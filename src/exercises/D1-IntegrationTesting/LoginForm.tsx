/**
 * ============================================
 * D1 — Integration Testing Form (RTL + Jest)
 * ============================================
 * 
 * WHAT: Test flow: nhập email/password → click login → mock API → kiểm tra success message
 * 
 * WHY:
 * - Test theo hành vi người dùng (behavioral)
 * - Không test nội bộ state
 * - Đảm bảo flow hoạt động end-to-end
 * 
 * HOW:
 * 1. Render(LoginForm)
 * 2. userEvent.type để nhập text
 * 3. userEvent.click submit
 * 4. Mock API (jest hoặc MSW)
 * 5. await screen.findByText(/welcome back/i)
 */

import React, { useState } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
}

interface FormErrors {
  email?: string;
  password?: string;
}

// ============================================
// LOGIN FORM COMPONENT
// ============================================

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Default submit handler (mock API)
  const defaultSubmit = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (email === 'test@example.com' && password === 'password123') {
      return { success: true, message: 'Welcome back!' };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitHandler = onSubmit || defaultSubmit;
      const result = await submitHandler(email, password);

      if (result.success) {
        setSuccessMessage(result.message);
        setEmail('');
        setPassword('');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 className="section-title">D1: Login Form (For Testing)</h2>

      {/* Success Message */}
      {successMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 15px',
            background: '#d4edda',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#155724',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '10px 15px',
            background: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#721c24',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="input-field"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className="error-message">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="input-field"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <span id="password-error" className="error-message">
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner" style={{ marginRight: '10px' }}></span>
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Test Credentials Hint */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h4>🔑 Test Credentials:</h4>
        <p style={{ fontSize: '14px', marginTop: '5px' }}>
          Email: <code>test@example.com</code>
          <br />
          Password: <code>password123</code>
        </p>
      </div>

      {/* Technical Info */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Testing Features:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px', fontSize: '14px' }}>
          <li>Proper labels with <code>htmlFor</code></li>
          <li>ARIA attributes for accessibility</li>
          <li>Role alerts for messages</li>
          <li>Testable by user behavior</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginForm;
