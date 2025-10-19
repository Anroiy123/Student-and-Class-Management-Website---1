import type { RequestHandler } from "express";
import { CourseModel } from "../models/course.model";
import { asyncHandler } from "../utils/asyncHandler";

export const listCourses: RequestHandler = asyncHandler(async (_req, res) => {
  const courses = await CourseModel.find().sort({ code: 1 });
  res.json(courses);
});

export const getCourse: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await CourseModel.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
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
    return res.status(404).json({ message: "Course not found" });
  }
  res.json(course);
});

export const deleteCourse: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await CourseModel.findByIdAndDelete(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.status(204).send();
});
