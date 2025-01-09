import { useEffect } from 'react';

import { usePersistState } from '@/shared/hooks/usePersistState';

import { INITIAL_MASTER_STATISTICS, INITIAL_EMOJI } from '@/shared/constants/initialState';
import { MasterStatisticsResponse } from '@youquiz/shared/interfaces/response';

interface HistoryItem {
  user: string;
  submitTime: number;
  elapsedTime: number;
  displayTime: string;
}

interface useStatisticsStateProps {
  initializeStates: boolean;
  setInitializeStates: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useStatisticsState = ({
  initializeStates,
  setInitializeStates,
}: useStatisticsStateProps) => {
  const [masterStatistics, setMasterStatistics] = usePersistState<MasterStatisticsResponse>(
    'masterStatistics',
    INITIAL_MASTER_STATISTICS,
  );
  const [reactionStats, setReactionStats] = usePersistState('reactionStats', INITIAL_EMOJI);
  const [history, setHistory] = usePersistState<HistoryItem[]>('history', []);

  const initializeStatistics = () => {
    setMasterStatistics(INITIAL_MASTER_STATISTICS);
    setReactionStats(INITIAL_EMOJI);
    setHistory([]);
  };

  useEffect(() => {
    initializeStatistics();
    setInitializeStates(false);
  }, [initializeStates]);

  return {
    masterStatistics,
    setMasterStatistics,
    reactionStats,
    setReactionStats,
    history,
    setHistory,
  };
};
