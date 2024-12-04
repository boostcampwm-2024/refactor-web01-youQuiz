import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import TrophyIcon from '@/shared/assets/icons/tropyhy.svg?react';
import AvatarIcon from '@/shared/assets/icons/avatar.svg?react';

import { setCookie } from '@/shared/utils/cookie';
import { getQuizSocket } from '@/shared/utils/socket';
import { emitEventWithAck } from '@/shared/utils/emitEventWithAck';
import { toastController } from '@/features/toast/model/toastController';

const MAX_NICKNAME_LENGTH = 12;

export default function Nickname() {
  const { pinCode } = useParams();
  const navigate = useNavigate();
  const toast = toastController();
  const [nickname, setNickname] = useState('');

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const socket = getQuizSocket();
    try {
      const sid = await emitEventWithAck<string>(socket, 'session', {
        pinCode: pinCode,
        nickname: nickname,
      });
      if (!sid) {
        toast.warning('방이 가득 찼습니다.');
        navigate(`/`);
        return;
      }
      setCookie('sid', sid, 30);
      socket.emit('participant notice', { pinCode: pinCode });
      navigate(`/quiz/wait/${pinCode}`);
    } catch (error) {
      toast.error('닉네임 등록 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center px-64 pt-16 min-w-[980px]">
      <form className="flex flex-col items-center gap-3 w-fit" onSubmit={handleNicknameSubmit}>
        <label
          htmlFor="nickname"
          className="flex gap-2 ml-1 items-center text-xl font-bold self-start"
        >
          <TrophyIcon />
          닉네임
        </label>
        <div className="flex gap-3 items-center w-[650px] h-16 p-4 border-2 rounded-base border-border">
          <div className="flex justify-center items-center w-8 h-8 rounded-full bg-weak">
            <AvatarIcon />
          </div>
          <input
            type="text"
            id="nickname"
            placeholder="Your Name"
            className="w-[488px] bg-transparent focus:outline-none"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={MAX_NICKNAME_LENGTH}
          />
          <button
            type="submit"
            className={`w-20 h-10 text-white bg-primary rounded-3xl ${
              nickname.length === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
            disabled={nickname.length === 0}
          >
            참가하기
          </button>
        </div>
      </form>
    </div>
  );
}
