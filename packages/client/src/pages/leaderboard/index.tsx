import AsyncBoundary from '@/shared/boundary/AsyncBoundary';
import LeaderboardLazyPage from './index.lazy';

export default function Leaderboard() {
  return (
    <AsyncBoundary>
      <LeaderboardLazyPage />
    </AsyncBoundary>
  );
}
