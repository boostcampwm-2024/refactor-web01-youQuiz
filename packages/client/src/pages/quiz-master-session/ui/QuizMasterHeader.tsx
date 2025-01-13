import { Socket } from 'socket.io-client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePersistState } from '@/shared/hooks/usePersistState';
import { useQuizContext } from '../hooks/useQuizContext';
import { getCookie } from '@/shared/utils/cookie';
import { clearLocalStorage } from '@/shared/utils/clearLocalStorage';
import { MASTER_LOCAL_STORAGE_KEYS } from '@/shared/constants/masterLocalStorageKey';

interface QuizMasterHeaderProps {
  pinCode: string;
  id: string;
  socket: Socket;
}

export default function QuizMasterHeader({ pinCode, socket, id }: QuizMasterHeaderProps) {
  const navigate = useNavigate();
  const { quiz, refetch, setInitializeStates } = useQuizContext();

  const [remainingTime, setRemainingTime] = usePersistState(
    'remainingTime',
    quiz.currentQuizData.timeLimit,
  );

  const handleNextQuiz = () => {
    if (quiz.isLast) {
      socket.emit('end quiz', { pinCode, sid: getCookie('sid') });
      clearLocalStorage(MASTER_LOCAL_STORAGE_KEYS);
      navigate(`/quiz/session/${pinCode}/end`);
      return;
    }

    socket.emitWithAck('start quiz', { pinCode, sid: getCookie('sid') }).then(() => {
      clearLocalStorage(MASTER_LOCAL_STORAGE_KEYS);
      navigate(`/quiz/session/host/${pinCode}/${parseInt(id) + 1}`);
      refetch();
      setInitializeStates(true);
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeLeft =
        quiz.currentQuizData.timeLimit - Math.floor((Date.now() - quiz.startTime) / 1000);
      setRemainingTime(timeLeft);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [quiz.startTime]);

  useEffect(() => {
    if (remainingTime === 0) {
      socket.emit('time end', { pinCode: pinCode });
    }
  }, [remainingTime]);

  return (
    <div className="p-5">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold mb-2">실시간 통계</h1>
          <p className="text-2xl font-bold mb-2">
            Q{quiz.currentQuizData.position + 1}. {quiz.currentQuizData.content}
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-500 mb-2">
            제한 시간 {remainingTime <= 0 ? '종료' : remainingTime}
          </p>
          <div className="mb-2">
            <button
              className={`bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-50`}
              onClick={handleNextQuiz}
              disabled={remainingTime > 0}
            >
              다음 퀴즈
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
