import { useState } from "react";
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from "../hooks/useStudents";
import type { Student } from "../services/student.service";
import { StudentTable } from "../components/students/StudentTable";
import { StudentForm } from "../components/students/StudentForm";

// Adapter để chuyển đổi Student từ API sang Student của Table
const adaptStudentForTable = (apiStudent: Student) => {
  // classId có thể là string hoặc object đã được populate
  // Hiển thị mã lớp (code) thay vì tên đầy đủ cho ngắn gọn
  let className = "Chưa có lớp";
  if (apiStudent.classId && typeof apiStudent.classId === 'object') {
    className = apiStudent.classId.code || apiStudent.classId.name || "Chưa có lớp";
  }
    
  return {
    id: apiStudent._id,
    mssv: apiStudent.mssv,
    fullName: apiStudent.fullName,
    email: apiStudent.email,
    phone: apiStudent.phone,
    dateOfBirth: apiStudent.dob,
    address: apiStudent.address,
    className: className,
  };
};

export function StudentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Fetch students với React Query
  const { data, isLoading, error } = useStudents({
    page: currentPage,
    limit: 10,
    search: "",
  });

  // Mutations cho students
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const students = data?.students || [];
  const totalPages = data?.totalPages || 1;

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEditStudent = (tableStudent: any) => {
    // Tìm student gốc từ API data
    const apiStudent = students.find(s => s._id === tableStudent.id);
    if (apiStudent) {
      // Chuyển đổi sang format cho form
      // className trong form sẽ chứa classId (để select dropdown chọn đúng)
      let classIdValue = "";
      if (apiStudent.classId) {
        classIdValue = typeof apiStudent.classId === 'object' 
          ? apiStudent.classId._id 
          : apiStudent.classId;
      }
      
      // Chuyển đổi ngày sinh sang định dạng YYYY-MM-DD cho input date
      let dateOfBirth = "";
      if (apiStudent.dob) {
        const date = new Date(apiStudent.dob);
        dateOfBirth = date.toISOString().split('T')[0];
      }
      
      const formStudent = {
        id: apiStudent._id,
        mssv: apiStudent.mssv,
        fullName: apiStudent.fullName,
        email: apiStudent.email,
        phone: apiStudent.phone,
        dateOfBirth: dateOfBirth,
        address: apiStudent.address,
        className: classIdValue,  // Lưu classId để select chọn đúng
      };
      setEditingStudent(formStudent as any);
      setIsFormOpen(true);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      try {
        await deleteMutation.mutateAsync(id);
        alert("Xóa sinh viên thành công!");
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa sinh viên!");
        console.error(error);
      }
    }
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      // Backend yêu cầu: mssv, dob (không phải studentId, dateOfBirth)
      const submitData: any = {
        mssv: formData.mssv,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dateOfBirth,
        address: formData.address,
      };

      // Chỉ thêm classId nếu người dùng có nhập className
      if (formData.className && formData.className.trim()) {
        submitData.classId = formData.className;
      }

      if (editingStudent) {
        // Update - editingStudent.id là _id từ API
        await updateMutation.mutateAsync({
          id: editingStudent.id,
          data: submitData,
        });
        alert("Cập nhật sinh viên thành công!");
      } else {
        // Create
        await createMutation.mutateAsync(submitData);
        alert("Thêm sinh viên thành công!");
      }
      setIsFormOpen(false);
      setEditingStudent(null);
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
          <p className="text-gray-600 mb-4">
            {(error as any)?.response?.data?.message || "Không thể kết nối đến server"}
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng kiểm tra:
            <br />
            1. API server đang chạy (http://localhost:4000)
            <br />
            2. MongoDB đã kết nối thành công
            <br />
            3. File .env đã cấu hình đúng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sinh viên</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin sinh viên: thêm, sửa, xóa và tìm kiếm
          </p>
        </div>
        <button
          onClick={handleAddStudent}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm sinh viên
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold">Tổng sinh viên</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{data?.total || 0}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold">Trang hiện tại</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{currentPage} / {totalPages}</p>
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-semibold">Kết quả hiển thị</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{students.length}</p>
            </div>
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600 mb-4">
            {(error as any)?.response?.data?.message || "Không thể kết nối đến server"}
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng kiểm tra:
            <br />
            1. API server đang chạy (http://localhost:4000)
            <br />
            2. MongoDB đã kết nối thành công
            <br />
            3. File .env đã cấu hình đúng
          </p>
        </div>
      ) : (
        <StudentTable
          data={students.map(adaptStudentForTable)}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
        />
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              ⏮️ Đầu
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              ◀️ Trước
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border-2 border-blue-200">
              <span className="text-sm text-gray-600">Trang</span>
              <span className="font-bold text-blue-600 text-lg">{currentPage}</span>
              <span className="text-sm text-gray-600">/</span>
              <span className="font-bold text-gray-700">{totalPages}</span>
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Sau ▶️
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cuối ⏭️
            </button>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {isFormOpen && (
        <StudentForm
          isOpen={isFormOpen}
          student={editingStudent}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStudent(null);
          }}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
}
