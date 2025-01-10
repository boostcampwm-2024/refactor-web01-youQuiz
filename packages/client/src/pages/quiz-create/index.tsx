import QuizCreateSection from './ui/QuizCreateSection';
import { QuizProvider } from './contexts/quizContext';
import QuizNavigation from './ui/QuizNavigatioin';
import QuizActions from './ui/QuizActions';

export default function QuizCreatePage() {
  return (
    <QuizProvider>
      <div className="flex flex-col w-full mt-6 mx-6">
        <QuizNavigation />
        <QuizCreateSection />
        <QuizActions />
      </div>
    </QuizProvider>
  );
}
