import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './domain/entities/quiz.entity';
import { Choice } from './domain/entities/choice.entity';
import { Class } from './domain/entities/class.entity';
import { QuizRepository } from './infrastructure/quiz.repository';
import { ChoiceRepository } from './infrastructure/choice.repository';
import { ClassRepository } from './infrastructure/class.repository';
import { QuizService } from './application/quiz.service';
import { QuizController } from './presentation/quiz.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Choice, Class])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository, ChoiceRepository, ClassRepository],
  exports: [QuizRepository, ChoiceRepository, ClassRepository],
})
export class QuizModule {}
