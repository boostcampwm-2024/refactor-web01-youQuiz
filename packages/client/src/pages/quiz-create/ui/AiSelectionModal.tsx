import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, Loader, Rocket, Sparkles, Book } from 'lucide-react';

import { useCreateChoices } from '@/shared/hooks/quizzes';
import { useQuizContext } from '../contexts/useQuizContext';
import { QUIZ_DIFFICULTY } from '@youquiz/shared/constants/quiz-difficulty.enum';
import Modal from '@/shared/ui/modal';

interface Choice {
  content: string;
  isCorrect: boolean;
  position: number;
}

interface AiSelectionModalProps {
  content: string;
  choices: Choice[];
  onClose: () => void;
}

interface AiSelectionProps extends AiSelectionModalProps {}

interface SelectionOptionType {
  content: string;
  choices: Choice[];
  difficulty: QUIZ_DIFFICULTY;
  count: number;
}

const difficulties = [
  {
    value: 'HARD',
    icon: <Rocket className="w-5 h-5 mb-2" />,
    title: '어려움',
    description: '상위 20% 이상의 학습자를 위한 도전적인 난이도입니다.',
  },
  {
    value: 'MEDIUM',
    icon: <Sparkles className="w-5 h-5 mb-2" />,
    title: '보통',
    description: '대부분의 학습자가 적당한 고민과 함께 풀 수 있는 난이도입니다.',
  },
  {
    value: 'EASY',
    icon: <Book className="w-5 h-5 mb-2" />,
    title: '쉬움',
    description: '핵심 개념을 처음 학습하거나 복습하기에 좋은 난이도입니다.',
  },
];

const AiSelection = ({ content, choices, onClose }: AiSelectionProps) => {
  const [selectionOption, setSelectionOption] = useState<SelectionOptionType>({
    content,
    choices,
    difficulty: QUIZ_DIFFICULTY.MEDIUM,
    count: 3,
  });
  const { setQuizzes, currentQuizIndex } = useQuizContext();
  const { mutate: createChoices, isPending } = useCreateChoices();
  const { classId } = useParams();

  console.log(selectionOption);

  const onMinusClick = () => {
    setSelectionOption((prev) => ({
      ...prev,
      count: Math.max(1, prev.count - 1),
    }));
  };

  const onPlusClick = () => {
    setSelectionOption((prev) => ({
      ...prev,
      count: Math.min(10, prev.count + 1),
    }));
  };

  const onDifficultyClick = (diff: string) => {
    setSelectionOption((prev) => ({
      ...prev,
      difficulty: diff as SelectionOptionType['difficulty'],
    }));
  };

  const onGenerateBtnClick = () => {
    createChoices(
      { classId, choices: selectionOption },
      {
        onSuccess: (data) => {
          setQuizzes((prev) => {
            const newQuizzes = [...prev];
            newQuizzes[currentQuizIndex] = {
              ...newQuizzes[currentQuizIndex],
              choices: data.data.choices,
            };
            return newQuizzes;
          });
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="flex flex-col w-full max-w-xl mx-auto p-6 shadow-lg rounded-lg bg-white space-y-6"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl text-center font-semibold text-gray-800 mb-4">선택지 생성 옵션</h2>

      <div className="grid grid-cols-3 gap-4">
        {difficulties.map(({ value, icon, title, description }) => (
          <button
            key={value}
            onClick={() => onDifficultyClick(value)}
            className={`group relative p-4 rounded-xl transition-all duration-200 hover:shadow-md
                ${
                  selectionOption?.difficulty === value
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                    : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-200'
                }
              `}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`transition-colors duration-200
                  ${selectionOption?.difficulty === value ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}
                `}
              >
                {icon}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p
                className={`text-xs leading-tight
                  ${selectionOption?.difficulty === value ? 'text-blue-50' : 'text-gray-500'}
                `}
              >
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col justify-center items-center space-y-2">
        <label className="text-sm font-medium text-gray-700">생성할 선택지 수</label>
        <div className="flex items-center space-x-4">
          <button
            onClick={onMinusClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={selectionOption.count <= 1}
          >
            <Minus
              className={`w-5 h-5 ${selectionOption.count <= 1 ? 'text-gray-300' : 'text-gray-600'}`}
            />
          </button>

          <span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">
            {selectionOption.count}
          </span>

          <button
            onClick={onPlusClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={selectionOption.count >= 5}
          >
            <Plus
              className={`w-5 h-5 ${selectionOption.count >= 10 ? 'text-gray-300' : 'text-gray-600'}`}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg
            hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2"
          onClick={onGenerateBtnClick}
        >
          {isPending ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : '문제 생성하기'}
        </button>
      </div>
    </div>
  );
};

export default function AiSelectionModal({ content, choices, onClose }: AiSelectionModalProps) {
  return (
    <Modal onClose={onClose}>
      <AiSelection content={content} choices={choices} onClose={onClose} />
    </Modal>
  );
}
