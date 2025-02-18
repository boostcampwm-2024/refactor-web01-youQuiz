import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAIQuiz,
  createQuiz,
  createAIChoices,
  requestAdditionalQuiz,
  postFeedback,
} from '../api/quizzes';
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

interface PromptHistory {
  role: string;
  text: string;
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
    onMutate: ({ classId, text }) => {
      const previousHistory =
        (queryClient.getQueryData(['promptHistory', classId]) as string[]) || [];

      queryClient.setQueryData(
        ['promptHistory', classId],
        [...previousHistory, { role: 'user', text }],
      );

      return { previousHistory };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      });
      toast.success('AI가 자동 생성한 퀴즈가 생성되었습니다.');
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(['promptHistory', variables.classId], context.previousHistory);
      }
      console.log(err);
      toast.error('AI 퀴즈 생성에 실패했습니다.');
    },
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

export const useRequestAdditionalQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['quiz', 'AI', 'additional'],
    mutationFn: ({ classId, text }: CreateAIQuizParams) => {
      const previousHistory =
        (queryClient.getQueryData(['promptHistory', classId]) as PromptHistory[]) || [];

      return requestAdditionalQuiz(classId, [...previousHistory, { role: 'user', text }]);
    },
    onMutate: ({ classId, text }) => {
      const previousHistory =
        (queryClient.getQueryData(['promptHistory', classId]) as string[]) || [];

      queryClient.setQueryData(
        ['promptHistory', classId],
        [...previousHistory, { role: 'user', text }],
      );

      return { previousHistory };
    },
  });
};

export const usePostFeedback = () => {
  const toast = toastController();
  return useMutation({
    mutationKey: ['quiz', 'AI', 'feedback'],
    mutationFn: ({ classId, prompts, feedback }: any) => postFeedback(classId, prompts, feedback),
    onSuccess: () => {
      toast.success('피드백이 감사합니다.');
    },
    onError: () => toast.error('피드백 전송에 실패했습니다.'),
  });
};
