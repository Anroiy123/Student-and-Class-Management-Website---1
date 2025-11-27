import type { RequestHandler } from 'express';
import { CourseModel } from '../models/course.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherCourseAccess,
} from '../utils/teacherAccess';

export const listCourses: RequestHandler = asyncHandler(async (req, res) => {
  let filter = {};

  // Apply teacher scope filtering
  if (req.user) {
    const scope = await getTeacherAccessScope(req.user);
    if (scope) {
      // Teacher: filter by their teacherId
      if (!scope.teacherId) {
        // Unlinked teacher - return empty
        return res.json([]);
      }
      filter = { teacherId: scope.teacherId };
    }
    // Admin: no filtering (scope is null)
  }

  const courses = await CourseModel.find(filter)
    .populate('teacherId', 'employeeId fullName email')
    .sort({ code: 1 });
  res.json(courses);
});

export const getCourse: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify teacher has access to this course
  if (req.user) {
    const hasAccess = await verifyTeacherCourseAccess(req.user, id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const course = await CourseModel.findById(id).populate(
    'teacherId',
    'employeeId fullName email',
  );
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

export const createCourse: RequestHandler = asyncHandler(async (req, res) => {
  const course = await CourseModel.create(req.body);
  res.status(201).json(course);
});

export const updateCourse: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await CourseModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.json(course);
});

export const deleteCourse: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await CourseModel.findByIdAndDelete(id);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  res.status(204).send();
});
