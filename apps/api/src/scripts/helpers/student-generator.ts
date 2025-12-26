import { faker } from '@faker-js/faker/locale/vi';
import { getMajorInfo } from './major-mapping.js';

/**
 * Đảo ngược tên từ format "Tên Họ" (Western) sang "Họ Tên" (Vietnamese)
 * Ví dụ: "Bích Liên Lâm" -> "Lâm Bích Liên"
 */
function reverseToVietnameseName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) {
    return name;
  }
  // Lấy từ cuối cùng (họ) và đưa lên đầu
  const lastName = parts[parts.length - 1];
  const otherNames = parts.slice(0, -1);
  return [lastName, ...otherNames].join(' ');
}

export interface GeneratedStudent {
  mssv: string;
  fullName: string;
  dob: Date;
  email: string;
  phone: string;
  address: string;
  classCode: string;
}

const VIETNAMESE_PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
  'Đồng Nai',
  'Bình Dương',
  'Long An',
  'Tiền Giang',
  'Vĩnh Long',
  'An Giang',
  'Kiên Giang',
  'Sóc Trăng',
  'Bạc Liêu',
  'Cà Mau',
  'Nghệ An',
  'Thanh Hóa',
  'Quảng Nam',
  'Khánh Hòa',
  'Lâm Đồng',
  'Bình Thuận',
  'Ninh Thuận',
  'Đắk Lắk',
  'Gia Lai',
  'Kon Tum',
  'Hà Giang',
  'Cao Bằng',
  'Lạng Sơn',
  'Quảng Ninh',
  'Bắc Giang',
  'Thái Nguyên',
  'Phú Thọ',
  'Vĩnh Phúc',
  'Bắc Ninh',
  'Hải Dương',
  'Hưng Yên',
  'Nam Định',
  'Thái Bình',
  'Ninh Bình',
  'Hà Nam',
];

const VIETNAMESE_DISTRICTS = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Quận Bình Thạnh',
  'Quận Tân Bình',
  'Quận Phú Nhuận',
  'Quận Gò Vấp',
  'Quận Thủ Đức',
  'Huyện Củ Chi',
  'Huyện Hóc Môn',
  'Huyện Bình Chánh',
  'Huyện Nhà Bè',
  'Huyện Cần Giờ',
];

export function generateStudentsForClass(
  classCode: string,
  numStudents: number = 40,
): GeneratedStudent[] {
  const students: GeneratedStudent[] = [];
  const year = classCode.substring(1, 3);
  const majorInfo = getMajorInfo(classCode);

  if (!majorInfo) {
    console.warn(`⚠️  Unknown major for class ${classCode}`);
    return [];
  }

  const studentCodePrefix = majorInfo.studentCode.substring(2);
  const birthYear = 2000 + parseInt(year) + 1;

  for (let i = 1; i <= numStudents; i++) {
    const mssv = `N${year}${majorInfo.studentCode}${String(i).padStart(3, '0')}`;
    const gender = Math.random() > 0.5 ? 'male' : 'female';

    const fullName = reverseToVietnameseName(faker.person.fullName({ sex: gender }));

    const dob = faker.date.between({
      from: new Date(birthYear, 0, 1),
      to: new Date(birthYear, 11, 31),
    });

    const email = `${mssv.toLowerCase()}@student.ptithcm.edu.vn`;

    const phone = '0' + faker.string.numeric(9);

    const province = faker.helpers.arrayElement(VIETNAMESE_PROVINCES);
    const district = faker.helpers.arrayElement(VIETNAMESE_DISTRICTS);
    const street = faker.location.street();
    const address = `${street}, ${district}, ${province}`;

    students.push({
      mssv,
      fullName,
      dob,
      email,
      phone,
      address,
      classCode,
    });
  }

  return students;
}

export function generateStudentsForAllClasses(
  classCodes: string[],
  minStudents: number = 35,
  maxStudents: number = 50,
): GeneratedStudent[] {
  const allStudents: GeneratedStudent[] = [];
  const majorCounters = new Map<string, number>();

  for (const classCode of classCodes) {
    const numStudents = faker.number.int({
      min: minStudents,
      max: maxStudents,
    });
    const year = classCode.substring(1, 3);
    const majorInfo = getMajorInfo(classCode);

    if (!majorInfo) {
      console.warn(`⚠️  Unknown major for class ${classCode}`);
      continue;
    }

    const majorKey = `${year}-${majorInfo.studentCode}`;
    const startIndex = (majorCounters.get(majorKey) || 0) + 1;
    majorCounters.set(majorKey, startIndex + numStudents - 1);

    const students = generateStudentsForClassWithStartIndex(
      classCode,
      numStudents,
      startIndex,
    );
    allStudents.push(...students);
  }

  return allStudents;
}

function generateStudentsForClassWithStartIndex(
  classCode: string,
  numStudents: number,
  startIndex: number,
): GeneratedStudent[] {
  const students: GeneratedStudent[] = [];
  const year = classCode.substring(1, 3);
  const majorInfo = getMajorInfo(classCode);

  if (!majorInfo) {
    return [];
  }

  const birthYear = 2000 + parseInt(year) + 1;

  for (let i = 0; i < numStudents; i++) {
    const studentNumber = startIndex + i;
    const mssv = `N${year}${majorInfo.studentCode}${String(studentNumber).padStart(3, '0')}`;
    const gender = Math.random() > 0.5 ? 'male' : 'female';

    const fullName = reverseToVietnameseName(faker.person.fullName({ sex: gender }));

    const dob = faker.date.between({
      from: new Date(birthYear, 0, 1),
      to: new Date(birthYear, 11, 31),
    });

    const email = `${mssv.toLowerCase()}@student.ptithcm.edu.vn`;

    const phone = '0' + faker.string.numeric(9);

    const province = faker.helpers.arrayElement(VIETNAMESE_PROVINCES);
    const district = faker.helpers.arrayElement(VIETNAMESE_DISTRICTS);
    const street = faker.location.street();
    const address = `${street}, ${district}, ${province}`;

    students.push({
      mssv,
      fullName,
      dob,
      email,
      phone,
      address,
      classCode,
    });
  }

  return students;
}

export function generateRandomGrade(): {
  attendance: number;
  midterm: number;
  final: number;
  total: number;
} {
  const attendance = faker.number.float({ min: 5, max: 10, fractionDigits: 1 });
  const midterm = faker.number.float({ min: 4, max: 10, fractionDigits: 1 });
  const final = faker.number.float({ min: 4, max: 10, fractionDigits: 1 });

  const total = parseFloat(
    (attendance * 0.1 + midterm * 0.3 + final * 0.6).toFixed(2),
  );

  return {
    attendance,
    midterm,
    final,
    total,
  };
}
