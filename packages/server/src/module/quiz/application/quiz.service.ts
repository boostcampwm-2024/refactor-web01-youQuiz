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
import { CreateQuizWithAiResponseDto } from '../presentation/dto/response/create-quiz-with-ai.response.dto';
import { CreateChoiceWithAiDto } from '../presentation/dto/request/create-choice-with-ai.request.dto';
import { CreateChoiceWithAiResponseDto } from '../presentation/dto/response/create-chioce-with-ai.response.dto';
import { RedisService } from 'src/config/database/redis/redis.service';
import { cosineSimilarity } from '../utils/cosine-similarity';

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly choiceRepository: ChoiceRepository,
    private readonly classRepository: ClassRepository,
    private readonly redisService: RedisService,
    private readonly openAiService: OpenAiService,
    private readonly dataSource: DataSource,
  ) {}

  async getAiQuiz(dto: CreateQuizWithAiDto): Promise<CreateQuizWithAiResponseDto> {
    const { text } = dto;

    // Redis에서 동일한 요청 캐싱 확인
    const cachedQuiz = await this.redisService.hget('quiz_data', text);
    if (cachedQuiz) {
      console.log('캐싱된 퀴즈 반환');
      return CreateQuizWithAiResponseDto.fromAiResponse(JSON.parse(cachedQuiz));
    }

    // 유사한 퀴즈가 있는지 확인 (코사인 유사도 0.9 이상이면 사용)
    const similarQuiz = await this.findSimilarQuiz(text);
    if (similarQuiz) {
      console.log('유사한 퀴즈 반환');
      return CreateQuizWithAiResponseDto.fromAiResponse(similarQuiz);
    }

    // AI 호출하여 퀴즈 생성
    console.log('AI 호출하여 새 퀴즈 생성');
    const aiGeneratedQuiz = JSON.parse(await this.openAiService.generateQuiz(text));

    // Redis에 퀴즈 데이터 저장 + 벡터 임베딩 저장 + TTL 1시간
    await this.redisService.hsetWithExpire(
      'quiz_data',
      text,
      JSON.stringify(aiGeneratedQuiz),
      3600,
    );
    await this.storeQuizEmbedding(text, aiGeneratedQuiz);

    return CreateQuizWithAiResponseDto.fromAiResponse(aiGeneratedQuiz);
  }

  async createClass(dto: CreateClassRequestDto): Promise<CreateClassResponseDto> {
    const classEntity = await this.classRepository.create(dto);

    const responseDto = CreateClassResponseDto.fromEntity(classEntity);

    return responseDto;
  }

  async createAiQuiz(classId: number, dto: CreateQuizWithAiDto): Promise<void> {
    const response = JSON.parse(await this.openAiService.generateQuiz(dto.text));
    await this.createBulkQuizWithChoices(classId, response);
  }

  async createAiChoices(dto: CreateChoiceWithAiDto): Promise<CreateChoiceWithAiResponseDto> {
    const aiGeneratedChoice = JSON.parse(await this.openAiService.generateChoices(dto));

    return CreateChoiceWithAiResponseDto.fromAiChoice(aiGeneratedChoice);
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

  async findSimilarQuiz(text: string): Promise<any | null> {
    const inputEmbedding = await this.openAiService.getEmbedding(text);
    const storedQuizzes = await this.redisService.hgetall('quiz_embeddings');

    let mostSimilarQuiz = null;
    let highestSimilarity = 0;

    for (const [quizText, vectorStr] of Object.entries(storedQuizzes)) {
      const storedVector = JSON.parse(vectorStr);
      const similarity = cosineSimilarity(inputEmbedding, storedVector);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        mostSimilarQuiz = quizText;
      }
    }

    if (highestSimilarity >= 0.9) {
      return JSON.parse(await this.redisService.hget('quiz_data', mostSimilarQuiz));
    }

    return null;
  }

  private async storeQuizEmbedding(text: string, quizData: any) {
    const embedding = await this.openAiService.getEmbedding(text);
    await this.redisService.hset('quiz_embeddings', text, JSON.stringify(embedding));
    await this.redisService.hset('quiz_data', text, JSON.stringify(quizData));
  }
}
