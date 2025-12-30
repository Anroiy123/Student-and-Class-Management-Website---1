import type { RequestHandler } from 'express';
import type { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { StudentModel } from '../models/student.model';
import type { Student } from '../models/student.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherStudentAccess,
} from '../utils/teacherAccess';
import { createStudentInfoUpdateNotification } from '../utils/notificationService';

const DEFAULT_PAGE_SIZE = 10;

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const listStudents: RequestHandler = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE);
  const query = String(req.query.q ?? '').trim();
  const classId = req.query.classId ? String(req.query.classId) : undefined;
  const mssv = req.query.mssv ? String(req.query.mssv) : undefined;
  const fullName = req.query.fullName ? String(req.query.fullName) : undefined;
  const email = req.query.email ? String(req.query.email) : undefined;
  const phone = req.query.phone ? String(req.query.phone) : undefined;
  const address = req.query.address ? String(req.query.address) : undefined;
  const dobFrom = req.query.dobFrom ? String(req.query.dobFrom) : undefined;
  const dobTo = req.query.dobTo ? String(req.query.dobTo) : undefined;

  const filter: FilterQuery<Student> = {};

  // Apply teacher scope filtering
  let teacherScope: { classIds: any[] } | null = null;
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their classes
      if (scope.classIds.length === 0) {
        // Unlinked teacher - return empty
        return res.json({ items: [], total: 0, page, pageSize });
      }
      teacherScope = scope;
      filter.classId = { $in: scope.classIds };
    }
    // Admin: no filtering (scope is null)
  }

  if (query) {
    const q = new RegExp(escapeRegExp(query), 'i');
    filter.$or = [{ mssv: q }, { fullName: q }, { email: q }];
  }

  if (classId) {
    // Validate and convert classId to ObjectId
    if (!Types.ObjectId.isValid(classId)) {
      return res.json({ items: [], total: 0, page, pageSize });
    }
    
    const classObjectId = new Types.ObjectId(classId);
    
    // If teacher scope exists, we need to ensure the classId is within their scope
    if (teacherScope) {
      // Check if the requested classId is in teacher's scope
      const hasAccess = teacherScope.classIds.some(
        (id) => id.equals(classObjectId)
      );
      if (!hasAccess) {
        // Teacher trying to access a class they don't have access to
        return res.json({ items: [], total: 0, page, pageSize });
      }
      // If within scope, filter by the specific classId
      filter.classId = classObjectId;
    } else {
      // Admin: directly filter by classId
      filter.classId = classObjectId;
    }
  }

  if (mssv) {
    filter.mssv = new RegExp(escapeRegExp(mssv), 'i');
  }
  if (fullName) {
    filter.fullName = new RegExp(escapeRegExp(fullName), 'i');
  }
  if (email) {
    filter.email = new RegExp(escapeRegExp(email), 'i');
  }
  if (phone) {
    filter.phone = new RegExp(escapeRegExp(phone), 'i');
  }
  if (address) {
    filter.address = new RegExp(escapeRegExp(address), 'i');
  }

  if (dobFrom || dobTo) {
    const dobCond: { $gte?: Date; $lte?: Date } = {};
    if (dobFrom) {
      const fromDate = new Date(dobFrom);
      if (!isNaN(fromDate.getTime())) {
        dobCond.$gte = fromDate;
      }
    }
    if (dobTo) {
      const toDate = new Date(dobTo);
      if (!isNaN(toDate.getTime())) {
        dobCond.$lte = toDate;
      }
    }
    if (Object.keys(dobCond).length > 0) {
      filter.dob = dobCond;
    }
  }

  // Use aggregation to sort by class first, then by last name (tên - last word in fullName)
  const pipeline: any[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'classes',
        localField: 'classId',
        foreignField: '_id',
        as: 'classInfo',
      },
    },
    {
      $addFields: {
        // Extract last word (tên) from fullName for sorting
        lastName: {
          $arrayElemAt: [{ $split: ['$fullName', ' '] }, -1],
        },
        // Get class code for sorting
        classCode: {
          $arrayElemAt: ['$classInfo.code', 0],
        },
      },
    },
    { $sort: { classCode: 1, lastName: 1, fullName: 1 } }, // Sort by class first, then by tên, then full name
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
    {
      $project: {
        classInfo: 0, // Remove temporary lookup field
        classCode: 0, // Remove temporary sort field
      },
    },
  ];

  const [items, total] = await Promise.all([
    StudentModel.aggregate(pipeline).then((docs) =>
      StudentModel.populate(docs, { path: 'classId' }),
    ),
    StudentModel.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    pageSize,
  });
});

export const getStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify teacher has access to this student
  if (req.user) {
    const hasAccess = await verifyTeacherStudentAccess(req.user, id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const student = await StudentModel.findById(id).populate('classId');

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
});

export const createStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { dob, ...rest } = req.body;
  const student = await StudentModel.create({
    ...rest,
    dob: new Date(dob),
  });
  res.status(201).json(student);
});

