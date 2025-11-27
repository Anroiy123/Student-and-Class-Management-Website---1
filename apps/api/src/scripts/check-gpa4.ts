import { connectToDatabase } from '../config/database';
import '../models';
import { GradeModel } from '../models/grade.model';

async function checkGPA4() {
  try {
    await connectToDatabase();

    // Find grades with total score
    const grades = await GradeModel.find({ 
      total: { $ne: null } 
    }).limit(10);

    console.log('\n📊 Sample grades with total score:');
    grades.forEach((g) => {
      console.log({
        enrollmentId: g.enrollmentId.toString(),
        total: g.total,
        gpa4: g.gpa4,
        letterGrade: g.letterGrade,
      });
    });

    // Count grades with and without gpa4
    const withGPA4 = await GradeModel.countDocuments({ 
      total: { $ne: null },
      gpa4: { $ne: null }
    });
    const withoutGPA4 = await GradeModel.countDocuments({ 
      total: { $ne: null },
      gpa4: null
    });

    console.log('\n📈 Statistics:');
    console.log(`  Grades with GPA4: ${withGPA4}`);
    console.log(`  Grades without GPA4: ${withoutGPA4}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkGPA4();

