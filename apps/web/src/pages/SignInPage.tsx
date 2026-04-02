import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/authHooks';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useId } from 'react';

const schema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Generate unique IDs for form elements
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      await login(values.email, values.password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-edu-primary/5 via-edu-background to-edu-accent/5 dark:from-edu-dark-bg dark:via-edu-dark-bg dark:to-edu-dark-muted">
      <div className="w-full max-w-md">
        {/* Skip link for keyboard users */}
        <a href="#login-form" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-edu-primary focus:text-white focus:z-50 focus:rounded-lg">
          Chuyển đến form đăng nhập
        </a>
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-edu-ink dark:text-edu-dark-text tracking-tight mb-2">
            Edu<span className="text-edu-accent dark:text-edu-dark-accent">Manager</span>
          </h1>
          <p className="text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
            Hệ thống quản lý sinh viên
          </p>
        </div>
        
        <form
          id="login-form"
          onSubmit={handleSubmit(onSubmit)}
          className="edu-card shadow-elevated"
          aria-labelledby="form-title"
          aria-describedby={error ? errorId : undefined}
          noValidate
        >
          <header className="mb-6">
            <h2 id="form-title" className="text-xl font-semibold text-edu-ink dark:text-edu-dark-text">
              Đăng nhập
            </h2>
            <p className="mt-1 text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
              Sử dụng tài khoản được cấp để truy cập hệ thống.
            </p>
          </header>

          {error && (
            <div 
              id={errorId}
              className="mb-6 edu-alert edu-alert--error"
              role="alert"
              aria-live="assertive"
            >
              <span aria-hidden="true">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label 
                htmlFor={emailId} 
                className="edu-label"
              >
                Email
                <span className="text-edu-error ml-1" aria-hidden="true">*</span>
              </label>
              <input
                id={emailId}
                type="email"
                {...register('email')}
                className="edu-input"
                placeholder="you@example.com"
                autoComplete="email"
                aria-required="true"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? `${emailId}-error` : undefined}
              />
              {errors.email && (
                <p 
                  id={`${emailId}-error`}
                  className="mt-1.5 text-sm text-edu-error flex items-center gap-1"
                  role="alert"
                >
                  <span aria-hidden="true">✕</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor={passwordId} 
                className="edu-label"
              >
                Mật khẩu
                <span className="text-edu-error ml-1" aria-hidden="true">*</span>
              </label>
              <input
                id={passwordId}
                type="password"
                {...register('password')}
                className="edu-input"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? `${passwordId}-error` : undefined}
              />
              {errors.password && (
                <p 
                  id={`${passwordId}-error`}
                  className="mt-1.5 text-sm text-edu-error flex items-center gap-1"
                  role="alert"
                >
                  <span aria-hidden="true">✕</span>
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="edu-btn edu-btn--primary mt-6 w-full"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="edu-loading-spinner w-4 h-4" aria-hidden="true"></div>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>

          <p className="mt-6 text-center text-sm text-edu-ink-light dark:text-edu-dark-text-dim">
            Chưa có tài khoản?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-edu-primary dark:text-edu-dark-primary hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
        
        {/* Footer */}
        <p className="mt-6 text-center text-xs text-edu-ink-muted dark:text-edu-dark-text-dim">
          © 2025 EduManager. Bảo mật dữ liệu sinh viên.
        </p>
      </div>
    </div>
  );
};
