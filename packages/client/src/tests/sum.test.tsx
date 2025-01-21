import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import '@testing-library/jest-dom';
import App from '@/app';

describe('메인 페이지 테스트', () => {
  it('메인 페이지 제목 렌더링', () => {
    const { getByText } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(getByText('You Quiz')).toBeInTheDocument();
  });
});
