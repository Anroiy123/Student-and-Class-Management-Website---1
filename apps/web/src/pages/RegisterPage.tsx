import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/authHooks';
import type { UserRole } from '../lib/authContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

const schema = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      setSuccess(false);
      await registerUser(
        values.email,
        values.password,
        values.role as UserRole,
      );
      setSuccess(true);
      reset();
      setTimeout(() => navigate('/auth/sign-in'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="nb-card w-full max-w-sm"
      >
        <h1 className="text-xl font-bold">Đăng ký tài khoản</h1>
        <p className="mt-1 text-sm opacity-70">
          Tạo tài khoản mới cho hệ thống quản lý.
        </p>

        {error && (
          <div className="mt-4 border-3 border-black bg-nb-coral p-3 shadow-neo-sm">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 border-3 border-black bg-nb-mint p-3 shadow-neo-sm">
            <p className="text-sm font-semibold">
              Đăng ký thành công! Đang chuyển đến trang đăng nhập...
            </p>
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
            Vai trò
            <select {...register('role')} className="nb-input mt-1">
              <option value="STUDENT">Sinh viên</option>
              <option value="TEACHER">Giảng viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {errors.role && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.role.message}
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

          <label className="block text-sm font-semibold">
            Xác nhận mật khẩu
            <input
              type="password"
              {...register('confirmPassword')}
              className="nb-input mt-1"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="mt-1 block text-xs text-red-600">
                {errors.confirmPassword.message}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="nb-btn nb-btn--primary mt-6 w-full disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <div className="mt-4 text-center text-sm">
          <span className="opacity-70">Đã có tài khoản? </span>
          <Link
            to="/auth/sign-in"
            className="font-semibold underline hover:no-underline"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
};
