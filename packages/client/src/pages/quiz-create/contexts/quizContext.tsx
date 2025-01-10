import { createContext, useState } from 'react';
import { QuizContextValue, QuizData } from './quizContext.types';

export const INITIAL_QUIZ_VALUE: QuizData = {
  content: '',
  quizType: 'MC',
  timeLimit: 30,
  point: 1000,
  position: 0,
  choices: [
    { content: '', isCorrect: false, position: 0 },
    { content: '', isCorrect: false, position: 1 },
  ],
};

export const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [quizzes, setQuizzes] = useState<QuizData[]>([{ ...INITIAL_QUIZ_VALUE }]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  return (
    <QuizContext.Provider value={{ quizzes, setQuizzes, currentQuizIndex, setCurrentQuizIndex }}>
      {children}
    </QuizContext.Provider>
  );
};
