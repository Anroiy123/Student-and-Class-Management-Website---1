import { apiClient } from './api';

export type ExportReportParams = {
  classId?: string;
  courseId?: string;
  semester?: string;
  format: 'excel' | 'pdf';
};

export async function exportReport(params: ExportReportParams): Promise<Blob> {
  const { data } = await apiClient.get('/reports/export', {
    params,
    responseType: 'blob',
  });
  return data;
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

