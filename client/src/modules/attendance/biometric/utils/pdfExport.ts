import jsPDF from "jspdf";
import type { DailyAttendanceRecord } from "../types/biometric-reports";

export const exportDailyAttendanceReportToPDF = async (
  records: DailyAttendanceRecord[],
  date: string,
  filename: string = "daily_biometric_attendance_report"
): Promise<jsPDF> => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // A4 Landscape: ~297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // A4 Landscape: ~210mm
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AKSHARA ERP - DAILY BIOMETRIC ATTENDANCE REPORT", pageWidth / 2, yPosition + 5, { align: "center" });
  yPosition += 12;

  // Date info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Report Date: ${date}`, margin, yPosition);
  doc.text(`Total Records: ${records.length}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 6;

  // Summary counts
  const presentCount = records.filter(r => r.status_code?.toUpperCase() === "P").length;
  const absentCount = records.filter(r => r.status_code?.toUpperCase() === "A").length;
  const lateCount = records.filter(r => r.late_by_minutes > 0).length;
  const leaveCount = records.filter(r => r.status_code?.toUpperCase() === "L").length;
  const otherCount = records.length - (presentCount + absentCount + leaveCount);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Summary: Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount} | Leave: ${leaveCount} | Others: ${otherCount}`,
    margin,
    yPosition
  );
  yPosition += 8;

  // Draw separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Table Headers
  const colWidths = [15, 22, 45, 35, 35, 20, 20, 20, 25, 20, 20]; // Sum matches 277mm
  const colSum = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 8;
  const tableLeft = margin;
  const tableWidth = contentWidth;

  const getColRight = (colIndex: number) => {
    let x = tableLeft;
    for (let i = 0; i <= colIndex; i++) x += (tableWidth * colWidths[i]) / colSum;
    return x;
  };

  const getColLeft = (colIndex: number) => {
    if (colIndex === 0) return tableLeft;
    return getColRight(colIndex - 1);
  };

  // Draw Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const headers = [
    "S.No",
    "Emp Code",
    "Employee Name",
    "Department",
    "Designation",
    "Shift",
    "In Time",
    "Out Time",
    "Work Hrs",
    "Late (m)",
    "Status"
  ];

  headers.forEach((h, i) => {
    const left = getColLeft(i);
    doc.text(h, left + 2, yPosition + 5.5);
  });

  // Table outline
  doc.setDrawColor(180, 180, 180);
  doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
  doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
  yPosition += rowHeight;

  // Draw Table Rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  records.forEach((record, index) => {
    // Check page break
    if (yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      
      // Draw headers again on new page
      doc.setFillColor(240, 240, 240);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
      doc.setFont("helvetica", "bold");
      headers.forEach((h, i) => {
        const left = getColLeft(i);
        doc.text(h, left + 2, yPosition + 5.5);
      });
      doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
      doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
      yPosition += rowHeight;
      doc.setFont("helvetica", "normal");
    }

    const cells = [
      String(index + 1),
      record.employee_code || "-",
      record.employee_name || "-",
      record.department_sname || "-",
      record.designation || "-",
      record.shift_fname || "-",
      record.in_time || "-",
      record.out_time || "-",
      record.work_duration_hours ? record.work_duration_hours.toFixed(2) : "0.00",
      record.late_by_minutes ? String(record.late_by_minutes) : "0",
      record.attendance_status || "-"
    ];

    // Alternating rows / coloring for Absent/Present
    const statusCode = record.status_code?.toUpperCase();
    if (statusCode === "A") {
      doc.setFillColor(254, 242, 242); // very soft light red
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
      doc.setTextColor(153, 27, 27); // Dark red text
    } else if (statusCode === "P") {
      doc.setFillColor(240, 253, 250); // very soft light green
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
      doc.setTextColor(15, 118, 110); // Dark green text
    } else {
      doc.setTextColor(0, 0, 0);
      if (index % 2 === 1) {
        doc.setFillColor(249, 250, 251); // Zebra striping
        doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
      }
    }

    cells.forEach((cell, i) => {
      const left = getColLeft(i);
      const width = (tableWidth * colWidths[i]) / colSum;
      let text = cell;
      // Truncate cell text if it is too long to prevent spillover
      const maxTextWidth = width - 4;
      const textWidth = doc.getTextWidth(text);
      if (textWidth > maxTextWidth) {
        text = doc.splitTextToSize(text, maxTextWidth)[0] + "..";
      }
      doc.text(text, left + 2, yPosition + 5);
    });

    // Row bottom line
    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  });

  // Revert color
  doc.setTextColor(0, 0, 0);

  // Footer on last page
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} - Powered by Velocity ERP`,
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  return doc;
};
