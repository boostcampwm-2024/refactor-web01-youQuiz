import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/config/database/redis/redis.service';
import { QuizStatistics } from '../../interfaces/QuizStatistics';

@Injectable()
export class GameQuizService {
  constructor(private readonly redisService: RedisService) {}

  async getQuizData(classId: number) {
    const quizData = await this.redisService.get(`classId=${classId}`);
    if (!quizData) {
      throw new NotFoundException(`Quiz with classId: ${classId} not found`);
    }

    return JSON.parse(quizData);
  }

  /**
   * 현재 진행할 퀴즈 정보를 가져오는 메서드
   */
  async getCurrentQuiz(classId: number, order: number) {
    const quizData = await this.getQuizData(classId);
    const currentQuiz = quizData.find((quiz) => quiz.position === order);

    if (!currentQuiz) {
      throw new NotFoundException(`Quiz not found for order: ${order}`);
    }
    return currentQuiz;
  }

  async getQuizStatistics(pinCode: string, currentOrder: number) {
    const quizStatistics = await this.redisService.get(`gameId=${pinCode}:quizId=${currentOrder}`);
    if (!quizStatistics) {
      throw new NotFoundException(
        `Quiz with pinCode: ${pinCode}, quizId: ${currentOrder} not found`,
      );
    }

    return JSON.parse(quizStatistics);
  }

  async setQuizStatistics(pinCode: string, currentOrder: number, quizStatistics: QuizStatistics) {
    await this.redisService.set(
      `gameId=${pinCode}:quizId=${currentOrder}`,
      JSON.stringify(quizStatistics),
    );
  }

  /**
   * 퀴즈 통계를 초기화하는 메서드
   */
  async initializeQuizStatistics(pinCode: string, currentOrder: number, choicesLength: number) {
    const choiceStatus = Object.fromEntries(
      Array.from({ length: choicesLength }, (_, i) => [i, 0]),
    );

    const quizStatistics: QuizStatistics = {
      totalSubmit: 0,
      totalCorrect: 0,
      totalTime: 0,
      choiceStatus,
      submitHistory: [],
      emojiStatus: { easy: 0, hard: 0 },
      startTime: Date.now(),
    };

    await this.setQuizStatistics(pinCode, currentOrder, quizStatistics);
  }
}
