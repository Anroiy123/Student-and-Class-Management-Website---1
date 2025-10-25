import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export const SignInPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="nb-card w-full max-w-sm"
      >
        <h1 className="text-xl font-bold">Đăng nhập hệ thống</h1>
        <p className="mt-1 text-sm opacity-70">
          Sử dụng tài khoản được cấp để truy cập.
        </p>

        {error && (
          <div className="mt-4 border-3 border-black bg-nb-coral p-3 shadow-neo-sm">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              {...register('email')}
              className="nb-input mt-1"
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.email.message}
              </span>
            )}
          </label>

          <label className="block text-sm font-semibold">
            Mật khẩu
            <input
              type="password"
              {...register('password')}
              className="nb-input mt-1"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.password.message}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="nb-btn nb-btn--primary mt-6 w-full disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="mt-4 text-center text-sm">
          <span className="opacity-70">Chưa có tài khoản? </span>
          <Link
            to="/auth/register"
            className="font-semibold underline hover:no-underline"
          >
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
};
