import { NotificationModel } from '../models/notification.model';
import { StudentModel } from '../models/student.model';
import { UserModel } from '../models/user.model';
import type { Types } from 'mongoose';

interface CreateNotificationParams {
  userId: Types.ObjectId | string;
  type: 'grade_added' | 'grade_updated' | 'info_updated';
  title: string;
  message: string;
  relatedId?: Types.ObjectId | string;
  relatedType?: 'grade' | 'student' | 'enrollment';
  metadata?: Record<string, unknown>;
}

// Tạo thông báo
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await NotificationModel.create(params);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Tạo thông báo khi có điểm mới/cập nhật
export const createGradeNotification = async (
  gradeData: {
    enrollmentId: {
      studentId: { _id: Types.ObjectId; fullName?: string; mssv?: string };
      courseId: { code?: string; name?: string };
      classId: { code?: string };
    };
    attendance: number;
    midterm: number;
    final: number;
    total: number;
    letterGrade: string;
    _id: Types.ObjectId;
  },
  isUpdate: boolean = false,
) => {
  const student = gradeData.enrollmentId.studentId;
  const course = gradeData.enrollmentId.courseId;

  // Tìm user account của sinh viên
  const user = await UserModel.findOne({ studentId: student._id });
  if (!user) {
    console.warn('Student does not have a linked user account');
    return null;
  }

  const type = isUpdate ? 'grade_updated' : 'grade_added';
  const action = isUpdate ? 'đã được cập nhật' : 'mới đã được thêm';

  const title = isUpdate ? 'Điểm số được cập nhật' : 'Điểm số mới';
  const message = `Điểm ${action} cho môn ${course.name} (${course.code}). Điểm tổng kết: ${gradeData.total} (${gradeData.letterGrade})`;

  return createNotification({
    userId: user._id,
    type,
    title,
    message,
    relatedId: gradeData._id,
    relatedType: 'grade',
    metadata: {
      courseName: course.name,
      courseCode: course.code,
      total: gradeData.total,
      letterGrade: gradeData.letterGrade,
      attendance: gradeData.attendance,
      midterm: gradeData.midterm,
      final: gradeData.final,
    },
  });
};

// Tạo thông báo khi thông tin sinh viên được cập nhật
export const createStudentInfoUpdateNotification = async (
  studentId: Types.ObjectId | string,
  updatedFields: string[],
) => {
  try {
    const student = await StudentModel.findById(studentId);
    if (!student) {
      return null;
    }

    // Tìm user có studentId trùng với student._id
    const user = await UserModel.findOne({ studentId: student._id });
    if (!user) {
      return null;
    }

    const fieldsText = updatedFields.join(', ');
    const title = 'Thông tin được cập nhật';
    const message = `Thông tin của bạn đã được cập nhật: ${fieldsText}`;

    return createNotification({
      userId: user._id,
      type: 'info_updated',
      title,
      message,
      relatedId: studentId as Types.ObjectId,
      relatedType: 'student',
      metadata: {
        updatedFields,
      },
    });
  } catch (error) {
    console.error('Error creating student info update notification:', error);
    return null;
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    return await NotificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    return await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return null;
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId: string) => {
  try {
    return await NotificationModel.findByIdAndDelete(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return null;
  }
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async (userId: string) => {
  try {
    return await NotificationModel.countDocuments({ userId, isRead: false });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
