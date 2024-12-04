import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { deleteCookie, getCookie } from '@/shared/utils/cookie';
import { Socket } from 'socket.io-client';

interface ExitModalProps {
  onClose: () => void;
  pinCode: string;
  socket: Socket;
}

export default function ExitModal({ onClose, pinCode, socket }: ExitModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLeaveRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    socket.emit('leave room', { pinCode, sid: getCookie('sid') });
    queryClient.removeQueries({ queryKey: ['participant info', pinCode] });
    deleteCookie('sid');
    onClose();
    navigate('/');
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20"
      onClick={onClose}
    >
      <div
        className="bg-white w-96 h-46 p-6 rounded-lg shadow-lg text-center"
        onClick={handleModalClick}
      >
        <p className="text-xl text-gray-600 font-medium">정말로 나가시겠습니까?</p>
        <span className="text-md text-gray-400">퀴즈가 대기 중이면 다시 참가할 수 있어요.</span>
        <div className="mt-9 flex justify-center space-x-4">
          <button
            className="bg-slate-400 text-white w-24 rounded hover:bg-slate-600"
            onClick={handleLeaveRoom}
          >
            예
          </button>
          <button
            className="bg-blue-500 text-white w-24 py-2 rounded hover:bg-blue-600"
            onClick={onClose}
          >
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}
