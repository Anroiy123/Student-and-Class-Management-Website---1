/**
 * Script để liên kết User (role STUDENT) với Student record
 * Chạy: npx tsx src/scripts/link-student-user.ts <user_email> <student_mssv>
 *
 * Ví dụ: npx tsx src/scripts/link-student-user.ts student@test.com SV001
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';

config();

async function linkStudentUser() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx tsx src/scripts/link-student-user.ts <user_email> <student_mssv>');
    console.log('Example: npx tsx src/scripts/link-student-user.ts student@test.com SV001');
    process.exit(1);
  }

  const [userEmail, studentMssv] = args;

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user
    const user = await UserModel.findOne({ email: userEmail.toLowerCase() });
    if (!user) {
      console.error(`User not found with email: ${userEmail}`);
      process.exit(1);
    }

    if (user.role !== 'STUDENT') {
      console.error(`User role is ${user.role}, expected STUDENT`);
      process.exit(1);
    }

    // Find student
    const student = await StudentModel.findOne({ mssv: studentMssv });
    if (!student) {
      console.error(`Student not found with MSSV: ${studentMssv}`);
      console.log('\nAvailable students:');
      const students = await StudentModel.find({}, { mssv: 1, fullName: 1, email: 1 }).limit(10);
      students.forEach((s) => {
        console.log(`  - MSSV: ${s.mssv}, Name: ${s.fullName}, Email: ${s.email}`);
      });
      process.exit(1);
    }

    // Check if already linked
    if (user.studentId?.toString() === student._id.toString()) {
      console.log('User is already linked to this student');
      process.exit(0);
    }

    // Update user with studentId
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { studentId: student._id } }
    );

    console.log('\n✅ Successfully linked!');
    console.log(`User: ${user.email} (${user.role})`);
    console.log(`Student: ${student.mssv} - ${student.fullName}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

linkStudentUser();
