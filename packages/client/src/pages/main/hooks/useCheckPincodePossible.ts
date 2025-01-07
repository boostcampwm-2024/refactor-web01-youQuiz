import { toastController } from '@/features/toast/model/toastController';
import { checkPincodePossible } from '@/shared/api/games';
import { useCallback } from 'react';

export const useCheckPincodePossible = () => {
  const toast = toastController();
  const navigateIfRoomAvailable = useCallback(async (pinCode: string, navigate: Function) => {
    const response = await checkPincodePossible(pinCode);

    if (!response.isPossible) {
      toast.warning('방이 가득 찼습니다.');
      return;
    }
    navigate(`/nickname/${pinCode}`);
  }, []);

  return { navigateIfRoomAvailable };
};
