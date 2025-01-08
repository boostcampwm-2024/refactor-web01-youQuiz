export interface QuizData {
  content: string;
  quizType: 'MC' | 'TF';
  timeLimit: number;
  point: number;
  position: number;
  choices: Choice[];
}

interface Choice {
  content: string;
  isCorrect: boolean;
  position: number;
}

export interface QuizContextValue {
  quizzes: QuizData[];
  setQuizzes: React.Dispatch<React.SetStateAction<QuizData[]>>;
  currentQuizIndex: number;
  setCurrentQuizIndex: React.Dispatch<React.SetStateAction<number>>;
}
