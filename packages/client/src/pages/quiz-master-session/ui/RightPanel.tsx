import RecentSubmittedAnswers from './RecentSubmittedAnswers';
import EmojiChart from './EmojiChart';

import { MasterStatisticsResponse } from '@youquiz/shared/interfaces/response';

interface HistoryItem {
  user: string;
  submitTime: number;
  elapsedTime: number;
  displayTime: string;
}

interface RightPanelProps {
  masterStatistics: MasterStatisticsResponse;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  reactionStats: { easy: number; hard: number };
}

export default function RightPanel({
  masterStatistics,
  history,
  setHistory,
  reactionStats,
}: RightPanelProps) {
  return (
    <div className="flex flex-col gap-2 max-h-[calc(100vh-300px)]">
      <RecentSubmittedAnswers
        userSubmitHistory={masterStatistics.submitHistory}
        history={history}
        setHistory={setHistory}
      />
      <EmojiChart reactionStats={reactionStats} />
    </div>
  );
}
