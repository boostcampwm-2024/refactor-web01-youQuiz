import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAIQuiz, createQuiz, createAIChoices } from '../api/quizzes';
import { QuizData } from '@/pages/quiz-create/contexts/quizContext.types';
import { toastController } from '@/features/toast/model/toastController';
import { useNavigate } from 'react-router-dom';

interface Quizzes {
  quizzes: QuizData[];
}

interface CreateQuizParams {
  quizData: Quizzes;
  classId: number;
}

export const useCreateQuiz = () => {
  const toast = toastController();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['quiz'],
    mutationFn: ({ quizData, classId }: CreateQuizParams) => createQuiz(quizData, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      });
      navigate('/quiz-list');
      toast.success('퀴즈가 생성되었습니다.');
    },
    onError: () => toast.error('퀴즈 생성에 실패했습니다.'),
  });
};

interface CreateAIQuizParams {
  classId: number;
  text: string;
}

export const useCreateAIQuiz = () => {
  const toast = toastController();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['quiz', 'AI'],
    mutationFn: ({ classId, text }: CreateAIQuizParams) => createAIQuiz(classId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      });
      toast.success('AI가 자동 생성한 퀴즈가 생성되었습니다.');
    },
    onError: () => toast.error('AI 퀴즈 생성에 실패했습니다.'),
  });
};

export const useCreateChoices = () => {
  const toast = toastController();
  return useMutation({
    mutationKey: ['quiz', 'AI', 'choice'],
    mutationFn: ({ classId, choices }: any) => createAIChoices(classId, choices),
    onSuccess: () => {
      toast.success('AI가 자동 생성한 선택지가 생성되었습니다.');
    },
    onError: () => toast.error('AI 선택지 생성에 실패했습니다.'),
  });
};
