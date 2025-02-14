import { QuizData } from '@/pages/quiz-create/contexts/quizContext.types';
import { apiClient } from '..';

interface Quizzes {
  quizzes: QuizData[];
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
