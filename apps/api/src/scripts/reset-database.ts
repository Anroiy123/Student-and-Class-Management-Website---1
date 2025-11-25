import { connectToDatabase } from '../config/database.js';
import { ClassModel } from '../models/class.model.js';
import { CourseModel } from '../models/course.model.js';
import { StudentModel } from '../models/student.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { GradeModel } from '../models/grade.model.js';
import { UserModel } from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';
import mongoose from 'mongoose';

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    console.log('⚠️  WARNING: This will delete ALL data in the database!');
    console.log('🗑️  Dropping all collections...\n');

    const collections = [
      { name: 'Grades', model: GradeModel },
      { name: 'Enrollments', model: EnrollmentModel },
      { name: 'Students', model: StudentModel },
      { name: 'Courses', model: CourseModel },
      { name: 'Classes', model: ClassModel },
      { name: 'Users', model: UserModel },
    ];

    for (const { name, model } of collections) {
      try {
        await model.deleteMany({});
        console.log(`✅ Cleared ${name} collection`);
      } catch (error: any) {
        console.log(`⚠️  Error clearing ${name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Database reset completed!\n');

    console.log('👤 Creating default admin user...');
    const adminPassword = await hashPassword('admin123');
    await UserModel.create({
      email: 'admin@ptithcm.edu.vn',
      passwordHash: adminPassword,
      role: 'ADMIN',
      studentId: null,
      teacherId: null,
    });
    console.log('✅ Admin user created');
    console.log('   Email: admin@ptithcm.edu.vn');
    console.log('   Password: admin123\n');

    console.log('💡 Next steps:');
    console.log('   Run: npm run seed:csv');
    console.log('   to populate the database with data from CSV files.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
