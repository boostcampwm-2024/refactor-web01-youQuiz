import { lazy, ComponentType } from 'react';

import CustomSuspense from '@/shared/boundary/CustomSuspense';
import QuizLoading from '@/pages/quiz-session/ui/QuizLoading';

export default function withLazySuspense(
  importFn: () => Promise<{ default: ComponentType }>,
  fallback = <QuizLoading />,
) {
  const LazyComponent = lazy(importFn);

  return function WithLazySuspense() {
    return (
      <CustomSuspense fallback={fallback}>
        <LazyComponent />
      </CustomSuspense>
    );
  };
}
