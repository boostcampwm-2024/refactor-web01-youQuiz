import AnswerGraph from './AnswerChart';
import RecentSubmittedAnswers from './RecentSubmittedAnswers';
import StatisticsGroup from './StatisticsGroup';
import EmojiChart from './EmojiChart';
import { useEffect } from 'react';
import { MasterStatisticsResponse } from '@youquiz/shared/interfaces/response/master-statistics.response.interface';
import { getQuizSocket } from '@/shared/utils/socket';

import { useStatisticsState } from '../hooks/useStatisticsState';

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
      <div className="grid grid-cols-[3fr_1fr] gap-4 mx-5 h-[calc(100vh-300px)]">
        <AnswerGraph
          answerStats={masterStatistics.choiceStatus}
          totalParticipants={totalParticipants}
          quizData={quizData}
        />
        <div className="flex flex-col gap-2 max-h-[calc(100vh-300px)]">
          <RecentSubmittedAnswers
            userSubmitHistory={masterStatistics.submitHistory}
            history={history}
            setHistory={setHistory}
          />
          <EmojiChart reactionStats={reactionStats} />
        </div>
      </div>
    </>
  );
}
