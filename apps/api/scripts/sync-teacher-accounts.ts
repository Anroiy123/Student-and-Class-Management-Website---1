import { connectToDatabase } from '../src/config/database';
import { UserModel } from '../src/models/user.model';
import { TeacherModel } from '../src/models/teacher.model';
import bcrypt from 'bcryptjs';

async function syncTeacherAccounts() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB Atlas\n');

    // Step 1: Delete all existing teacher users
    const deleteResult = await UserModel.deleteMany({ role: 'TEACHER' });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old teacher accounts\n`);

    // Step 2: Get all teachers from Teacher collection
    const teachers = await TeacherModel.find().sort({ email: 1 });
    console.log(`👥 Creating accounts for ${teachers.length} teachers...\n`);

    const password = 'teacher123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let created = 0;

    for (const teacher of teachers) {
      await UserModel.create({
        email: teacher.email,
        passwordHash: hashedPassword,
        role: 'TEACHER',
      });

      console.log(`✅ Created account for: ${teacher.fullName}`);
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      
      created++;
    }

    console.log('━'.repeat(80));
    console.log(`\n✅ Successfully created ${created} teacher accounts`);
    console.log('\n🔑 All teachers can login with password: teacher123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncTeacherAccounts();
