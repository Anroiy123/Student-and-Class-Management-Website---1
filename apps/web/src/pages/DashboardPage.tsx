import { useStudents } from "../hooks/useStudents";
import { useClasses } from "../hooks/useClasses";
import { useCourses } from "../hooks/useCourses";
import { useGrades } from "../hooks/useGrades";

export const DashboardPage = () => {
  // Fetch data
  const { data: studentsData, isLoading: loadingStudents } = useStudents({ limit: 1 });
  const { data: classes = [], isLoading: loadingClasses } = useClasses();
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const { data: grades = [], isLoading: loadingGrades } = useGrades();

  // Calculate statistics
  const totalStudents = studentsData?.total || 0;
  const totalClasses = classes.length;
  const totalCourses = courses.length;
  const totalGrades = grades.length;
  
  // Calculate average grade
  const avgGrade = totalGrades > 0
    ? (grades.reduce((sum, g) => sum + g.total, 0) / totalGrades).toFixed(2)
    : "0.00";
  
  // Calculate pass rate
  const passCount = grades.filter(g => g.total >= 4.0).length;
  const passRate = totalGrades > 0 
    ? ((passCount / totalGrades) * 100).toFixed(1) 
    : "0.0";

  const isLoading = loadingStudents || loadingClasses || loadingCourses || loadingGrades;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          📊 Tổng quan hệ thống
        </h1>
        <p className="mt-2 text-gray-600">
          Hiển thị số lượng sinh viên, lớp học, môn học và thông tin tóm tắt.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="font-medium">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Main Statistics */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Students Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 font-semibold text-sm">Sinh viên</p>
                  <p className="text-4xl font-bold mt-2">{totalStudents}</p>
                  <p className="text-blue-100 text-sm mt-1">sinh viên đang học</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Classes Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 font-semibold text-sm">Lớp học</p>
                  <p className="text-4xl font-bold mt-2">{totalClasses}</p>
                  <p className="text-purple-100 text-sm mt-1">lớp đang hoạt động</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Courses Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform transition-transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 font-semibold text-sm">Môn học</p>
                  <p className="text-4xl font-bold mt-2">{totalCourses}</p>
                  <p className="text-green-100 text-sm mt-1">môn đang giảng dạy</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Average Grade Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600">Điểm trung bình</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{avgGrade}</p>
                  <p className="text-sm text-gray-500 mt-1">trên tổng {totalGrades} điểm</p>
                </div>
              </div>
            </div>

            {/* Pass Rate Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600">Tỷ lệ đạt</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">{passRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">{passCount}/{totalGrades} môn đạt</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Thống kê nhanh
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 font-medium">Trung bình/Lớp</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">sinh viên</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 font-medium">Tổng tín chỉ</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {courses.reduce((sum, c) => sum + c.credits, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">tín chỉ</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 font-medium">TC Trung bình</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {totalCourses > 0 
                    ? (courses.reduce((sum, c) => sum + c.credits, 0) / totalCourses).toFixed(1)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">TC/môn</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-600 font-medium">Tổng điểm</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{totalGrades}</p>
                <p className="text-xs text-gray-500 mt-1">bản ghi</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
