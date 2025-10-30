import { useState, useEffect } from "react";
import type { Student } from "./StudentTable";
import { useClasses } from "../../hooks/useClasses";

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<Student, "id"> | Student) => void;
  student?: Student;
}

export const StudentForm = ({
  isOpen,
  onClose,
  onSubmit,
  student,
}: StudentFormProps) => {
  // Fetch danh sách lớp
  const { data: classes, isLoading: isLoadingClasses } = useClasses();
  
  const [formData, setFormData] = useState({
    mssv: "",
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    className: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        mssv: student.mssv || "",
        fullName: student.fullName || "",
        email: student.email || "",
        phone: student.phone || "",
        dateOfBirth: student.dateOfBirth || "",
        address: student.address || "",
        className: student.className || "",
      });
    } else {
      setFormData({
        mssv: "",
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        className: "",
      });
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      onSubmit({ ...formData, id: student.id });
    } else {
      onSubmit(formData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {student ? "Chỉnh sửa thông tin" : "Thêm sinh viên mới"}
                </h2>
                <p className="text-blue-100 text-sm mt-0.5">
                  {student ? "Cập nhật thông tin sinh viên" : "Điền đầy đủ thông tin bên dưới"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form with better styling */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* MSSV */}
            <div className="group">
              <label htmlFor="mssv" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                MSSV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="mssv"
                required
                value={formData.mssv}
                onChange={(e) => setFormData({ ...formData, mssv: e.target.value })}
                placeholder="VD: 2021601234"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
              />
            </div>

            {/* Họ và tên */}
            <div className="group">
              <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
              />
            </div>

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="VD: student@example.com"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
              />
            </div>

            {/* Số điện thoại */}
            <div className="group">
              <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="VD: 0912345678"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
              />
            </div>

            {/* Ngày sinh */}
            <div className="group">
              <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300"
              />
            </div>

            {/* Lớp */}
            <div className="group">
              <label htmlFor="className" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Lớp <span className="text-gray-400 text-xs">(Tùy chọn)</span>
              </label>
              <select
                id="className"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                disabled={isLoadingClasses}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Chọn lớp --</option>
                {classes?.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.code} - {cls.name}
                  </option>
                ))}
              </select>
              {isLoadingClasses && (
                <p className="mt-1 text-xs text-gray-500">Đang tải danh sách lớp...</p>
              )}
            </div>

            {/* Địa chỉ */}
            <div className="md:col-span-2 group">
              <label htmlFor="address" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP.HCM"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 hover:border-gray-300 resize-none"
              />
            </div>
          </div>

          {/* Actions with better design */}
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            >
              {student ? "💾 Cập nhật" : "✨ Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
