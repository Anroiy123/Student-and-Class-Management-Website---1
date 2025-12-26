import type { RequestHandler } from 'express';
import type { FilterQuery } from 'mongoose';
import { StudentModel } from '../models/student.model';
import type { Student } from '../models/student.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherStudentAccess,
} from '../utils/teacherAccess';

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
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their classes
      if (scope.classIds.length === 0) {
        // Unlinked teacher - return empty
        return res.json({ items: [], total: 0, page, pageSize });
      }
      filter.classId = { $in: scope.classIds };
    }
    // Admin: no filtering (scope is null)
  }

  if (query) {
    const q = new RegExp(escapeRegExp(query), 'i');
    filter.$or = [{ mssv: q }, { fullName: q }, { email: q }];
  }

  if (classId) {
    filter.classId = classId as unknown as FilterQuery<Student>['classId'];
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

  // Use aggregation to sort by last name (tên - last word in fullName)
  const pipeline: any[] = [
    { $match: filter },
    {
      $addFields: {
        // Extract last word (tên) from fullName for sorting
        lastName: {
          $arrayElemAt: [{ $split: ['$fullName', ' '] }, -1],
        },
      },
    },
    { $sort: { lastName: 1, fullName: 1 } }, // Sort by tên first, then full name
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
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
