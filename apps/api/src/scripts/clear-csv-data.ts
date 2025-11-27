import { connectToDatabase } from '../config/database.js';
import { TeacherModel } from '../models/teacher.model.js';
import { ClassModel } from '../models/class.model.js';
import { CourseModel } from '../models/course.model.js';
import { StudentModel } from '../models/student.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { GradeModel } from '../models/grade.model.js';

async function clearCsvData() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Clearing CSV-related data (keeping Users)...\n');

    // Delete in reverse order of dependencies
    const gradesResult = await GradeModel.deleteMany({});
    console.log(`✅ Deleted ${gradesResult.deletedCount} grades`);

    const enrollmentsResult = await EnrollmentModel.deleteMany({});
    console.log(`✅ Deleted ${enrollmentsResult.deletedCount} enrollments`);

    const studentsResult = await StudentModel.deleteMany({});
    console.log(`✅ Deleted ${studentsResult.deletedCount} students`);

    const coursesResult = await CourseModel.deleteMany({});
    console.log(`✅ Deleted ${coursesResult.deletedCount} courses`);

    const classesResult = await ClassModel.deleteMany({});
    console.log(`✅ Deleted ${classesResult.deletedCount} classes`);

    const teachersResult = await TeacherModel.deleteMany({});
    console.log(`✅ Deleted ${teachersResult.deletedCount} teachers`);

    console.log('\n🎉 Done! You can now run: npm run seed:csv');
    console.log('💡 Note: User accounts are preserved.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearCsvData();

