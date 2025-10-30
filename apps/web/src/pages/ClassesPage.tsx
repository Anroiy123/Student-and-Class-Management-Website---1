import { useState } from "react";
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from "../hooks/useClasses";
import { ClassTable } from "../components/classes/ClassTable";
import { ClassForm } from "../components/classes/ClassForm";
import type { Class } from "../services/class.service";

export const ClassesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Fetch classes
  const { data: classes, isLoading, error } = useClasses();

  // Mutations
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();

  const handleAddClass = () => {
    setEditingClass(null);
    setIsFormOpen(true);
  };

  const handleEditClass = (classData: Class) => {
    setEditingClass(classData);
    setIsFormOpen(true);
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      alert("Xóa lớp học thành công!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Có lỗi xảy ra khi xóa lớp học!";
      alert(message);
      console.error(error);
    }
  };

  const handleSubmitForm = async (formData: Class) => {
    try {
      if (editingClass) {
        // Update
        await updateMutation.mutateAsync({
          id: editingClass._id!,
          data: {
            code: formData.code,
            name: formData.name,
            size: formData.size,
            homeroomTeacher: formData.homeroomTeacher,
          },
        });
        alert("Cập nhật lớp học thành công!");
      } else {
        // Create
        await createMutation.mutateAsync({
          code: formData.code,
          name: formData.name,
          size: formData.size,
          homeroomTeacher: formData.homeroomTeacher,
        });
        alert("Thêm lớp học thành công!");
      }
      setIsFormOpen(false);
      setEditingClass(null);
    } catch (error: any) {
      const message = error.response?.data?.message || "Có lỗi xảy ra!";
      alert(message);
      console.error(error);
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600">
            {(error as any)?.response?.data?.message || "Không thể kết nối đến server"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quản lý lớp học
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý thông tin lớp học, sĩ số và giáo viên chủ nhiệm
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClass}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm lớp học
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số lớp</p>
              <p className="text-2xl font-bold text-gray-900">{classes?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sinh viên</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes?.reduce((sum, cls) => sum + (cls.size || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sĩ số trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes && classes.length > 0
                  ? Math.round(classes.reduce((sum, cls) => sum + (cls.size || 0), 0) / classes.length)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <ClassTable
          data={classes || []}
          onEdit={handleEditClass}
          onDelete={handleDeleteClass}
        />
      )}

      {/* Form Modal */}
      <ClassForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClass(null);
        }}
        onSubmit={handleSubmitForm}
        classData={editingClass}
      />
    </section>
  );
};

