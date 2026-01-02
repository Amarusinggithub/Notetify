import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '../../src/pages/auth/register.tsx';

const mockSignUp = vi.fn();
const mockSetErrors = vi.fn();

vi.mock('../../src/stores/index.ts', () => ({
	useStore: () => ({
		SignUp: mockSignUp,
		isLoading: false,
		errors: null,
		setErrors: mockSetErrors,
	}),
}));

describe('Register page', () => {
	beforeEach(() => {
		mockSignUp.mockReset();
		mockSetErrors.mockReset();
	});

	it('submits trimmed form data when validation succeeds', async () => {
		render(
			<MemoryRouter>
				<Register />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(/First Name/i), {
			target: { name: 'first_name', value: '  Jane ' },
		});
		fireEvent.change(screen.getByLabelText(/Last Name/i), {
			target: { name: 'last_name', value: '  Doe ' },
		});
		fireEvent.change(screen.getByLabelText(/Email address/i), {
			target: { name: 'email', value: '  jane.doe@example.com ' },
		});
		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { name: 'password', value: 'password123' },
		});
		fireEvent.change(screen.getByLabelText(/Confirm password/i), {
			target: { name: 'confirmPassword', value: 'password123' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

		expect(mockSetErrors).toHaveBeenCalledWith(null);
		expect(mockSignUp).toHaveBeenCalledWith(
			'Jane',
			'Doe',
			'jane.doe@example.com',
			'password123',
		);
	});

	it('prevents submission when passwords do not match', async () => {
		render(
			<MemoryRouter>
				<Register />
			</MemoryRouter>,
		);

		fireEvent.change(screen.getByLabelText(/First Name/i), {
			target: { name: 'first_name', value: 'John' },
		});
		fireEvent.change(screen.getByLabelText(/Last Name/i), {
			target: { name: 'last_name', value: 'Smith' },
		});
		fireEvent.change(screen.getByLabelText(/Email address/i), {
			target: { name: 'email', value: 'john.smith@example.com' },
		});
		fireEvent.change(screen.getByLabelText(/^Password$/i), {
			target: { name: 'password', value: 'password123' },
		});
		fireEvent.change(screen.getByLabelText(/Confirm password/i), {
			target: { name: 'confirmPassword', value: 'password456' },
		});

		fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

		expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
		expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
			confirmPassword: ['Passwords do not match.'],
		});
		expect(mockSignUp).not.toHaveBeenCalled();
	});
});
