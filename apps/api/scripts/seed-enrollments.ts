import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EnrollmentModel } from '../src/models/enrollment.model';
import { StudentModel } from '../src/models/student.model';
import { CourseModel } from '../src/models/course.model';
import { ClassModel } from '../src/models/class.model';

dotenv.config();

// Danh sách học kỳ
const semesters = ['HK1-2024', 'HK2-2024', 'HK1-2025'];

// Số môn mỗi sinh viên đăng ký mỗi kỳ (random 3-6 môn)
function getRandomCourseCount() {
  return Math.floor(Math.random() * 4) + 3; // 3-6 môn
}

// Random semester
function getRandomSemester() {
  return semesters[Math.floor(Math.random() * semesters.length)];
}

async function seedEnrollments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB successfully');

    // Get all students, courses, and classes
    const students = await StudentModel.find();
    const courses = await CourseModel.find();
    const classes = await ClassModel.find();

    console.log(`👨‍🎓 Found ${students.length} students`);
    console.log(`📚 Found ${courses.length} courses`);
    console.log(`🏫 Found ${classes.length} classes`);

    if (students.length === 0) {
      console.log('❌ No students found. Please run seed:students first.');
      return;
    }

    if (courses.length === 0) {
      console.log('❌ No courses found. Please run seed:courses first.');
      return;
    }

    // Check existing enrollments
    const existingEnrollments = await EnrollmentModel.countDocuments();
    console.log(`📊 Current enrollments in database: ${existingEnrollments}`);

    if (existingEnrollments > 0) {
      console.log('⚠️  Database already has enrollments.');
      console.log('💡 Clearing existing enrollments and recreating...');
      await EnrollmentModel.deleteMany({});
      console.log('🗑️  Cleared all existing enrollments');
    }

    console.log('\n🎯 Creating enrollments...');
    
    let createdCount = 0;
    const enrollmentsBySemester: Record<string, number> = {};

    // For each student, enroll in random courses
    for (const student of students) {
      const semester = getRandomSemester();
      const courseCount = getRandomCourseCount();
      
      // Shuffle courses and pick random ones
      const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
      const selectedCourses = shuffledCourses.slice(0, courseCount);

      for (const course of selectedCourses) {
        try {
          const enrollmentData = {
            studentId: student._id,
            courseId: course._id,
            classId: student.classId || null,
            semester: semester,
          };

          await EnrollmentModel.create(enrollmentData);
          createdCount++;

          // Count by semester
          enrollmentsBySemester[semester] = (enrollmentsBySemester[semester] || 0) + 1;
        } catch (error: any) {
          if (error.code === 11000) {
            // Duplicate enrollment, skip
            continue;
          } else {
            console.error(`❌ Error creating enrollment:`, error.message);
          }
        }
      }

      console.log(`✅ Enrolled student ${student.mssv} in ${selectedCourses.length} courses (${semester})`);
    }

    console.log(`\n✅ Successfully created ${createdCount} enrollments!`);

    // Show statistics
    console.log('\n📊 Statistics by semester:');
    Object.entries(enrollmentsBySemester).forEach(([semester, count]) => {
      console.log(`   ${semester.padEnd(15)} - ${count} enrollments`);
    });

    // Show statistics by course
    console.log('\n📊 Top 10 most enrolled courses:');
    const courseStats = await EnrollmentModel.aggregate([
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    for (const stat of courseStats) {
      const course = await CourseModel.findById(stat._id);
      if (course) {
        console.log(`   ${course.code.padEnd(10)} ${course.name.padEnd(40)} - ${stat.count} students`);
      }
    }

    // Show statistics by student's class
    console.log('\n📊 Enrollments by class:');
    for (const cls of classes) {
      const count = await EnrollmentModel.countDocuments({ classId: cls._id });
      console.log(`   ${cls.code.padEnd(15)} - ${count} enrollments`);
    }

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding enrollments:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedEnrollments();
