import { Injectable } from '@nestjs/common';
import { ClassRepository } from '../../quiz/infrastructure/class.repository';
import { RedisService } from '../../../config/database/redis/redis.service';
import { Quiz } from 'src/module/quiz/domain/entities/quiz.entity';
import { GAMESTATUS_TYPES } from '@shared/types/gameStatus.types';
import { GameInfo } from '../interfaces/GameInfo';
import { GameRankingService } from '../domain/services/game.ranking.service';
import { CONVERT_TO_MS } from '@shared/constants/utils.constants';
import {
  MASTER_POSITION,
  QUIZ_WAITING_TIME,
  PARTICIPANT_MAX_NUMBER,
} from '@shared/constants/game.constants';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { CONNECTION_TYPES } from '@shared/types/connection.types';
import { ParticipantInfo, ParticipantListInfo } from '../interfaces/ParticipantInfo';
import { GameStateService } from '../domain/services/game.state.service';
import { GameUserInfoService } from '../domain/services/game.user-info.service';
import { GameQuizService } from '../domain/services/game.quiz.service';

@Injectable()
export class GameService {
  constructor(
    private readonly redisService: RedisService,
    private readonly classRepository: ClassRepository,
    private readonly gameRankingService: GameRankingService,
    private readonly gameStateService: GameStateService,
    private readonly gameUserInfoService: GameUserInfoService,
    private readonly gameQuizService: GameQuizService,
  ) {}

  async cachingQuizData(classId: number) {
    const classWithRelations = await this.findClassWithRelations(classId);
    const transformedData = this.transformQuizData(classWithRelations);

    return transformedData;
  }

  async findClassWithRelations(id: number) {
    const classEntity = await this.classRepository.getOnlyQuiz(id);

    return classEntity?.quizzes || [];
  }

  private transformQuizData(quizlists: Quiz[]) {
    const result = [];

    quizlists.forEach((quiz) => {
      const choiceList = [];
      quiz.choices.forEach((choice) => {
        const { id, quizId, content, isCorrect, position } = choice;
        const oneChoice = { id, quizId, content, isCorrect, position }; // 인터페이스로 refactor
        choiceList.push(oneChoice);
      });

      const { id, content, quizType, timeLimit, point, position } = quiz;
      const oneQuiz = { id, content, quizType, timeLimit, point, position, choices: choiceList }; // 인터페이스로 refactor
      result.push(oneQuiz);
    });
    return result;
  }

