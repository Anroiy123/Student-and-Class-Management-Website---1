import { faker } from '@faker-js/faker/locale/vi';

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

export interface GeneratedTeacher {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RETIRED';
  hireDate: Date;
}

const DEPARTMENTS = [
  'Công nghệ Thông tin',
  'Kỹ thuật Điện - Điện tử',
  'Kế toán',
  'Quản trị Kinh doanh',
  'Marketing',
  'Công nghệ Đa phương tiện',
  'An toàn Thông tin',
  'Kỹ thuật Điều khiển và Tự động hóa',
  'Internet vạn vật (IoT)',
  'Kỹ thuật Điện tử Viễn thông',
];

const SPECIALIZATIONS: Record<string, string[]> = {
  'Công nghệ Thông tin': [
    'Lập trình Web',
    'Phát triển Phần mềm',
    'Hệ thống Thông tin',
    'Trí tuệ Nhân tạo',
    'Khoa học Dữ liệu',
  ],
  'Kỹ thuật Điện - Điện tử': [
    'Điện tử Công suất',
    'Hệ thống Nhúng',
    'Vi xử lý',
    'Mạch Điện tử',
  ],
  'Kế toán': ['Kế toán Doanh nghiệp', 'Kế toán Quản trị', 'Kiểm toán'],
  'Quản trị Kinh doanh': [
    'Quản trị Doanh nghiệp',
    'Quản trị Nhân sự',
    'Quản trị Chiến lược',
  ],
  Marketing: ['Marketing Số', 'Phân tích Marketing', 'Truyền thông Marketing'],
  'Công nghệ Đa phương tiện': [
    'Thiết kế Đồ họa',
    'Ứng dụng Đa phương tiện',
    'Game Design',
  ],
  'An toàn Thông tin': [
    'Bảo mật Mạng',
    'Mật mã học',
    'An ninh Mạng',
    'Forensics',
  ],
  'Kỹ thuật Điều khiển và Tự động hóa': [
    'Tự động hóa Công nghiệp',
    'Robot',
    'PLC',
  ],
  'Internet vạn vật (IoT)': [
    'IoT Applications',
    'Smart Home',
    'Sensor Networks',
  ],
  'Kỹ thuật Điện tử Viễn thông': [
    'Hệ thống Thông tin Viễn thông',
    'Mạng và Dịch vụ',
    'Vô tuyến',
  ],
};

/**
 * Remove Vietnamese diacritics from string
 */
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function generateTeachers(count: number = 20): GeneratedTeacher[] {
  const teachers: GeneratedTeacher[] = [];

  for (let i = 1; i <= count; i++) {
    const employeeId = `GV${String(i).padStart(3, '0')}`;
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const fullName = reverseToVietnameseName(faker.person.fullName({ sex: gender }));

    // Remove Vietnamese tones for email
    const firstName = fullName.split(' ').pop() || 'teacher';
    const firstNameNoTones = removeVietnameseTones(firstName).toLowerCase();
    const email = `${firstNameNoTones}${i}@ptithcm.edu.vn`;

    const phone = '0' + faker.string.numeric(9);

    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const specializationList = SPECIALIZATIONS[department] || ['General'];
    const specialization = faker.helpers.arrayElement(specializationList);

    const status: 'ACTIVE' | 'ON_LEAVE' | 'RETIRED' =
      Math.random() > 0.9 ? 'ON_LEAVE' : 'ACTIVE';

    const hireDate = faker.date.between({
      from: new Date(2000, 0, 1),
      to: new Date(2020, 11, 31),
    });

    teachers.push({
      employeeId,
      fullName,
      email,
      phone,
      department,
      specialization,
      status,
      hireDate,
    });
  }

  return teachers;
}
