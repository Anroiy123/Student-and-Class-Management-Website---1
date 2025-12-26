import type { RequestHandler } from 'express';
import { GradeModel } from '../models/grade.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherEnrollmentAccess,
} from '../utils/teacherAccess';
import { convertToGPA4, computeLetterGrade } from '../constants/messages';

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
    // Support partial semester matching (HK1, 2024, or HK1-2024)
    // Escape special regex characters to avoid issues with parentheses
    const escapedSemester = (req.query.semester as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    enrollmentMatch.semester = { $regex: escapedSemester, $options: 'i' };
  }

  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  // Handle search
  const search = req.query.search as string | undefined;
  const searchField = (req.query.searchField as string) || 'studentName';

  const grades = await GradeModel.find(filter)
    .populate({
      path: 'enrollmentId',
      match:
        Object.keys(enrollmentMatch).length > 0 ? enrollmentMatch : undefined,
      populate: ['studentId', 'classId', 'courseId'],
    })
    .sort({ updatedAt: -1 });

  // Filter out grades where enrollmentId is null (didn't match the criteria)
  let filteredGrades = grades.filter((grade) => grade.enrollmentId !== null);

  // Apply search filter
  if (search && search.trim()) {
    const searchLower = search.toLowerCase().trim();
    filteredGrades = filteredGrades.filter((grade) => {
      const enrollment = grade.enrollmentId as {
        studentId?: { mssv?: string; fullName?: string };
      };
      const student = enrollment?.studentId;
      if (!student) return false;

      if (searchField === 'mssv') {
        return student.mssv?.toLowerCase().includes(searchLower);
      } else {
        return student.fullName?.toLowerCase().includes(searchLower);
      }
    });
  }

  // Apply pagination
  const paginatedGrades = filteredGrades.slice(skip, skip + pageSize);

  res.json({
    items: paginatedGrades,
    total: filteredGrades.length,
    page,
    pageSize,
  });
});

export const getGradeStatistics: RequestHandler = asyncHandler(
  async (req, res) => {
    const enrollmentMatch: Record<string, unknown> = {};

    // Apply teacher scope filtering
    if (req.user) {
      const scope = await getTeacherAccessScope(req.user);
      if (scope) {
        if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
          return res.json({
            averages: { attendance: 0, midterm: 0, final: 0, total: 0 },
            distribution: { excellent: 0, good: 0, average: 0, poor: 0 },
            totalCount: 0,
            byCourse: [],
          });
        }
        enrollmentMatch.$or = [
          { classId: { $in: scope.classIds } },
          { courseId: { $in: scope.courseIds } },
        ];
      }
    }

    if (req.query.classId) enrollmentMatch.classId = req.query.classId;
    if (req.query.courseId) enrollmentMatch.courseId = req.query.courseId;
    if (req.query.semester) {
      // Support partial semester matching (HK1, 2024, or HK1-2024)
      // Escape special regex characters to avoid issues with parentheses
      const escapedSemester = (req.query.semester as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      enrollmentMatch.semester = { $regex: escapedSemester, $options: 'i' };
    }

    // Handle search
    const search = req.query.search as string | undefined;
    const searchField = (req.query.searchField as string) || 'studentName';

    // Get all grades with enrollment filter
    const grades = await GradeModel.find({ total: { $ne: null, $gte: 0 } })
      .populate({
        path: 'enrollmentId',
        match:
          Object.keys(enrollmentMatch).length > 0 ? enrollmentMatch : undefined,
        populate: ['studentId', 'courseId'],
      })
      .lean();

    let filteredGrades = grades.filter((g) => g.enrollmentId !== null);

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredGrades = filteredGrades.filter((grade) => {
        const enrollment = grade.enrollmentId as {
          studentId?: { mssv?: string; fullName?: string };
        };
        const student = enrollment?.studentId;
        if (!student) return false;

        if (searchField === 'mssv') {
          return student.mssv?.toLowerCase().includes(searchLower);
        } else {
          return student.fullName?.toLowerCase().includes(searchLower);
        }
      });
    }

    if (filteredGrades.length === 0) {
      return res.json({
        averages: { attendance: 0, midterm: 0, final: 0, total: 0 },
        distribution: { excellent: 0, good: 0, average: 0, poor: 0 },
        totalCount: 0,
        byCourse: [],
      });
    }

    // Calculate weighted averages (by credits)
    const { weightedSum, totalCredits } = filteredGrades.reduce(
      (acc, g) => {
        const enrollment = g.enrollmentId as {
          courseId?: { credits?: number };
        };
        const credits = enrollment?.courseId?.credits || 1;
        return {
          weightedSum: {
            attendance:
              acc.weightedSum.attendance + (g.attendance || 0) * credits,
            midterm: acc.weightedSum.midterm + (g.midterm || 0) * credits,
            final: acc.weightedSum.final + (g.final || 0) * credits,
            total: acc.weightedSum.total + (g.total || 0) * credits,
          },
          totalCredits: acc.totalCredits + credits,
        };
      },
      {
        weightedSum: { attendance: 0, midterm: 0, final: 0, total: 0 },
        totalCredits: 0,
      },
    );

    const averages =
      totalCredits > 0
        ? {
            attendance: Number(
              (weightedSum.attendance / totalCredits).toFixed(2),
            ),
            midterm: Number((weightedSum.midterm / totalCredits).toFixed(2)),
            final: Number((weightedSum.final / totalCredits).toFixed(2)),
            total: Number((weightedSum.total / totalCredits).toFixed(2)),
          }
        : { attendance: 0, midterm: 0, final: 0, total: 0 };

    // Calculate distribution
    const distribution = filteredGrades.reduce(
      (acc, g) => {
        const total = g.total || 0;
        if (total >= 8) acc.excellent++;
        else if (total >= 6.5) acc.good++;
        else if (total >= 5) acc.average++;
        else acc.poor++;
        return acc;
      },
      { excellent: 0, good: 0, average: 0, poor: 0 },
    );

    // Calculate by course (for individual student view)
    const byCourse = filteredGrades.map((g) => {
      const enrollment = g.enrollmentId as {
        courseId?: { _id: string; code: string; name: string };
      };
      const course = enrollment?.courseId;
      return {
        courseId: course?._id || '',
        courseCode: course?.code || '',
        courseName: course?.name || '',
        attendance: g.attendance || 0,
        midterm: g.midterm || 0,
        final: g.final || 0,
        total: g.total || 0,
      };
    });

    res.json({
      averages,
      distribution,
      totalCount: filteredGrades.length,
      byCourse,
    });
  },
);

export const upsertGrade: RequestHandler = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { attendance, midterm, final } = req.body;

  // Verify teacher has access to this enrollment
  if (req.user) {
    const hasAccess = await verifyTeacherEnrollmentAccess(
      req.user,
      enrollmentId,
    );
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  const total = computeTotal(attendance, midterm, final);
  const gpa4 = convertToGPA4(total);
  const letterGrade = computeLetterGrade(total);

  const grade = await GradeModel.findOneAndUpdate(
    { enrollmentId },
    {
      attendance,
      midterm,
      final,
      total,
      gpa4,
      letterGrade,
      computedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).populate({
    path: 'enrollmentId',
    populate: ['studentId', 'classId', 'courseId'],
  });

  res.json(grade);
});
