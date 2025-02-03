import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { DataSource, InsertResult } from 'typeorm';
import OpenAI from 'openai';
import { QuizRepository } from '../infrastructure/quiz.repository';
import { ChoiceRepository } from '../infrastructure/choice.repository';
import { ClassRepository } from '../infrastructure/class.repository';
import { CreateClassRequestDto } from '../presentation/dto/request/create-class.request.dto';
import { CreateClassResponseDto } from '../presentation/dto/response/create-class.response.dto';
import { CreateQuizListRequestDto } from '../presentation/dto/request/create-quizlist.request.dto';
import { QuizResponseDto } from '../presentation/dto/response/quiz.response.dto';
import { UpdateClassRequestDto } from '../presentation/dto/request/update-class.request.dto';
import { UpdateQuizListRequestDto } from '../presentation/dto/request/update-quizlist.request.dto';
import { GetClassResponseDto } from '../presentation/dto/response/get-class.response.dto';
import { Class } from '../domain/entities/class.entity';
import { OpenAiService } from 'src/config/ai/openai.config';
import { CreateQuizWithAiDto } from '../presentation/dto/request/create-quiz-with-ai.request.dto';
import { create } from 'domain';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly choiceRepository: ChoiceRepository,
    private readonly classRepository: ClassRepository,
    private readonly openAiService: OpenAiService,
    private readonly dataSource: DataSource,
  ) {}

  async createClass(createClassRequestDto: CreateClassRequestDto): Promise<CreateClassResponseDto> {
    const classEntity = await this.classRepository.create(createClassRequestDto);

    const responseDto = CreateClassResponseDto.fromEntity(classEntity);

    return responseDto;
  }

  async createAiQuiz(classId: number, request: CreateQuizWithAiDto): Promise<void> {
    const response = JSON.parse(await this.openAiService.generateQuiz(request.text));
    await this.createBulkQuizWithChoices(classId, response);
  }

  async createBulkQuizWithChoices(
    classId: number,
    quizData: CreateQuizListRequestDto,
  ): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      await this.classRepository.findClassById(classId);

      const quizValues = this.prepareQuizData(classId, quizData);
      const insertedQuizzes = await this.quizRepository.createBulkQuizzes(manager, quizValues);

      const choiceValues = this.prepareChoiceData(quizData, insertedQuizzes);
      await this.choiceRepository.createBulkChoices(manager, choiceValues);
    });
  }

  private prepareQuizData(classId: number, quizData: CreateQuizListRequestDto) {
    return quizData.quizzes.map((quiz) => ({
      classId,
      content: quiz.content,
      quizType: quiz.quizType,
      timeLimit: quiz.timeLimit,
      point: quiz.point,
      position: quiz.position,
      createdAt: new Date(),
    }));
  }

  private prepareChoiceData(quizData: CreateQuizListRequestDto, insertedQuizzes: InsertResult) {
    const quizIds = insertedQuizzes.identifiers.map((identifier) => identifier.id);
    return quizData.quizzes.flatMap((quiz, index) =>
      quiz.choices.map((choice) => ({
        quizId: quizIds[index],
        content: choice.content,
        isCorrect: choice.isCorrect,
        position: choice.position,
        createdAt: new Date(),
      })),
    );
  }

  async getAllClasses(): Promise<GetClassResponseDto[]> {
    const classEntities = await this.classRepository.findAll();

    return classEntities.map((classEntity: Class) => GetClassResponseDto.fromEntity(classEntity));
  }

  async getQuizzesByClassId(classId: number): Promise<QuizResponseDto[]> {
    const quizzes = await this.quizRepository.findByClassId(classId);

    if (!quizzes || quizzes.length === 0) {
      throw new NotFoundException(`No quizzes found for classId ${classId}`);
    }

    return quizzes.map((quiz) => QuizResponseDto.fromEntity(quiz));
  }

  async updateClass(id: number, updateData: UpdateClassRequestDto): Promise<void> {
    const classEntity = await this.classRepository.findById(id);

    if (!classEntity) {
      throw new HttpException(`Class with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    await this.classRepository.update(id, updateData);
  }

  async updateQuiz(classId: number, dto: UpdateQuizListRequestDto): Promise<void> {
    const quizEntity = await this.classRepository.findById(classId);

    if (!quizEntity) {
      throw new HttpException(`Quiz with ID ${classId} not found`, HttpStatus.NOT_FOUND);
    }

    await this.quizRepository.updateQuizzes(classId, dto.quizzes);
  }

  async deleteClass(id: number): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      await this.classRepository.findClassById(id);
      await this.choiceRepository.deleteByClassId(id, manager);
      await this.quizRepository.deleteByClassId(id, manager);
      await this.classRepository.delete(id, manager);
    });
  }
}
