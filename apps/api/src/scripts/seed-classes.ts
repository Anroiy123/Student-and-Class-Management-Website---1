import mongoose from 'mongoose';
import { ClassModel } from '../models/class.model';
import { StudentModel } from '../models/student.model';
import { env } from '../config/env';

const sampleClasses = [
  {
    code: 'CNTT-K60',
    name: 'Công nghệ thông tin khóa 60',
    size: 45,
    homeroomTeacher: 'Nguyễn Văn A',
  },
  {
    code: 'KTPM-K60',
    name: 'Kỹ thuật phần mềm khóa 60',
    size: 40,
    homeroomTeacher: 'Trần Thị B',
  },
  {
    code: 'KHMT-K60',
    name: 'Khoa học máy tính khóa 60',
    size: 38,
    homeroomTeacher: 'Lê Văn C',
  },
  {
    code: 'HTTT-K60',
    name: 'Hệ thống thông tin khóa 60',
    size: 35,
    homeroomTeacher: 'Phạm Thị D',
  },
  {
    code: 'MMT-K60',
    name: 'Mạng máy tính và truyền thông khóa 60',
    size: 42,
    homeroomTeacher: 'Hoàng Văn E',
  },
  {
    code: 'CNTT-K61',
    name: 'Công nghệ thông tin khóa 61',
    size: 50,
    homeroomTeacher: 'Võ Thị F',
  },
  {
    code: 'KTPM-K61',
    name: 'Kỹ thuật phần mềm khóa 61',
    size: 48,
    homeroomTeacher: 'Đặng Văn G',
  },
];

async function seedClasses() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
    
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Kiểm tra số lượng lớp hiện tại
    const existingCount = await ClassModel.countDocuments();
    console.log(`📊 Current classes in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  Database already has classes. Do you want to:');
      console.log('   1. Keep existing and add new ones');
      console.log('   2. Delete all and recreate');
      console.log('\n💡 Running option 2: Delete all and recreate...\n');
      
      const deletedCount = await ClassModel.deleteMany({});
      console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing classes`);
    }

    // Tạo lớp mới
    console.log('\n📚 Creating new classes...');
    const createdClasses = await ClassModel.insertMany(sampleClasses);
    console.log(`✅ Successfully created ${createdClasses.length} classes:\n`);

    // Hiển thị danh sách lớp đã tạo
    createdClasses.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.code.padEnd(12)} - ${cls.name}`);
      console.log(`      📋 ID: ${cls._id}`);
      console.log(`      👥 Sĩ số: ${cls.size || 0} | 👨‍🏫 GVCN: ${cls.homeroomTeacher || 'Chưa có'}\n`);
    });

    // Gán ngẫu nhiên sinh viên vào lớp
    console.log('👥 Assigning students to classes...');
    const students = await StudentModel.find();
    
    if (students.length === 0) {
      console.log('⚠️  No students found in database. Skipping student assignment.');
      console.log('💡 Tip: Add students first, then run this script again to assign them to classes.\n');
    } else {
      let assignedCount = 0;
      const classIds = createdClasses.map(c => c._id);
      
      for (const student of students) {
        // Chọn ngẫu nhiên một lớp
        const randomClassId = classIds[Math.floor(Math.random() * classIds.length)];
        student.classId = randomClassId;
        await student.save();
        assignedCount++;
      }
      
      console.log(`✅ Successfully assigned ${assignedCount} students to classes\n`);
      
      // Hiển thị thống kê phân bổ
      console.log('📊 Distribution summary:');
      for (const cls of createdClasses) {
        const studentCount = await StudentModel.countDocuments({ classId: cls._id });
        console.log(`   ${cls.code}: ${studentCount} students`);
      }
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('🌐 You can now access classes via API at: http://localhost:4000/classes\n');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Chạy seed function
seedClasses();
