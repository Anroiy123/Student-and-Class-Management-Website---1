import type { RequestHandler } from 'express';
import { NotificationModel } from '../models/notification.model';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} from '../utils/notificationService';

export const createNotificationHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { recipientType, recipientIds, recipientRole, title, message, category } = req.body;

    // Kiểm tra quyền: Giảng viên chỉ có thể gửi cho sinh viên
    if (req.user.role === 'TEACHER' && recipientRole === 'TEACHER') {
      return res.status(403).json({
        message: 'Teachers can only send to students',
      });
    }

    // Lấy danh sách ID người nhận
    let userIds: string[] = [];

    if (recipientType === 'user' && recipientIds) {
      // Gửi cho người dùng cụ thể
      userIds = recipientIds;
    } else if (recipientType === 'role' && recipientRole) {
      // Gửi cho tất cả người dùng có vai trò cụ thể
      const users = await UserModel.find({ role: recipientRole }).select('_id');
      userIds = users.map((u) => u._id.toString());
    } else if (recipientType === 'all') {
      if (req.user.role === 'TEACHER') {
        // Giảng viên chỉ có thể gửi cho sinh viên
        const users = await UserModel.find({ role: 'STUDENT' }).select('_id');
        userIds = users.map((u) => u._id.toString());
      } else {
        // Admin có thể gửi cho tất cả
        const users = await UserModel.find({
          role: { $in: ['STUDENT', 'TEACHER'] },
        }).select('_id');
        userIds = users.map((u) => u._id.toString());
      }
    }

    // Tạo thông báo cho tất cả người nhận
    const notifications = await Promise.all(
      userIds.map((userId) =>
        createNotification({
          userId,
          type: 'general',
          title,
          message,
          category: category || 'general',
          metadata: {
            senderId: req.user!._id,
            senderRole: req.user!.role,
          },
        }),
      ),
    );

    res.status(201).json({
      message: `Thông báo đã gửi thành công`,
      count: notifications.length,
    });
  },
);

// Handler để lấy danh sách thông báo
export const listNotifications: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    const unreadOnly = req.query.unreadOnly === 'true';

    const filter: Record<string, unknown> = { userId: req.user._id };
    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      NotificationModel.countDocuments(filter),
    ]);

    res.json({
      items: notifications,
      total,
      page,
      pageSize,
    });
  },
);

// Handler đánh dấu đã đọc
export const markAsRead: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;

  // Kiểm tra thông báo thuộc về người dùng
  const notification = await NotificationModel.findById(id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const updated = await markNotificationAsRead(id);
  res.json(updated);
});

// Handler đánh dấu tất cả đã đọc
export const markAllAsRead: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await markAllNotificationsAsRead(req.user._id.toString());
  res.json({ message: 'All notifications marked as read' });
});

// Handler xóa thông báo
export const deleteNotificationHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    const notification = await NotificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await deleteNotification(id);
    res.json({ message: 'Notification deleted' });
  },
);

// Handler lấy số lượng thông báo chưa đọc
export const getUnreadCountHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await getUnreadCount(req.user._id.toString());
    res.json({ count });
  },
);
