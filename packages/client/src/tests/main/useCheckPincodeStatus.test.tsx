import { describe, it, vi, beforeEach, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCheckPincodeStatus } from '@/pages/main/hooks/useCheckPincodeStatus';
import { toastController } from '@/features/toast/model/toastController';
import { checkPincodeStatus } from '@/shared/api/games';
import { deleteCookie } from '@/shared/utils/cookie';

vi.mock('@/features/toast/model/toastController');
vi.mock('@/shared/api/games');
vi.mock('@/shared/utils/cookie');

describe('useCheckPincodeStatus 커스텀 훅 테스트', () => {
  let mockToast: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockToast = {
      info: vi.fn(),
    };
    (toastController as jest.Mock).mockReturnValue(mockToast);
  });

  it('게임이 종료되었을 때 올바른 메시지와 함께 쿠키를 삭제한다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';
    const sid = 'test-sid';

    (checkPincodeStatus as jest.Mock).mockResolvedValue({
      isPossible: false,
      message: '게임이 종료되었습니다.',
    });

    const { result } = renderHook(() => useCheckPincodeStatus());

    await result.current.navigateBasedOnGameStatus(pinCode, sid, mockNavigate);

    expect(mockToast.info).toHaveBeenCalledWith('게임이 종료되었습니다.');
    expect(deleteCookie).toHaveBeenCalledWith('sid');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('게임 상태가 없을 때 닉네임 페이지로 이동한다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';
    const sid = 'test-sid';

    (checkPincodeStatus as jest.Mock).mockResolvedValue({
      isPossible: true,
      gameStatus: null,
    });

    const { result } = renderHook(() => useCheckPincodeStatus());

    await result.current.navigateBasedOnGameStatus(pinCode, sid, mockNavigate);

    expect(deleteCookie).toHaveBeenCalledWith('sid');
    expect(mockNavigate).toHaveBeenCalledWith(`/nickname/${pinCode}`);
  });

  it('게임 상태에 따라 올바른 경로로 이동한다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';
    const sid = 'test-sid';

    (checkPincodeStatus as jest.Mock).mockResolvedValue({
      isPossible: true,
      gameStatus: 'IN PROGRESS',
    });

    const { result } = renderHook(() => useCheckPincodeStatus());

    await result.current.navigateBasedOnGameStatus(pinCode, sid, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith(`/quiz/session/${pinCode}/1`);
    expect(deleteCookie).not.toHaveBeenCalled();
  });

  it('게임 상태가 LEADERBOARD 또는 END일 때 올바른 경로로 이동한다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';
    const sid = 'test-sid';

    (checkPincodeStatus as jest.Mock).mockResolvedValue({
      isPossible: true,
      gameStatus: 'LEADERBOARD',
    });

    const { result } = renderHook(() => useCheckPincodeStatus());

    await result.current.navigateBasedOnGameStatus(pinCode, sid, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith(`/quiz/session/${pinCode}/end`);
    expect(deleteCookie).not.toHaveBeenCalled();
  });
});
