import { useEffect } from 'react';

import AnswerGraph from './AnswerChart';
import StatisticsGroup from './StatisticsGroup';
import StatisticsLayout from './StatisticsLayout';
import RightPanel from './RightPanel';

import { useStatisticsState } from '../hooks/useStatisticsState';
import { getQuizSocket } from '@/shared/utils/socket';
import { MasterStatisticsResponse } from '@youquiz/shared/interfaces/response/master-statistics.response.interface';

interface StatisticsProps {
  quizData: QuizData;
  initializeStates: boolean;
  setInitializeStates: React.Dispatch<React.SetStateAction<boolean>>;
  totalParticipants: number;
}

export default function Statistics({
  quizData,
  initializeStates,
  setInitializeStates,
  totalParticipants,
}: StatisticsProps) {
  const socket = getQuizSocket();
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
        <AnswerGraph
          answerStats={masterStatistics.choiceStatus}
          totalParticipants={totalParticipants}
          quizData={quizData}
        />
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
