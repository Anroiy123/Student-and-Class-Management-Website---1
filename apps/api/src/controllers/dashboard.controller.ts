import type { RequestHandler } from 'express';
import type { Types, PipelineStage } from 'mongoose';
import { StudentModel } from '../models/student.model';
import { ClassModel } from '../models/class.model';
import { CourseModel } from '../models/course.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { asyncHandler } from '../utils/asyncHandler';
import { DASHBOARD_CONSTANTS } from '../constants/dashboard';
import { getTeacherAccessScope } from '../utils/teacherAccess';

// Types for chart data response
interface GradeDistribution {
  excellent: number;
  good: number;
  average: number;
  poor: number;
  total: number;
}

interface StudentsByClass {
  classId: string;
  className: string;
  classCode: string;
  studentCount: number;
}

interface EnrollmentTrend {
  month: string;
  monthLabel: string;
  count: number;
}

interface CoursePopularity {
  courseId: string;
  courseCode: string;
  courseName: string;
  enrollmentCount: number;
}

interface DashboardChartsResponse {
  gradeDistribution: GradeDistribution;
  studentsByClass: StudentsByClass[];
  enrollmentTrend: EnrollmentTrend[];
  coursePopularity: CoursePopularity[];
}

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
export const getStats: RequestHandler = asyncHandler(async (req, res) => {
  let studentFilter = {};
  let classFilter = {};
  let courseFilter = {};

  // Apply teacher scope filtering
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their scope
      if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
        // Unlinked teacher - return zeros
        return res.json({
          totalStudents: 0,
          totalClasses: 0,
          totalCourses: 0,
        });
      }
      studentFilter = { classId: { $in: scope.classIds } };
      classFilter = { homeroomTeacherId: scope.teacherId };
      courseFilter = { teacherId: scope.teacherId };
    }
    // Admin: no filtering (scope is null)
  }

  const [totalStudents, totalClasses, totalCourses] = await Promise.all([
    StudentModel.countDocuments(studentFilter),
    ClassModel.countDocuments(classFilter),
    CourseModel.countDocuments(courseFilter),
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

    // Apply teacher scope filtering
    let enrollmentFilter = {};
    let gradeEnrollmentFilter = {};
    let studentFilter = {};

    if (req.user) {
      const scope = await getTeacherAccessScope(req.user);
      if (scope) {
        // Teacher: filter by their scope
        if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
          // Unlinked teacher - return empty
          return res.json({ items: [], total: 0, page, pageSize });
        }
        enrollmentFilter = {
          $or: [
            { classId: { $in: scope.classIds } },
            { courseId: { $in: scope.courseIds } },
          ],
        };
        gradeEnrollmentFilter = enrollmentFilter;
        studentFilter = { classId: { $in: scope.classIds } };
      }
      // Admin: no filtering (scope is null)
    }

    // Fetch recent activities từ các collections
    const [recentEnrollments, recentGrades, recentStudents] = await Promise.all(
      [
        EnrollmentModel.find(enrollmentFilter)
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
            match:
              Object.keys(gradeEnrollmentFilter).length > 0
                ? gradeEnrollmentFilter
                : undefined,
            populate: [
              { path: 'studentId', select: 'mssv fullName' },
              { path: 'courseId', select: 'code name' },
            ],
          })
          .lean(),
        StudentModel.find(studentFilter)
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

// Helper function to format month label in Vietnamese
function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNum = parseInt(month, 10);
  return `Tháng ${monthNum}/${year}`;
}

// Get chart data for dashboard
export const getChartData: RequestHandler = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit ?? 10);

  // Get teacher scope for filtering
  let teacherScope: {
    teacherId: Types.ObjectId;
    classIds: Types.ObjectId[];
    courseIds: Types.ObjectId[];
  } | null = null;

  if (req.user) {
    teacherScope = await getTeacherAccessScope(req.user);
  }

  // If teacher has no assigned classes/courses, return empty data
  if (
    teacherScope &&
    teacherScope.classIds.length === 0 &&
    teacherScope.courseIds.length === 0
  ) {
    const emptyResponse: DashboardChartsResponse = {
      gradeDistribution: { excellent: 0, good: 0, average: 0, poor: 0, total: 0 },
      studentsByClass: [],
      enrollmentTrend: [],
      coursePopularity: [],
    };
    return res.json(emptyResponse);
  }

  // Build aggregation pipelines with teacher scope filtering
  const [gradeDistribution, studentsByClass, enrollmentTrend, coursePopularity] =
    await Promise.all([
      getGradeDistribution(teacherScope),
      getStudentsByClass(teacherScope, limit),
      getEnrollmentTrend(teacherScope),
      getCoursePopularity(teacherScope, limit),
    ]);

  const response: DashboardChartsResponse = {
    gradeDistribution,
    studentsByClass,
    enrollmentTrend,
    coursePopularity,
  };

  res.json(response);
});

