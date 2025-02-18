import React, { useState } from 'react';
import { LightbulbIcon, X, ChevronDown, ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import { useQuizContext } from '../contexts/useQuizContext';
import { useRequestAdditionalQuiz } from '@/shared/hooks/quizzes';
import { useParams } from 'react-router-dom';
import { toastController } from '@/features/toast/model/toastController';
import { INITIAL_QUIZ_VALUE } from '../contexts/quizContext';

const MAX_ADDITIONAL_QUERIES = 3;

interface Choice {
  content: string;
  isCorrect: boolean;
  position: number;
}

interface Quiz {
  content: string;
  quizType: 'MC' | 'TF';
  timeLimit: number;
  point: number;
  position: number;
  choices: Choice[];
}

interface QuizResultModalProps {
  quizzes?: Quiz[];
  onClose: () => void;
}

function QuizItem({ quiz }: { quiz: Quiz; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="border rounded-lg mb-2">
      <button
        onClick={handleOpen}
        className="w-full px-4 py-3 flex items-start justify-between text-left hover:bg-gray-50 rounded-lg"
      >
        <div className="flex items-start gap-2">
          <span className="text-gray-500">Q{quiz.position + 1}.</span>
          <span className="font-normal">{quiz.content}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="pl-6 space-y-2">
            {quiz.choices.map((choice, choiceIndex) => (
              <div
                key={choiceIndex}
                className={`p-3 rounded-lg ${
                  choice.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <span className="mr-2 text-gray-500">
                    {quiz.quizType === 'TF'
                      ? choiceIndex === 0
                        ? 'T'
                        : 'F'
                      : `${choiceIndex + 1}`}
                    .
                  </span>
                  <span>{choice.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizResultModal({ quizzes = [], onClose }: QuizResultModalProps) {
  const { setQuizzes } = useQuizContext();
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [prompt, setPrompt] = useState('');
  const { mutate, isPending } = useRequestAdditionalQuiz();
  const { classId } = useParams();
  const toast = toastController();

  const handleAdditionalQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryCount >= MAX_ADDITIONAL_QUERIES) {
      toast.info('더 이상 추가 질의를 할 수 없습니다.');
      return;
    }

    if (showPromptInput && prompt.trim()) {
      // onAdditionalQuery(prompt);
      // setPrompt('');
      console.log('onAdditionalQuery(prompt);');
      setQueryCount((prev) => prev + 1);
      setShowPromptInput(false);
    } else {
      setShowPromptInput((pre) => !pre);
    }
  };

  const handleFeedback = (type: string) => {
    if (type === 'up') {
      // toast.success('피드백이 전송되었습니다.');
      // api request
    } else {
      // toast.error('피드백이 전송되었습니다.');
    }
  };

  const handleCancel = () => {
    setQuizzes([{ ...INITIAL_QUIZ_VALUE }]);
    onClose();
  };

  const handleNewQuery = () => {
    if (prompt.trim()) {
      console.log(prompt);
      mutate(
        { classId: Number(classId), text: prompt },
        {
          onSuccess: (data) => {
            setQuizzes(data.data.quizzes);
            setPrompt('');
            setQueryCount((prev) => prev + 1);
            setShowPromptInput(false);
          },
          onError: (error) => {
            console.log(error);
          },
        },
      );
    }
  };

  return (
    <div
      className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LightbulbIcon className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">생성된 퀴즈</h2>
          </div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <div className="space-y-2">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz, index) => <QuizItem key={index} quiz={quiz} index={index} />)
          ) : (
            <div className="text-center py-8 text-gray-500">생성된 퀴즈가 없습니다.</div>
          )}
          {quizzes && quizzes.length > 0 && (
            <div className="flex gap-2 justify-end px-2">
              <button
                className="text-gray-400 hover:text-blue-600"
                onClick={() => handleFeedback('up')}
              >
                <ThumbsUp className="w-4" />
              </button>
              <button
                className="text-gray-400 hover:text-red-200"
                onClick={() => handleFeedback('down')}
              >
                <ThumbsDown className="w-4" />
              </button>
            </div>
          )}
        </div>

        {showPromptInput && (
          <div className="space-y-4">
            {isPending ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <textarea
                className="w-full min-h-[200px] p-4 text-gray-700 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="퀴즈 생성을 위한 프롬프트를 입력해주세요."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            )}
            <button
              onClick={handleNewQuery}
              className="px-4 py-2 inline-flex bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isPending}
            >
              추가하기
            </button>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            남은 추가 질의: {MAX_ADDITIONAL_QUERIES - queryCount}회
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleAdditionalQuery}
              disabled={queryCount >= MAX_ADDITIONAL_QUERIES}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              질의 추가
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
