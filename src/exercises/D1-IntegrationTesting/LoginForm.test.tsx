/**
 * ============================================
 * D1 — Integration Testing Form (Test File)
 * ============================================
 * 
 * Test flow:
 * 1. Render(LoginForm)
 * 2. userEvent.type để nhập text
 * 3. userEvent.click submit
 * 4. Mock API
 * 5. await screen.findByText(/welcome back/i)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm Integration Tests', () => {
  // ============================================
  // TEST 1: Renders form elements correctly
  // ============================================
  test('renders login form with all required elements', () => {
    render(<LoginForm />);

    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // ============================================
  // TEST 2: Shows validation errors for empty fields
  // ============================================
  test('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Click submit without entering data
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check for error messages
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 3: Shows error for invalid email format
  // ============================================
  test('shows error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalidemail');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check for email format error
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 4: Shows error for short password
  // ============================================
  test('shows error for password less than 6 characters', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Enter short password
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), '12345');
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check for password length error
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 5: Successful login with mock API
  // ============================================
  test('shows success message after successful login', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    const mockSubmit = jest.fn().mockResolvedValue({
      success: true,
      message: 'Welcome back!',
    });

    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for success message
    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();

    // Verify mock was called with correct arguments
    expect(mockSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  // ============================================
  // TEST 6: Failed login shows error message
  // ============================================
  test('shows error message after failed login', async () => {
    const user = userEvent.setup();
    
    // Mock failed API response
    const mockSubmit = jest.fn().mockResolvedValue({
      success: false,
      message: 'Invalid credentials',
    });

    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 7: Shows loading state during submission
  // ============================================
  test('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    
    // Mock slow API response
    const mockSubmit = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Done' }), 100))
    );

    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Check for loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/logging in/i)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // TEST 8: Handles API error gracefully
  // ============================================
  test('handles API error gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    const mockSubmit = jest.fn().mockRejectedValue(new Error('Network error'));

    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for error message
    expect(await screen.findByText(/an error occurred/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 9: Clears form after successful login
  // ============================================
  test('clears form fields after successful login', async () => {
    const user = userEvent.setup();
    
    const mockSubmit = jest.fn().mockResolvedValue({
      success: true,
      message: 'Welcome back!',
    });

    render(<LoginForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    // Fill in the form
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Wait for success and check fields are cleared
    await screen.findByText(/welcome back/i);
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });

  // ============================================
  // TEST 10: Button is disabled while loading
  // ============================================
  test('disables submit button while loading', async () => {
    const user = userEvent.setup();
    
    const mockSubmit = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Done' }), 100))
    );

    render(<LoginForm onSubmit={mockSubmit} />);

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Check button is disabled
    expect(submitButton).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
