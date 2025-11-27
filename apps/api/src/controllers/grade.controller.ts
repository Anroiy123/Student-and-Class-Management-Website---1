import type { RequestHandler } from 'express';
import { GradeModel } from '../models/grade.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherEnrollmentAccess,
} from '../utils/teacherAccess';

const computeTotal = (attendance: number, midterm: number, final: number) =>
  Number((attendance * 0.1 + midterm * 0.3 + final * 0.6).toFixed(2));

export const listGrades: RequestHandler = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  const enrollmentMatch: Record<string, unknown> = {};

  // Apply teacher scope filtering
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their classes or courses
      if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
        // Unlinked teacher - return empty
        return res.json({ items: [], total: 0, page: 1, pageSize: 10 });
      }
      // Filter enrollments by classId OR courseId in scope
      enrollmentMatch.$or = [
        { classId: { $in: scope.classIds } },
        { courseId: { $in: scope.courseIds } },
      ];
    }
    // Admin: no filtering (scope is null)
  }

  if (req.query.studentId) {
    enrollmentMatch.studentId = req.query.studentId;
  }
  if (req.query.classId) {
    enrollmentMatch.classId = req.query.classId;
  }
  if (req.query.courseId) {
    enrollmentMatch.courseId = req.query.courseId;
  }
  if (req.query.semester) {
    enrollmentMatch.semester = req.query.semester;
  }

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const grades = await GradeModel.find(filter)
    .populate({
      path: 'enrollmentId',
      match:
        Object.keys(enrollmentMatch).length > 0 ? enrollmentMatch : undefined,
      populate: ['studentId', 'classId', 'courseId'],
    })
    .sort({ updatedAt: -1 });

  // Filter out grades where enrollmentId is null (didn't match the criteria)
  const filteredGrades = grades.filter((grade) => grade.enrollmentId !== null);

  // Apply pagination
  const paginatedGrades = filteredGrades.slice(skip, skip + pageSize);

  res.json({
    items: paginatedGrades,
    total: filteredGrades.length,
    page,
    pageSize,
  });
});

export const upsertGrade: RequestHandler = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { attendance, midterm, final } = req.body;

  // Verify teacher has access to this enrollment
  if (req.user) {
    const hasAccess = await verifyTeacherEnrollmentAccess(req.user, enrollmentId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  const total = computeTotal(attendance, midterm, final);

  const grade = await GradeModel.findOneAndUpdate(
    { enrollmentId },
    { attendance, midterm, final, total, computedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).populate({
    path: 'enrollmentId',
    populate: ['studentId', 'classId', 'courseId'],
  });

  res.json(grade);
});
