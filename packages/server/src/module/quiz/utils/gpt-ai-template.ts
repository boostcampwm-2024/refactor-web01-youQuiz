// import OpenAI from 'openai';

import OpenAI from 'openai';
import { RoleType } from '../domain/type/gpt-ai-role.enum';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const template = (
//   prompt: string,
// ): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =>
//   ({
//     model: 'gpt-4o',
//     messages: [
//       {
//         role: 'assistant',
//         content: `너는 "YouQuiz 문제 제작 AI 어시스턴트"야. YouQuiz는 사람들이 모여 퀴즈를 풀면서 학습과 경쟁을 동시에 즐길 수 있는 서비스로, Kahoot!과 비슷한 플랫폼이야.

//       📌 **너의 역할**
//       너의 역할은 **퀴즈 마스터**로서, 사용자가 요청한 주제, 난이도, 개수 등의 조건에 맞는 **퀴즈 묶음(Class)**을 생성하는 거야.
//       사용자는 너에게 자연어로 이루어진 데이터로 주제와 문제 개수와 선택지 개수를 요청하게 될 거야. 너는 주제와 문제 개수와 선택지 개수에 맞게 문제들을 출제하면 돼.

//       다음은 유저가 요청한 자연어 데이터야: ${prompt}`,
//       },
//     ],
//     response_format: {
//       type: 'json_schema',
//       json_schema: {
//         name: 'quiz_response',
//         strict: true,
//         schema: {
//           type: 'object',
//           properties: {
//             quizzes: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   content: { type: 'string', description: '퀴즈의 질문 내용' },
//                   quizType: { type: 'string', enum: ['MC', 'TF'], description: '퀴즈 유형' },
//                   timeLimit: { type: 'integer', description: '퀴즈 제한 시간' },
//                   point: { type: 'integer', description: '퀴즈 점수' },
//                   position: { type: 'integer', description: '퀴즈 순서' },
//                   choices: {
//                     type: 'array',
//                     items: {
//                       type: 'object',
//                       properties: {
//                         content: { type: 'string', description: '선택지 내용' },
//                         isCorrect: { type: 'boolean', description: '정답 여부' },
//                         position: { type: 'integer', description: '선택지 순서' },
//                       },
//                       required: ['content', 'isCorrect', 'position'],
//                     },
//                   },
//                 },
//                 required: ['content', 'quizType', 'timeLimit', 'point', 'position', 'choices'],
//               },
//             },
//           },
//           required: ['quizzes'],
//         },
//       },
//     },
//     temperature: 1,
//     max_completion_tokens: 2048,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//   }) as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
export const systemMessage = (): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
  role: 'system',
  content: `너는 "YouQuiz 문제 제작 AI 어시스턴트"야. YouQuiz는 사람들이 모여 퀴즈를 풀면서 학습과 경쟁을 동시에 즐길 수 있는 서비스로, Kahoot!과 비슷한 플랫폼이야.

  📌 **너의 역할** 
  너의 역할은 **퀴즈 마스터**로서, 사용자가 요청한 주제, 난이도, 개수 등의 조건에 맞는 **퀴즈 묶음(Class)**을 생성하는 거야. 
  사용자는 너에게 자연어로 이루어진 데이터로 주제와 문제 개수와 선택지 개수를 요청하게 될 거야. 너는 주제와 문제 개수와 선택지 개수에 맞게 문제들을 출제하면 돼.`,
});

export const roleText = (
  role: RoleType,
  text: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
  role,
  content: text,
});

export const buildMessages = (
  prompts: { role: RoleType; text: string }[],
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  return [systemMessage(), ...prompts.map(({ role, text }) => roleText(role, text))];
};

export const template = (
  prompts: { role: RoleType; text: string }[],
): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming => ({
  model: 'gpt-4o',
  messages: buildMessages(prompts),
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
                content: { type: 'string', description: '퀴즈의 질문 내용' },
                quizType: { type: 'string', enum: ['MC', 'TF'], description: '퀴즈 유형' },
                timeLimit: { type: 'integer', description: '퀴즈 제한 시간' },
                point: { type: 'integer', description: '퀴즈 점수' },
                position: { type: 'integer', description: '퀴즈 순서' },
                choices: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      content: { type: 'string', description: '선택지 내용' },
                      isCorrect: { type: 'boolean', description: '정답 여부' },
                      position: { type: 'integer', description: '선택지 순서' },
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
