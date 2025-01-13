import { useContext } from 'react';
import { QuizContext } from '../context/quizContext';

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuizContext is undefined. Please check useQuizSession');
  }
  return context;
};
