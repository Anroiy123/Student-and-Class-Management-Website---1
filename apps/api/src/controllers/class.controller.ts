import type { RequestHandler } from 'express';
import { ClassModel } from '../models/class.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getTeacherAccessScope,
  verifyTeacherClassAccess,
} from '../utils/teacherAccess';

export const listClasses: RequestHandler = asyncHandler(async (req, res) => {
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
      filter = { homeroomTeacherId: scope.teacherId };
    }
    // Admin: no filtering (scope is null)
  }

  const classes = await ClassModel.find(filter)
    .populate('homeroomTeacherId', 'employeeId fullName email')
    .sort({ code: 1 });
  res.json(classes);
});

export const getClassById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify teacher has access to this class
  if (req.user) {
    const hasAccess = await verifyTeacherClassAccess(req.user, id);
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const classDoc = await ClassModel.findById(id).populate(
    'homeroomTeacherId',
    'employeeId fullName email',
  );
  if (!classDoc) {
    return res.status(404).json({ message: 'Class not found' });
  }
  res.json(classDoc);
});

export const createClass: RequestHandler = asyncHandler(async (req, res) => {
  const classDoc = await ClassModel.create(req.body);
  res.status(201).json(classDoc);
});

export const updateClass: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classDoc = await ClassModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!classDoc) {
    return res.status(404).json({ message: 'Class not found' });
  }
  res.json(classDoc);
});

export const deleteClass: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ClassModel.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Class not found' });
  }
  res.status(204).send();
});
