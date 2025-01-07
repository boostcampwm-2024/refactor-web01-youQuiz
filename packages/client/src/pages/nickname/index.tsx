import { useState } from 'react';
import { NicknameForm } from './ui/NicknameForm';
import { useNicknameSubmit } from './hooks/useNicknameSubmit';

export default function NicknamePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNicknameSubmit = useNicknameSubmit();

  const handleSubmit = async (nickname: string) => {
    setIsSubmitting(true);
    try {
      await handleNicknameSubmit(nickname);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-64 pt-16 min-w-[980px]">
      <NicknameForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
