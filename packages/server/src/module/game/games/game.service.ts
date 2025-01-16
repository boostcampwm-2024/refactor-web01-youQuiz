import { Injectable } from '@nestjs/common';
import { ChoiceRepository } from '../../quiz/infrastructure/choice.repository';
import { ClassRepository } from '../../quiz/infrastructure/class.repository';
import { QuizRepository } from '../../quiz/infrastructure/quiz.repository';
import { RedisService } from '../../../config/database/redis/redis.service';
import { Quiz } from 'src/module/quiz/domain/entities/quiz.entity';
import { PARTICIPANT_MAX_NUMBER } from '@shared/constants/game.constants';
import { GAMESTATUS_TYPES } from '@shared/types/gameStatus.types';

@Injectable()
export class GameService {
  constructor(
    private readonly classRepository: ClassRepository,
    private readonly quizRepository: QuizRepository,
    private readonly choiceRepository: ChoiceRepository,
    private readonly redisService: RedisService,
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
      const result = await this.redisService.get(`gameId=${pinCode}`);

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

  async getRank(key: string, participantNum: number) {
    const result = await this.redisService.zrevrange(key, 0, participantNum);

    const formattedRank = result
      .map((item, index) => {
        if (index % 2 === 0) {
          return [item, result[index + 1]];
        }
      })
      .filter((item) => item !== undefined);

    return formattedRank;
  }

  async checkAccumulation(pinCode: string) {
    const gameInfo = JSON.parse(await this.redisService.get(`gameId=${pinCode}`));
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
}
