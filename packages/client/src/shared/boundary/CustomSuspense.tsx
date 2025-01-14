import { Suspense } from 'react';
import QuizLoading from '@/pages/quiz-session/ui/QuizLoading';

interface CustomSuspenseProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function CustomSuspense({
  fallback = <QuizLoading />,
  children,
}: CustomSuspenseProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
