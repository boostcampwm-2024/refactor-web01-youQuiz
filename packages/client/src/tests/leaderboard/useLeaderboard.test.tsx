import { describe, expect, it, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Socket } from 'socket.io-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { useLeaderboard } from '@/pages/leaderboard/model/hooks/useLeaderboard';
import { emitEventWithAck } from '@/shared/utils/emitEventWithAck';
import QuizLoading from '@/pages/quiz-session/ui/QuizLoading';

vi.mock('@/shared/utils/emitEventWithAck');

const mockLeaderboardData = {
  rankerData: [
    { rank: 1, nickname: 'User1', score: 100 },
    { rank: 2, nickname: 'User2', score: 90 },
  ],
  participantNumber: 2,
  averageScore: 95,
};

describe('useLeaderboard Custom Hook Test', () => {
  let mockSocket: Socket;
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // QueryClient 초기화
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Socket 모킹
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    } as unknown as Socket;

    // emitEventWithAck 모킹 설정
    (emitEventWithAck as jest.Mock).mockResolvedValue(mockLeaderboardData);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('성공적으로 리더보드 데이터를 가져온다.', async () => {
    const pinCode = '123456';

    const { result } = renderHook(() => useLeaderboard(mockSocket, pinCode), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(emitEventWithAck).toHaveBeenCalledWith(mockSocket, 'leaderboard', { pinCode });
    expect(result.current.data).toEqual(mockLeaderboardData);
  });

  it('캐시된 데이터를 재사용한다', async () => {
    const pinCode = '123456';

    // 첫 번째 렌더
    const { result, rerender } = renderHook(() => useLeaderboard(mockSocket, pinCode), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // emitEventWithAck 호출 횟수 확인
    expect(emitEventWithAck).toHaveBeenCalledTimes(1);

    // 재렌더
    rerender();

    expect(emitEventWithAck).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockLeaderboardData);
  });

  it('Promise Pending 상태에서 Suspense fallback을 렌더링한다.', async () => {
    const pinCode = '123456';
    const TestComponent = () => {
      const { data } = useLeaderboard(mockSocket, pinCode);
      return <div>{data.averageScore}</div>;
    };
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<QuizLoading />}>{children}</Suspense>
        </QueryClientProvider>
      );
    };

    let resolvePromise: (value: unknown) => void;

    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (emitEventWithAck as jest.Mock).mockReturnValue(promise);

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    expect(screen.getByText('데이터를 가져오는 중 입니다.')).toBeInTheDocument();

    resolvePromise!(mockLeaderboardData);

    await waitFor(() => {
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  it('에러가 발생하면 ErrorBoundary 화면을 보여준다.', async () => {
    const pinCode = '123456';
    const TestComponent = () => {
      const { data } = useLeaderboard(mockSocket, pinCode);
      return <div>{data.averageScore}</div>;
    };
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary fallback={'에러 발생'}>
            <Suspense fallback={<QuizLoading />}>{children}</Suspense>
          </ErrorBoundary>
        </QueryClientProvider>
      );
    };

    (emitEventWithAck as jest.Mock).mockRejectedValue(new Error('에러 발생'));

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText('에러 발생')).toBeInTheDocument();
    });
  });
});
