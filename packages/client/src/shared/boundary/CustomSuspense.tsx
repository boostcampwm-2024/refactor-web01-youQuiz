import { Suspense, startTransition, useState, useEffect } from 'react';
import QuizLoading from '@/pages/quiz-session/ui/QuizLoading';

interface CustomSuspenseProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  delayMs?: number;
}

export default function CustomSuspense({
  fallback = <QuizLoading />,
  children,
  delayMs = 500,
}: CustomSuspenseProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setShouldRender(true);
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, []);

  return <Suspense fallback={shouldRender ? fallback : null}>{children}</Suspense>;
}
