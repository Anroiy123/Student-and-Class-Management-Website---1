import type { RequestHandler } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  ME_MESSAGES,
  computeClassification,
  computeGPA,
  computeGPA4,
} from '../constants/messages';

// GET /api/me/profile
export const getMyProfile: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const student = await StudentModel.findById(user.studentId).populate(
    'classId',
  );
  if (!student) {
    return res.status(404).json({ message: ME_MESSAGES.STUDENT_NOT_FOUND });
  }

  res.json(student);
});

// GET /api/me/grades
export const getMyGrades: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const { semester, page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);

  // Build enrollment filter
  const enrollmentFilter: Record<string, unknown> = {
    studentId: user.studentId,
  };
  if (semester) {
    enrollmentFilter.semester = semester;
  }

  // Get enrollments with course info
  const enrollments = await EnrollmentModel.find(enrollmentFilter)
    .populate('courseId')
    .populate('classId')
    .sort({ createdAt: -1 });

  // Get grades for these enrollments
  const enrollmentIds = enrollments.map((e) => e._id);
  const grades = await GradeModel.find({
    enrollmentId: { $in: enrollmentIds },
  });

  // Map grades by enrollmentId for quick lookup
  const gradeMap = new Map(grades.map((g) => [g.enrollmentId.toString(), g]));

  // Build response items
  const items = enrollments.map((enrollment) => {
    const grade = gradeMap.get(enrollment._id.toString());
    const course = enrollment.courseId as {
      code?: string;
      name?: string;
      credits?: number;
    };

    return {
      _id: enrollment._id,
      courseCode: course?.code || 'N/A',
      courseName: course?.name || 'N/A',
      credits: course?.credits || 0,
      semester: enrollment.semester,
      attendance: grade?.attendance ?? null,
      midterm: grade?.midterm ?? null,
      final: grade?.final ?? null,
      total: grade?.total ?? null,
      gpa4: grade?.gpa4 ?? null,
      letterGrade: grade?.letterGrade ?? null,
      classification: computeClassification(grade?.total ?? null),
    };
  });

  // Calculate GPA
  const gradesForGPA = items
    .filter((item) => item.total !== null)
    .map((item) => ({ total: item.total, credits: item.credits }));
  const gpa = computeGPA(gradesForGPA);
  const gpa4 = computeGPA4(gradesForGPA);
  const totalCredits = items.reduce((sum, item) => sum + item.credits, 0);

  // Apply pagination
  const paginatedItems = items.slice(skip, skip + Number(pageSize));

  res.json({
    items: paginatedItems,
    total: items.length,
    page: Number(page),
    pageSize: Number(pageSize),
    gpa,
    gpa4,
    totalCredits,
  });
});

// GET /api/me/enrollments
export const getMyEnrollments: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.sub);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
    }

    const { semester, page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);

    const filter: Record<string, unknown> = { studentId: user.studentId };
    if (semester) {
      filter.semester = semester;
    }

    const [enrollments, total] = await Promise.all([
      EnrollmentModel.find(filter)
        .populate('courseId')
        .populate('classId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize)),
      EnrollmentModel.countDocuments(filter),
    ]);

    const items = enrollments.map((enrollment) => {
      const course = enrollment.courseId as any;
      const classDoc = enrollment.classId as any;

      return {
        _id: enrollment._id,
        courseCode: course?.code || 'N/A',
        courseName: course?.name || 'N/A',
        credits: course?.credits || 0,
        className: classDoc?.name || null,
        classCode: classDoc?.code || null,
        semester: enrollment.semester,
      };
    });

    res.json({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  },
);

// GET /api/me/dashboard
export const getMyDashboard: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const student = await StudentModel.findById(user.studentId).populate(
    'classId',
  );
  if (!student) {
    return res.status(404).json({ message: ME_MESSAGES.STUDENT_NOT_FOUND });
  }

  // Get enrollments
  const enrollments = await EnrollmentModel.find({
    studentId: user.studentId,
  }).populate('courseId');

  // Get grades
  const enrollmentIds = enrollments.map((e) => e._id);
  const grades = await GradeModel.find({ enrollmentId: { $in: enrollmentIds } })
    .populate({
      path: 'enrollmentId',
      populate: 'courseId',
    })
    .sort({ updatedAt: -1 })
    .limit(5);

  // Calculate stats
  const totalCredits = enrollments.reduce((sum, e) => {
    const course = e.courseId as any;
    return sum + (course?.credits || 0);
  }, 0);

  const gradesForGPA = grades
    .filter((g) => g.total !== null)
    .map((g) => {
      const enrollment = g.enrollmentId as any;
      const course = enrollment?.courseId as any;
      return { total: g.total, credits: course?.credits || 0 };
    });
  const gpa = computeGPA(gradesForGPA);
  const gpa4 = computeGPA4(gradesForGPA);

  // Build recent grades
  const recentGrades = grades.map((grade) => {
    const enrollment = grade.enrollmentId as any;
    const course = enrollment?.courseId as any;

    return {
      courseCode: course?.code || 'N/A',
      courseName: course?.name || 'N/A',
      credits: course?.credits || 0,
      total: grade.total,
      classification: computeClassification(grade.total),
    };
  });

  const classDoc = student.classId as any;

  res.json({
    profile: {
      fullName: student.fullName,
      mssv: student.mssv,
      className: classDoc?.name || null,
    },
    stats: {
      totalEnrollments: enrollments.length,
      totalCredits,
      gpa,
      gpa4,
    },
    recentGrades,
  });
});

