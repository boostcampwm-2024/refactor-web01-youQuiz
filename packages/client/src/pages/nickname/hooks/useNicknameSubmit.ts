import { useNavigate, useParams } from 'react-router-dom';
import { setCookie } from '@/shared/utils/cookie';
import { getQuizSocket } from '@/shared/utils/socket';
import { emitEventWithAck } from '@/shared/utils/emitEventWithAck';
import { toastController } from '@/features/toast/model/toastController';

export const useNicknameSubmit = () => {
  const { pinCode } = useParams();
  const navigate = useNavigate();
  const toast = toastController();

  const handleSubmit = async (nickname: string) => {
    if (!pinCode) {
      toast.error('잘못된 접근입니다.');
      navigate('/');
      return;
    }

    const socket = getQuizSocket();
    try {
      const sid = await emitEventWithAck<string>(socket, 'session', {
        pinCode,
        nickname,
      });

      if (!sid) {
        toast.warning('방이 가득 찼습니다.');
        navigate('/');
        return;
      }

      setCookie('sid', sid, 30);
      socket.emit('participant notice', { pinCode });
      navigate(`/quiz/wait/${pinCode}`);
    } catch (error) {
      toast.error('닉네임 등록 중 문제가 발생했습니다.');
    }
  };

  return handleSubmit;
};
