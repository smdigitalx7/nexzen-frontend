import { jsPDF } from 'jspdf';
import type { StudentPerformanceResponse as CollegeStudentPerformanceResponse } from '@/features/college/types/student-marks';
import type { StudentPerformanceResponse as SchoolStudentPerformanceResponse } from '@/features/school/types/marks';

type StudentPerformanceData = CollegeStudentPerformanceResponse | SchoolStudentPerformanceResponse;

/**
 * Export student performance to Excel format
 */
export const exportStudentPerformanceToExcel = async (
  performanceData: StudentPerformanceData,
  filename: string = 'student-performance-report'
): Promise<void> => {
  if (!performanceData || !performanceData.subjects || performanceData.subjects.length === 0) {
    console.warn('No performance data to export');
    return;
  }

  try {
    const ExcelJSImport: any = await import('exceljs');
    const ExcelJS = ExcelJSImport?.default ?? ExcelJSImport;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VELONEX ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Student Performance Report');

    // Set column widths
    sheet.getColumn(1).width = 25; // Subject
    sheet.getColumn(2).width = 15; // Total Exams
    sheet.getColumn(3).width = 15; // Total Tests
    sheet.getColumn(4).width = 18; // Total Assessments
    sheet.getColumn(5).width = 18; // Marks Obtained
    sheet.getColumn(6).width = 18; // Max Marks
    sheet.getColumn(7).width = 15; // Percentage

    // Header row with student information
    const studentDetails = performanceData.student_details;
    sheet.addRow(['Student Performance Report']);
    sheet.addRow([]);
    sheet.addRow(['Student Name:', studentDetails.student_name]);
    sheet.addRow(['Admission No:', studentDetails.admission_no]);
    if (studentDetails.roll_number) {
      sheet.addRow(['Roll Number:', studentDetails.roll_number]);
    }
    sheet.addRow(['Class:', studentDetails.class_name]);
    if ('section_name' in studentDetails && studentDetails.section_name) {
      sheet.addRow(['Section:', studentDetails.section_name]);
    }
    if ('group_name' in studentDetails && studentDetails.group_name) {
      sheet.addRow(['Group:', studentDetails.group_name]);
    }
    if ('course_name' in studentDetails && studentDetails.course_name) {
      sheet.addRow(['Course:', studentDetails.course_name]);
    }
    sheet.addRow(['Academic Year:', studentDetails.academic_year]);
    sheet.addRow(['Branch:', studentDetails.branch_name]);
    sheet.addRow([]);

    // Calculate overall statistics
    const totalExams = performanceData.subjects.reduce((sum, s) => sum + s.total_exams, 0);
    const totalTests = performanceData.subjects.reduce((sum, s) => sum + s.total_tests, 0);
    const overallPercentage = performanceData.subjects.reduce((sum, s) => sum + s.percentage, 0) / performanceData.subjects.length;
    const totalMarksObtained = performanceData.subjects.reduce((sum, s) => sum + s.total_marks_obtained, 0);
    const totalMaxMarks = performanceData.subjects.reduce((sum, s) => sum + s.total_max_marks, 0);

    sheet.addRow(['Overall Performance Summary']);
    sheet.addRow(['Total Exams:', totalExams]);
    sheet.addRow(['Total Tests:', totalTests]);
    sheet.addRow(['Total Marks Obtained:', totalMarksObtained]);
    sheet.addRow(['Total Maximum Marks:', totalMaxMarks]);
    sheet.addRow(['Overall Percentage:', `${overallPercentage.toFixed(2)}%`]);
    sheet.addRow([]);

    // Table headers
    const headerRow = sheet.addRow([
      'Subject',
      'Total Exams',
      'Total Tests',
      'Total Assessments',
      'Marks Obtained',
      'Max Marks',
      'Percentage'
    ]);

    // Style header row
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6B46C1' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell((cell: any) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    performanceData.subjects.forEach((subject) => {
      const row = sheet.addRow([
        subject.subject_name,
        subject.total_exams,
        subject.total_tests,
        subject.total_assessments,
        subject.total_marks_obtained,
        subject.total_max_marks,
        `${subject.percentage.toFixed(2)}%`
      ]);

      // Style data rows
      row.alignment = { horizontal: 'left', vertical: 'middle' };
      row.eachCell((cell: any, colNumber: number) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colNumber === 7) { // Percentage column
          const percentage = subject.percentage;
          if (percentage >= 90) {
            cell.font = { color: { argb: 'FF10B981' } }; // Green
          } else if (percentage >= 80) {
            cell.font = { color: { argb: 'FF3B82F6' } }; // Blue
          } else if (percentage >= 70) {
            cell.font = { color: { argb: 'FFF59E0B' } }; // Amber
          } else if (percentage >= 60) {
            cell.font = { color: { argb: 'FFF97316' } }; // Orange
          } else {
            cell.font = { color: { argb: 'FFEF4444' } }; // Red
          }
        }
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${sanitizedFilename}_${new Date().toISOString().split('T')[0]}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export student performance to PDF format
 */
export const exportStudentPerformanceToPDF = (
  performanceData: StudentPerformanceData,
  filename: string = 'student-performance-report'
): void => {
  if (!performanceData || !performanceData.subjects || performanceData.subjects.length === 0) {
    console.warn('No performance data to export');
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Student Performance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Student Information
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const studentDetails = performanceData.student_details;
    
    const studentInfo = [
      ['Student Name:', studentDetails.student_name],
      ['Admission No:', studentDetails.admission_no],
    ];

    if (studentDetails.roll_number) {
      studentInfo.push(['Roll Number:', studentDetails.roll_number]);
    }
    studentInfo.push(['Class:', studentDetails.class_name]);
    if ('section_name' in studentDetails && studentDetails.section_name) {
      studentInfo.push(['Section:', studentDetails.section_name]);
    }
    if ('group_name' in studentDetails && studentDetails.group_name) {
      studentInfo.push(['Group:', studentDetails.group_name]);
    }
    if ('course_name' in studentDetails && studentDetails.course_name) {
      studentInfo.push(['Course:', studentDetails.course_name]);
    }
    studentInfo.push(['Academic Year:', studentDetails.academic_year]);
    studentInfo.push(['Branch:', studentDetails.branch_name]);

    checkPageBreak(15);
    studentInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Overall Performance Summary
    const totalExams = performanceData.subjects.reduce((sum, s) => sum + s.total_exams, 0);
    const totalTests = performanceData.subjects.reduce((sum, s) => sum + s.total_tests, 0);
    const overallPercentage = performanceData.subjects.reduce((sum, s) => sum + s.percentage, 0) / performanceData.subjects.length;
    const totalMarksObtained = performanceData.subjects.reduce((sum, s) => sum + s.total_marks_obtained, 0);
    const totalMaxMarks = performanceData.subjects.reduce((sum, s) => sum + s.total_max_marks, 0);

    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Overall Performance Summary', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Exams: ${totalExams}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Tests: ${totalTests}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Marks Obtained: ${totalMarksObtained}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Maximum Marks: ${totalMaxMarks}`, margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Percentage: ${overallPercentage.toFixed(2)}%`, margin, yPosition);
    yPosition += 10;

    // Subject Performance
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Subject Performance', margin, yPosition);
    yPosition += 8;

    performanceData.subjects.forEach((subject, index) => {
      checkPageBreak(25);
      
      // Subject header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(subject.subject_name, margin, yPosition);
      yPosition += 7;

      // Subject details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Exams: ${subject.total_exams}`, margin + 5, yPosition);
      yPosition += 6;
      doc.text(`Total Tests: ${subject.total_tests}`, margin + 5, yPosition);
      yPosition += 6;
      doc.text(`Total Assessments: ${subject.total_assessments}`, margin + 5, yPosition);
      yPosition += 6;
      doc.text(`Marks Obtained: ${subject.total_marks_obtained}`, margin + 5, yPosition);
      yPosition += 6;
      doc.text(`Max Marks: ${subject.total_max_marks}`, margin + 5, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Percentage: ${subject.percentage.toFixed(2)}%`, margin + 5, yPosition);
      yPosition += 10;

      // Add separator between subjects
      if (index < performanceData.subjects.length - 1) {
        checkPageBreak(5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
    });

    // Save PDF
    const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${sanitizedFilename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

