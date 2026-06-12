import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfirmPassword from '@/features/auth/pages/confirm-password.tsx';

const mockConfirmPassword = vi.fn();
const mockSetErrors = vi.fn();

vi.mock('@/app/store/index.ts', () => ({
	useStore: () => ({
		isLoading: false,
		errors: null,
		setErrors: mockSetErrors,
	}),
}));
vi.mock('@/features/auth/hooks/use-confirm-password', () => ({
	default: (...args: any[]) => mockConfirmPassword(...args),
}));

describe('ConfirmPassword page', () => {
	beforeEach(() => {
		mockConfirmPassword.mockReset();
		mockSetErrors.mockReset();
	});

	it('submits valid password', async () => {
		render(
			<MemoryRouter>
				<ConfirmPassword />
			</MemoryRouter>
		);

		const passwordInput = screen.getByLabelText(/^Password$/i);
		const submitButton = screen.getByRole('button', {
			name: /Confirm password/i,
		});

		fireEvent.change(passwordInput, {
			target: { name: 'password', value: 'password123' },
		});

		fireEvent.click(submitButton);

		expect(mockSetErrors).toHaveBeenCalledWith(null);
		expect(mockConfirmPassword).toHaveBeenCalledWith('password123');
	});

	it('prevents submission when validation fails', async () => {
		render(
			<MemoryRouter>
				<ConfirmPassword />
			</MemoryRouter>
		);

		const passwordInput = screen.getByLabelText(/^Password$/i);
		const submitButton = screen.getByRole('button', {
			name: /Confirm password/i,
		});

		fireEvent.change(passwordInput, {
			target: { name: 'password', value: 'short' },
		});

		fireEvent.click(submitButton);

		expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
		expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
			password: ['Password must be at least 8 characters long.'],
		});
		expect(mockConfirmPassword).not.toHaveBeenCalled();
	});
});
