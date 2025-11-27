import type { Types } from 'mongoose';
import { UserModel } from '../models/user.model';
import { ClassModel } from '../models/class.model';
import { CourseModel } from '../models/course.model';
import type { JwtPayload } from './jwt';

export type TeacherAccessScope = {
  teacherId: Types.ObjectId;
  classIds: Types.ObjectId[];
  courseIds: Types.ObjectId[];
};

/**
 * Get teacher's access scope from JWT user info
 * Returns null for ADMIN (no filtering needed)
 * Returns scope object for TEACHER
 * Returns empty scope for unlinked TEACHER
 */
export async function getTeacherAccessScope(
  user: JwtPayload,
): Promise<TeacherAccessScope | null> {
  // Admin bypasses all filtering
  if (isAdmin(user.role)) {
    return null;
  }

  // Get user with teacherId
  const userDoc = await UserModel.findById(user.sub);
  if (!userDoc || !userDoc.teacherId) {
    // Unlinked teacher - return empty scope
    return {
      teacherId: null as unknown as Types.ObjectId,
      classIds: [],
      courseIds: [],
    };
  }

  // Get classes where teacher is homeroom teacher
  const classes = await ClassModel.find({
    homeroomTeacherId: userDoc.teacherId,
  }).select('_id');

  // Get courses where teacher is assigned
  const courses = await CourseModel.find({
    teacherId: userDoc.teacherId,
  }).select('_id');

  return {
    teacherId: userDoc.teacherId,
    classIds: classes.map((c) => c._id),
    courseIds: courses.map((c) => c._id),
  };
}

/**
 * Check if user is admin (bypass filtering)
 */
export function isAdmin(role: string): boolean {
  return role === 'ADMIN';
}

import { StudentModel } from '../models/student.model';
import { EnrollmentModel } from '../models/enrollment.model';

/**
 * Verify teacher has access to specific class
 */
export async function verifyTeacherClassAccess(
  user: JwtPayload,
  classId: string,
): Promise<boolean> {
  if (isAdmin(user.role)) {
    return true;
  }

  const scope = await getTeacherAccessScope(user);
  if (!scope) {
    return true; // Admin
  }

  return scope.classIds.some((id) => id.toString() === classId);
}

/**
 * Verify teacher has access to specific course
 */
export async function verifyTeacherCourseAccess(
  user: JwtPayload,
  courseId: string,
): Promise<boolean> {
  if (isAdmin(user.role)) {
    return true;
  }

  const scope = await getTeacherAccessScope(user);
  if (!scope) {
    return true; // Admin
  }

  return scope.courseIds.some((id) => id.toString() === courseId);
}

/**
 * Verify teacher has access to specific student
 */
export async function verifyTeacherStudentAccess(
  user: JwtPayload,
  studentId: string,
): Promise<boolean> {
  if (isAdmin(user.role)) {
    return true;
  }

  const scope = await getTeacherAccessScope(user);
  if (!scope || scope.classIds.length === 0) {
    return false;
  }

  // Check if student belongs to any of teacher's classes
  const student = await StudentModel.findById(studentId);
  if (!student || !student.classId) {
    return false;
  }

  return scope.classIds.some(
    (id) => id.toString() === student.classId?.toString(),
  );
}

/**
 * Verify teacher has access to specific enrollment
 */
export async function verifyTeacherEnrollmentAccess(
  user: JwtPayload,
  enrollmentId: string,
): Promise<boolean> {
  if (isAdmin(user.role)) {
    return true;
  }

  const scope = await getTeacherAccessScope(user);
  if (!scope) {
    return true; // Admin
  }

  // Check if enrollment belongs to teacher's classes or courses
  const enrollment = await EnrollmentModel.findById(enrollmentId);
  if (!enrollment) {
    return false;
  }

  const classMatch =
    enrollment.classId &&
    scope.classIds.some((id) => id.toString() === enrollment.classId?.toString());
  const courseMatch = scope.courseIds.some(
    (id) => id.toString() === enrollment.courseId.toString(),
  );

  return classMatch || courseMatch;
}
