import { connectToDatabase } from '../config/database.js';
import mongoose from 'mongoose';

async function inspectTeachers() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database connection not available');
      process.exit(1);
    }

    // Get all teachers
    const teachers = await db.collection('teachers').find({}).toArray();
    
    console.log(`📊 Total teachers: ${teachers.length}\n`);

    // Check which teachers have teacherId field
    const withTeacherId = teachers.filter((t) => 'teacherId' in t);
    const withoutTeacherId = teachers.filter((t) => !('teacherId' in t));

    console.log(`✅ Teachers WITH teacherId field: ${withTeacherId.length}`);
    console.log(`❌ Teachers WITHOUT teacherId field: ${withoutTeacherId.length}\n`);

    if (withTeacherId.length > 0) {
      console.log('📋 Sample teachers WITH teacherId:');
      withTeacherId.slice(0, 3).forEach((t) => {
        console.log(`  - ${t.fullName} (${t.employeeId}): teacherId = ${t.teacherId}`);
      });
      console.log('');
    }

    if (withoutTeacherId.length > 0) {
      console.log('📋 Sample teachers WITHOUT teacherId:');
      withoutTeacherId.slice(0, 3).forEach((t) => {
        console.log(`  - ${t.fullName} (${t.employeeId})`);
      });
      console.log('');
    }

    // Show all fields from first teacher
    if (teachers.length > 0) {
      console.log('🔍 All fields in first teacher document:');
      console.log(JSON.stringify(teachers[0], null, 2));
    }

    // Check indexes
    console.log('\n📑 Current indexes on teachers collection:');
    const indexes = await db.collection('teachers').indexes();
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

inspectTeachers();

