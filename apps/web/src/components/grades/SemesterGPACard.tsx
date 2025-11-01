import { useStudentSemesterGPA } from "../../hooks/useGrades";
import { exportToExcel, exportToPDF } from "../../utils/exportReport";
import { useStudents } from "../../hooks/useStudents";

interface SemesterGPACardProps {
  studentId: string;
  semester?: string;
}

export const SemesterGPACard = ({ studentId, semester }: SemesterGPACardProps) => {
  const { data, isLoading } = useStudentSemesterGPA(studentId, semester);
  const { data: studentsData } = useStudents({ limit: 1000 });
  const students = studentsData?.students || [];
  const currentStudent = students.find(s => s._id === studentId);
  const studentName = currentStudent?.fullName || "Sinh viên";

  const handleExportExcel = () => {
    if (data) {
      exportToExcel(data, studentName);
    }
  };

  const handleExportPDF = () => {
    if (data) {
      exportToPDF(data, studentName);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data || data.courses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <p className="text-gray-500 text-center">
          Không có dữ liệu điểm cho học kỳ này
        </p>
      </div>
    );
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 8.5) return "text-green-600";
    if (gpa >= 7.0) return "text-blue-600";
    if (gpa >= 5.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGPALabel = (gpa: number) => {
    if (gpa >= 8.5) return "Xuất sắc";
    if (gpa >= 7.0) return "Giỏi";
    if (gpa >= 5.5) return "Khá";
    if (gpa >= 4.0) return "Trung bình";
    return "Yếu";
  };

  return (
    <div className="space-y-6">
      {/* GPA Summary Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm p-6 border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Điểm trung bình {semester ? `học kỳ ${semester}` : "tất cả các học kỳ"}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-md"
              title="Xuất Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md"
              title="Xuất PDF"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GPA */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">GPA</div>
            <div className={`text-4xl font-bold ${getGPAColor(data.gpa)}`}>
              {data.gpa.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {getGPALabel(data.gpa)}
            </div>
          </div>

          {/* Credits */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Tín chỉ</div>
            <div className="text-2xl font-semibold text-gray-800">
              {data.passedCredits}/{data.totalCredits}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Đạt: {data.passedCredits} TC
            </div>
          </div>

          {/* Courses */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Môn học</div>
            <div className="text-2xl font-semibold text-gray-800">
              {data.passedCourses}/{data.totalCourses}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Đạt: {data.passedCourses} môn
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500">
          <h4 className="text-white font-semibold">Chi tiết điểm các môn học</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Mã MH
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tên môn học
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  TC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  HK
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  CC
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  GK
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  CK
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tổng
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.courses.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {course.courseCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {course.courseName}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {course.credits}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {course.semester}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {course.attendance.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {course.midterm.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                    {course.final.toFixed(1)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-center font-semibold ${
                    course.total >= 8.5 ? "text-green-600" :
                    course.total >= 7.0 ? "text-blue-600" :
                    course.total >= 5.5 ? "text-yellow-600" :
                    course.total >= 4.0 ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {course.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === "Đạt"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
