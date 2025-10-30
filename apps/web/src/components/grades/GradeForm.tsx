import { useState, useEffect } from "react";
import type { Grade } from "../../services/grade.service";

interface GradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { attendance: number; midterm: number; final: number }) => void;
  initialData?: Grade | null;
  studentName?: string;
  courseName?: string;
}

export const GradeForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  studentName,
  courseName 
}: GradeFormProps) => {
  const [formData, setFormData] = useState({
    attendance: 0,
    midterm: 0,
    final: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        attendance: initialData.attendance || 0,
        midterm: initialData.midterm || 0,
        final: initialData.final || 0,
      });
    } else {
      setFormData({ attendance: 0, midterm: 0, final: 0 });
    }
  }, [initialData, isOpen]);

  const calculateTotal = () => {
    return (formData.attendance * 0.1 + formData.midterm * 0.3 + formData.final * 0.6).toFixed(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📝 Nhập điểm
                </h2>
                <p className="text-amber-100 text-sm mt-1">
                  {studentName && `${studentName} - `}{courseName || "Môn học"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Điểm chuyên cần */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Điểm chuyên cần (10%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="10"
                step="0.1"
                value={formData.attendance}
                onChange={(e) => setFormData({ ...formData, attendance: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-bold text-gray-700 text-center text-lg"
              />
            </div>

            {/* Điểm giữa kỳ */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Điểm giữa kỳ (30%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="10"
                step="0.1"
                value={formData.midterm}
                onChange={(e) => setFormData({ ...formData, midterm: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-bold text-gray-700 text-center text-lg"
              />
            </div>

            {/* Điểm cuối kỳ */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Điểm cuối kỳ (60%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="10"
                step="0.1"
                value={formData.final}
                onChange={(e) => setFormData({ ...formData, final: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-bold text-gray-700 text-center text-lg"
              />
            </div>
          </div>

          {/* Điểm tổng kết */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Điểm tổng kết (tự động tính)</p>
                <p className="text-xs text-gray-500 mt-1">
                  Công thức: Chuyên cần × 0.1 + Giữa kỳ × 0.3 + Cuối kỳ × 0.6
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {calculateTotal()}
                </p>
                <p className="text-sm font-semibold text-amber-600 mt-1">/ 10 điểm</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-orange-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              💾 Lưu điểm
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
