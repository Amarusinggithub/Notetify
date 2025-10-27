import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from '../../src/pages/auth/login.tsx';

const mockLogin = vi.fn();
const mockSetErrors = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../src/hooks/use-auth.tsx', () => ({
        useAuth: () => mockUseAuth(),
}));

describe('Login page', () => {
        beforeEach(() => {
                mockLogin.mockReset();
                mockSetErrors.mockReset();
                mockUseAuth.mockReturnValue({
                        Login: mockLogin,
                        isLoading: false,
                        errors: null,
                        setErrors: mockSetErrors,
                });
        });

        it('submits valid credentials', async () => {
                render(<Login />);

                const emailInput = screen.getByLabelText(/Email address/i);
                const passwordInput = screen.getByLabelText(/Password/i);
                const submitButton = screen.getByRole('button', { name: /Log in/i });

                fireEvent.change(emailInput, {
                        target: { name: 'email', value: 'user@example.com' },
                });
                fireEvent.change(passwordInput, {
                        target: { name: 'password', value: 'password123' },
                });

                fireEvent.click(submitButton);

                expect(mockSetErrors).toHaveBeenCalledWith(null);
                expect(mockLogin).toHaveBeenCalledWith({
                        email: 'user@example.com',
                        password: 'password123',
                        remember: false,
                });
        });

        it('prevents submission when validation fails', async () => {
                render(<Login />);

                const emailInput = screen.getByLabelText(/Email address/i);
                const passwordInput = screen.getByLabelText(/^Password$/i);
                const submitButton = screen.getByRole('button', { name: /Log in/i });

                fireEvent.change(emailInput, {
                        target: { name: 'email', value: 'invalid' },
                });
                fireEvent.change(passwordInput, {
                        target: { name: 'password', value: 'short' },
                });

                fireEvent.click(submitButton);

                expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
                expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
                        email: ['Please enter a valid email address.'],
                        password: ['Password must be at least 8 characters long.'],
                });
                expect(mockLogin).not.toHaveBeenCalled();
        });
});
