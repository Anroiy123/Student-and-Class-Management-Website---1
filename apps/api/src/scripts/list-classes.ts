import { connectToDatabase } from '../config/database.js';
import { ClassModel } from '../models/class.model.js';

async function listClasses() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected\n');

    const classes = await ClassModel.find().sort({ code: 1 });
    
    console.log(`📚 DANH SÁCH CÁC LỚP (${classes.length} lớp):\n`);
    console.log('═'.repeat(80));
    
    classes.forEach((c, i) => {
      const index = String(i + 1).padStart(2, ' ');
      const code = c.code.padEnd(20);
      const name = c.name.padEnd(45);
      const size = String(c.size).padStart(2);
      console.log(`${index}. ${code} - ${name} (${size} SV)`);
    });
    
    console.log('═'.repeat(80));
    console.log(`\n✅ Total: ${classes.length} classes`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listClasses();