  async checkPinCode(pinCode: string) {
    try {
      const result = await this.gameStateService.getGameInfo(pinCode);

      if (result) {
        return { isExist: true, message: 'pinCode exists.' };
      }
      return { isExist: false, message: 'pinCode not exists.' };
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async checkSidType(sid: string) {
    try {
      const keyIds = ['master', 'participant'];

      for (const keyId of keyIds) {
        if (await this.redisService.get(`${keyId}_sid=${sid}`)) {
          return { type: keyId };
        }
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async checkAccumulation(pinCode: string) {
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);
    const participantLength = gameInfo.participantList.length;

    const isPossible = participantLength >= PARTICIPANT_MAX_NUMBER ? false : true;
    return { isPossible };
  }

  async checkGameStatus(sid: string, pinCode: string) {
    const isExist = await this.redisService.exists(`participant_sid=${sid}`);
    const gameInfo = JSON.parse(await this.redisService.get(`gameId=${pinCode}`));
    if (!isExist) {
      // 게임에서 나가진 경우
      if (gameInfo.gameStatus === GAMESTATUS_TYPES.WAITING) {
        return { isPossible: true, gameStatus: null };
      }
      return { isPossible: false, gameStatus: null, message: '게임에서 나가셨습니다.' };
    }

    const { pinCode: joinedPinCode } = JSON.parse(
      await this.redisService.get(`participant_sid=${sid}`),
    );

    if (joinedPinCode !== pinCode) {
      // 본인이 참여한 핀코드가 아닌 경우
      return { isPossible: false, gameStatus: null };
    }

    const { gameStatus } = JSON.parse(await this.redisService.get(`gameId=${pinCode}`));
    return { isPossible: true, gameStatus };
  }

  /**
   *
   * @param sid
   * @param pinCode
   * @param position
   */
  async removeParticipant(sid: string, pinCode: string, gameInfo: GameInfo, position: number) {
    // 참가자 정보 조회 (없으면 종료)
    const gameSidListJson = await this.redisService.get(`gameId=${pinCode}:sid`);
    if (!gameSidListJson) return;

    const gameSidList = JSON.parse(gameSidListJson);

    // 참가자 목록에서 제거
    const removeIndex = gameInfo.participantList.findIndex(
      (participant: ParticipantInfo) => participant.position === position,
    );

    if (removeIndex !== -1) {
      gameInfo.participantList.splice(removeIndex, 1);
      gameSidList.sidList.splice(removeIndex, 1);

      gameInfo.participantList
        .slice(removeIndex)
        .forEach(async (participant: ParticipantInfo, index) => {
          participant.position = removeIndex + index;
          const sid = gameSidList.sidList[participant.position];
          const participantInfo = JSON.parse(await this.redisService.get(`participant_sid=${sid}`));
          participantInfo.position = participant.position;
          await this.redisService.set(`participant_sid=${sid}`, JSON.stringify(participantInfo));
        });
    }

    // 게임 정보 업데이트
    await this.redisService.set(`gameId=${pinCode}:sid`, JSON.stringify(gameSidList));
    await this.redisService.set(`gameId=${pinCode}`, JSON.stringify(gameInfo));

    // Redis에서 참가자 데이터 삭제 (존재하는지 확인)
    if (await this.redisService.get(`participant_sid=${sid}`)) {
      await this.redisService.del(`participant_sid=${sid}`);
    }

    // 랭킹 ZSET에서 참가자 제거 (존재하는지 확인)
    if ((await this.redisService.zscore(`gameId=${pinCode}:ranking`, sid)) !== null) {
      await this.redisService.zrem(`gameId=${pinCode}:ranking`, sid);
    }
  }

  /**
   * 이벤트 핸들러 메서드
   *
   */

  async handleClientConnection(client: Socket) {
    const { sid } = client.handshake?.auth;
    if (!sid) return null;

    const sidType = await this.checkSidType(sid);
    if (!sidType) return null;

    const key = sidType.type === 'master' ? `master_sid=${sid}` : `participant_sid=${sid}`;
    const data = JSON.parse(await this.redisService.get(key));
    if (!data) return null;

    const { pinCode } = data;
    data['socketId'] = client.id;
    data['connection'] = CONNECTION_TYPES.ON;
    await this.redisService.set(key, JSON.stringify(data));
    await this.redisService.set(`${client.id}`, JSON.stringify({ sid, type: sidType.type }));
    client.join(pinCode);

    if (sidType.type === 'master') return null;

    const gameInfo = await this.gameStateService.getGameInfo(pinCode);
    gameInfo.participantList[data.position]['connection'] = CONNECTION_TYPES.ON;
    await this.gameStateService.setGameInfo(pinCode, gameInfo);
    console.log('handle', client.id, pinCode);
    return pinCode;
  }

  async disconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const data = JSON.parse(await this.redisService.get(`${client.id}`));
    if (!data) {
      return;
    }
    const { sid } = data;
    if (!sid) {
      return;
    }
    const sidType = await this.checkSidType(sid);
    if (!sidType) {
      return;
    }
    console.log('disconnected sid : ', sid);
    const key = sidType.type === 'master' ? `master_sid=${sid}` : `participant_sid=${sid}`;
    console.log('disconnected type key : ', key);
    const myInfo = JSON.parse(await this.redisService.get(key));
    console.log('disconnected myInfo : ', myInfo);
    // 마스터인 경우 제외 제외하기
    if (sidType.type === 'master') return;

    myInfo['connection'] = CONNECTION_TYPES.OFF;

    const gameInfo = JSON.parse(await this.redisService.get(`gameId=${myInfo.pinCode}`));
    gameInfo.participantList[myInfo.position].connection = CONNECTION_TYPES.OFF;

    await this.redisService.set(key, JSON.stringify(myInfo));
    await this.redisService.set(`gameId=${myInfo.pinCode}`, JSON.stringify(gameInfo));
    await this.redisService.del(`${client.id}`);

    return myInfo.pinCode;
  }

  async session(client: Socket, pinCode: string, nickname: string) {
    const socketId = client.id;
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);
    const participantLength = gameInfo.participantList.length;
    const participantSid = uuidv4();

    if (participantLength >= PARTICIPANT_MAX_NUMBER) {
      return undefined;
    }

    const clientInfo = await this.gameUserInfoService.createUserInfo(
      pinCode,
      nickname,
      socketId,
      participantLength,
    );

    // const clientInfo = { pinCode, nickname, socketId, character, position, connection };
    await this.redisService.set(
      `${socketId}`,
      JSON.stringify({ sid: participantSid, type: 'participant' }),
    );
    client.join(pinCode);

    await this.redisService.set(`participant_sid=${participantSid}`, JSON.stringify(clientInfo));
    await this.redisService.zincrby(`gameId=${pinCode}:ranking`, 0, participantSid);
    const gameSidList = await this.gameStateService.getGameSidList(pinCode);
    gameSidList.sidList.push(participantSid);
    await this.redisService.set(`gameId=${pinCode}:sid`, JSON.stringify(gameSidList));

    const pariticipantInfo: ParticipantListInfo = {
      nickname,
      character: clientInfo.character,
      position: clientInfo.position,
      connection: clientInfo.connection,
    };
    gameInfo.participantList.push(pariticipantInfo);

    await this.gameStateService.setGameInfo(pinCode, gameInfo);

    return participantSid;
  }

  async masterEntry(classId: number, client: Socket) {
    const masterSid = uuidv4();
    const pinCode = uuidv4().slice(0, 6); //TODO: 메소드 분리해서 중복 확인하고 없을 때까지 반복
    const socketId = client.id;

    const position = MASTER_POSITION;
    const connection = CONNECTION_TYPES.ON;

    const masterinfo = { pinCode, socketId, position, connection };

    client.join(pinCode);

    await this.redisService.set(`master_sid=${masterSid}`, JSON.stringify(masterinfo));
    await this.redisService.set(`${client.id}`, JSON.stringify({ sid: masterSid, type: 'master' }));
    await this.redisService.set(`gameId=${pinCode}:sid`, JSON.stringify({ sidList: [] }));
    const quizData = await this.storeQuizToRedis(classId);

    const gameInfo = {
      classId,
      gameStatus: GAMESTATUS_TYPES.WAITING,
      currentOrder: -1,
      quizMaxNum: quizData.length - 1,
      participantList: [],
    };

    await this.redisService.set(`gameId=${pinCode}`, JSON.stringify(gameInfo));

    return { masterSid, pinCode };
  }

  async leaveroom(sid: string, pinCode: string) {
    const participantInfo = await this.gameUserInfoService.getParticipantInfo(sid);

    // 게임 정보 가져오기 (예외 발생 가능)
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);

    // 게임 상태 확인 (대기 중이 아닐 경우 종료)
    if (gameInfo.gameStatus !== GAMESTATUS_TYPES.WAITING) {
      return;
    }

    // 참가자 제거 및 데이터 업데이트
    await this.removeParticipant(sid, pinCode, gameInfo, participantInfo.position);
  }

  async startQuiz(sid: string, pinCode: string) {
    // 마스터 검증
    await this.gameUserInfoService.validateMaster(sid, pinCode);

    // 게임 상태를 진행 중(IN_PROGRESS)으로 변경
    const gameInfo = await this.gameStateService.updateGameInfoStatus(
      pinCode,
      GAMESTATUS_TYPES.IN_PROGRESS,
    );

    gameInfo.currentOrder += 1;
    await this.gameStateService.setGameInfo(pinCode, gameInfo);

    // 퀴즈 데이터 가져오기
    const currentQuizData = await this.gameQuizService.getCurrentQuiz(
      gameInfo.classId,
      gameInfo.currentOrder,
    );

    // 퀴즈 통계 초기화
    await this.gameQuizService.initializeQuizStatistics(
      pinCode,
      gameInfo.currentOrder,
      currentQuizData.choices.length,
    );
  }

  async showQuiz(pinCode: string) {
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);

    const { classId, currentOrder, quizMaxNum, participantList } = gameInfo;
    // TODO:캐싱된 퀴즈를 가져온다. 퀴즈를 생성할 경우, 만들어졌을거라 예상
    // 만일 레디스에 퀴즈가 저장되어있지않다면, 퀴즈를 다시 캐싱해오는 로직이 필요할지도.

    // 퀴즈 데이터 가져오기 이건 참여자들에게 보여줄려고 get한 데이터
    const quizData = await this.gameQuizService.getQuizData(classId);

    const currentQuizData = quizData.find((quiz) => quiz.position === currentOrder);

    const isLast = gameInfo.currentOrder === quizMaxNum ? true : false;

    // 기존에 퀴즈가 저장된적이 있는지. start quiz에 저장되어있음
    const quizStatistics = await this.gameQuizService.getQuizStatistics(pinCode, currentOrder);

    return {
      quizMaxNum,
      currentQuizData,
      startTime: quizStatistics.startTime,
      isLast,
      participantLength: participantList.length,
    };
  }

