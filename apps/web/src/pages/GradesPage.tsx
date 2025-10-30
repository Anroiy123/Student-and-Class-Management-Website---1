import { useState } from "react";
import { useGrades, useUpsertGrade } from "../hooks/useGrades";
import { useEnrollments } from "../hooks/useEnrollments";
import { useClasses } from "../hooks/useClasses";
import { useCourses } from "../hooks/useCourses";
import { GradeForm } from "../components/grades/GradeForm";
import { GradeTable, type GradeRow } from "../components/grades/GradeTable";
import type { Grade } from "../services/grade.service";

export const GradesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ grade: Grade | null; enrollmentId: string } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Fetch data
  const { data: classes = [] } = useClasses();
  const { data: courses = [] } = useCourses();
  const { data: enrollments = [] } = useEnrollments({
    classId: selectedClassId || undefined,
    courseId: selectedCourseId || undefined,
  });
  const { data: grades = [], isLoading, error } = useGrades({
    classId: selectedClassId || undefined,
    courseId: selectedCourseId || undefined,
  });

  const upsertMutation = useUpsertGrade();

  // Adapter function to convert API grades to table format
  const adaptGradeForTable = (grade: Grade): GradeRow => {
    return {
      _id: grade._id,
      enrollmentId: grade.enrollmentId._id,
      mssv: grade.enrollmentId.studentId.mssv,
      studentName: grade.enrollmentId.studentId.fullName,
      courseCode: grade.enrollmentId.courseId.code,
      courseName: grade.enrollmentId.courseId.name,
      className: grade.enrollmentId.classId?.code || "Chưa có lớp",
      semester: grade.enrollmentId.semester,
      attendance: grade.attendance,
      midterm: grade.midterm,
      final: grade.final,
      total: grade.total,
    };
  };

  // Get enrollments that don't have grades yet
  const enrollmentsWithoutGrades = enrollments.filter(
    (enrollment) => !grades.find((g) => g.enrollmentId._id === enrollment._id)
  );

  const handleAddGrade = (enrollmentId: string) => {
    const enrollment = enrollments.find((e) => e._id === enrollmentId);
    if (!enrollment) return;

    setEditingGrade({ grade: null, enrollmentId });
    setIsFormOpen(true);
  };

  const handleEditGrade = (gradeRow: GradeRow) => {
    const fullGrade = grades.find((g) => g._id === gradeRow._id);
    if (!fullGrade) return;

    setEditingGrade({ grade: fullGrade, enrollmentId: gradeRow.enrollmentId });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGrade(null);
  };

  const handleSubmitForm = async (data: { attendance: number; midterm: number; final: number }) => {
    if (!editingGrade) return;

    try {
      await upsertMutation.mutateAsync({
        enrollmentId: editingGrade.enrollmentId,
        data,
      });
      handleCloseForm();
    } catch (error) {
      console.error("Error saving grade:", error);
      alert("Có lỗi xảy ra khi lưu điểm!");
    }
  };

  // Calculate statistics
  const totalGrades = grades.length;
  const avgGrade = totalGrades > 0 
    ? (grades.reduce((sum, g) => sum + g.total, 0) / totalGrades).toFixed(2) 
    : "0.00";
  const passCount = grades.filter((g) => g.total >= 4.0).length;
  const passRate = totalGrades > 0 ? ((passCount / totalGrades) * 100).toFixed(1) : "0.0";

  return (
    <section className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            📊 Quản lý điểm
          </h1>
          <p className="mt-2 text-gray-600">
            Nhập điểm chuyên cần, giữa kỳ, cuối kỳ và tổng kết
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏫 Lọc theo lớp
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
            >
              <option value="">Tất cả lớp</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.code} - {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📚 Lọc theo môn học
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
            >
              <option value="">Tất cả môn học</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 font-semibold">Tổng số điểm</p>
              <p className="text-4xl font-bold mt-2">{totalGrades}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 font-semibold">Điểm TB</p>
              <p className="text-4xl font-bold mt-2">{avgGrade}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 font-semibold">Số SV đạt</p>
              <p className="text-4xl font-bold mt-2">{passCount}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 font-semibold">Tỷ lệ đạt</p>
              <p className="text-4xl font-bold mt-2">{passRate}%</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments without grades */}
      {enrollmentsWithoutGrades.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">
            📝 Sinh viên chưa có điểm ({enrollmentsWithoutGrades.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollmentsWithoutGrades.map((enrollment) => (
              <button
                key={enrollment._id}
                onClick={() => handleAddGrade(enrollment._id)}
                className="bg-white hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-4 text-left transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{enrollment.studentId.fullName}</p>
                    <p className="text-sm text-gray-600">{enrollment.courseId.code}</p>
                  </div>
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <span className="font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-800">
          <p className="font-semibold">❌ Lỗi: {(error as Error).message}</p>
          <p className="text-sm mt-2">Vui lòng kiểm tra kết nối và thử lại.</p>
        </div>
      ) : (
        <GradeTable
          data={grades.map(adaptGradeForTable)}
          onEdit={handleEditGrade}
        />
      )}

      {/* Grade Form Modal */}
      {isFormOpen && editingGrade && (
        <GradeForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmitForm}
          initialData={editingGrade.grade}
          studentName={editingGrade.grade?.enrollmentId.studentId.fullName}
          courseName={editingGrade.grade?.enrollmentId.courseId.name}
        />
      )}
    </section>
  );
};
