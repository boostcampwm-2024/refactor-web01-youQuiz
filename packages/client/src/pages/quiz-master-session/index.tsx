import AsyncBoundary from '@/shared/boundary/AsyncBoundary';
import QuizMasterSessionLazyPage from './index.lazy';
import { QuizProvider } from './context/quizContext';

export default function QuizMasterSession() {
  return (
    <AsyncBoundary>
      <QuizProvider>
        <QuizMasterSessionLazyPage />
      </QuizProvider>
    </AsyncBoundary>
  );
}
