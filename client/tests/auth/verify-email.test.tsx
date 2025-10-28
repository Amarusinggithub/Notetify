import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import VerifyEmail from '../../src/pages/auth/verify-email.tsx';

const mockVerifyEmail = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../src/stores/use-auth-store.tsx', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('VerifyEmail page', () => {
  beforeEach(() => {
    mockVerifyEmail.mockReset();
    mockUseAuth.mockReturnValue({
      VerifyEmail: mockVerifyEmail,
      isLoading: false,
    });
  });

  it('calls VerifyEmail on submit', async () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /Resend verification email/i });
    fireEvent.click(submitButton);

    expect(mockVerifyEmail).toHaveBeenCalledWith('');
  });
});

