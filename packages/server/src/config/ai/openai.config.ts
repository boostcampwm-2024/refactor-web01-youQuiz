import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  logger: any;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      console.log('🚨 OpenAI API Key가 설정되지 않았습니다. .env 파일을 확인하세요.');
      throw new Error('Missing OpenAI API Key');
    }

    console.log(`✅ OpenAI API Key Loaded: ${apiKey.substring(0, 8)}********`);
    this.openai = new OpenAI({ apiKey });
  }

  async generateQuiz(prompt: string): Promise<any> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: '너는 "YouQuiz 문제 제작 AI 어시스턴트"야.  \nYouQuiz는 사람들이 모여 퀴즈를 풀면서 학습과 경쟁을 동시에 즐길 수 있는 서비스로, Kahoot!과 비슷한 플랫폼이야.  \n\n📌 **너의 역할**  \n너의 역할은 **퀴즈 마스터**로서, 사용자가 요청한 주제, 난이도, 개수 등의 조건에 맞는 **퀴즈 묶음(Class)**을 생성하는 거야.  \n사용자가 원하는 형식에 맞춰 **논리적이고 직관적인 JSON 구조**로 출제해야 해.  \n\n📌 **퀴즈 묶음(Class) 구성 요소**  \n각 문제 묶음(Class)에는 아래의 요소가 포함되어야 해:\n\n✅ **제목 (title)**: 문제 묶음의 이름. `"AB대학교 한국사 수업 1-1"` 같은 형식으로 명확하게 작성해.  \n✅ **태그 (tag)**: 문제 묶음을 설명하는 해시태그 (`List of String`). 예: `["#한국사", "#1학년"]`  \n✅ **문제 리스트 (quizzes)**: 하나의 문제 묶음 안에는 여러 개의 문제(quiz)가 포함될 수 있어. 각 문제는 다음 요소를 포함해야 해:  \n   - **문제 내용 (content)**: `"Q. 대한민국의 수도는 어디인가요?"` 같은 형태.  \n   - **퀴즈 유형 (quizType)**: `"MC"` (객관식) 또는 `"TF"` (참/거짓)로 설정.  \n   - **제한 시간 (timeLimit)**: 문제를 풀 수 있는 제한 시간(초). 최소 `5초` 이상.  \n   - **배점 (point)**: 문제를 맞혔을 때 얻을 수 있는 점수. 최소 `0점` 이상.  \n   - **문제 순서 (position)**: 퀴즈가 표시되는 순서 (0부터 시작).  \n   - **선택지 (choices)**: 각 문제에는 2개 이상의 선택지가 있어야 하며, 아래 구조를 따라야 해:\n     - 선택지 텍스트\n     - 정답 여부\n     - 선택지 순서\n   - **풀이 과정 (steps)**: 문제가 풀리는 과정을 설명하는 배열.\n   - **정답 (final_answer)**: 문제의 최종 정답.\n\n**⚠️ 중요!**  \n- 너는 Playground에 저장된 Schema에 맞는 JSON을 생성해야 해.  \n- 반드시 **유효한 JSON 형식**으로 출력해야 하며, 텍스트 형식이 아닌 JSON 객체를 반환해야 해.  \n- 응답을 할 때 `"response_format": "json"` 옵션을 따르도록 해.\n',
            },
          ],
        },
        {
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: '{\n  "quizzes": [\n    {\n      "content": "Q. 대한민국의 수도는 어디인가요?",\n      "quizType": "MC",\n      "timeLimit": 10,\n      "point": 5,\n      "position": 0,\n      "choices": [\n        {\n          "content": "서울",\n          "isCorrect": true,\n          "position": 0\n        },\n        {\n          "content": "부산",\n          "isCorrect": false,\n          "position": 1\n        },\n        {\n          "content": "인천",\n          "isCorrect": false,\n          "position": 2\n        },\n        {\n          "content": "대구",\n          "isCorrect": false,\n          "position": 3\n        }\n      ]\n    }\n  ]\n}',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '대한민국과 관련된 문제 3개를 내줘\n',
            },
          ],
        },
        {
          role: 'assistant',
          content: [
            {
              type: 'text',
              text: '{\n  "quizzes": [\n    {\n      "content": "Q. 대한민국의 건국 기념일은 언제인가요?",\n      "quizType": "MC",\n      "timeLimit": 15,\n      "point": 10,\n      "position": 0,\n      "choices": [\n        {\n          "content": "8월 15일",\n          "isCorrect": true,\n          "position": 0\n        },\n        {\n          "content": "10월 3일",\n          "isCorrect": false,\n          "position": 1\n        },\n        {\n          "content": "3월 1일",\n          "isCorrect": false,\n          "position": 2\n        },\n        {\n          "content": "5월 5일",\n          "isCorrect": false,\n          "position": 3\n        }\n      ]\n    },\n    {\n      "content": "Q. 대한민국의 국화(國花)는 무엇인가요?",\n      "quizType": "MC",\n      "timeLimit": 10,\n      "point": 5,\n      "position": 1,\n      "choices": [\n        {\n          "content": "무궁화",\n          "isCorrect": true,\n          "position": 0\n        },\n        {\n          "content": "국화",\n          "isCorrect": false,\n          "position": 1\n        },\n        {\n          "content": "진달래",\n          "isCorrect": false,\n          "position": 2\n        },\n        {\n          "content": "장미",\n          "isCorrect": false,\n          "position": 3\n        }\n      ]\n    },\n    {\n      "content": "Q. 대한민국 최초의 대통령은 누구인가요?",\n      "quizType": "MC",\n      "timeLimit": 10,\n      "point": 5,\n      "position": 2,\n      "choices": [\n        {\n          "content": "이승만",\n          "isCorrect": true,\n          "position": 0\n        },\n        {\n          "content": "김대중",\n          "isCorrect": false,\n          "position": 1\n        },\n        {\n          "content": "박정희",\n          "isCorrect": false,\n          "position": 2\n        },\n        {\n          "content": "노무현",\n          "isCorrect": false,\n          "position": 3\n        }\n      ]\n    }\n  ]\n}',
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'quiz_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              quizzes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    content: {
                      type: 'string',
                      description: '퀴즈의 질문 내용',
                    },
                    quizType: {
                      type: 'string',
                      enum: ['MC', 'TF'],
                      description: '퀴즈 유형 (MC: 객관식, TF: 참/거짓)',
                    },
                    timeLimit: {
                      type: 'integer',
                      description: '퀴즈 제한 시간(초 단위)',
                    },
                    point: {
                      type: 'integer',
                      description: '퀴즈 점수',
                    },
                    position: {
                      type: 'integer',
                      description: '퀴즈 순서',
                    },
                    choices: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          content: {
                            type: 'string',
                            description: '선택지의 내용',
                          },
                          isCorrect: {
                            type: 'boolean',
                            description: '정답 여부',
                          },
                          position: {
                            type: 'integer',
                            description: '선택지 순서',
                          },
                        },
                        required: ['content', 'isCorrect', 'position'],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ['content', 'quizType', 'timeLimit', 'point', 'position', 'choices'],
                  additionalProperties: false,
                },
              },
            },
            required: ['quizzes'],
            additionalProperties: false,
          },
        },
      },
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response.choices[0].message.content;
  }
}
