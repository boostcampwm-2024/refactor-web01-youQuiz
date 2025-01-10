import { toastController } from '@/features/toast/model/toastController';
import { checkPincodeStatus } from '@/shared/api/games';
import { deleteCookie } from '@/shared/utils/cookie';
import { useCallback } from 'react';

const mappingGameStatus = (status: string, pinCode: string) => {
  switch (status) {
    case 'WAITING':
      return `/quiz/wait/${pinCode}`;
    case 'IN PROGRESS':
      return `/quiz/session/${pinCode}/1`;
    case 'LEADERBOARD':
    case 'END':
      return `/quiz/session/${pinCode}/end`;
    default:
      return '/';
  }
};

export const useCheckPincodeStatus = () => {
  const toast = toastController();
  const navigateBasedOnGameStatus = useCallback(
    async (pinCode: string, sid: string, navigate: Function) => {
      const response = await checkPincodeStatus(pinCode, sid);

      if (!response.isPossible) {
        toast.info(response.message || '게임이 종료되었습니다.');
        deleteCookie('sid');
        return;
      }

      const status = response.gameStatus;
      if (!status) {
        deleteCookie('sid');
        navigate(`/nickname/${pinCode}`);
        return;
      }

      const path = mappingGameStatus(status, pinCode);
      navigate(path);
    },
    [],
  );

  return { navigateBasedOnGameStatus };
};
