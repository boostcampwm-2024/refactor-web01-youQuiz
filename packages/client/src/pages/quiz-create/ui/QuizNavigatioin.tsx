import { useQuizContext } from '../contexts/useQuizContext';

export default function QuizNavigation() {
  const { currentQuizIndex, setCurrentQuizIndex, quizzes } = useQuizContext();

  const handlePreQuiz = () => {
    if (currentQuizIndex === 0) return;
    setCurrentQuizIndex((prev) => prev - 1);
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex === quizzes.length - 1) return;
    setCurrentQuizIndex((prev) => prev + 1);
  };

  return (
    <div className=" flex gap-4 bg-white rounded-base p-4 mb-4">
      <button className="text-weak-md" onClick={handlePreQuiz}>
        이전 문제
      </button>
      <button className="text-weak-md" onClick={handleNextQuiz}>
        다음 문제
      </button>
      <div className="flex-1 flex justify-end text-weak-md">문제 유형: 객관식</div>
    </div>
  );
}
