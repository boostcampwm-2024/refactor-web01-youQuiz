import { describe, it, vi, beforeEach, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCheckPincodePossible } from '@/pages/main/hooks/useCheckPincodePossible';
import { toastController } from '@/features/toast/model/toastController';
import { checkPincodePossible } from '@/shared/api/games';

vi.mock('@/features/toast/model/toastController');
vi.mock('@/shared/api/games');

describe('useCheckPincodePossible 커스텀 훅 테스트', () => {
  let mockToast: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockToast = {
      warning: vi.fn(),
    };
    (toastController as jest.Mock).mockReturnValue(mockToast);
  });

  it('룸에 접근 가능할 때 닉네임 페이지로 이동한다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';

    (checkPincodePossible as jest.Mock).mockResolvedValue({ isPossible: true });

    const { result } = renderHook(() => useCheckPincodePossible());

    await result.current.navigateIfRoomAvailable(pinCode, mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith(`/nickname/${pinCode}`);

    expect(mockToast.warning).not.toHaveBeenCalled();
  });

  it('룸에 접근 불가능할 때 경고 토스트를 보여준다.', async () => {
    const mockNavigate = vi.fn();
    const pinCode = '123456';

    (checkPincodePossible as jest.Mock).mockResolvedValue({ isPossible: false });

    const { result } = renderHook(() => useCheckPincodePossible());

    await result.current.navigateIfRoomAvailable(pinCode, mockNavigate);

    expect(mockToast.warning).toHaveBeenCalledWith('방이 가득 찼습니다.');

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
