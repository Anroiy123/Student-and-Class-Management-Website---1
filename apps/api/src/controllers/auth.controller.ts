import type { RequestHandler } from 'express';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken } from '../utils/jwt';

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password, role, studentId, teacherId } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email đã được sử dụng' });
  }

  const passwordHash = await hashPassword(password);
  const user = await UserModel.create({
    email,
    passwordHash,
    role,
    studentId: studentId ?? null,
    teacherId: teacherId ?? null,
  });

  res.status(201).json({
    id: user._id,
    email: user.email,
    role: user.role,
  });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
  }

  if (user.status === 'PENDING') {
    return res.status(403).json({
      message: 'Tài khoản đang chờ duyệt. Vui lòng liên hệ quản trị viên.',
      code: 'ACCOUNT_PENDING',
    });
  }

  if (user.status === 'LOCKED') {
    return res.status(403).json({
      message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      code: 'ACCOUNT_LOCKED',
    });
  }

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  res.json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

export const getProfile: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await UserModel.findById(req.user.sub);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user._id,
    email: user.email,
    role: user.role,
  });
});
