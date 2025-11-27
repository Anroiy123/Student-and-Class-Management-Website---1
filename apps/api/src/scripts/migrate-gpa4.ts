import { connectToDatabase } from '../config/database';
import { GradeModel } from '../models/grade.model';
import { convertToGPA4, computeLetterGrade } from '../constants/messages';

async function migrateGPA4() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();

    console.log('📊 Fetching all grades...');
    const grades = await GradeModel.find({});
    console.log(`Found ${grades.length} grades to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const grade of grades) {
      if (grade.total !== null && grade.total !== undefined) {
        const gpa4 = convertToGPA4(grade.total);
        const letterGrade = computeLetterGrade(grade.total);

        await GradeModel.updateOne(
          { _id: grade._id },
          { $set: { gpa4, letterGrade } },
        );

        updated++;
        if (updated % 100 === 0) {
          console.log(`✅ Updated ${updated} grades...`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✨ Migration completed!');
    console.log(`✅ Updated: ${updated} grades`);
    console.log(`⏭️  Skipped: ${skipped} grades (no total score)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateGPA4();
