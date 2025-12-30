import { useState } from 'react';
import { useCreateNotification } from '../lib/notifications';
import { useAuth } from '../lib/authHooks';

export default function SendNotificationPage() {
  const { user } = useAuth();
  const createMutation = useCreateNotification();

  const [recipientType, setRecipientType] = useState<'role' | 'all'>('role');
  const [recipientRole, setRecipientRole] = useState<'STUDENT' | 'TEACHER'>(
    'STUDENT',
  );
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'academic' | 'administrative' | 'event' | 'urgent' | 'general'>('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createMutation.mutateAsync({
        recipientType,
        recipientRole: recipientType === 'role' ? recipientRole : undefined,
        title,
        message,
        category,
      });

      alert(`${result.message}`);
      setTitle('');
      setMessage('');
      setCategory('general');
    } catch (error: any) {
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    }
  };

  const isTeacher = user?.role === 'TEACHER';

  return (
    <section className="space-y-6 overflow-x-hidden max-w-full">
      <header className="nb-card--flat">
        <h1 className="nb-title">Gửi Thông Báo</h1>
        <p className="mt-2 text-edu-ink-light dark:text-edu-dark-muted">
          Gửi thông báo đến sinh viên hoặc giảng viên trong hệ thống
        </p>
      </header>

      <form onSubmit={handleSubmit} className="nb-card space-y-6">
        {/* Recipient Type */}
        <div>
          <label className="block text-sm font-semibold mb-3">Gửi đến</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="role"
                checked={recipientType === 'role'}
                onChange={(e) => setRecipientType(e.target.value as 'role')}
                className="w-4 h-4 text-edu-primary dark:text-edu-dark-accent focus:ring-edu-primary dark:focus:ring-edu-dark-accent"
              />
              <span className="text-sm">Theo vai trò</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="all"
                checked={recipientType === 'all'}
                onChange={(e) => setRecipientType(e.target.value as 'all')}
                className="w-4 h-4 text-edu-primary dark:text-edu-dark-accent focus:ring-edu-primary dark:focus:ring-edu-dark-accent"
              />
              <span className="text-sm">Tất cả</span>
            </label>
          </div>
        </div>

        {/* Role Selection */}
        {recipientType === 'role' && (
          <div>
            <label className="block text-sm font-semibold mb-2">Vai trò</label>
            <select
              value={recipientRole}
              onChange={(e) =>
                setRecipientRole(e.target.value as 'STUDENT' | 'TEACHER')
              }
              className="nb-input"
              disabled={isTeacher}
            >
              <option value="STUDENT">Sinh viên</option>
              {!isTeacher && <option value="TEACHER">Giảng viên</option>}
            </select>
            {isTeacher && (
              <p className="text-sm text-edu-ink-light dark:text-edu-dark-muted mt-2">
                Giảng viên chỉ có thể gửi cho sinh viên
              </p>
            )}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Phân loại <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="nb-input"
            required
          >
            <option value="general">Chung</option>
            <option value="academic">Học tập</option>
            <option value="administrative">Hành chính</option>
            <option value="event">Sự kiện</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
          <p className="text-xs text-edu-ink-light dark:text-edu-dark-muted mt-1">
            {category === 'general' && 'Thông báo chung'}
            {category === 'academic' && 'Liên quan đến học tập'}
            {category === 'administrative' && 'Thủ tục hành chính'}
            {category === 'event' && 'Sự kiện, hoạt động'}
            {category === 'urgent' && 'Yêu cầu chú ý ngay'}
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="nb-input"
            placeholder="Nhập tiêu đề thông báo"
            required
            maxLength={200}
          />
          <p className="text-xs text-edu-ink-light dark:text-edu-dark-muted mt-1">
            {title.length}/200 ký tự
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="nb-input min-h-[150px] resize-y"
            placeholder="Nhập nội dung thông báo"
            required
            maxLength={1000}
          />
          <p className="text-xs text-edu-ink-light dark:text-edu-dark-muted mt-1">
            {message.length}/1000 ký tự
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || !title || !message}
            className="nb-btn nb-btn--primary"
          >
            {createMutation.isPending ? (
              <>
                Đang gửi...
              </>
            ) : (
              <>
                Gửi thông báo
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setMessage('');
            }}
            className="nb-btn nb-btn--ghost"
            disabled={createMutation.isPending}
          >
            Xóa
          </button>
        </div>
      </form>
    </section>
  );
}
