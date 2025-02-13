import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Minus, Plus, Loader } from 'lucide-react';

import { useCreateChoices } from '@/shared/hooks/quizzes';
import { useQuizContext } from '../contexts/useQuizContext';
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
  difficulty: 'HARD' | 'NORMAL' | 'EASY';
  count: number;
}

const difficulty = ['HARD', 'NORMAL', 'EASY'];

const AiSelection = ({ content, choices, onClose }: AiSelectionProps) => {
  const [selectionOption, setSelectionOption] = useState<SelectionOptionType>({
    content,
    choices,
    difficulty: 'HARD',
    count: 3,
  });
  const { setQuizzes } = useQuizContext();
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
    // API 요청
    // 모달 닫힘
    // 버튼에서 Loading 돌아가기
    createChoices(
      { classId, choices: selectionOption },
      {
        onSuccess: (data) => {
          console.log(data.data);
          setQuizzes(data.data.choices);
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="flex flex-col w-full max-w-2xl mx-auto p-6 shadow-lg rounded-lg bg-white space-y-6"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">선택지 생성 옵션</h2>

      <div className="grid grid-cols-3 gap-4">
        {difficulty.map((value) => (
          <button
            key={value}
            onClick={() => onDifficultyClick(value)}
            className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors
              ${
                selectionOption.difficulty === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
              }`}
          >
            {value === 'HARD' && '어려움'}
            {value === 'NORMAL' && '보통'}
            {value === 'EASY' && '쉬움'}
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
          {isPending ? (
            <div className="animate-spin">
              <Loader className="w-4 h-4" />
            </div>
          ) : (
            '문제 생성하기'
          )}
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
