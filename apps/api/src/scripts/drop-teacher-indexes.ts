import { connectToDatabase } from '../config/database.js';
import { TeacherModel } from '../models/teacher.model.js';

async function dropTeacherIndexes() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Dropping old indexes from teachers collection...');
    
    try {
      await TeacherModel.collection.dropIndex('teacherId_1');
      console.log('✅ Dropped teacherId_1 index');
    } catch (error) {
      const err = error as { code?: number; message?: string };
      if (err.code === 27) {
        console.log('ℹ️  teacherId_1 index does not exist (already dropped)');
      } else {
        console.log('⚠️  Error dropping teacherId_1:', err.message);
      }
    }

    console.log('\n🎉 Done! You can now run: npm run seed:csv');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropTeacherIndexes();