  async submitAnswer(pinCode: string, sid: string, selectedAnswer: number[], submitTime: number) {
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);
    const pariticipantInfo = await this.gameUserInfoService.getParticipantInfo(sid);

    const { classId, currentOrder, participantList } = gameInfo;
    const quizData = await this.gameQuizService.getQuizData(classId);
    const currentQuizData = quizData.find((quiz) => quiz.position === currentOrder);

    const participantLength = participantList.length;

    const currentChoicesData = currentQuizData['choices'];
    const { point, timeLimit } = currentQuizData;

    const quizStatistics = await this.gameQuizService.getQuizStatistics(pinCode, currentOrder);

    quizStatistics.submitHistory.push([pariticipantInfo.nickname, submitTime]);
    const submitHistory = quizStatistics.submitHistory;

    quizStatistics.totalSubmit += 1;
    const totalSubmit = quizStatistics.totalSubmit;

    const isFlag = this.matchingAnswer(selectedAnswer, currentChoicesData);
    if (isFlag) {
      quizStatistics.totalCorrect += 1;
    }

    const processedPoint = this.calculatePoints(isFlag, submitTime, timeLimit, point);
    await this.redisService.zincrby(`gameId=${pinCode}:ranking`, processedPoint, sid);

    const totalCorrect = quizStatistics.totalCorrect;

