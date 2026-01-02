import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPassword from '../../src/pages/auth/forgot-password.tsx';

const mockForgotPassword = vi.fn();
const mockSetErrors = vi.fn();

vi.mock('../../src/stores/index.ts', () => ({
	useStore: () => ({
		ForgotPassword: mockForgotPassword,
		isLoading: false,
		errors: null,
		setErrors: mockSetErrors,
	}),
}));

describe('ForgotPassword page', () => {
	beforeEach(() => {
		mockForgotPassword.mockReset();
		mockSetErrors.mockReset();
	});

	it('submits valid email', async () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);

		const emailInput = screen.getByLabelText(/Email address/i);
		const submitButton = screen.getByRole('button', {
			name: /Email password reset link/i,
		});

		fireEvent.change(emailInput, {
			target: { name: 'email', value: '  User@Example.com ' },
		});

		fireEvent.click(submitButton);

		expect(mockSetErrors).toHaveBeenCalledWith(null);
		expect(mockForgotPassword).toHaveBeenCalledWith('User@Example.com');
	});

	it('prevents submission when validation fails', async () => {
		render(
			<MemoryRouter>
				<ForgotPassword />
			</MemoryRouter>,
		);

		const emailInput = screen.getByLabelText(/Email address/i);
		const submitButton = screen.getByRole('button', {
			name: /Email password reset link/i,
		});

		fireEvent.change(emailInput, {
			target: { name: 'email', value: 'invalid' },
		});

		fireEvent.click(submitButton);

		expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
		expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
			email: ['Please enter a valid email address.'],
		});
		expect(mockForgotPassword).not.toHaveBeenCalled();
	});
});
