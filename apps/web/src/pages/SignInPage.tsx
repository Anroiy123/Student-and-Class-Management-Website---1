import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export const SignInPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    console.log("Sign-in placeholder", values);
    // TODO: gọi API đăng nhập tại đây
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-lg"
      >
        <h1 className="text-xl font-semibold text-slate-900">
          Đăng nhập hệ thống
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sử dụng tài khoản được cấp để truy cập.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            Email
            <input
              type="email"
              {...register("email")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-500">
                {errors.email.message}
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-600">
            Mật khẩu
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">
                {errors.password.message}
              </span>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
};
