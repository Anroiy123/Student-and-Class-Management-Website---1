import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth';
import { validateRequest } from '../middlewares/validateRequest';
import {
  listNotifications,
  getUnreadCountHandler,
  markAsRead,
  markAllAsRead,
  deleteNotificationHandler,
  createNotificationHandler,
} from '../controllers/notification.controller';
import {
  listNotificationsSchema,
  notificationIdSchema,
  createNotificationSchema,
} from '../schemas/notification.schema';

const router = Router();

// Tất cả routes đều yêu cầu xác thực
router.use(requireAuth());

// GET /api/notifications - Lấy danh sách thông báo
router.get('/', validateRequest(listNotificationsSchema), listNotifications);

// GET /api/notifications/unread-count - Lấy số lượng thông báo chưa đọc
router.get('/unread-count', getUnreadCountHandler);

// POST /api/notifications - Tạo thông báo mới (Admin/Teacher)
router.post(
  '/',
  requireRole('ADMIN', 'TEACHER'),
  validateRequest(createNotificationSchema),
  createNotificationHandler,
);

// PUT /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
router.put('/mark-all-read', markAllAsRead);

// PUT /api/notifications/:id/read - Đánh dấu thông báo đã đọc
router.put('/:id/read', validateRequest(notificationIdSchema), markAsRead);

// DELETE /api/notifications/:id - Xóa thông báo
router.delete(
  '/:id',
  validateRequest(notificationIdSchema),
  deleteNotificationHandler,
);

export default router;
