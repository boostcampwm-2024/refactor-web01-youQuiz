import { useSuspenseQuery } from '@tanstack/react-query';
import { Socket } from 'socket.io-client';

import { Ranking } from '@/pages/leaderboard/index.lazy';
import { emitEventWithAck } from '@/shared/utils/emitEventWithAck';

interface LeaderboardData {
  rankerData: Ranking[];
  participantNumber: number;
  averageScore: number;
}

export const useLeaderboard = (socket: Socket, pinCode: string) => {
  return useSuspenseQuery({
    queryKey: ['leaderboard', pinCode],
    queryFn: () => emitEventWithAck<LeaderboardData>(socket, 'leaderboard', { pinCode }),
  });
};