export const updateStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update: Record<string, unknown> = { ...req.body };

  if (update.dob) {
    update.dob = new Date(String(update.dob));
  }

  const student = await StudentModel.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Send notification to student about info update
  if (req.user) {
    createStudentInfoUpdateNotification(
      student._id,
      ['Thông tin cá nhân']
    ).catch((err) => console.error('Failed to create notification:', err));
  }

  res.json(student);
});

export const deleteStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await StudentModel.findByIdAndDelete(id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.status(204).send();
});

export const importStudentsExcel: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được tải lên' });
    }

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: 'File Excel không hợp lệ' });
    }

    const students: any[] = [];
    const errors: string[] = [];
    let rowIndex = 0;

    worksheet.eachRow((row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      rowIndex++;
      const mssv = row.getCell(1).value?.toString().trim();
      const fullName = row.getCell(2).value?.toString().trim();
      const dobValue = row.getCell(3).value;
      
      // Handle email (might be hyperlink object or string)
      const emailValue = row.getCell(4).value;
      let email = '';
      if (typeof emailValue === 'string') {
        email = emailValue.trim();
      } else if (emailValue && typeof emailValue === 'object' && 'text' in emailValue) {
        email = (emailValue as any).text?.toString().trim() || '';
      } else if (emailValue) {
        email = emailValue.toString().trim();
      }
      
      const phone = row.getCell(5).value?.toString().trim();
      const address = row.getCell(6).value?.toString().trim();
      const classCode = row.getCell(7).value?.toString().trim();

      // Validate required fields
      if (!mssv || !fullName || !email) {
        errors.push(
          `Dòng ${rowNumber}: Thiếu thông tin bắt buộc (MSSV, Họ tên, Email)`,
        );
        return;
      }

      // Parse date
      let dob: Date | null = null;
      if (dobValue instanceof Date) {
        dob = dobValue;
      } else if (typeof dobValue === 'number') {
        // Excel serial date
        dob = new Date((dobValue - 25569) * 86400 * 1000);
      } else if (typeof dobValue === 'string') {
        dob = new Date(dobValue);
      }

      if (!dob || isNaN(dob.getTime())) {
        errors.push(`Dòng ${rowNumber}: Ngày sinh không hợp lệ`);
        return;
      }

      students.push({
        mssv,
        fullName,
        dob,
        email,
        phone: phone || '',
        address: address || '',
        classCode: classCode || null,
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'File có lỗi',
        errors: errors.slice(0, 10), // Limit to first 10 errors
      });
    }

    if (students.length === 0) {
      return res
        .status(400)
        .json({ message: 'File không có dữ liệu sinh viên' });
    }

    // Import students
    const { ClassModel } = await import('../models/class.model');
    const imported: any[] = [];
    const failed: string[] = [];

    for (const studentData of students) {
      try {
        // Find class by code if provided
        let classId = null;
        if (studentData.classCode) {
          const classDoc = await ClassModel.findOne({
            code: studentData.classCode,
          });
          if (classDoc) {
            classId = classDoc._id;
          }
        }

        // Check if student already exists
        const existing = await StudentModel.findOne({
          mssv: studentData.mssv,
        });
        if (existing) {
          failed.push(
            `MSSV ${studentData.mssv} đã tồn tại - ${studentData.fullName}`,
          );
          continue;
        }

        // Remove classCode from studentData before creating
        const { classCode, ...studentInfo } = studentData;
        const student = await StudentModel.create({
          ...studentInfo,
          classId,
        });
        imported.push(student);
      } catch (error: any) {
        failed.push(
          `${studentData.mssv}: ${error.message || 'Lỗi không xác định'}`,
        );
      }
    }

    res.json({
      message: 'Import hoàn tất',
      imported: imported.length,
      failed: failed.length,
      errors: failed.slice(0, 20), // Limit to first 20 failed records
    });
  },
);

export const downloadTemplate: RequestHandler = asyncHandler(
  async (_req, res) => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Mẫu danh sách sinh viên');

    // Define columns
    worksheet.columns = [
      { header: 'MSSV (*)', key: 'mssv', width: 15 },
      { header: 'Họ và tên (*)', key: 'fullName', width: 30 },
      { header: 'Ngày sinh (*)', key: 'dob', width: 15 },
      { header: 'Email (*)', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Mã lớp', key: 'classCode', width: 15 },
    ];

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add sample data
    worksheet.addRow({
      mssv: 'B21DCCN001',
      fullName: 'Nguyễn Văn A',
      dob: new Date('2003-01-15'),
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      address: 'Hà Nội',
      classCode: 'D21CQCN01-B',
    });

    worksheet.addRow({
      mssv: 'B21DCCN002',
      fullName: 'Trần Thị B',
      dob: new Date('2003-05-20'),
      email: 'tranthib@example.com',
      phone: '0987654321',
      address: 'Hồ Chí Minh',
      classCode: 'D21CQCN02-B',
    });

    // Format date column
    worksheet.getColumn(3).numFmt = 'dd/mm/yyyy';

    // Add borders
    worksheet.eachRow((row, rowNumber) => {
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
      'attachment; filename=mau-danh-sach-sinh-vien.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  },
);
