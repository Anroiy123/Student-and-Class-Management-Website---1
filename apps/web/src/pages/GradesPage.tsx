import { useState } from "react";
import { useGrades, useUpsertGrade } from "../hooks/useGrades";
import { useEnrollments } from "../hooks/useEnrollments";
import { useClasses } from "../hooks/useClasses";
import { useCourses } from "../hooks/useCourses";
import { useStudents } from "../hooks/useStudents";
import { useAuth } from "../contexts/AuthContext";
import { GradeForm } from "../components/grades/GradeForm";
import { GradeTable, type GradeRow } from "../components/grades/GradeTable";
import { SemesterGPACard } from "../components/grades/SemesterGPACard";
import { exportGradesListToExcel, exportGradesListToPDF } from "../utils/exportReport";
import type { Grade } from "../services/grade.service";

type TabType = "grades" | "gpa";

export const GradesPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("grades");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ grade: Grade | null; enrollmentId: string } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  
  const { user, isTeacher } = useAuth();

  // Fetch data
  const { data: classes = [] } = useClasses();
  const { data: allCourses = [] } = useCourses();
  
  // Filter courses for teachers - only show courses they teach
  const courses = isTeacher && user?.email
    ? allCourses.filter(course => course.teacherEmail === user.email)
    : allCourses;
  
  const { data: studentsData } = useStudents({ limit: 1000 }); // Get all students for dropdown
  const students = studentsData?.students || [];
  const { data: allEnrollments = [] } = useEnrollments({
    classId: selectedClassId || undefined,
    courseId: selectedCourseId || undefined,
  });
  
  // Filter enrollments for teachers - only show enrollments of courses they teach
  const enrollments = isTeacher && user?.email
    ? allEnrollments.filter(enrollment => enrollment.courseId.teacherEmail === user.email)
    : allEnrollments;
  
  const { data: allGrades = [], isLoading, error } = useGrades({
    classId: selectedClassId || undefined,
    courseId: selectedCourseId || undefined,
  });

  // Filter grades for teachers - only show grades of courses they teach
  const grades = isTeacher && user?.email
    ? allGrades.filter(grade => grade.enrollmentId.courseId.teacherEmail === user.email)
    : allGrades;

  // Get enrollments for selected student to extract available semesters
  const { data: studentEnrollments = [] } = useEnrollments({
    studentId: selectedStudentId || undefined,
  });

  // Extract unique semesters from student's enrollments
  const availableSemesters = Array.from(
    new Set(studentEnrollments.map((enrollment) => enrollment.semester))
  ).sort();

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
      teacherName: grade.enrollmentId.courseId.teacherName,
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

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedSemester(""); // Reset semester when student changes
  };

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

  // Export handlers
  const handleExportExcel = () => {
    const exportData = grades.map(grade => ({
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
    }));

    const selectedClass = classes.find(c => c._id === selectedClassId);
    const selectedCourse = courses.find(c => c._id === selectedCourseId);
    
    let title = "Tất cả điểm";
    if (selectedClass && selectedCourse) {
      title = `Lớp ${selectedClass.code} - ${selectedCourse.code}`;
    } else if (selectedClass) {
      title = `Lớp ${selectedClass.code}`;
    } else if (selectedCourse) {
      title = `Môn ${selectedCourse.code}`;
    }

    exportGradesListToExcel(exportData, title);
  };

  const handleExportPDF = () => {
    const exportData = grades.map(grade => ({
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
    }));

    const selectedClass = classes.find(c => c._id === selectedClassId);
    const selectedCourse = courses.find(c => c._id === selectedCourseId);
    
    let title = "Tất cả điểm";
    if (selectedClass && selectedCourse) {
      title = `Lớp ${selectedClass.code} - ${selectedCourse.code}`;
    } else if (selectedClass) {
      title = `Lớp ${selectedClass.code}`;
    } else if (selectedCourse) {
      title = `Môn ${selectedCourse.code}`;
    }

    exportGradesListToPDF(exportData, title);
  };

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
             Quản lý điểm
          </h1>
          <p className="mt-2 text-gray-600">
            Nhập điểm chuyên cần, giữa kỳ, cuối kỳ và tổng kết
          </p>
        </div>
        {activeTab === "grades" && totalGrades > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md"
              title="Xuất Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md"
              title="Xuất PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Xuất PDF
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-visible">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("grades")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "grades"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            📝 Quản lý điểm
          </button>
          <button
            onClick={() => setActiveTab("gpa")}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === "gpa"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            🎓 Điểm trung bình học kỳ
          </button>
        </div>
      </div>

      {/* Tab Content: Grades Management */}
      {activeTab === "grades" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏫 Lọc theo lớp
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
                  style={{ position: 'relative' }}
                >
                  <option value="">Tất cả lớp</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.code} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📚 Lọc theo môn học
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
                  style={{ position: 'relative' }}
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
        </>
      )}

      {/* Tab Content: GPA View */}
      {activeTab === "gpa" && (
        <>
          {/* Filters for GPA */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👨‍🎓 Chọn sinh viên
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
                >
                  <option value="">-- Chọn sinh viên --</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.mssv} - {student.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Chọn học kỳ (tuỳ chọn)
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 font-medium"
                  disabled={!selectedStudentId}
                >
                  <option value="">Tất cả các học kỳ</option>
                  {availableSemesters.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GPA Display */}
          {selectedStudentId ? (
            <SemesterGPACard 
              studentId={selectedStudentId} 
              semester={selectedSemester || undefined}
            />
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">Vui lòng chọn sinh viên để xem điểm trung bình</p>
              <p className="text-gray-500 text-sm mt-2">Chọn sinh viên và học kỳ (tuỳ chọn) để xem chi tiết điểm</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};
