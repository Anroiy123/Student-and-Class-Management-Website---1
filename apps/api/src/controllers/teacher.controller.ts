import type { RequestHandler } from 'express';
import { TeacherModel } from '../models/teacher.model';
import { asyncHandler } from '../utils/asyncHandler';

export const listTeachers: RequestHandler = asyncHandler(async (_req, res) => {
  const teachers = await TeacherModel.find()
    .sort({ employeeId: 1 })
    .select('employeeId fullName email phone department specialization status');
  res.json(teachers);
});

export const getTeacher: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const teacher = await TeacherModel.findById(id);
  if (!teacher) {
    return res.status(404).json({ message: 'Teacher not found' });
  }
  res.json(teacher);
});

