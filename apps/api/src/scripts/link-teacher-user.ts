/**
 * Script để liên kết User (role TEACHER) với Teacher record
 * Chạy: npx tsx src/scripts/link-teacher-user.ts <user_email> <teacher_employeeId>
 *
 * Ví dụ: npx tsx src/scripts/link-teacher-user.ts teacher@test.com GV001
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { UserModel } from '../models/user.model.js';
import { TeacherModel } from '../models/teacher.model.js';

config();

async function linkTeacherUser() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      'Usage: npx tsx src/scripts/link-teacher-user.ts <user_email> <teacher_employeeId>',
    );
    console.log(
      'Example: npx tsx src/scripts/link-teacher-user.ts teacher@test.com GV001',
    );
    process.exit(1);
  }

  const [userEmail, teacherEmployeeId] = args;

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

    if (user.role !== 'TEACHER') {
      console.error(`User role is ${user.role}, expected TEACHER`);
      process.exit(1);
    }

    // Find teacher
    const teacher = await TeacherModel.findOne({
      employeeId: teacherEmployeeId,
    });
    if (!teacher) {
      console.error(`Teacher not found with employeeId: ${teacherEmployeeId}`);
      console.log('\nAvailable teachers:');
      const teachers = await TeacherModel.find(
        {},
        { employeeId: 1, fullName: 1, email: 1 },
      ).limit(10);
      if (teachers.length === 0) {
        console.log('  (No teachers in database. Create teachers first.)');
      } else {
        teachers.forEach((t) => {
          console.log(
            `  - Mã GV: ${t.employeeId}, Name: ${t.fullName}, Email: ${t.email}`,
          );
        });
      }
      process.exit(1);
    }

    // Check if already linked
    if (user.teacherId?.toString() === teacher._id.toString()) {
      console.log('User is already linked to this teacher');
      process.exit(0);
    }

    // Update user with teacherId
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { teacherId: teacher._id } },
    );

    console.log('\n✅ Successfully linked!');
    console.log(`User: ${user.email} (${user.role})`);
    console.log(`Teacher: ${teacher.employeeId} - ${teacher.fullName}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

linkTeacherUser();
