import { connectToDatabase } from '../config/database';
import { GradeModel } from '../models/grade.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { StudentModel } from '../models/student.model';
import { CourseModel } from '../models/course.model';
import { ClassModel } from '../models/class.model';

async function debugGrades() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    // Tìm student n24dcpt035 (case insensitive)
    const student = await StudentModel.findOne({
      mssv: { $regex: /^n24dcpt035$/i },
    });
    if (!student) {
      console.log('❌ Student not found');
      console.log('Searching for similar students...');
      const similar = await StudentModel.find({
        mssv: { $regex: /n24dcpt/i },
      }).limit(5);
      console.log(
        'Found:',
        similar.map((s) => `${s.mssv} - ${s.fullName}`),
      );
      process.exit(1);
    }

    console.log(`\n📚 Student: ${student.fullName} (${student.mssv})`);

    // Lấy enrollments của student này
    const enrollments = await EnrollmentModel.find({ studentId: student._id });

    console.log(`\n📝 Total enrollments: ${enrollments.length}`);

    // Lấy grades
    const enrollmentIds = enrollments.map((e) => e._id);
    const grades = await GradeModel.find({
      enrollmentId: { $in: enrollmentIds },
    });

    console.log(`\n📊 Total grades: ${grades.length}`);

    // Map grades by enrollmentId
    const gradeMap = new Map();
    grades.forEach((grade) => {
      gradeMap.set(grade.enrollmentId.toString(), grade);
    });

    console.log('\n📋 Enrollment details:');
    for (let i = 0; i < Math.min(10, enrollments.length); i++) {
      const enrollment = enrollments[i];
      const grade = gradeMap.get(enrollment._id.toString());
      const course = await CourseModel.findById(enrollment.courseId);

      console.log(
        `\n${i + 1}. ${course?.name || 'N/A'} (${course?.code || 'N/A'})`,
      );
      console.log(`   Enrollment ID: ${enrollment._id}`);
      console.log(`   Course ID: ${enrollment.courseId}`);
      console.log(`   Semester: ${enrollment.semester}`);
      if (grade) {
        console.log(`   Grade found: YES`);
        console.log(`   - Attendance: ${grade.attendance}`);
        console.log(`   - Midterm: ${grade.midterm}`);
        console.log(`   - Final: ${grade.final}`);
        console.log(`   - Total: ${grade.total}`);
        console.log(`   - GPA4: ${grade.gpa4}`);
        console.log(`   - Letter: ${grade.letterGrade}`);
      } else {
        console.log(`   Grade found: NO`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugGrades();
