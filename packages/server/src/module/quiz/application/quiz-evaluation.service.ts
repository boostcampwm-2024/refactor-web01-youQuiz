import { Injectable } from "@nestjs/common";
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";
import { OpenAiService } from "../../../config/ai/openai.config";
import { z } from "zod";
import type { EvaluationResult } from "langsmith/evaluation";
import OpenAI from "openai";
import { ResponseFormatJSONSchema } from "openai/resources";

@Injectable()
export class QuizEvaluationService {
  private client: Client;
  private evaluationAi: OpenAI;

  constructor(private readonly openAiService: OpenAiService) {
    this.client = new Client({ apiKey: process.env.LANGSMITH_API_KEY });
    this.evaluationAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * LangSmith 데이터셋 생성 (100개 이상의 요청 포함)
   */
  async createLargeDataset(): Promise<string> {
    const dataset = await this.client.createDataset("Large Quiz Dataset - 2", {
      description: "200개의 서로 다른 주제 및 퀴즈 요청을 포함한 대량 테스트 데이터셋",
    });

    const topics = [
      // 🎓 학문 분야 (Academic Subjects)
      "한국 역사", "세계사", "컴퓨터 과학", "수학", "물리학", "화학", "생물학", "지구과학", "경제학", "심리학",
      
      // 📚 인문학 & 철학
      "철학", "문학", "언어학", "예술사", "고고학", "윤리학", "종교학", "사회학",
    
      // 🌍 시사 & 일반 상식
      "세계 정치", "국제 경제", "기후 변화", "환경 문제", "우주 탐사", "국제법", "미디어와 저널리즘",
    
      // 🎨 문화 & 예술
      "영화사", "클래식 음악", "현대 미술", "전통 예술", "디자인", "패션", "대중 문화",
    
      // 🏆 스포츠 & 건강
      "올림픽 역사", "축구", "농구", "야구", "테니스", "의학 상식", "운동 생리학", "영양학",
    
      // 💡 과학 & 기술
      "인공지능", "로봇공학", "블록체인", "양자 컴퓨팅", "인터넷의 역사", "데이터 사이언스", "컴퓨터 네트워크",
    
      // 📖 종교 & 신화
      "불교", "기독교", "이슬람교", "그리스 신화", "노르스 신화", "동양 신화",
    
      // 🔬 공학 & 응용 과학
      "기계 공학", "전자 공학", "항공 우주 공학", "건축학", "재료 공학", "에너지 공학",
    
      // 🌎 지리 & 여행
      "세계 지리", "유네스코 세계유산", "세계 유명 도시", "해양 탐험", "문화권별 음식",
    
      // 📜 법률 & 윤리
      "헌법", "국제법", "지적 재산권", "형법", "행정법", "사이버 보안법"
    ];
    
    const quizCounts = [3, 4, 5];
    const choiceCounts = [2, 3, 4];

    let examples = [];

    for (let i = 0; i < 200; i++) {
      const topic = topics[i % topics.length];
      const quizCount = quizCounts[i % quizCounts.length];
      const choiceCount = choiceCounts[i % choiceCounts.length];

      examples.push({
        inputs: {
          request: `주제: ${topic}, 퀴즈 개수: ${quizCount}, 선택지 개수: ${choiceCount}`,
        },
        outputs: {},
      });
    }

    await this.client.createExamples({
      inputs: examples.map((ex) => ex.inputs),
      outputs: examples.map((ex) => ex.outputs),
      datasetId: dataset.id,
    });

    return `Dataset created with ID: ${dataset.id}`;
  }

  /**
   * JSON 응답 검증 평가자
   */
  async jsonSchemaEvaluator({ inputs, outputs }: { inputs?: Record<string, any>; outputs?: Record<string, any> }): Promise<EvaluationResult> {
    if (!inputs || !outputs) {
      return { key: "json_validity", score: 0 };
    }

    let parsedOutputs;
    try {
      parsedOutputs = typeof outputs === "string" ? JSON.parse(outputs) : outputs;
      console.log(parsedOutputs);
    } catch (error) {
      return { key: "json_validity", score: 0 };
    }

    const actualOutputs = parsedOutputs.outputs?.quizzes ? parsedOutputs.outputs : parsedOutputs;

    const quizCountMatch = inputs.request.match(/퀴즈 개수: (\d+)/);
    const choiceCountMatch = inputs.request.match(/선택지 개수: (\d+)/);

    const expectedQuizCount = quizCountMatch ? parseInt(quizCountMatch[1], 10) : 5;
    const expectedChoiceCount = choiceCountMatch ? parseInt(choiceCountMatch[1], 10) : 4;

    const QuizSchema = z.object({
      quizzes: z.array(
        z.object({
          content: z.string(),
          quizType: z.enum(["MC", "TF"]),
          timeLimit: z.number().int(),
          point: z.number().int(),
          position: z.number().int(),
          choices: z.array(
            z.object({
              content: z.string(),
              isCorrect: z.boolean(),
              position: z.number().int(),
            })
          ).min(expectedChoiceCount),
        })
      ).min(expectedQuizCount),
    });

    try {
      QuizSchema.parse(actualOutputs);
      return { key: "json_validity", score: 1 };
    } catch (error) {
      return { key: "json_validity", score: 0 };
    }
  }

  /**
   * 퀴즈 문맥 적절성 평가 (AI 기반)
   */
  async relevanceEvaluator({ inputs, outputs, referenceOutputs }: { inputs?: Record<string, string>; outputs?: Record<string, any>; referenceOutputs?: Record<string, any> }): Promise<EvaluationResult> {
    if (!inputs || !outputs) {
      return { key: "relevance", score: 0, };
    }

    let parsedOutputs;
    try {
      parsedOutputs = typeof outputs === "string" ? JSON.parse(outputs) : outputs;
    } catch (error) {
      return { key: "relevance", score: 0, comment: "Missing Inputs or outputs", feedbackConfig: { type: "continuous", min: 0, max: 1 }};
    }

    const ResponseSchema = z.object({
      score: z.number().min(0).max(1).describe("퀴즈의 주제 관련성 점수 (0~1)"),
      feedback: z.string().describe("퀴즈 관련성 평가 피드백"),
    });
    const jsonSchema: ResponseFormatJSONSchema = {
      type: "json_schema",
      json_schema: {
        name: "quiz_relevance_evaluation",
        description: "Evaluate the relevance of the generated quiz to the given topic.",
        schema: {
          type: "object",
          properties: {
            score: { type: "number", minimum: 0, maximum: 1, description: "퀴즈의 주제 관련성 점수 (0~1)" },
            feedback: { type: "string", description: "퀴즈 관련성 평가 피드백" },
          },
          required: ["score", "feedback"],
          additionalProperties: false,
        },
      },
    };

    const response = await this.evaluationAi.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "다음 퀴즈가 요청된 주제와 얼마나 관련성이 높은지 평가하세요. 0~1 점수로 제공하며, 1은 매우 관련이 높고, 0은 전혀 관련이 없습니다." },
        { role: "user", content: `
          주제: "${inputs.request}"
          AI가 생성한 퀴즈: ${JSON.stringify(parsedOutputs, null, 2)}
          기준 퀴즈 (reference): ${JSON.stringify(referenceOutputs || {}, null, 2)}

          이 퀴즈가 요청된 주제와 관련이 있는지 0~1 점수로 평가하고, JSON 형식으로 응답하세요. 점수는 엄밀하게 작성해줘
          예시 응답: { "score": 0.85, "feedback": "퀴즈가 주제와 매우 밀접한 관련이 있습니다." }
        `},
      ],
      max_tokens: 200,
      response_format: jsonSchema,
    });

    try {
      const parsedResponse = ResponseSchema.parse(JSON.parse(response.choices[0].message.content));

      return {
        key: "relevance",
        score: parsedResponse.score ?? 0,
        comment: parsedResponse.feedback ?? "No feedback provided",
        feedbackConfig: { type: 'freeform' }
      };
    } catch (error) {
      console.error("Invalid JSON response from OpenAI:", response.choices[0].message.content);
      return {
        key: "relevance",
        score: 0,
        comment: "Failed to parse AI response",
        feedbackConfig: { type: "continuous", min: 0, max: 1 }
      };
    }
  }

  /**
   * OpenAI를 활용한 퀴즈 생성 및 평가 실행
   */
  async runEvaluation(): Promise<string> {
    const result = await evaluate(
      async (exampleInput) => {
        const generatedQuiz = await this.openAiService.generateQuiz(exampleInput.request);
        return {
          outputs: JSON.parse(generatedQuiz),
          referenceOutputs: exampleInput.reference || {},
        };
      },
      {
        data: "Large Quiz Dataset - 2",
        evaluators: [this.jsonSchemaEvaluator.bind(this), this.relevanceEvaluator.bind(this)],
        experimentPrefix: "large-scale-quiz-evaluation",
        maxConcurrency: 2,
      }
    );

    return `Evaluation started. Check results in LangSmith Experiments UI.`;
  }
}
