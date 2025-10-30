import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CourseModel } from '../src/models/course.model';

dotenv.config();

const courses = [
  {
    code: 'MATH101',
    name: 'Toán cao cấp A1',
    credits: 4,
  },
  {
    code: 'MATH102',
    name: 'Toán cao cấp A2',
    credits: 4,
  },
  {
    code: 'PHYS101',
    name: 'Vật lý đại cương 1',
    credits: 3,
  },
  {
    code: 'CHEM101',
    name: 'Hóa học đại cương',
    credits: 3,
  },
  {
    code: 'CS101',
    name: 'Nhập môn lập trình',
    credits: 4,
  },
  {
    code: 'CS102',
    name: 'Cấu trúc dữ liệu và giải thuật',
    credits: 4,
  },
  {
    code: 'CS201',
    name: 'Lập trình hướng đối tượng',
    credits: 4,
  },
  {
    code: 'CS202',
    name: 'Cơ sở dữ liệu',
    credits: 3,
  },
  {
    code: 'CS203',
    name: 'Hệ điều hành',
    credits: 3,
  },
  {
    code: 'CS204',
    name: 'Mạng máy tính',
    credits: 3,
  },
  {
    code: 'CS301',
    name: 'Công nghệ phần mềm',
    credits: 4,
  },
  {
    code: 'CS302',
    name: 'Trí tuệ nhân tạo',
    credits: 3,
  },
  {
    code: 'CS303',
    name: 'Học máy',
    credits: 3,
  },
  {
    code: 'CS304',
    name: 'Phát triển ứng dụng web',
    credits: 4,
  },
  {
    code: 'CS305',
    name: 'Phát triển ứng dụng di động',
    credits: 4,
  },
  {
    code: 'ENG101',
    name: 'Tiếng Anh 1',
    credits: 3,
  },
  {
    code: 'ENG102',
    name: 'Tiếng Anh 2',
    credits: 3,
  },
  {
    code: 'ENG201',
    name: 'Tiếng Anh chuyên ngành',
    credits: 3,
  },
  {
    code: 'POL101',
    name: 'Triết học Mác - Lênin',
    credits: 3,
  },
  {
    code: 'POL102',
    name: 'Kinh tế chính trị Mác - Lênin',
    credits: 2,
  },
];

async function seedCourses() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB successfully');

    // Check existing courses
    const existingCourses = await CourseModel.countDocuments();
    console.log(`📊 Current courses in database: ${existingCourses}`);

    if (existingCourses > 0) {
      console.log('⚠️  Database already has courses.');
      console.log('Choose an option:');
      console.log('1. Add more courses (keep existing)');
      console.log('2. Delete all and recreate');
      console.log('💡 Running option 1: Add more courses...');
    }

    console.log(`🎯 Creating ${courses.length} courses...`);
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const courseData of courses) {
      try {
        const existing = await CourseModel.findOne({ code: courseData.code });
        if (existing) {
          console.log(`⏭️  Course ${courseData.code} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        await CourseModel.create(courseData);
        console.log(`✅ Created course: ${courseData.code} - ${courseData.name}`);
        createdCount++;
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⏭️  Course ${courseData.code} already exists, skipping...`);
          skippedCount++;
        } else {
          console.error(`❌ Error creating course ${courseData.code}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} courses!`);
    console.log(`⏭️  Skipped ${skippedCount} duplicate courses`);

    // Show statistics
    const allCourses = await CourseModel.find().sort({ code: 1 });
    console.log(`\n📊 Total courses in database: ${allCourses.length}`);
    
    console.log('\n📚 Courses by category:');
    const categories = {
      'Toán & Khoa học tự nhiên': allCourses.filter(c => ['MATH', 'PHYS', 'CHEM'].some(prefix => c.code.startsWith(prefix))),
      'Khoa học máy tính': allCourses.filter(c => c.code.startsWith('CS')),
      'Ngoại ngữ': allCourses.filter(c => c.code.startsWith('ENG')),
      'Chính trị': allCourses.filter(c => c.code.startsWith('POL')),
    };

    Object.entries(categories).forEach(([category, coursesInCategory]) => {
      console.log(`   ${category.padEnd(30)} - ${coursesInCategory.length} courses`);
    });

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedCourses();
