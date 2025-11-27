import { connectToDatabase } from '../config/database';
import '../models'; // Import all models to register them
import { StudentModel } from '../models/student.model';
import { UserModel } from '../models/user.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { computeGPA, computeGPA4 } from '../constants/messages';

async function testAPIEndpoint() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    // Tìm user của student N24DCPT035
    const student = await StudentModel.findOne({
      mssv: { $regex: /^n24dcpt035$/i },
    });
    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log(`\n📚 Student: ${student.fullName} (${student.mssv})`);
    console.log(`Student ID: ${student._id}`);

    // Tìm user
    const user = await UserModel.findOne({ studentId: student._id });
    if (!user) {
      console.log('❌ User not found for this student');
      process.exit(1);
    }

    console.log(`\n👤 User found: ${user.email}`);
    console.log(`User ID: ${user._id}`);

    // Simulate getMyCharts endpoint
    const enrollmentFilter: Record<string, unknown> = {
      studentId: user.studentId,
    };

    console.log('\n🔍 Fetching enrollments with populate...');
    const enrollments = await EnrollmentModel.find(enrollmentFilter)
      .populate('courseId')
      .sort({ semester: 1 });

    console.log(`Found ${enrollments.length} enrollments`);

    // Check if populate worked
    const firstEnrollment = enrollments[0];
    if (firstEnrollment) {
      console.log('\n📋 First enrollment:');
      console.log('  Enrollment ID:', firstEnrollment._id);
      console.log('  Course ID (raw):', firstEnrollment.courseId);
      console.log(
        '  Course populated?',
        typeof firstEnrollment.courseId === 'object' &&
          firstEnrollment.courseId !== null,
      );
      if (
        typeof firstEnrollment.courseId === 'object' &&
        firstEnrollment.courseId !== null
      ) {
        const course = firstEnrollment.courseId as any;
        console.log('  Course name:', course.name);
        console.log('  Course code:', course.code);
      }
    }

    // Get grades
    const enrollmentIds = enrollments.map((e) => e._id);
    const grades = await GradeModel.find({
      enrollmentId: { $in: enrollmentIds },
    });

    console.log(`\n📊 Found ${grades.length} grades`);

    // Map grades
    const gradeMap = new Map();
    grades.forEach((grade) => {
      gradeMap.set(grade.enrollmentId.toString(), grade);
    });

    // Build gradeByCourse
    const gradeByCourse = enrollments
      .map((enrollment) => {
        const grade = gradeMap.get(enrollment._id.toString());
        const course = enrollment.courseId as {
          _id?: unknown;
          code?: string;
          name?: string;
          credits?: number;
        };

        return {
          courseId: course?._id?.toString() || '',
          courseCode: course?.code || 'N/A',
          courseName: course?.name || 'N/A',
          credits: course?.credits || 0,
          total: grade?.total ?? null,
        };
      })
      .filter((item) => item.total !== null);

    console.log('\n📈 Grade By Course:');
    console.log(`  Total items: ${gradeByCourse.length}`);
    console.log(JSON.stringify(gradeByCourse.slice(0, 3), null, 2));

    // Build gpaBySemester
    const semesterMap = new Map<
      string,
      { grades: { total: number; credits: number }[]; credits: number }
    >();

    enrollments.forEach((enrollment) => {
      const grade = gradeMap.get(enrollment._id.toString());
      const course = enrollment.courseId as { credits?: number };
      const sem = enrollment.semester || 'Unknown';

      if (!semesterMap.has(sem)) {
        semesterMap.set(sem, { grades: [], credits: 0 });
      }

      const semData = semesterMap.get(sem)!;
      if (grade?.total !== null && grade?.total !== undefined) {
        semData.grades.push({
          total: grade.total,
          credits: course?.credits || 0,
        });
      }
      semData.credits += course?.credits || 0;
    });

    const gpaBySemester = Array.from(semesterMap.entries())
      .map(([semester, data]) => ({
        semester,
        gpa: computeGPA(data.grades),
        gpa4: computeGPA4(data.grades),
        totalCredits: data.credits,
      }))
      .sort((a, b) => a.semester.localeCompare(b.semester));

    console.log('\n📊 GPA By Semester:');
    console.log(`  Total items: ${gpaBySemester.length}`);
    console.log(JSON.stringify(gpaBySemester, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAPIEndpoint();
