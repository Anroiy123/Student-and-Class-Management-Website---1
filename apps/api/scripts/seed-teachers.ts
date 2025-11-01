import { connectToDatabase } from '../src/config/database';
import { TeacherModel } from '../src/models/teacher.model';
import { UserModel } from '../src/models/user.model';
import { ClassModel } from '../src/models/class.model';
import { hashPassword } from '../src/utils/password';

// Dữ liệu giảng viên thật
const teachersData = [
  {
    teacherId: 'GV001',
    fullName: 'Nguyễn Văn An',
    department: 'Khoa Công nghệ Thông tin',
    position: 'Giảng viên chính',
    phone: '0901234567',
    dateOfBirth: new Date('1980-03-15'),
    address: 'Quận 1, TP.HCM',
  },
  {
    teacherId: 'GV002',
    fullName: 'Trần Thị Bình',
    department: 'Khoa Công nghệ Thông tin',
    position: 'Giảng viên',
    phone: '0902345678',
    dateOfBirth: new Date('1985-07-22'),
    address: 'Quận 3, TP.HCM',
  },
  {
    teacherId: 'GV003',
    fullName: 'Lê Minh Cường',
    department: 'Khoa Khoa học Máy tính',
    position: 'Giảng viên cao cấp',
    phone: '0903456789',
    dateOfBirth: new Date('1978-11-08'),
    address: 'Quận 5, TP.HCM',
  },
  {
    teacherId: 'GV004',
    fullName: 'Phạm Thị Dung',
    department: 'Khoa Hệ thống Thông tin',
    position: 'Giảng viên',
    phone: '0904567890',
    dateOfBirth: new Date('1983-05-14'),
    address: 'Quận 7, TP.HCM',
  },
  {
    teacherId: 'GV005',
    fullName: 'Hoàng Văn Em',
    department: 'Khoa Công nghệ Thông tin',
    position: 'Trưởng khoa',
    phone: '0905678901',
    dateOfBirth: new Date('1975-09-30'),
    address: 'Quận 10, TP.HCM',
  },
  {
    teacherId: 'GV006',
    fullName: 'Võ Thị Giang',
    department: 'Khoa Kỹ thuật Phần mềm',
    position: 'Giảng viên',
    phone: '0906789012',
    dateOfBirth: new Date('1987-12-25'),
    address: 'Quận Bình Thạnh, TP.HCM',
  },
  {
    teacherId: 'GV007',
    fullName: 'Đặng Văn Hùng',
    department: 'Khoa An ninh Mạng',
    position: 'Giảng viên chính',
    phone: '0907890123',
    dateOfBirth: new Date('1982-04-18'),
    address: 'Quận Phú Nhuận, TP.HCM',
  },
  {
    teacherId: 'GV008',
    fullName: 'Bùi Thị Lan',
    department: 'Khoa Công nghệ Điện tử',
    position: 'Giảng viên',
    phone: '0908901234',
    dateOfBirth: new Date('1986-08-09'),
    address: 'Quận Gò Vấp, TP.HCM',
  },
];

// Function to remove Vietnamese diacritics
function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Generate email from fullName and teacherId
// Format: {firstname}{lastname}{number}@teacher.ptithcm.edu.vn
// Example: Nguyễn Văn An (GV001) -> annguyen01@teacher.ptithcm.edu.vn
function generateEmail(fullName: string, teacherId: string): string {
  const nameParts = removeDiacritics(fullName).toLowerCase().split(' ');
  
  // Get first name (last part)
  const firstName = nameParts[nameParts.length - 1];
  
  // Get last name (first part - họ)
  const lastName = nameParts[0];
  
  // Get number from teacherId (e.g., "GV001" -> "01")
  const number = teacherId.replace(/\D/g, '').padStart(2, '0').slice(-2);
  
  return `${firstName}${lastName}${number}@teacher.ptithcm.edu.vn`;
}

async function seedTeachers() {
  try {
    await connectToDatabase();
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing teachers
    await TeacherModel.deleteMany({});
    console.log('🗑️  Cleared existing teachers');

    // Hash password for all teachers
    const password = 'teacher123';
    const hashedPassword = await hashPassword(password);

    // Create teachers and users
    const createdTeachers = [];
    for (const teacherData of teachersData) {
      // Generate email
      const email = generateEmail(teacherData.fullName, teacherData.teacherId);

      // Create teacher
      const teacher = await TeacherModel.create({
        ...teacherData,
        email,
      });
      createdTeachers.push(teacher);

      // Create user account
      const existingUser = await UserModel.findOne({ email });
      if (!existingUser) {
        await UserModel.create({
          email,
          passwordHash: hashedPassword,
          role: 'TEACHER',
          teacherId: teacher._id,
        });
      }

      console.log(`✅ Created: ${teacher.fullName} (${teacher.teacherId})`);
      console.log(`   Email: ${email}`);
      console.log(`   Department: ${teacher.department}`);
      console.log(`   Position: ${teacher.position}`);
    }

    // Assign teachers to classes (one teacher per class)
    const classes = await ClassModel.find();
    if (classes.length > 0) {
      for (let i = 0; i < classes.length; i++) {
        const cls = classes[i];
        const teacher = createdTeachers[i % createdTeachers.length];
        await ClassModel.updateOne(
          { _id: cls._id },
          { 
            homeroomTeacher: teacher.email,
            homeroomTeacherName: teacher.fullName
          }
        );
        console.log(`📚 Assigned ${teacher.fullName} to class ${cls.code}`);
      }
    }

    console.log('\n✅ Seeding completed!');
    console.log(`📊 Total teachers: ${createdTeachers.length}`);
    console.log(`📚 Classes assigned: ${classes.length}`);
    console.log('\n🔑 All teachers can login with password: teacher123');
    console.log('\n📧 Email examples:');
    createdTeachers.slice(0, 3).forEach(t => {
      console.log(`   - ${t.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTeachers();
