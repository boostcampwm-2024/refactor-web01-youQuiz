import { useEffect } from 'react';

import AnswerGraph from './AnswerChart';
import StatisticsGroup from './StatisticsGroup';
import StatisticsLayout from './StatisticsLayout';
import RightPanel from './RightPanel';

import { useStatisticsState } from '../hooks/useStatisticsState';
import { getQuizSocket } from '@/shared/utils/socket';
import { MasterStatisticsResponse } from '@youquiz/shared/interfaces/response/master-statistics.response.interface';
import { useQuizContext } from '../hooks/useQuizContext';

export default function Statistics() {
  const socket = getQuizSocket();
  const { initializeStates, setInitializeStates } = useQuizContext();
  const {
    masterStatistics,
    setMasterStatistics,
    reactionStats,
    setReactionStats,
    history,
    setHistory,
  } = useStatisticsState({ initializeStates, setInitializeStates });

  useEffect(() => {
    const handleMasterStatistics = (response: MasterStatisticsResponse) => {
      setMasterStatistics(response);
    };

    const handleReactionUpdate = (response: { easy: number; hard: number }) => {
      setReactionStats(response);
    };

    socket.on('master statistics', handleMasterStatistics);
    socket.on('emoji', handleReactionUpdate);

    return () => {
      socket.off('master statistics', handleMasterStatistics);
      socket.off('emoji', handleReactionUpdate);
    };
  }, []);

  return (
    <>
      <StatisticsGroup participantStatistics={masterStatistics} />
      <StatisticsLayout>
        <AnswerGraph answerStats={masterStatistics.choiceStatus} />
        <RightPanel
          masterStatistics={masterStatistics}
          history={history}
          setHistory={setHistory}
          reactionStats={reactionStats}
        />
      </StatisticsLayout>
    </>
  );
}
