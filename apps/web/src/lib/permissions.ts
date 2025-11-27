import type { UserRole } from './authContext';

/**
 * Check if user can modify students (create, edit, delete)
 * Only ADMIN can modify students
 */
export function canModifyStudents(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user can modify classes (create, edit, delete)
 * Only ADMIN can modify classes
 */
export function canModifyClasses(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user can modify courses (create, edit, delete)
 * Only ADMIN can modify courses
 */
export function canModifyCourses(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Check if user can modify grades (edit)
 * Both ADMIN and TEACHER can modify grades
 * (Teacher scope is enforced at API level)
 */
export function canModifyGrades(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'TEACHER';
}