// GET /api/me/semesters
export const getAvailableSemesters: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.sub);
    if (!user || !user.studentId) {
      return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
    }

    const semesters = await EnrollmentModel.distinct('semester', {
      studentId: user.studentId,
    });

    res.json(semesters.sort());
  },
);

// GET /api/me/grades/export
export const exportMyGrades: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const student = await StudentModel.findById(user.studentId).populate(
    'classId',
  );
  if (!student) {
    return res.status(404).json({ message: ME_MESSAGES.STUDENT_NOT_FOUND });
  }

  // Get all enrollments and grades
  const enrollments = await EnrollmentModel.find({ studentId: user.studentId })
    .populate('courseId')
    .sort({ createdAt: -1 });

  if (enrollments.length === 0) {
    return res.status(404).json({ message: ME_MESSAGES.NO_GRADES_TO_EXPORT });
  }

  const enrollmentIds = enrollments.map((e) => e._id);
  const grades = await GradeModel.find({
    enrollmentId: { $in: enrollmentIds },
  });
  const gradeMap = new Map(grades.map((g) => [g.enrollmentId.toString(), g]));

  // Build grade items
  const items = enrollments.map((enrollment) => {
    const grade = gradeMap.get(enrollment._id.toString());
    const course = enrollment.courseId as any;

    return {
      courseCode: course?.code || 'N/A',
      courseName: course?.name || 'N/A',
      credits: course?.credits || 0,
      semester: enrollment.semester,
      attendance: grade?.attendance ?? null,
      midterm: grade?.midterm ?? null,
      final: grade?.final ?? null,
      total: grade?.total ?? null,
      classification: computeClassification(grade?.total ?? null),
    };
  });

  // Calculate GPA
  const gradesForGPA = items
    .filter((item) => item.total !== null)
    .map((item) => ({ total: item.total, credits: item.credits }));
  const gpa = computeGPA(gradesForGPA);

  // Register Roboto fonts for Vietnamese support
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const fontPath = path.resolve(__dirname, '../../../fonts');

  // Generate PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Register fonts
  doc.registerFont('Roboto', path.join(fontPath, 'Roboto-Regular.ttf'));
  doc.registerFont('Roboto-Bold', path.join(fontPath, 'Roboto-Bold.ttf'));

  const classDoc = student.classId as any;
  const today = new Date().toISOString().split('T')[0];
  const filename = `bang-diem-${student.mssv}-${today}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Header
  doc
    .fontSize(18)
    .font('Roboto-Bold')
    .text('BẢNG ĐIỂM SINH VIÊN', { align: 'center' });
  doc.moveDown();

  // Student info
  doc.fontSize(11).font('Roboto');
  doc.text(`Họ và tên: ${student.fullName}`);
  doc.text(`MSSV: ${student.mssv}`);
  doc.text(`Lớp: ${classDoc?.name || 'Chưa phân lớp'}`);
  doc.text(`Ngày xuất: ${today}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  const colWidths = [35, 50, 120, 30, 75, 35, 35, 35, 35, 70];
  const headers = [
    'STT',
    'Mã môn',
    'Tên môn',
    'TC',
    'Học kỳ',
    'CC',
    'GK',
    'CK',
    'TK',
    'Xếp loại',
  ];

  let currentY = tableTop;
  doc.fontSize(8).font('Roboto-Bold');

  headers.forEach((header, i) => {
    const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(header, x, currentY, { width: colWidths[i], align: 'center', continued: false });
  });

  currentY += 20;
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 5;

  // Table rows
  doc.font('Roboto').fontSize(7);
  items.forEach((item, index) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 50;
    }

    const rowData = [
      String(index + 1),
      item.courseCode,
      item.courseName,
      String(item.credits),
      item.semester,
      item.attendance !== null ? String(item.attendance) : '-',
      item.midterm !== null ? String(item.midterm) : '-',
      item.final !== null ? String(item.final) : '-',
      item.total !== null ? String(item.total) : '-',
      item.classification,
    ];

    rowData.forEach((data, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(data, x, currentY, { width: colWidths[i], align: 'center', continued: false });
    });

    currentY += 18;
  });

  // GPA summary
  doc.moveDown(2);
  doc.fontSize(11).font('Roboto-Bold');
  doc.text(
    `Điểm trung bình tích lũy (GPA): ${gpa !== null ? gpa.toFixed(2) : 'Chưa có'}`,
    50,
    doc.y,
    {
      align: 'left',
    },
  );

  doc.end();
});

