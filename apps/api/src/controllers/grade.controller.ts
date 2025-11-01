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

// Get student semester GPA
export const getStudentSemesterGPA: RequestHandler = asyncHandler(async (req, res) => {
  const { studentId, semester } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: "studentId is required" });
  }

  // Find enrollments for this student and semester
  const enrollmentFilter: Record<string, unknown> = { studentId };
  if (semester) {
    enrollmentFilter.semester = semester;
  }

  const enrollments = await EnrollmentModel.find(enrollmentFilter)
    .populate('courseId')
    .populate('classId');

  if (enrollments.length === 0) {
    return res.json({
      studentId,
      semester: semester || 'all',
      courses: [],
      gpa: 0,
      totalCredits: 0,
      passedCredits: 0,
      failedCredits: 0,
    });
  }

  // Get grades for these enrollments
  const grades = await GradeModel.find({
    enrollmentId: { $in: enrollments.map(e => e._id) },
  }).populate({
    path: 'enrollmentId',
    populate: ['studentId', 'courseId', 'classId'],
  });

  // Calculate GPA (weighted by credits)
  let totalWeightedScore = 0;
  let totalCredits = 0;
  let passedCredits = 0;
  let failedCredits = 0;

  const courseGrades = grades.map(grade => {
    const enrollment = grade.enrollmentId as any;
    const course = enrollment.courseId;
    const credits = course.credits;
    
    totalWeightedScore += grade.total * credits;
    totalCredits += credits;
    
    if (grade.total >= 4.0) {
      passedCredits += credits;
    } else {
      failedCredits += credits;
    }

    return {
      courseCode: course.code,
      courseName: course.name,
      credits: course.credits,
      semester: enrollment.semester,
      attendance: grade.attendance,
      midterm: grade.midterm,
      final: grade.final,
      total: grade.total,
      status: grade.total >= 4.0 ? 'Đạt' : 'Không đạt',
    };
  });

  const gpa = totalCredits > 0 ? Number((totalWeightedScore / totalCredits).toFixed(2)) : 0;

  res.json({
    studentId,
    semester: semester || 'all',
    courses: courseGrades,
    gpa,
    totalCredits,
    passedCredits,
    failedCredits,
    totalCourses: courseGrades.length,
    passedCourses: courseGrades.filter(c => c.total >= 4.0).length,
    failedCourses: courseGrades.filter(c => c.total < 4.0).length,
  });
});
