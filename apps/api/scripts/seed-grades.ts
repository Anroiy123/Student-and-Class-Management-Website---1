import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GradeModel } from '../src/models/grade.model';
import { EnrollmentModel } from '../src/models/enrollment.model';
import { StudentModel } from '../src/models/student.model';
import { CourseModel } from '../src/models/course.model';
import { ClassModel } from '../src/models/class.model';

dotenv.config();

// Random grade generator (phân phối gần với thực tế)
function generateRandomGrade(min: number, max: number): number {
  // Sử dụng phân phối chuẩn để có nhiều điểm ở khoảng trung bình
  const avg = (min + max) / 2;
  const stdDev = (max - min) / 6;
  
  let num = avg + stdDev * (Math.random() + Math.random() + Math.random() - 1.5);
  num = Math.max(min, Math.min(max, num));
  
  return parseFloat(num.toFixed(1));
}

function computeTotal(attendance: number, midterm: number, final: number): number {
  return parseFloat((attendance * 0.1 + midterm * 0.3 + final * 0.6).toFixed(2));
}

async function seedGrades() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB successfully');

    // Get all enrollments (không populate, chỉ lấy _id)
    const enrollments = await EnrollmentModel.find();
    console.log(`👨‍🎓 Found ${enrollments.length} enrollments`);

    if (enrollments.length === 0) {
      console.log('❌ No enrollments found. Please run seed:enrollments first.');
      return;
    }

    // Check existing grades
    const existingGrades = await GradeModel.countDocuments();
    console.log(`📊 Current grades in database: ${existingGrades}`);

    if (existingGrades > 0) {
      console.log('⚠️  Database already has grades.');
      console.log('💡 Clearing existing grades and recreating...');
      await GradeModel.deleteMany({});
      console.log('🗑️  Cleared all existing grades');
    }

    console.log('\n🎯 Creating grades...');
    
    let createdCount = 0;
    const gradeStats = {
      excellent: 0, // >= 8.5
      good: 0,      // 7.0 - 8.4
      average: 0,   // 5.5 - 6.9
      weak: 0,      // 4.0 - 5.4
      poor: 0,      // < 4.0
    };

    for (const enrollment of enrollments) {
      try {
        // Generate realistic grades
        // Attendance: thường cao hơn (7-10)
        const attendance = generateRandomGrade(7, 10);
        
        // Midterm: phân phối rộng hơn (4-9)
        const midterm = generateRandomGrade(4, 9);
        
        // Final: phân phối rộng (3-10)
        const final = generateRandomGrade(3, 10);
        
        // Calculate total
        const total = computeTotal(attendance, midterm, final);

        const gradeData = {
          enrollmentId: enrollment._id,
          attendance,
          midterm,
          final,
          total,
          computedAt: new Date(),
        };

        await GradeModel.create(gradeData);
        createdCount++;

        // Update statistics
        if (total >= 8.5) gradeStats.excellent++;
        else if (total >= 7.0) gradeStats.good++;
        else if (total >= 5.5) gradeStats.average++;
        else if (total >= 4.0) gradeStats.weak++;
        else gradeStats.poor++;

        if (createdCount % 50 === 0) {
          console.log(`✅ Created ${createdCount}/${enrollments.length} grades...`);
        }
      } catch (error: any) {
        console.error(`❌ Error creating grade for enrollment ${enrollment._id}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully created ${createdCount} grades!`);

    // Show statistics
    console.log('\n📊 Grade Distribution:');
    console.log(`   Giỏi (>= 8.5)      - ${gradeStats.excellent} students (${((gradeStats.excellent / createdCount) * 100).toFixed(1)}%)`);
    console.log(`   Khá (7.0 - 8.4)    - ${gradeStats.good} students (${((gradeStats.good / createdCount) * 100).toFixed(1)}%)`);
    console.log(`   TB (5.5 - 6.9)     - ${gradeStats.average} students (${((gradeStats.average / createdCount) * 100).toFixed(1)}%)`);
    console.log(`   Yếu (4.0 - 5.4)    - ${gradeStats.weak} students (${((gradeStats.weak / createdCount) * 100).toFixed(1)}%)`);
    console.log(`   Kém (< 4.0)        - ${gradeStats.poor} students (${((gradeStats.poor / createdCount) * 100).toFixed(1)}%)`);

    // Calculate overall average
    const allGrades = await GradeModel.find();
    const avgGrade = allGrades.reduce((sum, g) => sum + g.total, 0) / allGrades.length;
    console.log(`\n📈 Overall Average: ${avgGrade.toFixed(2)}/10`);

    // Pass rate (>= 4.0)
    const passCount = allGrades.filter((g) => g.total >= 4.0).length;
    const passRate = (passCount / allGrades.length) * 100;
    console.log(`✅ Pass Rate: ${passRate.toFixed(1)}% (${passCount}/${allGrades.length})`);

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding grades:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedGrades();
