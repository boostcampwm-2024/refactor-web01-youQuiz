import { ErrorBoundary } from 'react-error-boundary';

export default function AsyncBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={<div>ERROR 발생! 비상</div>}>{children}</ErrorBoundary>;
}
