import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { exportReport, downloadFile } from '../lib/reports';

type ClassItem = { _id: string; code: string; name: string };
type CourseItem = { _id: string; code: string; name: string; credits: number };

export const ReportsPage = () => {
  const [classId, setClassId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await apiClient.get<ClassItem[]>('/classes');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: allCoursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await apiClient.get<CourseItem[]>('/courses');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: availableCoursesData } = useQuery({
    queryKey: ['available-courses', classId],
    queryFn: async () => {
      if (!classId) return null;
      const { data } = await apiClient.get<CourseItem[]>(
        '/reports/available-courses',
        {
          params: { classId },
        },
      );
      return data;
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });

  const coursesData = classId ? availableCoursesData : allCoursesData;

  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    setCourseId('');
  };

  const handleExport = async () => {
    setError('');
    setIsExporting(true);

    try {
      const blob = await exportReport({
        classId: classId || undefined,
        courseId: courseId || undefined,
        semester: semester || undefined,
        format,
      });

      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `bao-cao-diem-${Date.now()}.${extension}`;
      downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xuất báo cáo');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <div className="nb-card--flat">
          <h1 className="text-2xl font-bold">Báo cáo</h1>
          <p className="mt-1 text-sm opacity-70">
            Xuất báo cáo điểm theo lớp/môn ở định dạng Excel hoặc PDF.
          </p>
        </div>
      </header>

      <div className="nb-card space-y-6">
        <h2 className="font-bold text-lg border-b-2 border-black pb-2 dark:border-nb-dark-border">
          Chọn bộ lọc
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Lớp (tùy chọn)
            </label>
            <select
              className="nb-input w-full"
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">-- Tất cả lớp --</option>
              {classesData?.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.code} - {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Môn học (tùy chọn)
              {classId && (
                <span className="text-xs opacity-70 ml-2">
                  (Chỉ hiển thị môn có điểm)
                </span>
              )}
            </label>
            <select
              className="nb-input w-full"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              disabled={classId && !coursesData}
            >
              <option value="">
                {classId ? '-- Tất cả môn có điểm --' : '-- Tất cả môn --'}
              </option>
              {coursesData?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Học kỳ (tùy chọn)
            </label>
            <input
              type="text"
              className="nb-input w-full"
              placeholder="VD: HK1 2023-2024"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Định dạng file
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value as 'excel' | 'pdf')}
                  className="w-4 h-4"
                />
                <span>Excel (.xlsx)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value as 'excel' | 'pdf')}
                  className="w-4 h-4"
                />
                <span>PDF (.pdf)</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 border-2 border-red-500 bg-red-50 text-red-700 rounded dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="nb-btn nb-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting
              ? 'Đang xuất...'
              : `Xuất báo cáo ${format === 'excel' ? 'Excel' : 'PDF'}`}
          </button>
        </div>
      </div>
    </section>
  );
};
