import type { RequestHandler } from "express";
import { GradeModel } from "../models/grade.model";
import { EnrollmentModel } from "../models/enrollment.model";
import { asyncHandler } from "../utils/asyncHandler";

const computeTotal = (attendance: number, midterm: number, final: number) =>
  Number((attendance * 0.1 + midterm * 0.3 + final * 0.6).toFixed(2));

export const listGrades: RequestHandler = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  const enrollmentFilter: Record<string, unknown> = {};

  if (req.query.studentId) {
    enrollmentFilter.studentId = req.query.studentId;
  }
  if (req.query.classId) {
    enrollmentFilter.classId = req.query.classId;
  }
  if (req.query.courseId) {
    enrollmentFilter.courseId = req.query.courseId;
  }

  if (Object.keys(enrollmentFilter).length > 0) {
    const enrollmentDocs = await EnrollmentModel.find(enrollmentFilter).select(
      "_id",
    );
    filter.enrollmentId = {
      $in: enrollmentDocs.map((doc) => doc._id),
    };
  }

  const grades = await GradeModel.find(filter)
    .populate({
      path: "enrollmentId",
      populate: ["studentId", "classId", "courseId"],
    })
    .sort({ updatedAt: -1 });

  res.json(grades);
});

export const upsertGrade: RequestHandler = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { attendance, midterm, final } = req.body;

  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  const total = computeTotal(attendance, midterm, final);

  const grade = await GradeModel.findOneAndUpdate(
    { enrollmentId },
    { attendance, midterm, final, total, computedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).populate({
    path: "enrollmentId",
    populate: ["studentId", "classId", "courseId"],
  });

  res.json(grade);
});
