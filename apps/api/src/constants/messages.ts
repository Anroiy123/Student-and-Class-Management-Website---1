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
  if (total === null || total === undefined)
    return GRADE_CLASSIFICATION.NO_GRADE;
  if (total >= 8) return GRADE_CLASSIFICATION.EXCELLENT;
  if (total >= 6.5) return GRADE_CLASSIFICATION.GOOD;
  if (total >= 5) return GRADE_CLASSIFICATION.AVERAGE;
  return GRADE_CLASSIFICATION.WEAK;
}

export function computeGPA(
  grades: Array<{ total: number | null; credits: number }>,
): number | null {
  const validGrades = grades.filter(
    (g) => g.total !== null && g.total !== undefined,
  );
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

export function convertToGPA4(total10: number): number {
  if (total10 >= 8.5) return 4.0;
  if (total10 >= 8.0) return 3.5;
  if (total10 >= 7.0) return 3.0;
  if (total10 >= 6.5) return 2.5;
  if (total10 >= 5.5) return 2.0;
  if (total10 >= 5.0) return 1.5;
  if (total10 >= 4.0) return 1.0;
  return 0;
}

export function computeLetterGrade(total10: number): string {
  if (total10 >= 8.5) return 'A';
  if (total10 >= 8.0) return 'B+';
  if (total10 >= 7.0) return 'B';
  if (total10 >= 6.5) return 'C+';
  if (total10 >= 5.5) return 'C';
  if (total10 >= 5.0) return 'D+';
  if (total10 >= 4.0) return 'D';
  return 'F';
}

export function computeGPA4(
  grades: Array<{ total: number | null; credits: number }>,
): number | null {
  const validGrades = grades.filter(
    (g) => g.total !== null && g.total !== undefined,
  );
  if (validGrades.length === 0) return null;

  let totalWeightedGPA4 = 0;
  let totalCredits = 0;

  validGrades.forEach((grade) => {
    const gpa4 = convertToGPA4(grade.total as number);
    totalWeightedGPA4 += gpa4 * grade.credits;
    totalCredits += grade.credits;
  });

  return totalCredits > 0
    ? Number((totalWeightedGPA4 / totalCredits).toFixed(2))
    : null;
}
