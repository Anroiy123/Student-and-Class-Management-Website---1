import { useAuth } from "../contexts/AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useEnrollments } from "../hooks/useEnrollments";
import { useGrades } from "../hooks/useGrades";

export const StudentProfilePage = () => {
  const { user } = useAuth();
  
  // Fetch student info by email
  const { data: studentsData, isLoading: loadingStudent } = useStudents({ limit: 1000 });
  const students = studentsData?.students || [];
  const currentStudent = students.find(s => s.email === user?.email);

  // Fetch enrollments for current student - only run if we have the student ID
  const { data: enrollmentsData = [], isLoading: loadingEnrollments } = useEnrollments({
    studentId: currentStudent?._id,
  });

  // Fetch grades for current student
  const { data: allGrades = [], isLoading: loadingGrades } = useGrades({});
  
  const grades = allGrades.filter(g => {
    const matches = g.enrollmentId?.studentId?._id === currentStudent?._id;
    return matches;
  });

  // Use enrollments from the query
  const enrollments = enrollmentsData;

  // Calculate GPA by semester
  const calculateSemesterGPA = (semester: string) => {
    const semesterGrades = grades.filter(g => g.enrollmentId.semester === semester);
    if (semesterGrades.length === 0) return 0;

    const totalCredits = semesterGrades.reduce(
      (sum, grade) => sum + grade.enrollmentId.courseId.credits,
      0
    );
    const weightedSum = semesterGrades.reduce(
      (sum, grade) => sum + grade.total * grade.enrollmentId.courseId.credits,
      0
    );

    return totalCredits > 0 ? weightedSum / totalCredits : 0;
  };

  // Get unique semesters
  const semesters = Array.from(
    new Set(enrollments.map(e => e.semester))
  ).sort();

  // Calculate overall GPA
  const calculateOverallGPA = () => {
    if (grades.length === 0) return 0;

    const totalCredits = grades.reduce(
      (sum, grade) => sum + grade.enrollmentId.courseId.credits,
      0
    );
    const weightedSum = grades.reduce(
      (sum, grade) => sum + grade.total * grade.enrollmentId.courseId.credits,
      0
    );

    return totalCredits > 0 ? weightedSum / totalCredits : 0;
  };

  const overallGPA = calculateOverallGPA();

  if (loadingStudent || loadingEnrollments || loadingGrades) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-gray-600">Không tìm thấy thông tin sinh viên</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
            {currentStudent.fullName?.charAt(0) || "?"}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{currentStudent.fullName}</h1>
            <p className="text-blue-100 text-lg mt-1">MSSV: {currentStudent.mssv}</p>
            <p className="text-blue-100">
              Lớp: {typeof currentStudent.classId === 'object' ? currentStudent.classId?.code : "Chưa có lớp"}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-semibold text-gray-800">{currentStudent.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Số điện thoại</p>
              <p className="font-semibold text-gray-800">{currentStudent.phone || "Chưa cập nhật"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Ngày sinh</p>
              <p className="font-semibold text-gray-800">
                {currentStudent.dob ? new Date(currentStudent.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-xs text-gray-500">Địa chỉ</p>
              <p className="font-semibold text-gray-800">{currentStudent.address || "Chưa cập nhật"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">GPA Tích lũy</p>
              <p className="text-4xl font-bold mt-2">{overallGPA.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng môn học</p>
              <p className="text-4xl font-bold mt-2">{enrollments.length}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Tổng tín chỉ</p>
              <p className="text-4xl font-bold mt-2">
                {enrollments.reduce((sum, e) => sum + e.courseId.credits, 0)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Courses by Semester */}
      {semesters.map(semester => {
        const semesterEnrollments = enrollments.filter(e => e.semester === semester);
        const semesterGrades = grades.filter(g => g.enrollmentId.semester === semester);
        const semesterGPA = calculateSemesterGPA(semester);

        return (
          <div key={semester} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {semester}
              </h3>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-white text-sm font-medium">GPA: </span>
                <span className="text-white text-lg font-bold">{semesterGPA.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã MH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên môn học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảng viên</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tín chỉ</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">CC (10%)</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">GK (30%)</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">CK (60%)</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tổng kết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {semesterEnrollments.map(enrollment => {
                    const grade = semesterGrades.find(g => g.enrollmentId._id === enrollment._id);
                    
                    return (
                      <tr key={enrollment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-gray-700 bg-blue-50 px-2 py-1 rounded">
                            {enrollment.courseId.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{enrollment.courseId.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              {enrollment.courseId.teacherName || "Chưa có"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-sm">
                            {enrollment.courseId.credits}
                          </span>
                        </td>
                        {grade ? (
                          <>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-gray-700">{grade.attendance.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-gray-700">{grade.midterm.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-bold text-gray-700">{grade.final.toFixed(1)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-lg font-bold text-white ${
                                grade.total >= 8.5 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                                grade.total >= 7.0 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
                                grade.total >= 5.5 ? "bg-gradient-to-r from-amber-500 to-orange-600" :
                                grade.total >= 4.0 ? "bg-gradient-to-r from-orange-500 to-red-500" :
                                "bg-gradient-to-r from-red-500 to-pink-600"
                              }`}>
                                {grade.total.toFixed(1)}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-center" colSpan={4}>
                              <span className="text-gray-400 italic">Chưa có điểm</span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