// GET /api/me/charts
export const getMyCharts: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const { semester } = req.query;

  // Get enrollments with filter
  const enrollmentFilter: Record<string, unknown> = {
    studentId: user.studentId,
  };
  if (semester) {
    enrollmentFilter.semester = semester;
  }

  const enrollments = await EnrollmentModel.find(enrollmentFilter)
    .populate('courseId')
    .sort({ semester: 1 });

  const enrollmentIds = enrollments.map((e) => e._id);
  const grades = await GradeModel.find({
    enrollmentId: { $in: enrollmentIds },
  });

  // Map grades by enrollmentId for quick lookup
  const gradeMap = new Map(grades.map((g) => [g.enrollmentId.toString(), g]));

  // 1. Grade Distribution (Phân bố điểm cá nhân)
  const gradeDistribution = {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
    total: 0,
  };

  grades.forEach((grade) => {
    if (grade.total !== null && grade.total !== undefined) {
      gradeDistribution.total++;
      if (grade.total >= 8) gradeDistribution.excellent++;
      else if (grade.total >= 6.5) gradeDistribution.good++;
      else if (grade.total >= 5) gradeDistribution.average++;
      else gradeDistribution.poor++;
    }
  });

  // 2. Grade By Course (Điểm theo từng môn học)
  const gradeByCourse = enrollments
    .map((enrollment) => {
      const grade = gradeMap.get(enrollment._id.toString());
      const course = enrollment.courseId as {
        _id?: unknown;
        code?: string;
        name?: string;
        credits?: number;
      };

      return {
        courseId: course?._id?.toString() || '',
        courseCode: course?.code || 'N/A',
        courseName: course?.name || 'N/A',
        credits: course?.credits || 0,
        total: grade?.total ?? null,
      };
    })
    .filter((item) => item.total !== null);

  // 3. GPA By Semester (GPA theo học kỳ)
  const semesterMap = new Map<
    string,
    { grades: { total: number; credits: number }[]; credits: number }
  >();

  enrollments.forEach((enrollment) => {
    const grade = gradeMap.get(enrollment._id.toString());
    const course = enrollment.courseId as { credits?: number };
    const sem = enrollment.semester || 'Unknown';

    if (!semesterMap.has(sem)) {
      semesterMap.set(sem, { grades: [], credits: 0 });
    }

    const semData = semesterMap.get(sem)!;
    if (grade?.total !== null && grade?.total !== undefined) {
      semData.grades.push({
        total: grade.total,
        credits: course?.credits || 0,
      });
    }
    semData.credits += course?.credits || 0;
  });

  const gpaBySemester = Array.from(semesterMap.entries())
    .map(([semester, data]) => ({
      semester,
      gpa: computeGPA(data.grades),
      gpa4: computeGPA4(data.grades),
      totalCredits: data.credits,
    }))
    .sort((a, b) => a.semester.localeCompare(b.semester));

  // 4. Credits By Semester (Tín chỉ theo học kỳ)
  const creditsBySemester = gpaBySemester.map((item) => ({
    semester: item.semester,
    credits: item.totalCredits,
  }));

  // 5. Component Comparison (So sánh điểm thành phần)
  const componentComparison = {
    attendance: 0,
    midterm: 0,
    final: 0,
    count: 0,
  };

  grades.forEach((grade) => {
    if (
      grade.attendance !== null &&
      grade.midterm !== null &&
      grade.final !== null
    ) {
      componentComparison.attendance += grade.attendance;
      componentComparison.midterm += grade.midterm;
      componentComparison.final += grade.final;
      componentComparison.count++;
    }
  });

  if (componentComparison.count > 0) {
    componentComparison.attendance = Number(
      (componentComparison.attendance / componentComparison.count).toFixed(2),
    );
    componentComparison.midterm = Number(
      (componentComparison.midterm / componentComparison.count).toFixed(2),
    );
    componentComparison.final = Number(
      (componentComparison.final / componentComparison.count).toFixed(2),
    );
  }

  res.json({
    gradeDistribution,
    gradeByCourse,
    gpaBySemester,
    creditsBySemester,
    componentComparison,
  });
});
