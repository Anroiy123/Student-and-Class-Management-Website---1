import { connectToDatabase } from '../src/config/database';
import { CourseModel } from '../src/models/course.model';
import { TeacherModel } from '../src/models/teacher.model';

async function assignTeachersToCourses() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB Atlas');

    const teachers = await TeacherModel.find();
    const courses = await CourseModel.find();

    if (teachers.length === 0) {
      console.log('❌ No teachers found. Please run seed:teachers first.');
      process.exit(1);
    }

    console.log(`📚 Found ${courses.length} courses`);
    console.log(`👨‍🏫 Found ${teachers.length} teachers`);

    // Assign teachers to courses (each teacher can teach 2-3 courses)
    let teacherIndex = 0;
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const teacher = teachers[teacherIndex % teachers.length];
      
      await CourseModel.updateOne(
        { _id: course._id },
        {
          teacherEmail: teacher.email,
          teacherName: teacher.fullName,
        }
      );

      console.log(`✅ ${course.code} - ${course.name}`);
      console.log(`   → Giảng viên: ${teacher.fullName}`);

      // Change teacher every 2-3 courses
      if ((i + 1) % 2 === 0 || (i + 1) % 3 === 0) {
        teacherIndex++;
      }
    }

    console.log('\n✅ Teacher assignment completed!');
    console.log('📊 Summary:');
    
    // Show summary for each teacher
    for (const teacher of teachers) {
      const teacherCourses = await CourseModel.find({ teacherEmail: teacher.email });
      console.log(`\n👨‍🏫 ${teacher.fullName}:`);
      teacherCourses.forEach(course => {
        console.log(`   - ${course.code}: ${course.name}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignTeachersToCourses();
