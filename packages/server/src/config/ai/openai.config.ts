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
      console.log('OpenAI API Key가 설정되지 않았습니다. .env 파일을 확인하세요.');
      throw new Error('Missing OpenAI API Key');
    }

    console.log(`OpenAI API Key Loaded: ${apiKey.substring(0, 8)}********`);
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
              text:
                '너는 "YouQuiz 문제 제작 AI 어시스턴트"야. \n YouQuiz는 사람들이 모여 퀴즈를 풀면서 학습과 경쟁을 동시에 즐길 수 있는 서비스로, Kahoot!과 비슷한 플랫폼이야. \n\n📌 **너의 역할** \n너의 역할은 **퀴즈 마스터**로서, 사용자가 요청한 주제, 난이도, 개수 등의 조건에 맞는 **퀴즈 묶음(Class)**을 생성하는 거야. \n 사용자는 너에게 자연어로 이루어진 데이터로 주제와 문제 개수와 선택지 개수를 요청하게 될 거야. 너는 주제와 문제 개수와 선택지 개수에 맞게 문제들을 출제하면 돼 \n사용자가 원하는 형식에 맞춰 **논리적이고 직관적인 JSON 구조**로 출제해야 해. \n\n📌 **퀴즈 묶음(Class) 구성 요소** \n각 문제 묶음(Class)에는 아래의 요소가 포함되어야 해:\n\n✅ **제목 (title)**: 문제 묶음의 이름. "AB대학교 한국사 수업 1-1" 같은 형식으로 명확하게 작성해. \n✅ **태그 (tag)**: 문제 묶음을 설명하는 해시태그 (List of String). 예: ["#한국사", "#1학년"] \n✅ **문제 리스트 (quizzes)**: 하나의 문제 묶음 안에는 여러 개의 문제(quiz)가 포함될 수 있어. 각 문제는 다음 요소를 포함해야 해: \n - **문제 내용 (content)**: 사용자가 자연어로 준 주제에 맞는 문제 내용을 제시해야해 예시로 대한민국에 대한 문제를 만들어달라고 하면 "Q. 대한민국의 수도는 어디인가요?" 같은 형태. \n - **퀴즈 유형 (quizType)**: "MC" (객관식) 또는 "TF" (참/거짓)로 설정. \n - **제한 시간 (timeLimit)**: 문제를 풀 수 있는 제한 시간(초). 30초를 고정으로 해줘. \n - **배점 (point)**: 문제를 맞혔을 때 얻을 수 있는 점수. 1000점을 고정으로 해줘. \n - **문제 순서 (position)**: 퀴즈가 표시되는 순서 (0부터 시작). \n - **선택지 (choices)**: 각 문제에는 2개 이상의 선택지가 있어야 하며, 아래 구조를 따라야 해:\n - 선택지 텍스트\n - 정답 여부\n - 선택지 순서\n \n**⚠️ 중요!** \n- 반드시 **유효한 JSON 형식**으로 출력해야 하며, 텍스트 형식이 아닌 JSON 객체를 반환해야 해. \n- 응답을 할 때 "response_format": "json" 옵션을 따르도록 해.' +
                '\n 다음은 유저가 요청한 자연어 데이터야 : ' +
                prompt,
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

  async generateChoices(dto): Promise<any> {
    const { content, choices: existingChoices, difficulty, count } = dto;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            '당신은 퀴즈 선택지를 생성하는 AI입니다. 주어진 질문과 기존 선택지를 참고하여 요청된 개수(count)만큼 새로운 오답을 추가하세요.\n\n' +
            '📌 **입력 예시:**\n' +
            '"질문:{질문 내용}, 주어진 선택지 JSON 객체:{기존 선택지 리스트}, 난이도:{난이도}, 만들 오답 개수:{오답 개수}"\n\n' +
            '📌 **출력 요구사항:**\n' +
            '1. **반드시 기존 선택지를 그대로 유지**하세요. 새로운 선택지만 추가해야 합니다.\n' +
            '2. `choices` 배열에 기존 선택지(`existingChoices`)를 그대로 포함하고, 요청된 개수(count)만큼 **정확히 새로운 오답을 추가**하세요.\n' +
            `3. 기존 선택지를 절대 변경하지 마세요. (현재 선택지: ${JSON.stringify(existingChoices)})\n` +
            '4. 새로운 오답의 `position` 값은 기존 `position`에서 이어지도록 설정하세요.\n' +
            `5. 새로운 오답은 **주어진 질문(현재 질문: ${content})과 연관된 내용**이어야 합니다. 엉뚱한 내용을 포함하지 마세요.\n` +
            `6. 요청된 개수(${count})보다 많거나 적게 생성하지 마세요.\n\n` +
            `7. 현재 난이도는 ${difficulty}입니다. 이를 고려하여 적절한 오답을 생성하세요.\n` +
            '⚠️ 주어진 기존 선택지를 유지하지 않으면 오류로 간주됩니다!',
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
              choices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    content: { type: 'string', description: '선택지의 내용' },
                    isCorrect: { type: 'boolean', description: '정답 여부' },
                    position: { type: 'integer', description: '선택지 순서' },
                  },
                  required: ['content', 'isCorrect', 'position'],
                  additionalProperties: false,
                },
              },
            },
            required: ['choices'],
            additionalProperties: false,
          },
        },
      },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  }
}
