/**
 * Script tự động liên kết User TEACHER với Teacher record có cùng email
 * Chạy: npx tsx src/scripts/auto-link-teachers.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { UserModel } from '../models/user.model.js';
import { TeacherModel } from '../models/teacher.model.js';

config();

async function autoLinkTeachers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Find all TEACHER users without teacherId
    const unlinkedUsers = await UserModel.find({
      role: 'TEACHER',
      teacherId: null,
    });

    console.log(`Found ${unlinkedUsers.length} unlinked TEACHER users\n`);

    let linkedCount = 0;

    for (const user of unlinkedUsers) {
      // Try to find teacher with same email
      const teacher = await TeacherModel.findOne({ email: user.email });

      if (teacher) {
        await UserModel.updateOne(
          { _id: user._id },
          { $set: { teacherId: teacher._id } },
        );
        console.log(
          `✅ Linked: ${user.email} → ${teacher.employeeId} (${teacher.fullName})`,
        );
        linkedCount++;
      } else {
        console.log(`❌ No matching teacher for: ${user.email}`);
      }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total unlinked users: ${unlinkedUsers.length}`);
    console.log(`Successfully linked: ${linkedCount}`);
    console.log(`Still unlinked: ${unlinkedUsers.length - linkedCount}`);

    // Show available teachers for manual linking
    if (unlinkedUsers.length - linkedCount > 0) {
      console.log('\n=== Available Teachers ===');
      const teachers = await TeacherModel.find(
        {},
        { employeeId: 1, fullName: 1, email: 1 },
      ).limit(20);
      if (teachers.length === 0) {
        console.log('  (No teachers in database. Create teachers first.)');
      } else {
        teachers.forEach((t) => {
          console.log(`  Mã GV: ${t.employeeId} | ${t.fullName} | ${t.email}`);
        });
      }
      console.log(
        '\nUse: npx tsx src/scripts/link-teacher-user.ts <user_email> <teacher_employeeId>',
      );
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

autoLinkTeachers();
