import { Module } from '@nestjs/common';
import { GameController } from './presentation/game.controller';
import { GameService } from './application/game.service';
import { GameGateway } from './presentation/game.gateway';
import { QuizModule } from '../quiz/quiz.module';
import { RedisModule } from '../../config/database/redis/redis.module';
import { GameRankingService } from './domain/services/game.ranking.service';
import { GameStateService } from './domain/services/game.state.service';
import { GameUserInfoService } from './domain/services/game.user-info.service';
import { GameQuizService } from './domain/services/game.quiz.service';
import { CustomSocketGateway } from './presentation/test.gateway';

@Module({
  imports: [QuizModule, RedisModule],
  controllers: [GameController],
  providers: [
    GameGateway,
    CustomSocketGateway,
    GameService,
    GameRankingService,
    GameStateService,
    GameUserInfoService,
    GameQuizService,
  ],
  exports: [CustomSocketGateway, GameGateway, GameService],
})
export class GameModule {}
