import { QuizData } from '@/pages/quiz-create/contexts/quizContext.types';
import { apiClient } from '..';

interface Quizzes {
  quizzes: QuizData[];
}

interface PromptHistory {
  role: string;
  text: string;
}

export const getQuiz = async (classId: number): Promise<QuizData[]> => {
  return apiClient.get(`/classes/${classId}/quizzes`);
};

export const createQuiz = async (quizData: Quizzes, classId: number): Promise<void> => {
  return apiClient.post(`/classes/${classId}/quizzes`, {
    body: quizData,
  });
};

export const createAIQuiz = async (classId: number, text: string) => {
  return apiClient.post(`/classes/${classId}/quizzes/ai/generate`, {
    body: { text },
  });
};

export const createAIChoices = async (classId: number, choices: any) => {
  console.log(choices);
  return apiClient.post(`/classes/${classId}/quizzes/choices/ai/generate`, {
    body: { ...choices },
  });
};

export const requestAdditionalQuiz = async (classId: number, promptHistory: PromptHistory[]) => {
  return apiClient.post(`/classes/${classId}/quizzes/ai/generate/adjust`, {
    body: { conversationHistory: promptHistory },
  });
};

export const postFeedback = async (classId: number, prompts: string[], feedback: string) => {
  return apiClient.post(`/classes/${classId}/quizzes/ai/generate/feedback`, {
    body: { prompts, feedback },
  });
};
