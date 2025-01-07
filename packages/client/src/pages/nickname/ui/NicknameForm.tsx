import { useState } from 'react';
import TrophyIcon from '@/shared/assets/icons/tropyhy.svg?react';
import AvatarIcon from '@/shared/assets/icons/avatar.svg?react';

const MAX_NICKNAME_LENGTH = 12;

interface NicknameFormProps {
  onSubmit: (nickname: string) => Promise<void>;
  isLoading?: boolean;
}

export const NicknameForm: React.FC<NicknameFormProps> = ({ onSubmit, isLoading = false }) => {
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(nickname);
  };

  return (
    <form className="flex flex-col items-center gap-3 w-fit" onSubmit={handleSubmit}>
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
          className={`w-20 h-10 text-white bg-primary rounded-3xl 
            ${!nickname || isLoading ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
          disabled={!nickname || isLoading}
        >
          {isLoading ? '처리중...' : '참가하기'}
        </button>
      </div>
    </form>
  );
};
