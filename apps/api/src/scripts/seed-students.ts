import mongoose from 'mongoose';
import { StudentModel } from '../models/student.model';
import { ClassModel } from '../models/class.model';
import { env } from '../config/env';

// Danh sách họ tên Việt Nam
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Đức', 'Anh', 'Quốc', 'Hữu', 'Thanh', 'Tuấn', 'Công', 'Hồng', 'Thu', 'Phương', 'Khánh'];
const firstNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hà', 'Hùng', 'Linh', 'Long', 'Mai', 'Nam', 'Phong', 'Quân', 'Tú', 'Tùng', 'Yến', 'Hạnh', 'Hương', 'Lan', 'Nga', 'Oanh', 'Trang', 'Vy', 'Xuân', 'Anh', 'Bảo', 'Chi', 'Đạt', 'Giang', 'Hiếu', 'Khoa'];

// Danh sách địa chỉ
const streets = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Võ Văn Tần', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Phan Xích Long', 'Nguyễn Văn Cừ'];
const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Thủ Đức', 'Bình Thạnh', 'Tân Bình', 'Phú Nhuận'];
const cities = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang', 'Huế'];

// Hàm random
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tạo MSSV
const generateMSSV = (year: number, index: number) => {
  return `${year}${String(index).padStart(4, '0')}`;
};

// Tạo email
const generateEmail = (fullName: string, mssv: string) => {
  const nameParts = fullName.toLowerCase().split(' ');
  const lastName = nameParts[nameParts.length - 1];
  const initials = nameParts.slice(0, -1).map(n => n[0]).join('');
  return `${initials}${lastName}${mssv.slice(-2)}@student.ptithcm.edu.vn`;
};

// Tạo số điện thoại
const generatePhone = () => {
  const prefixes = ['098', '097', '096', '086', '032', '033', '034', '035', '036', '037', '038', '039'];
  return `${random(prefixes)}${randomNumber(1000000, 9999999)}`;
};

// Tạo ngày sinh (18-25 tuổi)
const generateDOB = () => {
  const year = randomNumber(2000, 2007);
  const month = randomNumber(1, 12);
  const day = randomNumber(1, 28);
  return new Date(year, month - 1, day);
};

// Tạo địa chỉ
const generateAddress = () => {
  const number = randomNumber(1, 999);
  return `${number} ${random(streets)}, ${random(districts)}, ${random(cities)}`;
};

// Tạo tên ngẫu nhiên
const generateFullName = () => {
  return `${random(lastNames)} ${random(middleNames)} ${random(firstNames)}`;
};

async function seedStudents() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Lấy danh sách lớp
    const classes = await ClassModel.find();
    if (classes.length === 0) {
      console.log('❌ No classes found! Please run seed:classes first.');
      process.exit(1);
    }
    console.log(`📚 Found ${classes.length} classes\n`);

    // Kiểm tra số lượng sinh viên hiện tại
    const existingCount = await StudentModel.countDocuments();
    console.log(`📊 Current students in database: ${existingCount}`);

    // Hỏi người dùng
    console.log('\n⚠️  Options:');
    console.log('   1. Add more students (keep existing)');
    console.log('   2. Delete all and recreate');
    console.log('\n💡 Running option 1: Add more students...\n');

    // Số lượng sinh viên muốn tạo
    const numberOfStudents = 50;
    console.log(`🎯 Creating ${numberOfStudents} new students...`);

    const startYear = 2021;
    const startIndex = existingCount + 1;

    const newStudents = [];
    for (let i = 0; i < numberOfStudents; i++) {
      const fullName = generateFullName();
      const mssv = generateMSSV(startYear, startIndex + i);
      const email = generateEmail(fullName, mssv);
      const phone = generatePhone();
      const dob = generateDOB();
      const address = generateAddress();
      const classId = random(classes)._id;

      newStudents.push({
        mssv,
        fullName,
        email,
        phone,
        dob,
        address,
        classId,
      });
    }

    // Insert sinh viên
    const created = await StudentModel.insertMany(newStudents);
    console.log(`✅ Successfully created ${created.length} students!\n`);

    // Hiển thị thống kê
    console.log('📊 Statistics by class:');
    for (const cls of classes) {
      const count = await StudentModel.countDocuments({ classId: cls._id });
      console.log(`   ${cls.code.padEnd(12)} - ${count.toString().padStart(2)} students`);
    }

    const totalStudents = await StudentModel.countDocuments();
    console.log(`\n✨ Total students in database: ${totalStudents}`);
    console.log('\n🎉 Seed completed successfully!');
    console.log('🌐 You can now access students via API at: http://localhost:4000/students\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Chạy seed function
seedStudents();
