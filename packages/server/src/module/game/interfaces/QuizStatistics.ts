interface ChoiceStatus {
  [key: string]: number;
}

interface EmojiStatus {
  easy: number;
  hard: number;
}

type SubmitHistoryEntry = [string, number];

export interface QuizStatistics {
  totalSubmit: number;
  totalCorrect: number;
  totalTime: number;
  choiceStatus: ChoiceStatus;
  submitHistory: SubmitHistoryEntry[];
  emojiStatus: EmojiStatus;
  startTime: number;
}
