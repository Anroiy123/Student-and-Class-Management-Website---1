import type { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';
import { TeacherModel } from '../models/teacher.model';
import { asyncHandler } from '../utils/asyncHandler';

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const { status, role, page = 1, pageSize = 20, search } = req.query;

  const filter: Record<string, unknown> = {};

  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    filter.email = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(pageSize);

  const [items, total] = await Promise.all([
    UserModel.find(filter)
      .select('-passwordHash')
      .populate('studentId', 'mssv fullName email')
      .populate('teacherId', 'employeeId fullName email')
      .populate('approvedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(pageSize)),
    UserModel.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
});

export const getUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id)
    .select('-passwordHash')
    .populate('studentId', 'mssv fullName email phone')
    .populate('teacherId', 'employeeId fullName email phone')
    .populate('approvedBy', 'email');

  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  res.json(user);
});

export const approveUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, teacherId } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  if (user.status !== 'PENDING') {
    return res
      .status(400)
      .json({ message: 'Chỉ có thể duyệt tài khoản đang chờ' });
  }

  const updateData: Record<string, unknown> = {
    status: 'ACTIVE',
    approvedBy: req.user?.sub,
    approvedAt: new Date(),
  };

  if (user.role === 'STUDENT' && studentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: 'Không tìm thấy sinh viên' });
    }
    updateData.studentId = studentId;
  }

  if (user.role === 'TEACHER' && teacherId) {
    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(400).json({ message: 'Không tìm thấy giảng viên' });
    }
    updateData.teacherId = teacherId;
  }

  const updated = await UserModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .select('-passwordHash')
    .populate('studentId', 'mssv fullName email')
    .populate('teacherId', 'employeeId fullName email');

  res.json({ message: 'Đã duyệt tài khoản thành công', user: updated });
});

export const lockUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  if (user.role === 'ADMIN') {
    return res.status(400).json({ message: 'Không thể khóa tài khoản Admin' });
  }

  if (user.status === 'LOCKED') {
    return res.status(400).json({ message: 'Tài khoản đã bị khóa' });
  }

  const updated = await UserModel.findByIdAndUpdate(
    id,
    { status: 'LOCKED', lockedAt: new Date(), lockedReason: reason },
    { new: true },
  ).select('-passwordHash');

  res.json({ message: 'Đã khóa tài khoản', user: updated });
});

export const unlockUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  if (user.status !== 'LOCKED') {
    return res.status(400).json({ message: 'Tài khoản không bị khóa' });
  }

  const updated = await UserModel.findByIdAndUpdate(
    id,
    { status: 'ACTIVE', lockedAt: null, lockedReason: null },
    { new: true },
  ).select('-passwordHash');

  res.json({ message: 'Đã mở khóa tài khoản', user: updated });
});

export const linkAccount: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, teacherId } = req.body;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  const updateData: Record<string, unknown> = {};

  if (user.role === 'STUDENT' && studentId) {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return res.status(400).json({ message: 'Không tìm thấy sinh viên' });
    }
    updateData.studentId = studentId;
  } else if (user.role === 'TEACHER' && teacherId) {
    const teacher = await TeacherModel.findById(teacherId);
    if (!teacher) {
      return res.status(400).json({ message: 'Không tìm thấy giảng viên' });
    }
    updateData.teacherId = teacherId;
  } else {
    return res.status(400).json({ message: 'Dữ liệu liên kết không hợp lệ' });
  }

  const updated = await UserModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .select('-passwordHash')
    .populate('studentId', 'mssv fullName email')
    .populate('teacherId', 'employeeId fullName email');

  res.json({ message: 'Đã liên kết tài khoản thành công', user: updated });
});

export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }

  if (user.role === 'ADMIN') {
    return res.status(400).json({ message: 'Không thể xóa tài khoản Admin' });
  }

  await UserModel.findByIdAndDelete(id);

  res.json({ message: 'Đã xóa tài khoản thành công' });
});

export const getUnlinkedRecords: RequestHandler = asyncHandler(
  async (req, res) => {
    const { role } = req.query;

    if (role === 'STUDENT') {
      const linkedStudentIds = await UserModel.find({
        studentId: { $ne: null },
      }).distinct('studentId');
      const unlinkedStudents = await StudentModel.find({
        _id: { $nin: linkedStudentIds },
      })
        .select('mssv fullName email')
        .sort({ fullName: 1 });
      return res.json(unlinkedStudents);
    }

    if (role === 'TEACHER') {
      const linkedTeacherIds = await UserModel.find({
        teacherId: { $ne: null },
      }).distinct('teacherId');
      const unlinkedTeachers = await TeacherModel.find({
        _id: { $nin: linkedTeacherIds },
      })
        .select('employeeId fullName email')
        .sort({ fullName: 1 });
      return res.json(unlinkedTeachers);
    }

    res.json([]);
  },
);
