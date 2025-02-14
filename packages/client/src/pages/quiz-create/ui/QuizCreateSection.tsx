import { useState, useRef } from 'react';
import { Bot } from 'lucide-react';

import CustomButton from '@/shared/ui/buttons/CustomButton';
import InputBox from '@/shared/ui/input-box/InputBox';
import TimeSelectBox from './TimeSelectBox';
import PlusIcon from '@/shared/assets/icons/plus.svg?react';
import AiSelectionModal from './AiSelectionModal';

import { useQuizContext } from '../contexts/useQuizContext';
import { QuizData } from '../contexts/quizContext.types';
import DraggableAnswerContainer from './DraggableContainer';

export default function QuizCreateSection() {
  const { quizzes, currentQuizIndex, setQuizzes } = useQuizContext();
  const quizData = quizzes[currentQuizIndex];

  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [selectionModal, setSelectionModal] = useState(false);
  const inputValidation =
    quizData.content !== '' && quizData.choices.findIndex((e) => e.isCorrect === true) >= 0;

  console.log(quizData);

  const onQuizUpdate = (updatedData: QuizData) => {
    setQuizzes((prev) => {
      const newQuizzes = [...prev];
      newQuizzes[currentQuizIndex] = { ...updatedData, position: currentQuizIndex };
      return newQuizzes;
    });
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const updateChoice = (index: number, updates: Partial<(typeof quizData.choices)[0]>) => {
    const updatedChoices = quizData.choices.map((choice, i) =>
      i === index ? { ...choice, ...updates, position: index } : choice,
    );
    onQuizUpdate({
      ...quizData,
      choices: updatedChoices,
    });
  };

  const onAiSelectionClick = () => {
    //TODO: 모달창 열리기
    setSelectionModal(true);
    //버튼에 로딩이 보이도록
  };

  return (
    <section>
      <article className="min-w-content min-h-[532px] flex flex-col gap-1 items-center bg-white rounded-base p-6">
        <div className="self-start relative">
          <span className="text-weak-md mr-3">{`${currentQuizIndex + 1}번 퀴즈`}</span>
          <span
            className="text-weak-sm cursor-pointer"
            onClick={() => setShowTimeSelect(!showTimeSelect)}
          >
            {`${quizData.timeLimit}초`}
          </span>
          {showTimeSelect && (
            <TimeSelectBox
              setTime={(time: number) => onQuizUpdate({ ...quizData, timeLimit: time })}
              setShowTimeSelect={setShowTimeSelect}
            />
          )}
          <span className="text-sm text-gray-500 ml-5">* 복수 선택 가능</span>
        </div>
        <div className="w-full">
          <InputBox
            placeholder="문제를 입력해주세요"
            type="box"
            onSubmit={(value) => onQuizUpdate({ ...quizData, content: value })}
            initialValue={quizData.content}
          />
        </div>
        <div className="flex flex-col gap-4 w-full mt-6">
          <DraggableAnswerContainer
            quizData={quizData}
            updateChoice={updateChoice}
            onQuizUpdate={onQuizUpdate}
            inputRefs={inputRefs}
            handleKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex gap-2 self-start mt-4">
          <CustomButton
            Icon={PlusIcon}
            type="outline"
            size="md"
            color="secondary"
            label="답안 추가하기"
            onClick={() => {
              onQuizUpdate({
                ...quizData,
                choices: [...quizData.choices, { content: '', isCorrect: false, position: 0 }],
              });
            }}
          />
          <CustomButton
            Icon={Bot}
            type="outline"
            size="md"
            color="primary"
            label="AI 선택지 자동생성"
            disable={!inputValidation}
            onClick={onAiSelectionClick}
          />
        </div>
      </article>

      {selectionModal && (
        <AiSelectionModal
          onClose={() => setSelectionModal(false)}
          content={quizData.content}
          choices={quizData.choices}
        />
      )}
    </section>
  );
}
