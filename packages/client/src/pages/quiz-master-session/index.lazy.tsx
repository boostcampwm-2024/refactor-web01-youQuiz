import { useParams } from 'react-router-dom';

import { getQuizSocket } from '@/shared/utils/socket';
import QuizMasterHeader from './ui/QuizMasterHeader';
import Statistics from './ui/Statistics';

export default function QuizMasterSessionLazyPage() {
  const { pinCode, id } = useParams();
  const socket = getQuizSocket();

  return (
    <div className="w-screen min-h-screen">
      <QuizMasterHeader pinCode={pinCode as string} socket={socket} id={id as string} />
      <Statistics />
    </div>
  );
}
