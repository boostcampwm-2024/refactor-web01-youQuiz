import { createContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

import { useQuizSession } from '@/pages/quiz-session/model/hooks/useQuizSession';
import { getQuizSocket } from '@/shared/utils/socket';

interface ShowQuizResponse {
  quizMaxNum: number;
  currentQuizData: QuizData;
  isLast: boolean;
  startTime: number;
  participantLength: number;
}

interface QuizProviderValue {
  quiz: ShowQuizResponse;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<ShowQuizResponse, Error>>;
  initializeStates: boolean;
  setInitializeStates: React.Dispatch<React.SetStateAction<boolean>>;
}

export const QuizContext = createContext<QuizProviderValue | undefined>(undefined);

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = getQuizSocket();
  const { pinCode, id } = useParams();
  const { data: quiz, refetch } = useQuizSession({
    socket,
    pinCode: pinCode as string,
    quizOrder: parseInt(id as string),
  });
  const [initializeStates, setInitializeStates] = useState(false);

  return (
    <QuizContext.Provider value={{ quiz, refetch, initializeStates, setInitializeStates }}>
      {children}
    </QuizContext.Provider>
  );
};
