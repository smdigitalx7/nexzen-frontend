import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import type { StudentMarksResponse as CollegeStudentMarksResponse } from '@/features/college/types/student-marks';
import type { StudentMarksResponse as SchoolStudentMarksResponse } from '@/features/school/types/marks';

type StudentMarksData = CollegeStudentMarksResponse | SchoolStudentMarksResponse;

/**
 * Export student marks to Excel format
 */
export const exportStudentMarksToExcel = async (
  marksData: StudentMarksData,
  filename: string = 'student-marks-report'
): Promise<void> => {
  if (!marksData || !marksData.subjects || marksData.subjects.length === 0) {
    console.warn('No marks data to export');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'VELONEX ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Student Marks Report');

    // Set column widths
    sheet.getColumn(1).width = 25; // Subject
    sheet.getColumn(2).width = 20; // Assessment Type
    sheet.getColumn(3).width = 25; // Assessment Name
    sheet.getColumn(4).width = 15; // Max Marks
    sheet.getColumn(5).width = 15; // Obtained Marks
    sheet.getColumn(6).width = 15; // Percentage
    sheet.getColumn(7).width = 12; // Grade
    sheet.getColumn(8).width = 20; // Remarks

    // Header row with student information
    const studentDetails = marksData.student_details;
    sheet.addRow(['Student Marks Report']);
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
    let totalObtained = 0;
    let totalMax = 0;
    marksData.subjects.forEach((subject) => {
      subject.exam_marks.forEach((exam) => {
        totalObtained += exam.marks_obtained;
        totalMax += exam.max_marks;
      });
      subject.test_marks.forEach((test) => {
        totalObtained += test.marks_obtained;
        totalMax += test.max_marks;
      });
    });
    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    sheet.addRow(['Overall Performance']);
    sheet.addRow(['Total Marks Obtained:', totalObtained]);
    sheet.addRow(['Total Maximum Marks:', totalMax]);
    sheet.addRow(['Overall Percentage:', `${overallPercentage.toFixed(2)}%`]);
    sheet.addRow([]);

    // Table headers
    const headerRow = sheet.addRow([
      'Subject',
      'Assessment Type',
      'Assessment Name',
      'Max Marks',
      'Obtained Marks',
      'Percentage',
      'Grade',
      'Remarks'
    ]);

    // Style header row
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    marksData.subjects.forEach((subject) => {
      // Add exams
      subject.exam_marks.forEach((exam) => {
        const row = sheet.addRow([
          subject.subject_name,
          'Exam',
          exam.exam_name,
          exam.max_marks,
          exam.marks_obtained,
          `${exam.percentage.toFixed(2)}%`,
          exam.grade || '-',
          exam.remarks || '-'
        ]);

        // Style data rows
        row.alignment = { horizontal: 'left', vertical: 'middle' };
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (colNumber === 5) { // Percentage column
            const percentage = exam.percentage;
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

      // Add tests
      subject.test_marks.forEach((test) => {
        const row = sheet.addRow([
          subject.subject_name,
          'Test',
          test.test_name,
          test.max_marks,
          test.marks_obtained,
          `${test.percentage.toFixed(2)}%`,
          test.grade || '-',
          test.remarks || '-'
        ]);

        // Style data rows
        row.alignment = { horizontal: 'left', vertical: 'middle' };
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (colNumber === 5) { // Percentage column
            const percentage = test.percentage;
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
    });

    // Add subject summary section
    sheet.addRow([]);
    sheet.addRow(['Subject-wise Summary']);
    const summaryHeaderRow = sheet.addRow([
      'Subject',
      'Total Exams',
      'Total Tests',
      'Total Obtained',
      'Total Maximum',
      'Overall Percentage'
    ]);

    summaryHeaderRow.font = { bold: true, size: 11 };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6B7280' }
    };
    summaryHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
    summaryHeaderRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    marksData.subjects.forEach((subject) => {
      const examTotal = subject.exam_marks.reduce((sum, exam) => sum + exam.marks_obtained, 0);
      const examMax = subject.exam_marks.reduce((sum, exam) => sum + exam.max_marks, 0);
      const testTotal = subject.test_marks.reduce((sum, test) => sum + test.marks_obtained, 0);
      const testMax = subject.test_marks.reduce((sum, test) => sum + test.max_marks, 0);
      const totalObtained = examTotal + testTotal;
      const totalMax = examMax + testMax;
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      const summaryRow = sheet.addRow([
        subject.subject_name,
        subject.exam_marks.length,
        subject.test_marks.length,
        totalObtained,
        totalMax,
        `${percentage.toFixed(2)}%`
      ]);

      summaryRow.alignment = { horizontal: 'left', vertical: 'middle' };
      summaryRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
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
 * Export student marks to PDF format
 */
export const exportStudentMarksToPDF = (
  marksData: StudentMarksData,
  filename: string = 'student-marks-report'
): void => {
  if (!marksData || !marksData.subjects || marksData.subjects.length === 0) {
    console.warn('No marks data to export');
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
    doc.text('Student Marks Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Student Information
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const studentDetails = marksData.student_details;
    
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

    // Overall Performance
    let totalObtained = 0;
    let totalMax = 0;
    marksData.subjects.forEach((subject) => {
      subject.exam_marks.forEach((exam) => {
        totalObtained += exam.marks_obtained;
        totalMax += exam.max_marks;
      });
      subject.test_marks.forEach((test) => {
        totalObtained += test.marks_obtained;
        totalMax += test.max_marks;
      });
    });
    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Overall Performance', margin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Marks Obtained: ${totalObtained}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Maximum Marks: ${totalMax}`, margin, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Percentage: ${overallPercentage.toFixed(2)}%`, margin, yPosition);
    yPosition += 10;

    // Subject-wise marks
    marksData.subjects.forEach((subject, subjectIndex) => {
      checkPageBreak(30);
      
      // Subject header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(subject.subject_name, margin, yPosition);
      yPosition += 8;

      // Calculate subject totals
      const examTotal = subject.exam_marks.reduce((sum, exam) => sum + exam.marks_obtained, 0);
      const examMax = subject.exam_marks.reduce((sum, exam) => sum + exam.max_marks, 0);
      const testTotal = subject.test_marks.reduce((sum, test) => sum + test.marks_obtained, 0);
      const testMax = subject.test_marks.reduce((sum, test) => sum + test.max_marks, 0);
      const totalObtained = examTotal + testTotal;
      const totalMax = examMax + testMax;
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

      // Exams
      if (subject.exam_marks.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Exams:', margin + 5, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        subject.exam_marks.forEach((exam) => {
          checkPageBreak(8);
          doc.setFontSize(9);
          doc.text(
            `  ${exam.exam_name}: ${exam.marks_obtained}/${exam.max_marks} (${exam.percentage.toFixed(2)}%)${exam.grade ? ` - Grade: ${exam.grade}` : ''}`,
            margin + 5,
            yPosition
          );
          yPosition += 6;
        });
      }

      // Tests
      if (subject.test_marks.length > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Tests:', margin + 5, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        subject.test_marks.forEach((test) => {
          checkPageBreak(8);
          doc.setFontSize(9);
          doc.text(
            `  ${test.test_name}: ${test.marks_obtained}/${test.max_marks} (${test.percentage.toFixed(2)}%)${test.grade ? ` - Grade: ${test.grade}` : ''}`,
            margin + 5,
            yPosition
          );
          yPosition += 6;
        });
      }

      // Subject summary
      checkPageBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(
        `Subject Total: ${totalObtained}/${totalMax} (${percentage.toFixed(2)}%)`,
        margin + 5,
        yPosition
      );
      yPosition += 10;

      // Add separator between subjects
      if (subjectIndex < marksData.subjects.length - 1) {
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