// Grade distribution aggregation
async function getGradeDistribution(
  scope: { classIds: Types.ObjectId[]; courseIds: Types.ObjectId[] } | null,
): Promise<GradeDistribution> {
  const pipeline: PipelineStage[] = [];

  // If teacher scope, filter by enrollments in their classes/courses
  if (scope) {
    // First lookup enrollment to filter by scope
    pipeline.push(
      {
        $lookup: {
          from: 'enrollments',
          localField: 'enrollmentId',
          foreignField: '_id',
          as: 'enrollment',
        },
      },
      { $unwind: '$enrollment' },
      {
        $match: {
          $or: [
            { 'enrollment.classId': { $in: scope.classIds } },
            { 'enrollment.courseId': { $in: scope.courseIds } },
          ],
        },
      },
    );
  }

  // Filter grades with valid total
  pipeline.push({ $match: { total: { $ne: null } } });

  // Group and classify grades
  pipeline.push({
    $group: {
      _id: null,
      excellent: { $sum: { $cond: [{ $gte: ['$total', 8] }, 1, 0] } },
      good: {
        $sum: {
          $cond: [
            { $and: [{ $gte: ['$total', 6.5] }, { $lt: ['$total', 8] }] },
            1,
            0,
          ],
        },
      },
      average: {
        $sum: {
          $cond: [
            { $and: [{ $gte: ['$total', 5] }, { $lt: ['$total', 6.5] }] },
            1,
            0,
          ],
        },
      },
      poor: { $sum: { $cond: [{ $lt: ['$total', 5] }, 1, 0] } },
      total: { $sum: 1 },
    },
  });

  const result = await GradeModel.aggregate(pipeline);

  if (result.length === 0) {
    return { excellent: 0, good: 0, average: 0, poor: 0, total: 0 };
  }

  return {
    excellent: result[0].excellent,
    good: result[0].good,
    average: result[0].average,
    poor: result[0].poor,
    total: result[0].total,
  };
}

// Students by class aggregation
async function getStudentsByClass(
  scope: { classIds: Types.ObjectId[] } | null,
  limit: number,
): Promise<StudentsByClass[]> {
  const pipeline: PipelineStage[] = [];

  // Filter by teacher's classes if scope exists
  if (scope) {
    pipeline.push({ $match: { classId: { $in: scope.classIds } } });
  }

  // Filter students with classId
  pipeline.push({ $match: { classId: { $ne: null } } });

  // Group by class and count
  pipeline.push(
    { $group: { _id: '$classId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  );

  // Only apply limit for admin (scope is null)
  // Teachers see all their homeroom classes without limit (Requirement 2.2)
  if (!scope) {
    pipeline.push({ $limit: limit });
  }

  pipeline.push(
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'class',
      },
    },
    { $unwind: '$class' },
    {
      $project: {
        _id: 0,
        classId: { $toString: '$_id' },
        className: '$class.name',
        classCode: '$class.code',
        studentCount: '$count',
      },
    },
  );

  return StudentModel.aggregate(pipeline);
}

// Enrollment trend aggregation (last 6 months)
async function getEnrollmentTrend(
  scope: { courseIds: Types.ObjectId[] } | null,
): Promise<EnrollmentTrend[]> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const pipeline: PipelineStage[] = [];

  // Filter by date range
  pipeline.push({ $match: { createdAt: { $gte: sixMonthsAgo } } });

  // Filter by teacher's courses if scope exists
  if (scope) {
    pipeline.push({ $match: { courseId: { $in: scope.courseIds } } });
  }

  // Group by month
  pipeline.push(
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        month: '$_id',
        count: 1,
      },
    },
  );

  const result = await EnrollmentModel.aggregate(pipeline);

  // Add Vietnamese month labels
  return result.map((item) => ({
    month: item.month,
    monthLabel: formatMonthLabel(item.month),
    count: item.count,
  }));
}

// Course popularity aggregation
async function getCoursePopularity(
  scope: { courseIds: Types.ObjectId[] } | null,
  limit: number,
): Promise<CoursePopularity[]> {
  const pipeline: PipelineStage[] = [];

  // Filter by teacher's courses if scope exists
  if (scope) {
    pipeline.push({ $match: { courseId: { $in: scope.courseIds } } });
  }

  // Group by course and count enrollments
  pipeline.push(
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'courses',
        localField: '_id',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $project: {
        _id: 0,
        courseId: { $toString: '$_id' },
        courseCode: '$course.code',
        courseName: '$course.name',
        enrollmentCount: '$count',
      },
    },
  );

  return EnrollmentModel.aggregate(pipeline);
}
