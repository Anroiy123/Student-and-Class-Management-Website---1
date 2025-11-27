import { connectToDatabase } from '../config/database.js';
import { TeacherModel } from '../models/teacher.model.js';

async function clearTeachers() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Deleting all teachers...');
    const result = await TeacherModel.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} teachers\n`);

    console.log('🎉 Done! You can now run: npm run seed:csv');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearTeachers();

