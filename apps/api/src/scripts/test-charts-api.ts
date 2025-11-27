import { connectToDatabase } from '../config/database';
import { StudentModel } from '../models/student.model';
import { EnrollmentModel } from '../models/enrollment.model';
import { GradeModel } from '../models/grade.model';
import { CourseModel } from '../models/course.model';
import { computeGPA, computeGPA4 } from '../constants/messages';

async function testChartsAPI() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    // Tìm student N24DCPT035
    const student = await StudentModel.findOne({
      mssv: { $regex: /^n24dcpt035$/i },
    });
    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log(`\n📚 Student: ${student.fullName} (${student.mssv})`);

    // Simulate getMyCharts logic
    const enrollments = await EnrollmentModel.find({
      studentId: student._id,
    });

    const enrollmentIds = enrollments.map((e) => e._id);
    const grades = await GradeModel.find({
      enrollmentId: { $in: enrollmentIds },
    });

    // Map grades
    const gradeMap = new Map();
    grades.forEach((grade) => {
      gradeMap.set(grade.enrollmentId.toString(), grade);
    });

    // 3. GPA By Semester
    const semesterMap = new Map<
      string,
      { grades: { total: number; credits: number }[]; credits: number }
    >();

    for (const enrollment of enrollments) {
      const grade = gradeMap.get(enrollment._id.toString());
      const course = await CourseModel.findById(enrollment.courseId);
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
    }

    const gpaBySemester = Array.from(semesterMap.entries())
      .map(([semester, data]) => ({
        semester,
        gpa: computeGPA(data.grades),
        gpa4: computeGPA4(data.grades),
        totalCredits: data.credits,
      }))
      .sort((a, b) => a.semester.localeCompare(b.semester));

    console.log('\n📊 GPA By Semester:');
    console.log(JSON.stringify(gpaBySemester, null, 2));

    // 2. Grade By Course
    const gradeByCourse = [];
    for (const enrollment of enrollments) {
      const grade = gradeMap.get(enrollment._id.toString());
      const course = await CourseModel.findById(enrollment.courseId);

      if (grade?.total !== null && grade?.total !== undefined) {
        gradeByCourse.push({
          courseId: course?._id?.toString() || '',
          courseCode: course?.code || 'N/A',
          courseName: course?.name || 'N/A',
          credits: course?.credits || 0,
          total: grade.total,
        });
      }
    }

    console.log('\n📈 Grade By Course:');
    console.log(JSON.stringify(gradeByCourse, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testChartsAPI();

