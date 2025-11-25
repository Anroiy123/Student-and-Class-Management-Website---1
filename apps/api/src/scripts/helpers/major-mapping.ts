export interface MajorInfo {
  code: string;
  name: string;
  specialization?: string;
  studentCode: string;
}

export const MAJOR_MAPPING: Record<string, MajorInfo> = {
  // Công nghệ thông tin
  CQCN: {
    code: 'CQCN',
    name: 'Công nghệ thông tin',
    studentCode: 'DCCN',
  },
  CQCNPM: {
    code: 'CQCNPM',
    name: 'Công nghệ thông tin',
    specialization: 'Công nghệ phần mềm',
    studentCode: 'DCCN',
  },
  CQCNHT: {
    code: 'CQCNHT',
    name: 'Công nghệ thông tin',
    specialization: 'Hệ thống thông tin',
    studentCode: 'DCCN',
  },
  CQCE: {
    code: 'CQCE',
    name: 'Kỹ thuật máy tính',
    specialization: 'Lớp ghép (AT/DK/CN)',
    studentCode: 'DCCN', // Mixed: DCCN, DCAT, DCDK
  },

  // Công nghệ kỹ thuật Điện - Điện tử
  CQDT: {
    code: 'CQDT',
    name: 'Công nghệ kỹ thuật Điện - Điện tử',
    studentCode: 'DCDT',
  },
  CQDTDT: {
    code: 'CQDTDT',
    name: 'Công nghệ kỹ thuật Điện - Điện tử',
    specialization: 'Điện tử - Điện tử',
    studentCode: 'DCDT',
  },

  // Kế toán
  CQKT: {
    code: 'CQKT',
    name: 'Kế toán',
    studentCode: 'DCKT',
  },

  // Quản trị kinh doanh
  CQQT: {
    code: 'CQQT',
    name: 'Quản trị kinh doanh',
    studentCode: 'DCQT',
  },
  CQQTDN: {
    code: 'CQQTDN',
    name: 'Quản trị kinh doanh',
    specialization: 'Quản trị doanh nghiệp',
    studentCode: 'DCQT',
  },
  CQQTMR: {
    code: 'CQQTMR',
    name: 'Quản trị kinh doanh',
    specialization: 'Quản trị Marketing',
    studentCode: 'DCQT',
  },

  // Điện tử - Truyền thông (Viễn thông)
  CQVT: {
    code: 'CQVT',
    name: 'Kỹ thuật Điện tử viễn thông',
    studentCode: 'DCVT',
  },
  CQVTHI: {
    code: 'CQVTHI',
    name: 'Kỹ thuật Điện tử viễn thông',
    specialization: 'Hệ thống thông tin viễn thông',
    studentCode: 'DCVT',
  },
  CQVTMD: {
    code: 'CQVTMD',
    name: 'Kỹ thuật Điện tử viễn thông',
    specialization: 'Mạng và Dịch vụ',
    studentCode: 'DCVT',
  },
  CQVTVT: {
    code: 'CQVTVT',
    name: 'Kỹ thuật Điện tử viễn thông',
    specialization: 'Vô tuyến',
    studentCode: 'DCVT',
  },

  // Marketing
  CQMR: {
    code: 'CQMR',
    name: 'Marketing',
    studentCode: 'DCMR',
  },
  CQMRPT: {
    code: 'CQMRPT',
    name: 'Marketing',
    specialization: 'Phân tích Marketing',
    studentCode: 'DCMR',
  },
  CQMRTT: {
    code: 'CQMRTT',
    name: 'Marketing',
    specialization: 'Truyền thông Marketing',
    studentCode: 'DCMR',
  },

  // Công nghệ Đa phương tiện
  CQPT: {
    code: 'CQPT',
    name: 'Công nghệ đa phương tiện',
    studentCode: 'DCPT',
  },
  CQPTTK: {
    code: 'CQPTTK',
    name: 'Công nghệ đa phương tiện',
    specialization: 'Thiết kế đa phương tiện',
    studentCode: 'DCPT',
  },
  CQPTUD: {
    code: 'CQPTUD',
    name: 'Công nghệ đa phương tiện',
    specialization: 'Ứng dụng đa phương tiện',
    studentCode: 'DCPT',
  },

  // An toàn thông tin
  CQAT: {
    code: 'CQAT',
    name: 'An toàn thông tin',
    studentCode: 'DCAT',
  },

  // Điều khiển và Tự động hóa
  CQDK: {
    code: 'CQDK',
    name: 'Kỹ thuật điều khiển và tự động hóa',
    studentCode: 'DCDK',
  },
  CQDKTD: {
    code: 'CQDKTD',
    name: 'Kỹ thuật điều khiển và tự động hóa',
    specialization: 'Tự động hóa',
    studentCode: 'DCDK',
  },

  // Internet vạn vật (IoT)
  CQCI: {
    code: 'CQCI',
    name: 'Công nghệ Internet vạn vật (IoT)',
    studentCode: 'DCCI',
  },
};

export function getMajorInfo(classCode: string): MajorInfo | null {
  const withoutPrefix = classCode.substring(3);
  const dashIndex = withoutPrefix.indexOf('-');
  const majorPart =
    dashIndex > 0 ? withoutPrefix.substring(0, dashIndex) : withoutPrefix;

  const majorCode = majorPart.replace(/\d+$/, '');

  return MAJOR_MAPPING[majorCode] || null;
}

export function generateClassName(classCode: string): string {
  const year = classCode.substring(1, 3);
  const majorInfo = getMajorInfo(classCode);

  if (!majorInfo) {
    return `Lớp ${classCode}`;
  }

  return `${majorInfo.name} D${year}`;
}
