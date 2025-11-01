import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StudentSemesterGPA } from '../services/grade.service';

interface GradeExportData {
  mssv: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  className: string;
  semester: string;
  attendance: number;
  midterm: number;
  final: number;
  total: number;
}

// Export grades list to Excel
export const exportGradesListToExcel = (grades: GradeExportData[], title: string) => {
  const worksheetData = [
    ['BẢNG ĐIỂM'],
    [title],
    ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
    [],
    ['MSSV', 'Họ và tên', 'Mã MH', 'Tên môn học', 'Lớp', 'Học kỳ', 'Chuyên cần', 'Giữa kỳ', 'Cuối kỳ', 'Tổng kết'],
  ];

  grades.forEach((grade) => {
    worksheetData.push([
      grade.mssv,
      grade.studentName,
      grade.courseCode,
      grade.courseName,
      grade.className,
      grade.semester,
      grade.attendance.toFixed(2),
      grade.midterm.toFixed(2),
      grade.final.toFixed(2),
      grade.total.toFixed(2),
    ]);
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws['!cols'] = [
    { wch: 12 }, // MSSV
    { wch: 25 }, // Họ và tên
    { wch: 12 }, // Mã MH
    { wch: 35 }, // Tên môn học
    { wch: 15 }, // Lớp
    { wch: 12 }, // Học kỳ
    { wch: 12 }, // Chuyên cần
    { wch: 10 }, // Giữa kỳ
    { wch: 10 }, // Cuối kỳ
    { wch: 10 }, // Tổng kết
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');

  const filename = `BangDiem_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
};

// Export grades list to PDF
export const exportGradesListToPDF = (grades: GradeExportData[], title: string) => {
  const doc = new jsPDF('landscape'); // Landscape orientation for wide table

  doc.setFont('times', 'normal');
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text('BANG DIEM', 148, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  // Remove Vietnamese diacritics from title
  const safeTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
  doc.text(safeTitle, 148, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 35);

  const tableData = grades.map((grade) => [
    grade.mssv,
    grade.studentName,
    grade.courseCode,
    grade.courseName,
    grade.className,
    grade.semester,
    grade.attendance.toFixed(1),
    grade.midterm.toFixed(1),
    grade.final.toFixed(1),
    grade.total.toFixed(2),
  ]);

  autoTable(doc, {
    head: [['MSSV', 'Ho va ten', 'Ma MH', 'Ten mon hoc', 'Lop', 'HK', 'CC', 'GK', 'CK', 'Tong']],
    body: tableData,
    startY: 42,
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      font: 'times',
    },
    bodyStyles: {
      fontSize: 9,
      font: 'times',
    },
    columnStyles: {
      0: { cellWidth: 22 }, // MSSV
      1: { cellWidth: 40 }, // Họ và tên
      2: { cellWidth: 20 }, // Mã MH
      3: { cellWidth: 60 }, // Tên môn học
      4: { cellWidth: 25 }, // Lớp
      5: { cellWidth: 20, halign: 'center' }, // HK
      6: { cellWidth: 15, halign: 'center' }, // CC
      7: { cellWidth: 15, halign: 'center' }, // GK
      8: { cellWidth: 15, halign: 'center' }, // CK
      9: { cellWidth: 18, halign: 'center' }, // Tổng
    },
    didParseCell: (data) => {
      if (data.column.index === 9 && data.section === 'body') {
        const score = parseFloat(data.cell.raw as string);
        if (score >= 8.5) {
          data.cell.styles.textColor = [34, 197, 94];
        } else if (score >= 7.0) {
          data.cell.styles.textColor = [59, 130, 246];
        } else if (score >= 5.5) {
          data.cell.styles.textColor = [234, 179, 8];
        } else if (score >= 4.0) {
          data.cell.styles.textColor = [249, 115, 22];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 42;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('times', 'italic');
  doc.text(
    `Bao cao duoc tao tu dong - ${new Date().toLocaleString('vi-VN')}`,
    148,
    finalY + 10,
    { align: 'center' }
  );

  const filename = `BangDiem_${new Date().getTime()}.pdf`;
  doc.save(filename);
};

// Export to Excel
export const exportToExcel = (data: StudentSemesterGPA, studentName: string) => {
  // Prepare data for Excel
  const worksheetData = [
    ['BÁO CÁO ĐIỂM SINH VIÊN'],
    [],
    ['Sinh viên:', studentName],
    ['Học kỳ:', data.semester === 'all' ? 'Tất cả các học kỳ' : data.semester],
    ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
    [],
    ['THÔNG TIN TỔNG QUAN'],
    ['Điểm trung bình (GPA):', data.gpa],
    ['Tổng số tín chỉ:', data.totalCredits],
    ['Tín chỉ đạt:', data.passedCredits],
    ['Tín chỉ chưa đạt:', data.failedCredits],
    ['Tổng số môn:', data.totalCourses],
    ['Số môn đạt:', data.passedCourses],
    ['Số môn chưa đạt:', data.failedCourses],
    [],
    ['CHI TIẾT ĐIỂM CÁC MÔN HỌC'],
    ['Mã MH', 'Tên môn học', 'Tín chỉ', 'Học kỳ', 'Chuyên cần', 'Giữa kỳ', 'Cuối kỳ', 'Tổng kết', 'Trạng thái'],
  ];

  // Add course details
  data.courses.forEach((course) => {
    worksheetData.push([
      course.courseCode,
      course.courseName,
      course.credits,
      course.semester,
      course.attendance.toFixed(2),
      course.midterm.toFixed(2),
      course.final.toFixed(2),
      course.total.toFixed(2),
      course.status,
    ]);
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Mã MH
    { wch: 35 }, // Tên môn học
    { wch: 10 }, // Tín chỉ
    { wch: 12 }, // Học kỳ
    { wch: 12 }, // Chuyên cần
    { wch: 10 }, // Giữa kỳ
    { wch: 10 }, // Cuối kỳ
    { wch: 10 }, // Tổng kết
    { wch: 12 }, // Trạng thái
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Bảng điểm');

  // Generate filename
  const filename = `BaoCaoDiem_${studentName.replace(/\s/g, '_')}_${data.semester}_${new Date().getTime()}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
};

// Export to PDF
export const exportToPDF = (data: StudentSemesterGPA, studentName: string) => {
  const doc = new jsPDF();

  // Use Times for better Vietnamese support (though not perfect)
  // Note: For full Vietnamese support, you need to add a custom font
  doc.setFont('times', 'normal');

  // Title
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text('BAO CAO DIEM SINH VIEN', 105, 15, { align: 'center' });

  // Student info
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.text(`Sinh vien: ${studentName}`, 14, 30);
  doc.text(`Hoc ky: ${data.semester === 'all' ? 'Tat ca cac hoc ky' : data.semester}`, 14, 37);
  doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 44);

  // Summary box
  doc.setFillColor(240, 240, 240);
  doc.rect(14, 50, 182, 40, 'F');
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('THONG TIN TONG QUAN', 105, 58, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  const summaryY = 66;
  doc.text(`Diem trung binh (GPA): ${data.gpa.toFixed(2)}`, 20, summaryY);
  doc.text(`Tong so mon: ${data.totalCourses}`, 110, summaryY);
  
  doc.text(`Tong tin chi: ${data.totalCredits}`, 20, summaryY + 7);
  doc.text(`So mon dat: ${data.passedCourses}`, 110, summaryY + 7);
  
  doc.text(`Tin chi dat: ${data.passedCredits}`, 20, summaryY + 14);
  doc.text(`So mon chua dat: ${data.failedCourses}`, 110, summaryY + 14);

  // Course details table
  const tableData = data.courses.map((course) => [
    course.courseCode,
    course.courseName,
    course.credits.toString(),
    course.semester,
    course.attendance.toFixed(1),
    course.midterm.toFixed(1),
    course.final.toFixed(1),
    course.total.toFixed(2),
    course.status,
  ]);

  autoTable(doc, {
    head: [['Ma MH', 'Ten mon hoc', 'TC', 'HK', 'CC', 'GK', 'CK', 'Tong', 'Trang thai']],
    body: tableData,
    startY: 98,
    headStyles: {
      fillColor: [245, 158, 11], // Amber color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      font: 'times',
    },
    bodyStyles: {
      fontSize: 9,
      font: 'times',
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Mã MH
      1: { cellWidth: 55 }, // Tên môn học
      2: { cellWidth: 12, halign: 'center' }, // TC
      3: { cellWidth: 18, halign: 'center' }, // HK
      4: { cellWidth: 12, halign: 'center' }, // CC
      5: { cellWidth: 12, halign: 'center' }, // GK
      6: { cellWidth: 12, halign: 'center' }, // CK
      7: { cellWidth: 15, halign: 'center' }, // Tổng
      8: { cellWidth: 22, halign: 'center' }, // Trạng thái
    },
    didParseCell: (data) => {
      // Color code the status column
      if (data.column.index === 8 && data.section === 'body') {
        const status = data.cell.raw as string;
        if (status === 'Đạt') {
          data.cell.styles.textColor = [34, 197, 94]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Color code the total score
      if (data.column.index === 7 && data.section === 'body') {
        const score = parseFloat(data.cell.raw as string);
        if (score >= 8.5) {
          data.cell.styles.textColor = [34, 197, 94]; // Green
        } else if (score >= 7.0) {
          data.cell.styles.textColor = [59, 130, 246]; // Blue
        } else if (score >= 5.5) {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow
        } else if (score >= 4.0) {
          data.cell.styles.textColor = [249, 115, 22]; // Orange
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 98;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont('times', 'italic');
  doc.text(
    `Bao cao duoc tao tu dong boi He thong quan ly sinh vien - ${new Date().toLocaleString('vi-VN')}`,
    105,
    finalY + 10,
    { align: 'center' }
  );

  // Generate filename - use ASCII-safe characters
  const safeStudentName = studentName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s/g, '_');
  const filename = `BaoCaoDiem_${safeStudentName}_${data.semester}_${new Date().getTime()}.pdf`;

  // Save file
  doc.save(filename);
};
