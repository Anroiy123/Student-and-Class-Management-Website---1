// Student Portal Error Messages
export const ME_MESSAGES = {
  PROFILE_NOT_LINKED: 'Tài khoản chưa được liên kết với hồ sơ sinh viên',
  STUDENT_NOT_FOUND: 'Không tìm thấy thông tin sinh viên',
  NO_GRADES_FOUND: 'Chưa có điểm',
  NO_ENROLLMENTS_FOUND: 'Chưa đăng ký môn học nào',
  NO_GRADES_TO_EXPORT: 'Không có điểm để xuất báo cáo',
} as const;

// Grade Classification
export const GRADE_CLASSIFICATION = {
  EXCELLENT: 'Giỏi',
  GOOD: 'Khá',
  AVERAGE: 'Trung bình',
  WEAK: 'Yếu',
  NO_GRADE: 'Chưa có điểm',
} as const;

export function computeClassification(total: number | null): string {
  if (total === null || total === undefined) return GRADE_CLASSIFICATION.NO_GRADE;
  if (total >= 8) return GRADE_CLASSIFICATION.EXCELLENT;
  if (total >= 6.5) return GRADE_CLASSIFICATION.GOOD;
  if (total >= 5) return GRADE_CLASSIFICATION.AVERAGE;
  return GRADE_CLASSIFICATION.WEAK;
}

export function computeGPA(
  grades: Array<{ total: number | null; credits: number }>
): number | null {
  const validGrades = grades.filter((g) => g.total !== null && g.total !== undefined);
  if (validGrades.length === 0) return null;

  let totalWeightedScore = 0;
  let totalCredits = 0;

  validGrades.forEach((grade) => {
    totalWeightedScore += (grade.total as number) * grade.credits;
    totalCredits += grade.credits;
  });

  return totalCredits > 0
    ? Number((totalWeightedScore / totalCredits).toFixed(2))
    : null;
}
