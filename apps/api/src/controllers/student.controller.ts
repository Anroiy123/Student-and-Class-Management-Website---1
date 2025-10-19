import type { RequestHandler } from "express";
import { StudentModel } from "../models/student.model";
import { asyncHandler } from "../utils/asyncHandler";

const DEFAULT_PAGE_SIZE = 10;

export const listStudents: RequestHandler = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE);
  const query = String(req.query.q ?? "").trim();
  const classId = req.query.classId ? String(req.query.classId) : undefined;

  const filter: Record<string, unknown> = {};

  if (query) {
    filter.$or = [
      { mssv: { $regex: query, $options: "i" } },
      { fullName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  if (classId) {
    filter.classId = classId;
  }

  const [items, total] = await Promise.all([
    StudentModel.find(filter)
      .populate("classId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    StudentModel.countDocuments(filter),
  ]);

  res.json({
    items,
    total,
    page,
    pageSize,
  });
});

export const getStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await StudentModel.findById(id).populate("classId");

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

export const createStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { dob, ...rest } = req.body;
  const student = await StudentModel.create({
    ...rest,
    dob: new Date(dob),
  });
  res.status(201).json(student);
});

export const updateStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const update: Record<string, unknown> = { ...req.body };

  if (update.dob) {
    update.dob = new Date(String(update.dob));
  }

  const student = await StudentModel.findByIdAndUpdate(id, update, {
    new: true,
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json(student);
});

export const deleteStudent: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await StudentModel.findByIdAndDelete(id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(204).send();
});
