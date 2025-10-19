import type { RequestHandler } from "express";
import { EnrollmentModel } from "../models/enrollment.model";
import { asyncHandler } from "../utils/asyncHandler";

export const listEnrollments: RequestHandler = asyncHandler(
  async (req, res) => {
    const filter: Record<string, unknown> = {};

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
      .populate("studentId")
      .populate("classId")
      .populate("courseId")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  },
);

export const createEnrollment: RequestHandler = asyncHandler(
  async (req, res) => {
    const enrollment = await EnrollmentModel.create(req.body);
    res.status(201).json(
      await enrollment.populate(["studentId", "classId", "courseId"]),
    );
  },
);

export const deleteEnrollment: RequestHandler = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const enrollment = await EnrollmentModel.findByIdAndDelete(id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.status(204).send();
  },
);
