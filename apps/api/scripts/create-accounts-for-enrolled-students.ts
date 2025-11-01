import { connectToDatabase } from '../src/config/database';
import { UserModel } from '../src/models/user.model';
import { StudentModel } from '../src/models/student.model';
import { EnrollmentModel } from '../src/models/enrollment.model';
import bcrypt from 'bcryptjs';

async function createAccountsForEnrolledStudents() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get all unique student IDs from enrollments
    const enrollments = await EnrollmentModel.find().distinct('studentId');
    console.log(`📚 Found ${enrollments.length} students with enrollments\n`);

    // Get students who have enrollments
    const studentsWithEnrollments = await StudentModel.find({
      _id: { $in: enrollments }
    }); // Remove limit to create accounts for ALL students with enrollments

    console.log(`👥 Creating accounts for ${studentsWithEnrollments.length} students...\n`);

    let created = 0;
    let skipped = 0;

    for (const student of studentsWithEnrollments) {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: student.email });
      
      if (existingUser) {
        console.log(`⏭️  Skipped: ${student.fullName} (${student.email}) - Account already exists`);
        skipped++;
        continue;
      }

      // Create user account
      const hashedPassword = await bcrypt.hash('student123', 10);
      await UserModel.create({
        email: student.email,
        passwordHash: hashedPassword,
        role: 'STUDENT',
      });

      // Count enrollments for this student
      const enrollmentCount = await EnrollmentModel.countDocuments({ studentId: student._id });

      console.log(`✅ Created account for: ${student.fullName}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   MSSV: ${student.mssv}`);
      console.log(`   Enrollments: ${enrollmentCount} courses`);
      console.log('');
      
      created++;
    }

    console.log('━'.repeat(80));
    console.log(`\n✅ Created ${created} new student accounts`);
    console.log(`⏭️  Skipped ${skipped} existing accounts`);
    console.log('\n🔑 All students can login with password: student123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAccountsForEnrolledStudents();
