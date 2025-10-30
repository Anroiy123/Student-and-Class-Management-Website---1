import { useState, useEffect } from "react";
import type { Class } from "../../services/class.service";

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (classData: Class) => void;
  classData?: Class | null;
}

export const ClassForm = ({
  isOpen,
  onClose,
  onSubmit,
  classData,
}: ClassFormProps) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    size: "",
    homeroomTeacher: "",
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        code: classData.code,
        name: classData.name,
        size: classData.size?.toString() || "",
        homeroomTeacher: classData.homeroomTeacher || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        size: "",
        homeroomTeacher: "",
      });
    }
  }, [classData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: Partial<Class> = {
      code: formData.code,
      name: formData.name,
      size: formData.size ? Number(formData.size) : undefined,
      homeroomTeacher: formData.homeroomTeacher || undefined,
    };
    
    if (classData?._id) {
      submitData._id = classData._id;
    }
    
    onSubmit(submitData as Class);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {classData ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
                </h2>
                <p className="text-purple-100 text-sm mt-0.5">
                  {classData ? "Cập nhật thông tin lớp học" : "Điền đầy đủ thông tin bên dưới"}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Mã lớp */}
            <div className="group">
              <label htmlFor="code" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Mã lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="code"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="VD: CNTT-K60"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
              />
            </div>

            {/* Tên lớp */}
            <div className="group">
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Tên lớp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Công nghệ thông tin khóa 60"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
              />
            </div>

            {/* Sĩ số */}
            <div className="group">
              <label htmlFor="size" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Sĩ số <span className="text-gray-400 text-xs">(Tùy chọn)</span>
              </label>
              <input
                type="number"
                id="size"
                min="0"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="VD: 45"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
              />
            </div>

            {/* Giáo viên chủ nhiệm */}
            <div className="group">
              <label htmlFor="homeroomTeacher" className="mb-2 block text-sm font-semibold text-gray-700 flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Giáo viên chủ nhiệm <span className="text-gray-400 text-xs">(Tùy chọn)</span>
              </label>
              <input
                type="text"
                id="homeroomTeacher"
                value={formData.homeroomTeacher}
                onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
            >
              {classData ? "💾 Cập nhật" : "✨ Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
