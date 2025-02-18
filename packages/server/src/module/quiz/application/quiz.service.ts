import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { DataSource, InsertResult } from 'typeorm';
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
import { CreateQuizWithAiResponseDto } from '../presentation/dto/response/create-quiz-with-ai.response.dto';
import { CreateChoiceWithAiDto } from '../presentation/dto/request/create-choice-with-ai.request.dto';
import { CreateChoiceWithAiResponseDto } from '../presentation/dto/response/create-chioce-with-ai.response.dto';
import { RedisService } from 'src/config/database/redis/redis.service';
import { cosineSimilarity } from '../utils/cosine-similarity';
import { CreateAdjustedQuizWithAiDto } from '../presentation/dto/request/create-adjust-quiz-with-ai.request.dto';
import { ConversationMessageDto } from '../presentation/dto/request/conversation-message.request.dto';
import { RoleType } from '../domain/type/gpt-ai-role.enum';
import { CreateQuizFeedbackRequestDto } from '../presentation/dto/request/create-quiz-feedback.request.dto';

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

    // 1️⃣ Redis에서 동일한 요청 캐싱 확인
    const cachedQuiz = await this.redisService.hget('quiz_data', text);
    if (cachedQuiz) {
      console.log('캐싱된 퀴즈 반환');
      return CreateQuizWithAiResponseDto.fromAiResponse(JSON.parse(cachedQuiz));
    }

    // 2️⃣ 유사한 퀴즈 확인 (임베딩 검색)
    const similarQuizData = await this.findSimilarQuiz(text);
    if (similarQuizData) {
      console.log('유사한 퀴즈 반환');
      return CreateQuizWithAiResponseDto.fromAiResponse(similarQuizData);
    }

    // 3️⃣ AI 호출하여 퀴즈 생성
    console.log('AI 호출하여 새 퀴즈 생성');
    const aiGeneratedQuiz = JSON.parse(await this.openAiService.generateQuiz(text));

    // 4️⃣ Redis에 퀴즈 및 임베딩 저장
    await this.storeQuizEmbedding(text, aiGeneratedQuiz);

    return CreateQuizWithAiResponseDto.fromAiResponse(aiGeneratedQuiz);
  }

  async getAdjustedQuiz(dto: CreateAdjustedQuizWithAiDto): Promise<CreateQuizWithAiResponseDto> {
    // CreateAdjustedQuizWithAiDto에 사이사이에 집어넣을 고차함수
    const conversationHistory = dto.conversationHistory; // 사용자의 대화 내역

    // Redis에서 캐싱된 AI 응답을 삽입하여 conversationHistory 확장
    const updatedHistory = await this.insertCachedAssistantResponses(conversationHistory);

    // OpenAI API에 맞게 messages 배열 생성
    const aiGeneratedQuiz = JSON.parse(await this.openAiService.getAdjustedQuiz(updatedHistory));

    await this.storeQuizEmbedding(this.textTransformer(conversationHistory), aiGeneratedQuiz);

    return CreateQuizWithAiResponseDto.fromAiResponse(aiGeneratedQuiz);
  }

  async getFeedbackQuiz(dto: CreateQuizFeedbackRequestDto): Promise<void> {
    await this.storeFeedback(dto);
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

  private async findSimilarQuiz(text: string): Promise<any | null> {
    const inputEmbedding = await this.openAiService.getEmbedding(text);
    const storedEmbeddings = await this.redisService.hgetall('quiz_embeddings');

    if (!storedEmbeddings || Object.keys(storedEmbeddings).length === 0) {
      return null;
    }

    let mostSimilarQuiz = null;
    let highestSimilarity = 0;

    for (const [embeddingKey, vectorStr] of Object.entries(storedEmbeddings)) {
      const storedVector = JSON.parse(vectorStr);
      const similarity = cosineSimilarity(inputEmbedding, storedVector);

      if (similarity > highestSimilarity && similarity >= 0.98) {
        highestSimilarity = similarity;
        mostSimilarQuiz = embeddingKey.replace('emb:', '');
      }
    }

    if (mostSimilarQuiz) {
      const originalQuizData = JSON.parse(
        await this.redisService.hget('quiz_data', mostSimilarQuiz),
      );

      if (this.isSimilarPrompt(text, mostSimilarQuiz)) {
        return originalQuizData;
      }
    }

    return null;
  }

  // 공통 단어 비율 계산 코드 추가
  private isSimilarPrompt(inputPrompt: string, storedPrompt: string): boolean {
    const inputWords = new Set(inputPrompt.split(' '));
    const storedWords = new Set(storedPrompt.split(' '));

    // 공통 단어 비율 계산 (50% 미만이면 false 반환)
    const intersectionSize = [...inputWords].filter((word) => storedWords.has(word)).length;
    const similarityRatio = intersectionSize / Math.max(inputWords.size, storedWords.size);

    return similarityRatio >= 0.5; // 50% 이상 단어가 일치해야 함
  }

  private async storeQuizEmbedding(text: string, quizData: any) {
    const embedding = await this.openAiService.getEmbedding(text);
    const embeddingKey = `emb:${text}`;

    await Promise.all([
      this.redisService.hsetWithExpire(
        'quiz_embeddings',
        embeddingKey,
        JSON.stringify(embedding),
        86400,
      ), // 1일 보관
      this.redisService.hsetWithExpire('quiz_data', text, JSON.stringify(quizData), 172800), // 2일 보관
    ]);
  }

  private async insertCachedAssistantResponses(
    conversationHistory: ConversationMessageDto[],
  ): Promise<ConversationMessageDto[]> {
    const enrichedHistory: ConversationMessageDto[] = [];
    let userInput = '';

    for (const message of conversationHistory) {
      enrichedHistory.push(message);
      userInput += message.text;

      const cachedResponse = await this.redisService.hget('quiz_data', userInput);

      if (cachedResponse) {
        enrichedHistory.push({ role: RoleType.ASSISTANT, text: cachedResponse });
      }
    }
    return enrichedHistory;
  }

  private textTransformer(conversationHistory: ConversationMessageDto[]): string {
    return conversationHistory.reduce((acc, message) => acc + message.text, '');
  }

  private async storeFeedback(dto: CreateQuizFeedbackRequestDto): Promise<void> {
    const { prompts, feedback } = dto;
    const prompt = prompts.join('');
    const timestamp = Date.now();

    const aiResponse = await this.redisService.hget('quiz_data', prompt);

    await this.redisService.zadd(
      'feedbacks',
      timestamp,
      JSON.stringify({
        prompt,
        response: aiResponse,
        feedback,
        timestamp,
      }),
    );
  }
}
