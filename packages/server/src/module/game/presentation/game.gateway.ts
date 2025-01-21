import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from '../application/game.service';
import { Injectable, UseGuards } from '@nestjs/common';
import { MasterEntryRequestDto } from './dto/request/master-entry.request.dto';
import { ShowQuizRequestDto } from './dto/request/show-quiz.request.dto';
import { StartQuizRequestDto } from './dto/request/start-quiz.request.dto';
import { EmojiRequestDto } from './dto/request/emoji.request.dto';
import { SubmitAnswerRequestDto } from './dto/request/submit-answer.request.dto';
import { ShowRankingRequestDto } from './dto/request/show-ranking.request.dto';
import { EndQuizRequestDto } from './dto/request/end-quiz.request.dto';
import { MessageRequestDto } from './dto/request/message.request.dto';
import { LeaderboardRequestDto } from './dto/request/leaderboard.request.dto';
import { GAMESTATUS_TYPES } from '@shared/types/gameStatus.types';
import { GameEvents } from '@shared/constants/game-events.enum';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  async handleConnection(client: Socket) {
    try {
      const pinCode = await this.gameService.handleClientConnection(client);

      if (pinCode) {
        client.to(pinCode).emit(GameEvents.PARTICIPANT_NOTICE);
      }
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.CONNECTION);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const pinCode = await this.gameService.disconnect(client);
      client.to(pinCode).emit(GameEvents.PARTICIPANT_NOTICE);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.DISCONNECTION);
    }
  }

  @SubscribeMessage(GameEvents.LEAVE_ROOM)
  async handleLeaveRoom(client: Socket, payload: any) {
    const { sid, pinCode } = payload;
    try {
      await this.gameService.leaveroom(sid, pinCode);
      client.to(pinCode).emit(GameEvents.PARTICIPANT_NOTICE);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.LEAVE_ROOM);
    }
  }

  @SubscribeMessage(GameEvents.MASTER_ENTRY)
  async handleMasterEntry(client: Socket, requestDto: MasterEntryRequestDto) {
    const { classId } = requestDto;
    try {
      const { masterSid, pinCode } = await this.gameService.masterEntry(classId, client);
      client.emit(GameEvents.SESSION, masterSid);
      client.emit(GameEvents.PINCODE, pinCode);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.MASTER_ENTRY);
    }
  }

  @SubscribeMessage(GameEvents.SESSION)
  async handleSession(client: Socket, payload: any) {
    const { pinCode, nickname } = payload;
    try {
      const participantSid = await this.gameService.session(client, pinCode, nickname);
      return participantSid;
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.SESSION);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.PARTICIPANT_NOTICE)
  async handleParticipantNotice(client: Socket, payload: any) {
    const { pinCode } = payload;
    try {
      client.to(pinCode).emit(GameEvents.PARTICIPANT_NOTICE);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.PARTICIPANT_NOTICE);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.PARTICIPANT_INFO)
  async handleParticipantInfo(client: Socket, payload: any) {
    const { pinCode, sid } = payload;
    try {
      const { myPosition, participantList } = await this.gameService.participantInfo(sid, pinCode);
      return { myPosition, participantList };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.PARTICIPANT_INFO);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.START_QUIZ)
  async handleStartQuiz(client: Socket, requestDto: StartQuizRequestDto) {
    const { sid, pinCode } = requestDto;
    try {
      await this.gameService.startQuiz(sid, pinCode);
      // 마스터가 참여자들에게 게임 시작을 알림, 이 알림을 받은 참여자는 showranking을 시작한다.
      client.to(pinCode).emit(GameEvents.START_QUIZ, { isStarted: true });

      return { isStarted: true };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.START_QUIZ);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.SHOW_QUIZ)
  async handleShowQuiz(client: Socket, requestDto: ShowQuizRequestDto) {
    const { pinCode } = requestDto;
    try {
      const { quizMaxNum, currentQuizData, startTime, isLast, participantLength } =
        await this.gameService.showQuiz(pinCode);
      return {
        quizMaxNum,
        currentQuizData,
        startTime,
        isLast,
        participantLength,
      };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.SHOW_QUIZ);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.SUBMIT_ANSWER)
  async handleSubmitAnswer(client: Socket, requestDto: SubmitAnswerRequestDto) {
    const { pinCode, sid, selectedAnswer, submitTime } = requestDto;
    try {
      const { participantStatistics, masterStatistics, submitOrder } =
        await this.gameService.submitAnswer(pinCode, sid, selectedAnswer, submitTime);

      this.server.to(pinCode).emit(GameEvents.PARTICIPANT_STATISTICS, participantStatistics);
      this.server.to(pinCode).emit(GameEvents.MASTER_STATISTICS, masterStatistics);
      return { submitOrder };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.SUBMIT_ANSWER);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.EMOJI)
  async handleEmoji(client: Socket, requestDto: EmojiRequestDto) {
    const { pinCode, currentOrder, emoji } = requestDto;
    try {
      const emojiStatus = await this.gameService.emoji(pinCode, currentOrder, emoji);

      this.server.to(pinCode).emit(GameEvents.EMOJI, emojiStatus);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.EMOJI);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.TIME_END)
  async handleTimeEnd(client: Socket, payload: any) {
    const { pinCode } = payload;
    try {
      await this.gameService.timeEnd(pinCode, GAMESTATUS_TYPES.END);
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.TIME_END);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.SHOW_RANKING)
  async handleShowRanking(client: Socket, requestDto: ShowRankingRequestDto) {
    const { pinCode, sid } = requestDto;
    try {
      const { rankerData, myRank, myScore, myNickname } = await this.gameService.showRanking(
        pinCode,
        sid,
      );
      return { rankerData, myRank, myScore, myNickname };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.SHOW_RANKING);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.END_QUIZ)
  async handleEndQuiz(client: Socket, requestDto: EndQuizRequestDto) {
    const { sid, pinCode } = requestDto;
    try {
      await this.gameService.endQuiz(sid, pinCode);
      client.to(pinCode).emit(GameEvents.END_QUIZ, { isEnded: true });
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.END_QUIZ);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.LEADERBOARD)
  async handleLeaderboard(client: Socket, requestDto: LeaderboardRequestDto) {
    const { pinCode } = requestDto;
    try {
      const { rankerData, participantNumber, averageScore } =
        await this.gameService.leaderboard(pinCode);
      return { rankerData, participantNumber, averageScore };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.LEADERBOARD);
    }
  }

  // @UseGuards(SessionGuard)
  @SubscribeMessage(GameEvents.MESSAGE)
  async handleMessage(client: Socket, requestDto: MessageRequestDto) {
    const { pinCode, message, position } = requestDto;
    try {
      this.server.to(pinCode).emit(GameEvents.MESSAGE, { message, position });
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.MESSAGE);
    }
  }

  // GameUserInfoService
  @SubscribeMessage(GameEvents.MY_INFO)
  async handleMyInfo(client: Socket, payload: any) {
    const { sid } = payload;
    try {
      const { nickname, character } = await this.gameService.myInfo(sid);
      return { nickname, character };
    } catch (error) {
      this.handleSocketError(client, error, GameEvents.MY_INFO);
    }
  }

  private handleSocketError(client: Socket, error: unknown, context: string) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Error in ${context}: ${errorMessage}`);
    client.emit('error', { message: `Error in ${context}`, details: errorMessage });
  }
}
