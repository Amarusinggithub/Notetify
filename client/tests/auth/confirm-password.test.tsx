// These tests exercise the Confirm Password screen and its validation
// flow. The page uses the `useAuth` hook to submit and to surface
// field-based errors (Zod client-side + server-side mapped), so we mock
// that hook to observe interactions and avoid real network calls.
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import ConfirmPassword from '../../src/pages/auth/confirm-password.tsx';

// Test doubles for the `useAuth` contract consumed by the page
const mockConfirmPassword = vi.fn();
const mockSetErrors = vi.fn();
const mockUseAuth = vi.fn();

// Replace the real hook with our stub so the component under test
// receives predictable functions/state.
vi.mock('../../src/stores/use-auth-store.tsx', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('ConfirmPassword page', () => {
  // Reset spies and provide fresh default hook values before each test
  beforeEach(() => {
    mockConfirmPassword.mockReset();
    mockSetErrors.mockReset();
    mockUseAuth.mockReturnValue({
      ConfirmPassword: mockConfirmPassword,
      isLoading: false,
      errors: null,
      setErrors: mockSetErrors,
    });
  });

  it('submits valid password', async () => {
    // Render inside a MemoryRouter because the page uses React Router
    // primitives within the shared layout (links, etc.).
    render(
      <MemoryRouter>
        <ConfirmPassword />
      </MemoryRouter>,
    );

    // Fill a valid password and submit the form
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitButton = screen.getByRole('button', { name: /Confirm password/i });

    fireEvent.change(passwordInput, {
      target: { name: 'password', value: 'password123' },
    });

    fireEvent.click(submitButton);

    // The page clears prior errors and calls the hook with the value
    expect(mockSetErrors).toHaveBeenCalledWith(null);
    expect(mockConfirmPassword).toHaveBeenCalledWith('password123');
  });

  it('prevents submission when validation fails', async () => {
    render(
      <MemoryRouter>
        <ConfirmPassword />
      </MemoryRouter>,
    );

    // Provide a too-short password to trigger Zod validation errors
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const submitButton = screen.getByRole('button', { name: /Confirm password/i });

    fireEvent.change(passwordInput, {
      target: { name: 'password', value: 'short' },
    });

    fireEvent.click(submitButton);

    // First the component clears errors, then it sets fieldErrors from Zod
    expect(mockSetErrors).toHaveBeenNthCalledWith(1, null);
    expect(mockSetErrors).toHaveBeenNthCalledWith(2, {
      password: ['Password must be at least 8 characters long.'],
    });
    // And the submit action is not invoked
    expect(mockConfirmPassword).not.toHaveBeenCalled();
  });
});
