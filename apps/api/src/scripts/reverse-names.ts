import { connectToDatabase } from '../config/database.js';
import { StudentModel } from '../models/student.model.js';
import { TeacherModel } from '../models/teacher.model.js';

/**
 * Đảo ngược tên từ format "Tên Họ" sang "Họ Tên"
 * Ví dụ: "Bích Liên Lâm" -> "Lâm Bích Liên"
 */
function reverseVietnameseName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return name; // Nếu chỉ có 1 từ thì giữ nguyên
  }
  
  // Lấy từ cuối cùng (họ) và đưa lên đầu
  const lastName = parts[parts.length - 1];
  const otherNames = parts.slice(0, -1);
  
  return [lastName, ...otherNames].join(' ');
}

async function reverseAllNames() {
  try {
    console.log('🔄 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Connected to database\n');

    // Đảo ngược tên sinh viên
    console.log('👨‍🎓 Reversing student names...');
    const students = await StudentModel.find({});
    let studentCount = 0;
    
    for (const student of students) {
      const oldName = student.fullName;
      const newName = reverseVietnameseName(oldName);
      
      if (oldName !== newName) {
        student.fullName = newName;
        await student.save();
        studentCount++;
        console.log(`  ${oldName} -> ${newName}`);
      }
    }
    
    console.log(`✅ Reversed ${studentCount} student names\n`);

    // Đảo ngược tên giáo viên
    console.log('👨‍🏫 Reversing teacher names...');
    const teachers = await TeacherModel.find({});
    let teacherCount = 0;
    
    for (const teacher of teachers) {
      const oldName = teacher.fullName;
      const newName = reverseVietnameseName(oldName);
      
      if (oldName !== newName) {
        teacher.fullName = newName;
        await teacher.save();
        teacherCount++;
        console.log(`  ${oldName} -> ${newName}`);
      }
    }
    
    console.log(`✅ Reversed ${teacherCount} teacher names\n`);

    console.log('🎉 Done! All names have been reversed to Vietnamese format (Họ Tên)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reverseAllNames();
