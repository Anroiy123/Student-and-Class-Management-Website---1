import type { RequestHandler } from 'express';
import { StudentModel } from '../models/student.model';
import { ClassModel } from '../models/class.model';
import { CourseModel } from '../models/course.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { asyncHandler } from '../utils/asyncHandler';
import { DASHBOARD_CONSTANTS } from '../constants/dashboard';

// Type guards cho populated documents
type PopulatedStudent = { fullName: string; mssv: string };
type PopulatedCourse = { name: string; code: string };
type PopulatedClass = { name: string; code: string };

function isPopulatedStudent(obj: unknown): obj is PopulatedStudent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'fullName' in obj &&
    'mssv' in obj &&
    typeof (obj as PopulatedStudent).fullName === 'string' &&
    typeof (obj as PopulatedStudent).mssv === 'string'
  );
}

function isPopulatedCourse(obj: unknown): obj is PopulatedCourse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'code' in obj &&
    typeof (obj as PopulatedCourse).name === 'string' &&
    typeof (obj as PopulatedCourse).code === 'string'
  );
}

function isPopulatedClass(obj: unknown): obj is PopulatedClass {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'code' in obj &&
    typeof (obj as PopulatedClass).name === 'string' &&
    typeof (obj as PopulatedClass).code === 'string'
  );
}

// Lấy thống kê tổng quan: số sinh viên, lớp học, môn học
export const getStats: RequestHandler = asyncHandler(async (_req, res) => {
  const [totalStudents, totalClasses, totalCourses] = await Promise.all([
    StudentModel.countDocuments(),
    ClassModel.countDocuments(),
    CourseModel.countDocuments(),
  ]);

  res.json({
    totalStudents,
    totalClasses,
    totalCourses,
  });
});

// Lấy danh sách hoạt động gần đây từ các collection
export const getRecentActivities: RequestHandler = asyncHandler(
  async (req, res) => {
    // Zod đã validate, chỉ cần parse giá trị
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(
      req.query.pageSize ?? DASHBOARD_CONSTANTS.DEFAULT_PAGE_SIZE,
    );

    // Giới hạn tối đa activities để tránh quá tải
    const { MAX_ACTIVITIES } = DASHBOARD_CONSTANTS;
    const fetchLimit = Math.ceil(MAX_ACTIVITIES / 3);

    // Fetch recent activities từ các collections
    const [recentEnrollments, recentGrades, recentStudents] = await Promise.all(
      [
        EnrollmentModel.find()
          .sort({ createdAt: -1 })
          .limit(fetchLimit)
          .populate('studentId', 'mssv fullName')
          .populate('courseId', 'code name')
          .lean(),
        GradeModel.find()
          .sort({ updatedAt: -1 })
          .limit(fetchLimit)
          .populate({
            path: 'enrollmentId',
            populate: [
              { path: 'studentId', select: 'mssv fullName' },
              { path: 'courseId', select: 'code name' },
            ],
          })
          .lean(),
        StudentModel.find()
          .sort({ createdAt: -1 })
          .limit(fetchLimit)
          .populate('classId', 'code name')
          .lean(),
      ],
    );

    type ActivityItem = {
      _id: string;
      type: 'enrollment' | 'grade_update' | 'new_student';
      description: string;
      timestamp: Date;
      details: {
        studentName?: string;
        studentMssv?: string;
        courseName?: string;
        courseCode?: string;
        className?: string;
        classCode?: string;
        total?: number;
      };
    };

    // Gộp và định dạng activities với type guards
    const activities: ActivityItem[] = [];

    for (const enrollment of recentEnrollments) {
      const student = enrollment.studentId;
      const course = enrollment.courseId;
      if (isPopulatedStudent(student) && isPopulatedCourse(course)) {
        activities.push({
          _id: String(enrollment._id),
          type: 'enrollment',
          description: `${student.fullName} đăng ký môn ${course.name}`,
          timestamp: enrollment.createdAt as Date,
          details: {
            studentName: student.fullName,
            studentMssv: student.mssv,
            courseName: course.name,
            courseCode: course.code,
          },
        });
      }
    }

    for (const grade of recentGrades) {
      const enrollment = grade.enrollmentId;

      // Type guard cho enrollment object
      if (
        enrollment &&
        typeof enrollment === 'object' &&
        'studentId' in enrollment &&
        'courseId' in enrollment &&
        isPopulatedStudent(enrollment.studentId) &&
        isPopulatedCourse(enrollment.courseId)
      ) {
        activities.push({
          _id: String(grade._id),
          type: 'grade_update',
          description: `Cập nhật điểm ${enrollment.studentId.fullName} - ${enrollment.courseId.name}`,
          timestamp: grade.updatedAt as Date,
          details: {
            studentName: enrollment.studentId.fullName,
            studentMssv: enrollment.studentId.mssv,
            courseName: enrollment.courseId.name,
            courseCode: enrollment.courseId.code,
            total: grade.total,
          },
        });
      }
    }

    for (const student of recentStudents) {
      const classInfo = student.classId;
      activities.push({
        _id: String(student._id),
        type: 'new_student',
        description: `Sinh viên mới: ${student.fullName}`,
        timestamp: student.createdAt as Date,
        details: {
          studentName: student.fullName,
          studentMssv: student.mssv,
          className: isPopulatedClass(classInfo) ? classInfo.name : undefined,
          classCode: isPopulatedClass(classInfo) ? classInfo.code : undefined,
        },
      });
    }

    // Sắp xếp theo thời gian mới nhất
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Tổng số activities thực tế sau khi merge & sort
    const total = activities.length;
    const paginatedItems = activities.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    res.json({
      items: paginatedItems,
      total,
      page,
      pageSize,
    });
  },
);
