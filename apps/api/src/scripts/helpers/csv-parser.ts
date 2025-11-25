import fs from 'fs';
import { parse } from 'csv-parse/sync';

export interface CourseEnrollmentRecord {
  classCode: string;
  semester: string;
  courseCode: string;
  courseName: string;
}

export interface MajorMappingRecord {
  majorName: string;
  majorCode: string;
  classPattern: string;
  studentPattern: string;
}

export function parseCoursesCSV(filePath: string): CourseEnrollmentRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((record: any) => ({
      classCode: record['Mã Lớp']?.trim() || '',
      semester: record['Học Kỳ']?.trim() || '',
      courseCode: record['Mã Môn']?.trim() || '',
      courseName: record['Tên Môn Học']?.trim() || '',
    }))
    .filter((r) => r.classCode && r.courseCode);
}

export function parseMajorMappingCSV(filePath: string): MajorMappingRecord[] {
  const content = fs.readFileSync(filePath, 'utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records
    .map((record: any) => ({
      majorName: record['Ngành đào tạo']?.trim() || '',
      majorCode: record['Mã ngành']?.trim() || '',
      classPattern: record['mã lớp']?.trim() || '',
      studentPattern: record['mã sinh viên']?.trim() || '',
    }))
    .filter((r) => r.majorName && r.classPattern);
}

export function extractUniqueClasses(
  records: CourseEnrollmentRecord[],
): string[] {
  const classSet = new Set<string>();
  records.forEach((r) => classSet.add(r.classCode));
  return Array.from(classSet).sort();
}

/**
 * Filter to keep only main classes (not sub-specializations)
 * Main classes have format: DxxCQXX##-N where XX is 2-4 chars
 * Sub-specializations have longer codes like CQPTTK, CQPTUD, CQCNPM, CQCNHT
 *
 * Main class examples: D22CQPT01-N, D21CQCN01-N, D23CQAT01-N
 * Sub-specialization examples: D22CQPTTK01-N, D22CQPTUD01-N, D21CQCNPM01-N
 */
export function filterMainClasses(classCodes: string[]): string[] {
  const MAIN_MAJOR_CODES = [
    'CQPT', // Công nghệ Đa phương tiện
    'CQCN', // Công nghệ thông tin
    'CQAT', // An toàn thông tin
    'CQVT', // Điện tử - Truyền thông
    'CQDT', // Điện - Điện tử
    'CQKT', // Kế toán
    'CQQT', // Quản trị kinh doanh
    'CQMR', // Marketing
    'CQDK', // Điều khiển và Tự động hóa
    'CQCI', // Internet vạn vật
    'CQCE', // Kỹ thuật máy tính
  ];

  return classCodes.filter((classCode) => {
    // Extract major code from class code (e.g., D22CQPT01-N -> CQPT)
    const withoutPrefix = classCode.substring(3); // Remove Dxx
    const dashIndex = withoutPrefix.indexOf('-');
    const majorPart =
      dashIndex > 0 ? withoutPrefix.substring(0, dashIndex) : withoutPrefix;
    const majorCodeWithNumber = majorPart.replace(/\d+$/, ''); // Remove trailing digits

    // Check if this major code is in the main list
    return MAIN_MAJOR_CODES.includes(majorCodeWithNumber);
  });
}

export interface UniqueCourse {
  code: string;
  name: string;
  credits: number;
}

export function extractUniqueCourses(
  records: CourseEnrollmentRecord[],
): UniqueCourse[] {
  const courseMap = new Map<string, UniqueCourse>();

  records.forEach((r) => {
    if (!courseMap.has(r.courseCode)) {
      courseMap.set(r.courseCode, {
        code: r.courseCode,
        name: r.courseName,
        credits: generateCredits(r.courseCode),
      });
    }
  });

  return Array.from(courseMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
}

function generateCredits(courseCode: string): number {
  const prefix = courseCode.substring(0, 3).toUpperCase();

  if (prefix === 'SKD' || prefix === 'BAS') {
    return 2;
  }

  if (prefix === 'INT' || prefix === 'ELE' || prefix === 'TEL') {
    return Math.random() > 0.5 ? 3 : 4;
  }

  return Math.floor(Math.random() * 3) + 2;
}

export function getEnrollmentsBySemester(
  records: CourseEnrollmentRecord[],
): Map<string, CourseEnrollmentRecord[]> {
  const semesterMap = new Map<string, CourseEnrollmentRecord[]>();

  records.forEach((r) => {
    if (!semesterMap.has(r.semester)) {
      semesterMap.set(r.semester, []);
    }
    semesterMap.get(r.semester)!.push(r);
  });

  return semesterMap;
}

export function getEnrollmentsByClass(
  records: CourseEnrollmentRecord[],
): Map<string, CourseEnrollmentRecord[]> {
  const classMap = new Map<string, CourseEnrollmentRecord[]>();

  records.forEach((r) => {
    if (!classMap.has(r.classCode)) {
      classMap.set(r.classCode, []);
    }
    classMap.get(r.classCode)!.push(r);
  });

  return classMap;
}
