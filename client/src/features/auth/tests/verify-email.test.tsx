import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmail from '@/features/auth/pages/verify-email.tsx';

const mockVerifyEmail = vi.fn();

vi.mock('@/app/store/index.ts', () => ({
	useStore: () => ({
		isLoading: false,
		sharedData: {
			auth: {
				user: {
					email: 'test@example.com',
				},
			},
		},
	}),
}));
vi.mock('@/features/auth/hooks/use-verify-email', () => ({
	default: (...args: any[]) => mockVerifyEmail(...args),
}));
vi.mock('@/features/auth/hooks/use-logout', () => ({
	default: vi.fn(),
}));

describe('VerifyEmail page', () => {
	beforeEach(() => {
		mockVerifyEmail.mockReset();
	});

	it('calls VerifyEmail on submit', async () => {
		render(
			<MemoryRouter>
				<VerifyEmail />
			</MemoryRouter>
		);

		const submitButton = screen.getByRole('button', {
			name: /Resend verification email/i,
		});
		fireEvent.click(submitButton);

		expect(mockVerifyEmail).toHaveBeenCalledWith();
	});
});
