import type { RequestHandler } from "express";
import { ClassModel } from "../models/class.model";
import { asyncHandler } from "../utils/asyncHandler";

export const listClasses: RequestHandler = asyncHandler(async (_req, res) => {
  const classes = await ClassModel.find().sort({ code: 1 });
  res.json(classes);
});

export const getClassById: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classDoc = await ClassModel.findById(id);
  if (!classDoc) {
    return res.status(404).json({ message: "Class not found" });
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
    return res.status(404).json({ message: "Class not found" });
  }
  res.json(classDoc);
});

export const deleteClass: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await ClassModel.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Class not found" });
  }
  res.status(204).send();
});
