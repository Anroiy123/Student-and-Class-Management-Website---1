import type { RequestHandler } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { GradeModel } from '../models/grade.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { asyncHandler } from '../utils/asyncHandler';
import { getTeacherAccessScope } from '../utils/teacherAccess';

const computeClassification = (total: number): string => {
  if (total >= 8) return 'Giỏi';
  if (total >= 6.5) return 'Khá';
  if (total >= 5) return 'Trung bình';
  return 'Yếu';
};

export const getAvailableCourses: RequestHandler = asyncHandler(
  async (req, res) => {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({ message: 'classId là bắt buộc' });
    }

    // Apply teacher scope filtering
    let enrollmentFilter: any = { classId };
    if (req.user) {
      const scope = await getTeacherAccessScope(req.user);
      if (scope) {
        // Teacher: filter by their scope
        if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
          // Unlinked teacher - return empty
          return res.json([]);
        }
        enrollmentFilter = {
          classId,
          $or: [
            { classId: { $in: scope.classIds } },
            { courseId: { $in: scope.courseIds } },
          ],
        };
      }
      // Admin: no filtering (scope is null)
    }

    const _enrollments = await EnrollmentModel.find(enrollmentFilter)
      .populate('courseId')
      .distinct('courseId');

    const gradeEnrollments = await GradeModel.find()
      .populate({
        path: 'enrollmentId',
        match: enrollmentFilter,
        populate: 'courseId',
      })
      .then((grades) =>
        grades
          .filter((g) => g.enrollmentId !== null)
          .map((g: any) => g.enrollmentId.courseId),
      );

    const uniqueCourses = Array.from(
      new Map(
        gradeEnrollments
          .filter((c: any) => c !== null && c !== undefined)
          .map((c: any) => [c._id.toString(), c]),
      ).values(),
    );

    res.json(uniqueCourses);
  },
);

export const exportReport: RequestHandler = asyncHandler(async (req, res) => {
  const { classId, courseId, semester, format } = req.query;

  const enrollmentMatch: Record<string, unknown> = {};
  if (classId) enrollmentMatch.classId = classId;
  if (courseId) enrollmentMatch.courseId = courseId;
  if (semester) enrollmentMatch.semester = semester;

  // Apply teacher scope filtering
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their scope
      if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
        // Unlinked teacher - return 403
        return res.status(403).json({ message: 'Forbidden' });
      }
      enrollmentMatch.$or = [
        { classId: { $in: scope.classIds } },
        { courseId: { $in: scope.courseIds } },
      ];
    }
    // Admin: no filtering (scope is null)
  }

  const grades = await GradeModel.find()
    .populate({
      path: 'enrollmentId',
      match:
        Object.keys(enrollmentMatch).length > 0 ? enrollmentMatch : undefined,
      populate: ['studentId', 'classId', 'courseId'],
    })
    .sort({ updatedAt: -1 });

  const filteredGrades = grades.filter((grade) => grade.enrollmentId !== null);

  if (filteredGrades.length === 0) {
    return res.status(404).json({ message: 'Không tìm thấy dữ liệu điểm' });
  }

  if (format === 'pdf') {
    await generatePDFReport(res, filteredGrades);
  } else {
    await generateExcelReport(res, filteredGrades);
  }
});

async function generateExcelReport(res: any, grades: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Báo cáo điểm');

  worksheet.columns = [
    { header: 'STT', key: 'stt', width: 8 },
    { header: 'MSSV', key: 'mssv', width: 15 },
    { header: 'Họ và tên', key: 'fullName', width: 30 },
    { header: 'Lớp', key: 'class', width: 15 },
    { header: 'Môn học', key: 'course', width: 25 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'Chuyên cần', key: 'attendance', width: 12 },
    { header: 'Giữa kỳ', key: 'midterm', width: 12 },
    { header: 'Cuối kỳ', key: 'final', width: 12 },
    { header: 'Tổng kết', key: 'total', width: 12 },
    { header: 'GPA 4.0', key: 'gpa4', width: 10 },
    { header: 'Điểm chữ', key: 'letterGrade', width: 12 },
    { header: 'Xếp loại', key: 'classification', width: 15 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  grades.forEach((grade: any, index: number) => {
    const enrollment = grade.enrollmentId;
    const student = enrollment?.studentId;
    const classDoc = enrollment?.classId;
    const course = enrollment?.courseId;

    worksheet.addRow({
      stt: index + 1,
      mssv: student?.mssv || 'N/A',
      fullName: student?.fullName || 'N/A',
      class: classDoc?.code || 'N/A',
      course: course?.name || 'N/A',
      semester: enrollment?.semester || 'N/A',
      attendance: grade.attendance,
      midterm: grade.midterm,
      final: grade.final,
      total: grade.total,
      gpa4: grade.gpa4 || 0,
      letterGrade: grade.letterGrade || 'F',
      classification: computeClassification(grade.total),
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=bao-cao-diem-${Date.now()}.xlsx`,
  );

  await workbook.xlsx.write(res);
  res.end();
}

async function generatePDFReport(res: any, grades: any[]) {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    layout: 'landscape',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=bao-cao-diem-${Date.now()}.pdf`,
  );

  doc.pipe(res);

  doc.fontSize(18).font('Helvetica-Bold').text('BÁO CÁO ĐIỂM SINH VIÊN', {
    align: 'center',
  });
  doc.moveDown();

  doc.fontSize(10).font('Helvetica');

  const tableTop = 120;
  const rowHeight = 25;
  const colWidths = [30, 60, 120, 60, 100, 60, 40, 40, 40, 40, 40, 40, 70];
  const headers = [
    'STT',
    'MSSV',
    'Họ và tên',
    'Lớp',
    'Môn học',
    'Học kỳ',
    'CC',
    'GK',
    'CK',
    'TK',
    'GPA4',
    'Chữ',
    'Xếp loại',
  ];

  let currentY = tableTop;

  headers.forEach((header, i) => {
    const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc
      .rect(x, currentY, colWidths[i], rowHeight)
      .fillAndStroke('#D3D3D3', '#000000');
    doc
      .fillColor('#000000')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(header, x + 5, currentY + 8, {
        width: colWidths[i] - 10,
        align: 'center',
      });
  });

  currentY += rowHeight;

  grades.forEach((grade: any, index: number) => {
    const enrollment = grade.enrollmentId;
    const student = enrollment?.studentId;
    const classDoc = enrollment?.classId;
    const course = enrollment?.courseId;

    const rowData = [
      String(index + 1),
      student?.mssv || 'N/A',
      student?.fullName || 'N/A',
      classDoc?.code || 'N/A',
      course?.name || 'N/A',
      enrollment?.semester || 'N/A',
      String(grade.attendance),
      String(grade.midterm),
      String(grade.final),
      String(grade.total),
      String(grade.gpa4 || 0),
      grade.letterGrade || 'F',
      computeClassification(grade.total),
    ];

    if (currentY > 500) {
      doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' });
      currentY = 50;
    }

    rowData.forEach((data, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, currentY, colWidths[i], rowHeight).stroke('#000000');
      doc
        .fillColor('#000000')
        .fontSize(8)
        .font('Helvetica')
        .text(data, x + 5, currentY + 8, {
          width: colWidths[i] - 10,
          align: 'center',
        });
    });

    currentY += rowHeight;
  });

  doc.end();
}
