import { CustomButton } from '@/shared/ui/buttons';
import PlusIcon from '@/shared/assets/icons/plus.svg?react';
import { useQuizContext } from '../contexts/useQuizContext';
import { useCreateQuiz } from '@/shared/hooks/quizzes';
import { INITIAL_QUIZ_VALUE } from '../contexts/quizContext';
import { useParams } from 'react-router-dom';

export default function QuizActions() {
  const { quizzes, currentQuizIndex, setQuizzes, setCurrentQuizIndex } = useQuizContext();
  const createQuizMutation = useCreateQuiz();
  const { classId } = useParams();

  const addNewQuiz = () => {
    setQuizzes((prev) => [...prev, { ...INITIAL_QUIZ_VALUE }]);
    setCurrentQuizIndex((prev) => prev + 1);
  };

  const removeQuiz = (index: number) => {
    if (quizzes.length === 1) return;
    setQuizzes((prev) => {
      const newQuizzes = [...prev];
      newQuizzes.splice(index, 1);

      if (index === prev.length - 1) {
        setCurrentQuizIndex((prevIndex) => Math.max(0, prevIndex - 1));
      }
      return newQuizzes;
    });
  };

  const handleCreateQuiz = () => {
    const quizzesData = {
      quizzes: quizzes,
    };
    createQuizMutation.mutate({ quizData: quizzesData, classId: Number(classId) });
  };

  return (
    <div className="flex justify-between mt-10 mr-6">
      <div className="flex gap-6">
        <CustomButton
          Icon={PlusIcon}
          type="outline"
          size="md"
          color="primary"
          label="문제 추가하기"
          onClick={addNewQuiz}
        />
        <button
          className="flex items-center min-w-fit h-[44px] px-4 py-2.5 bg-white border-2 border-red-500 text-red-500 rounded-base font-medium leading-none text-md
            disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={() => removeQuiz(currentQuizIndex)}
          disabled={quizzes.length === 1}
        >
          <PlusIcon className="w-5 h-5 mr-1 transform rotate-45" />
          문제 삭제하기
        </button>
      </div>
      <CustomButton label="퀴즈 발행하기" onClick={handleCreateQuiz} />
    </div>
  );
}
