import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPassword from '../../src/pages/auth/reset-password.tsx';

const mockPasswordReset = vi.fn();
const mockSetErrors = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../src/stores/use-auth-store.tsx', () => ({
	useAuth: () => mockUseAuth(),
}));

function renderWithRoute(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/reset-password/:token" element={<ResetPassword />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe('ResetPassword page', () => {
	beforeEach(() => {
		mockPasswordReset.mockReset();
		mockSetErrors.mockReset();
		mockUseAuth.mockReturnValue({
			PasswordReset: mockPasswordReset,
			isLoading: false,
			errors: null,
			setErrors: mockSetErrors,
		});
	});

	it('submits when validation succeeds', async () => {
		renderWithRoute('/reset-password/abc123');

		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { name: 'password', value: 'password123' },
		});
		fireEvent.change(screen.getByLabelText(/Confirm password/i), {
			target: { name: 'confirmPassword', value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

		expect(mockSetErrors).toHaveBeenCalledWith(null);
		expect(mockPasswordReset).toHaveBeenCalledWith('abc123', 'password123');
	});

	it('prevents submission when passwords do not match', async () => {
		renderWithRoute('/reset-password/abc123');

		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { name: 'password', value: 'password123' },
		});
		fireEvent.change(screen.getByLabelText(/Confirm password/i), {
			target: { name: 'confirmPassword', value: 'password456' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Reset password/i }));

		expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
		expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
			confirmPassword: ['Passwords do not match.'],
		});
		expect(mockPasswordReset).not.toHaveBeenCalled();
	});
});