    quizStatistics.totalTime += submitTime;
    const totalTime = quizStatistics.totalTime;

    for (const answer of selectedAnswer) {
      quizStatistics.choiceStatus[answer] += 1;
    }
    const choiceStatus = quizStatistics.choiceStatus;

    const participantNum = participantList.length;

    await this.gameQuizService.setQuizStatistics(pinCode, currentOrder, quizStatistics);

    await this.gameStateService.setGameInfo(pinCode, gameInfo);

    const solveRate = (totalCorrect / totalSubmit) * 100;
    const averageTime = (totalTime / totalSubmit) * 100;
    const participantRate = (totalSubmit / participantNum) * 100;

    const participantStatistics = { totalSubmit, solveRate, averageTime, participantRate };
    const masterStatistics = {
      totalSubmit,
      solveRate,
      averageTime,
      participantRate,
      choiceStatus,
      submitHistory,
      participantLength,
    };

    return { participantStatistics, masterStatistics, submitOrder: totalSubmit };
  }

  async emoji(pinCode: string, currentOrder: number, emoji: string) {
    const quizStatistics = await this.gameQuizService.getQuizStatistics(pinCode, currentOrder);

    quizStatistics.emojiStatus[emoji] += 1;

    await this.gameQuizService.setQuizStatistics(pinCode, currentOrder, quizStatistics);

    return quizStatistics.emojiStatus;
  }

  async timeEnd(pinCode: string, statut: string) {
    this.gameStateService.updateGameInfoStatus(pinCode, statut);
  }

  async showRanking(pinCode: string, sid: string) {
    return await this.gameRankingService.showRanking(pinCode, sid);
  }

  async endQuiz(pinCode: string, sid: string) {
    // 마스터 검증
    await this.gameUserInfoService.validateMaster(sid, pinCode);
    // 게임 상태를 대기 중(WAITING)으로 변경
    await this.gameStateService.updateGameInfoStatus(pinCode, GAMESTATUS_TYPES.WAITING);
  }

  async leaderboard(pinCode: string) {
    const { allRankers, participantNumber } =
      await this.gameRankingService.getLeaderBoardInfo(pinCode);
    const rankerData = await Promise.all(
      allRankers.map(async ([sid, score]) => {
        const { nickname, character } = await this.gameUserInfoService.getParticipantInfo(sid);
        return { nickname, score, character };
      }),
    );

    const allParticipantsScore = rankerData.reduce((acc, { score }) => acc + Number(score), 0);
    const averageScore = allParticipantsScore / participantNumber;
    return { rankerData, participantNumber, averageScore };
  }

  async participantInfo(sid: string, pinCode: string) {
    const userInfo = await this.gameUserInfoService.getUserInfo(sid);
    const gameInfo = await this.gameStateService.getGameInfo(pinCode);
    return { myPosition: userInfo.position, participantList: gameInfo.participantList };
  }

  async myInfo(sid: string) {
    const userInfo = await this.gameUserInfoService.getUserInfo(sid);
    return userInfo;
  }

  matchingAnswer(selectedAnswer: Number[], currentChoicesData) {
    const correctAnswers = currentChoicesData
      .filter((choice) => choice.isCorrect)
      .map((choice) => choice.position);

    const equals = (a: Number[], b: Number[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);

    correctAnswers.sort();
    selectedAnswer.sort();

    return equals(selectedAnswer, correctAnswers);
  }

  async storeQuizToRedis(classId: number) {
    const cachedQuizData = await this.redisService.get(`classId=${classId}`);

    if (cachedQuizData) {
      const quizData = JSON.parse(cachedQuizData);
      return quizData;
    }

    const quizData = await this.cachingQuizData(classId);

    await this.redisService.set(`classId=${classId}`, JSON.stringify(quizData), 'EX', 604800);
    return quizData;
  }

  calculatePoints(isFlag: boolean, submitTime: number, timeLimit: number, point: number) {
    const timeLimitToMs = (timeLimit + QUIZ_WAITING_TIME) * CONVERT_TO_MS;
    if (isFlag) {
      const ratio = (timeLimitToMs - submitTime) / timeLimitToMs;
      return Math.floor(ratio * point);
    }
    return 0;
  }
}
