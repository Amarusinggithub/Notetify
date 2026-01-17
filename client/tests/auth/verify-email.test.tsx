import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmail from '../../src/pages/auth/verify-email.tsx';

const mockVerifyEmail = vi.fn();

vi.mock('../../src/stores/index.ts', () => ({
	useStore: () => ({
		VerifyEmail: mockVerifyEmail,
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

		expect(mockVerifyEmail).toHaveBeenCalledWith('test@example.com');
	});
});
