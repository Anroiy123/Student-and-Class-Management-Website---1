import { connectToDatabase } from '../config/database.js';
import { ClassModel } from '../models/class.model.js';
import { CourseModel } from '../models/course.model.js';
import { StudentModel } from '../models/student.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { GradeModel } from '../models/grade.model.js';
import { TeacherModel } from '../models/teacher.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseCoursesCSV,
  extractUniqueClasses,
  extractUniqueCourses,
  getEnrollmentsByClass,
  filterMainClasses,
} from './helpers/csv-parser.js';
import { generateClassName } from './helpers/major-mapping.js';
import {
  generateStudentsForAllClasses,
  generateRandomGrade,
} from './helpers/student-generator.js';
import { generateTeachers } from './helpers/teacher-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DS_CSV_PATH = path.resolve(__dirname, '../../../../ds.csv');

async function seedFromCSV() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    console.log('📄 Parsing CSV files...');
    const courseRecords = parseCoursesCSV(DS_CSV_PATH);
    console.log(
      `✅ Parsed ${courseRecords.length} course enrollment records\n`,
    );

    console.log('📊 Extracting unique data...');
    const allClassCodes = extractUniqueClasses(courseRecords);
    const uniqueClassCodes = filterMainClasses(allClassCodes);
    console.log(
      `✅ Found ${allClassCodes.length} total classes, filtered to ${uniqueClassCodes.length} main classes`,
    );

    // Filter course records to only include main classes
    const filteredCourseRecords = courseRecords.filter((r) =>
      uniqueClassCodes.includes(r.classCode),
    );
    const uniqueCourses = extractUniqueCourses(filteredCourseRecords);
    console.log(`✅ Found ${uniqueCourses.length} unique courses\n`);

    console.log('👨‍🏫 Generating Teachers...');
    const generatedTeachers = generateTeachers(20);
    console.log(`✅ Generated ${generatedTeachers.length} teachers\n`);

    console.log('💾 Seeding Teachers...');
    const teacherDocuments = await TeacherModel.insertMany(generatedTeachers);
    console.log(`✅ Inserted ${teacherDocuments.length} teachers\n`);

    console.log('🏫 Seeding Classes...');
    const classDocuments = await ClassModel.insertMany(
      uniqueClassCodes.map((code, index) => ({
        code,
        name: generateClassName(code),
        size: 0,
        homeroomTeacherId:
          teacherDocuments[index % teacherDocuments.length]._id,
      })),
    );
    console.log(`✅ Inserted ${classDocuments.length} classes\n`);

    console.log('📚 Seeding Courses...');
    const courseDocuments = await CourseModel.insertMany(
      uniqueCourses.map((course, index) => ({
        ...course,
        teacherId: teacherDocuments[index % teacherDocuments.length]._id,
      })),
    );
    console.log(`✅ Inserted ${courseDocuments.length} courses\n`);

    console.log('👨‍🎓 Generating Students...');
    const generatedStudents = generateStudentsForAllClasses(
      uniqueClassCodes,
      18,
      22,
    );
    console.log(`✅ Generated ${generatedStudents.length} students\n`);

    console.log('💾 Seeding Students...');
    const classMap = new Map(classDocuments.map((c) => [c.code, c._id]));
    const studentDocuments = await StudentModel.insertMany(
      generatedStudents.map((s) => ({
        mssv: s.mssv,
        fullName: s.fullName,
        dob: s.dob,
        email: s.email,
        phone: s.phone,
        address: s.address,
        classId: classMap.get(s.classCode),
      })),
    );
    console.log(`✅ Inserted ${studentDocuments.length} students\n`);

    console.log('🔄 Updating class sizes...');
    for (const classDoc of classDocuments) {
      const count = studentDocuments.filter(
        (s) => s.classId?.toString() === classDoc._id.toString(),
      ).length;
      await ClassModel.updateOne({ _id: classDoc._id }, { size: count });
    }
    console.log('✅ Updated class sizes\n');

    console.log('📝 Seeding Enrollments...');
    const studentMap = new Map(studentDocuments.map((s) => [s.mssv, s._id]));
    const courseMap = new Map(courseDocuments.map((c) => [c.code, c._id]));
    const enrollmentsByClass = getEnrollmentsByClass(filteredCourseRecords);

    const enrollmentsToInsert = [];
    for (const [classCode, records] of enrollmentsByClass) {
      const classStudents = studentDocuments.filter(
        (s) => s.classId?.toString() === classMap.get(classCode)?.toString(),
      );

      for (const record of records) {
        for (const student of classStudents) {
          enrollmentsToInsert.push({
            studentId: student._id,
            courseId: courseMap.get(record.courseCode),
            classId: classMap.get(classCode),
            semester: record.semester,
          });
        }
      }
    }

    const enrollmentDocuments =
      await EnrollmentModel.insertMany(enrollmentsToInsert);
    console.log(`✅ Inserted ${enrollmentDocuments.length} enrollments\n`);

    console.log('📊 Seeding Grades (80% of enrollments)...');
    const gradesToInsert = enrollmentDocuments
      .filter(() => Math.random() < 0.8)
      .map((enrollment) => {
        const grade = generateRandomGrade();
        return {
          enrollmentId: enrollment._id,
          attendance: grade.attendance,
          midterm: grade.midterm,
          final: grade.final,
          total: grade.total,
          computedAt: new Date(),
        };
      });

    const gradeDocuments = await GradeModel.insertMany(gradesToInsert);
    console.log(`✅ Inserted ${gradeDocuments.length} grades\n`);

    console.log('🎉 Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Teachers: ${teacherDocuments.length}`);
    console.log(`   - Classes: ${classDocuments.length}`);
    console.log(`   - Courses: ${courseDocuments.length}`);
    console.log(`   - Students: ${studentDocuments.length}`);
    console.log(`   - Enrollments: ${enrollmentDocuments.length}`);
    console.log(`   - Grades: ${gradeDocuments.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedFromCSV();
