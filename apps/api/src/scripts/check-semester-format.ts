import { connectToDatabase } from '../config/database.js';
import { EnrollmentModel } from '../models/enrollment.model.js';

async function checkSemesterFormat() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    // Get unique semesters
    const semesters = await EnrollmentModel.distinct('semester');
    
    console.log('\n📊 Unique semester values in database:');
    console.log('='.repeat(50));
    semesters.forEach((sem, index) => {
      console.log(`${index + 1}. "${sem}"`);
    });

    // Get a few sample enrollments with semester
    console.log('\n📝 Sample enrollments:');
    console.log('='.repeat(50));
    const samples = await EnrollmentModel.find()
      .populate('studentId', 'mssv fullName')
      .populate('courseId', 'code name')
      .limit(5)
      .lean();

    samples.forEach((enrollment: any, index) => {
      console.log(`\n${index + 1}.`);
      console.log(`   Student: ${enrollment.studentId?.mssv} - ${enrollment.studentId?.fullName}`);
      console.log(`   Course: ${enrollment.courseId?.code} - ${enrollment.courseId?.name}`);
      console.log(`   Semester: "${enrollment.semester}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSemesterFormat();
