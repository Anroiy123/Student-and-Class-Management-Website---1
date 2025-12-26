import type { RequestHandler } from 'express';
import { EnrollmentModel } from '../models/enrollment.model';
import { StudentModel } from '../models/student.model';
import { ClassModel } from '../models/class.model';
import { CourseModel } from '../models/course.model';
import { asyncHandler } from '../utils/asyncHandler';
import { getTeacherAccessScope } from '../utils/teacherAccess';

export const listEnrollments: RequestHandler = asyncHandler(
  async (req, res) => {
    const filter: Record<string, unknown> = {};

    // Apply teacher scope filtering
    if (req.user) {
      const scope = await getTeacherAccessScope(req.user);
      if (scope) {
        // Teacher: filter by their classes or courses
        if (scope.classIds.length === 0 && scope.courseIds.length === 0) {
          // Unlinked teacher - return empty
          return res.json([]);
        }
        filter.$or = [
          { classId: { $in: scope.classIds } },
          { courseId: { $in: scope.courseIds } },
        ];
      }
      // Admin: no filtering (scope is null)
    }

    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }

    if (req.query.classId) {
      filter.classId = req.query.classId;
    }

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    if (req.query.semester) {
      filter.semester = req.query.semester;
    }

    const enrollments = await EnrollmentModel.find(filter)
      .populate('studentId')
      .populate('classId')
      .populate('courseId')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  },
);

export const createEnrollment: RequestHandler = asyncHandler(
  async (req, res) => {
    const { studentId, classId, courseId } = req.body;

    // Validate student exists
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate class exists (if provided)
    if (classId) {
      const classDoc = await ClassModel.findById(classId);
      if (!classDoc) {
        return res.status(404).json({ message: 'Class not found' });
      }
    }

    // Validate course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await EnrollmentModel.create(req.body);
    res
      .status(201)
      .json(await enrollment.populate(['studentId', 'classId', 'courseId']));
  },
);

export const deleteEnrollment: RequestHandler = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const enrollment = await EnrollmentModel.findByIdAndDelete(id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.status(204).send();
  },
);

export const listSemesters: RequestHandler = asyncHandler(
  async (req, res) => {
    // Get all distinct semesters from enrollments
    const semesters = await EnrollmentModel.distinct('semester');
    
    // Filter out empty/null values and sort
    const validSemesters = semesters
      .filter((s) => s && s.trim())
      .sort()
      .reverse(); // Most recent first

    res.json(validSemesters);
  },
);
