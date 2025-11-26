/**
 * Script tự động liên kết User STUDENT với Student record có cùng email
 * Chạy: npx tsx src/scripts/auto-link-students.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { UserModel } from '../models/user.model';
import { StudentModel } from '../models/student.model';

config();

async function autoLinkStudents() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Find all STUDENT users without studentId
    const unlinkedUsers = await UserModel.find({
      role: 'STUDENT',
      studentId: null,
    });

    console.log(`Found ${unlinkedUsers.length} unlinked STUDENT users\n`);

    let linkedCount = 0;

    for (const user of unlinkedUsers) {
      // Try to find student with same email
      const student = await StudentModel.findOne({ email: user.email });

      if (student) {
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { studentId: student._id } }
        );
        console.log(`✅ Linked: ${user.email} → ${student.mssv} (${student.fullName})`);
        linkedCount++;
      } else {
        console.log(`❌ No matching student for: ${user.email}`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total unlinked users: ${unlinkedUsers.length}`);
    console.log(`Successfully linked: ${linkedCount}`);
    console.log(`Still unlinked: ${unlinkedUsers.length - linkedCount}`);

    // Show available students for manual linking
    if (unlinkedUsers.length - linkedCount > 0) {
      console.log('\n=== Available Students ===');
      const students = await StudentModel.find({}, { mssv: 1, fullName: 1, email: 1 }).limit(20);
      students.forEach((s) => {
        console.log(`  MSSV: ${s.mssv} | ${s.fullName} | ${s.email}`);
      });
      console.log('\nUse: npx tsx src/scripts/link-student-user.ts <user_email> <student_mssv>');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

autoLinkStudents();
