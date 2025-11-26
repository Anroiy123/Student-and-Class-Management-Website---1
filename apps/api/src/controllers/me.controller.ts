import type { RequestHandler } from 'express';
import PDFDocument from 'pdfkit';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  ME_MESSAGES,
  computeClassification,
  computeGPA,
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

  const student = await StudentModel.findById(user.studentId).populate('classId');
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
  const enrollmentFilter: Record<string, unknown> = { studentId: user.studentId };
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
  const grades = await GradeModel.find({ enrollmentId: { $in: enrollmentIds } });

  // Map grades by enrollmentId for quick lookup
  const gradeMap = new Map(grades.map((g) => [g.enrollmentId.toString(), g]));

  // Build response items
  const items = enrollments.map((enrollment) => {
    const grade = gradeMap.get(enrollment._id.toString());
    const course = enrollment.courseId as any;

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
      classification: computeClassification(grade?.total ?? null),
    };
  });

  // Calculate GPA
  const gradesForGPA = items
    .filter((item) => item.total !== null)
    .map((item) => ({ total: item.total, credits: item.credits }));
  const gpa = computeGPA(gradesForGPA);
  const totalCredits = items.reduce((sum, item) => sum + item.credits, 0);

  // Apply pagination
  const paginatedItems = items.slice(skip, skip + Number(pageSize));

  res.json({
    items: paginatedItems,
    total: items.length,
    page: Number(page),
    pageSize: Number(pageSize),
    gpa,
    totalCredits,
  });
});

// GET /api/me/enrollments
export const getMyEnrollments: RequestHandler = asyncHandler(async (req, res) => {
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
});


// GET /api/me/dashboard
export const getMyDashboard: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const student = await StudentModel.findById(user.studentId).populate('classId');
  if (!student) {
    return res.status(404).json({ message: ME_MESSAGES.STUDENT_NOT_FOUND });
  }

  // Get enrollments
  const enrollments = await EnrollmentModel.find({ studentId: user.studentId })
    .populate('courseId');

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
    },
    recentGrades,
  });
});

// GET /api/me/semesters
export const getAvailableSemesters: RequestHandler = asyncHandler(async (req, res) => {
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
});


// GET /api/me/grades/export
export const exportMyGrades: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);
  if (!user || !user.studentId) {
    return res.status(404).json({ message: ME_MESSAGES.PROFILE_NOT_LINKED });
  }

  const student = await StudentModel.findById(user.studentId).populate('classId');
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
  const grades = await GradeModel.find({ enrollmentId: { $in: enrollmentIds } });
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

  // Generate PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const classDoc = student.classId as any;
  const today = new Date().toISOString().split('T')[0];
  const filename = `bang-diem-${student.mssv}-${today}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  doc.pipe(res);

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('BẢNG ĐIỂM SINH VIÊN', { align: 'center' });
  doc.moveDown();

  // Student info
  doc.fontSize(11).font('Helvetica');
  doc.text(`Họ và tên: ${student.fullName}`);
  doc.text(`MSSV: ${student.mssv}`);
  doc.text(`Lớp: ${classDoc?.name || 'Chưa phân lớp'}`);
  doc.text(`Ngày xuất: ${today}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  const colWidths = [40, 60, 150, 40, 50, 40, 40, 40, 40, 60];
  const headers = ['STT', 'Mã môn', 'Tên môn', 'TC', 'Học kỳ', 'CC', 'GK', 'CK', 'TK', 'Xếp loại'];

  let currentY = tableTop;
  doc.fontSize(9).font('Helvetica-Bold');

  headers.forEach((header, i) => {
    const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(header, x, currentY, { width: colWidths[i], align: 'center' });
  });

  currentY += 20;
  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 5;

  // Table rows
  doc.font('Helvetica').fontSize(8);
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
      doc.text(data, x, currentY, { width: colWidths[i], align: 'center' });
    });

    currentY += 18;
  });

  // GPA summary
  doc.moveDown(2);
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text(`Điểm trung bình tích lũy (GPA): ${gpa !== null ? gpa.toFixed(2) : 'Chưa có'}`, {
    align: 'right',
  });

  doc.end();
});
