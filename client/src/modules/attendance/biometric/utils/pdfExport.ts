import type { jsPDF } from "jspdf";
import type {
  DailyAttendanceRecord,
  MonthlySummaryRecord,
  MonthlyMatrixRecord,
  YearlySummaryRecord,
  YearlyMatrixRecord,
} from "../types/biometric-reports";

export const exportDailyAttendanceReportToPDF = async (
  records: DailyAttendanceRecord[],
  date: string,
  filename: string = "daily_biometric_attendance_report",
  subtitle?: string
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
  yPosition += 11;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, pageWidth / 2, yPosition + 2, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPosition += 6;
  }

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
  // const colWidths = [15, 22, 45, 35, 35, 20, 20, 20, 25, 20, 20]; // With Department
  const colWidths = [15, 25, 55, 45, 25, 22, 22, 25, 20, 25]; // Department and Company excluded
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
    // "Department",
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
      // record.department_sname || "-",
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

export const exportMonthlySummaryToPDF = async (
  records: MonthlySummaryRecord[],
  year: number,
  month: number,
  filename: string = `monthly_summary_${year}_${month}`
) => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AKSHARA ERP - MONTHLY BIOMETRIC ATTENDANCE SUMMARY", pageWidth / 2, yPosition + 5, { align: "center" });
  yPosition += 11;

  // Subtitle / Period
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Period: ${monthName} ${year}`, margin, yPosition);
  doc.text(`Total Employees: ${records.length}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 8;

  // Table setup
  const colWidths = [12, 24, 55, 34, 18, 20, 20, 20, 16, 18, 24];
  const colSum = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 7.5;
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

  const headers = [
    "S.No",
    "Emp Code",
    "Employee Name",
    "Designation",
    "Cal Days",
    "Present",
    "Absent",
    "Leaves",
    "WO",
    "Late (D)",
    "Worked Hrs",
  ];

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    headers.forEach((h, i) => {
      const left = getColLeft(i);
      if (h === "Present") {
        doc.setTextColor(5, 150, 105);
      } else if (h === "Absent") {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(30, 41, 59);
      }
      doc.text(h, left + 2, yPosition + 5);
    });
    doc.setDrawColor(203, 213, 225);
    doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  records.forEach((record, index) => {
    if (yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
    }

    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    }

    const cells = [
      String(index + 1),
      record.employee_code || "-",
      record.employee_name || "-",
      record.designation || "-",
      String(record.total_calendar_days || "-"),
      (record.total_present_days || 0).toFixed(1),
      (record.total_absent_days || 0).toFixed(1),
      (record.total_leave_days || 0).toFixed(1),
      String(record.total_weekly_offs || 0),
      String(record.total_late_days || 0),
      (record.total_worked_hours || 0).toFixed(2),
    ];

    cells.forEach((cell, i) => {
      const left = getColLeft(i);
      const width = (tableWidth * colWidths[i]) / colSum;
      let text = cell;
      const maxTextWidth = width - 4;
      if (doc.getTextWidth(text) > maxTextWidth) {
        text = doc.splitTextToSize(text, maxTextWidth)[0] + "..";
      }

      // Professional colors: Green for Present, Red for Absent
      if (i === 5) {
        // Present
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
      } else if (i === 6) {
        // Absent
        const aVal = Number(record.total_absent_days || 0);
        if (aVal > 0) {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 7) {
        // Leaves
        const lVal = Number(record.total_leave_days || 0);
        if (lVal > 0) {
          doc.setTextColor(37, 99, 235);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 9) {
        // Late (D)
        const lateVal = Number(record.total_late_days || 0);
        if (lateVal > 0) {
          doc.setTextColor(217, 119, 6);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else {
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
      }

      doc.text(text, left + 2, yPosition + 5);
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} - Powered by Velocity ERP`,
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  return doc;
};

export const exportMonthlyMatrixToPDF = async (
  records: MonthlyMatrixRecord[],
  year: number,
  month: number,
  filename: string = `monthly_matrix_${year}_${month}`
) => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month, 0).getDate();

  // Title
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("AKSHARA ERP - MONTHLY BIOMETRIC ATTENDANCE MATRIX", pageWidth / 2, yPosition + 4, { align: "center" });
  yPosition += 9;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Period: ${monthName} ${year}`, margin, yPosition);
  doc.text(`Total Employees: ${records.length}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 7;

  // Column definitions: S.No (10), Emp (42), Days 1..31 (31 * 5.7 = ~176.7), P (13), A (13), L (13), WO (12)
  const colWidths: number[] = [10, 42];
  for (let d = 1; d <= 31; d++) {
    colWidths.push(5.7);
  }
  colWidths.push(13, 13, 13, 12);

  const colSum = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 6.5;
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

  const headers = ["#", "Employee"];
  for (let d = 1; d <= 31; d++) {
    headers.push(String(d));
  }
  headers.push("P", "A", "L", "WO");

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    headers.forEach((h, i) => {
      const left = getColLeft(i);
      if (h === "P") {
        doc.setTextColor(5, 150, 105);
      } else if (h === "A") {
        doc.setTextColor(220, 38, 38);
      } else if (h === "L") {
        doc.setTextColor(37, 99, 235);
      } else {
        doc.setTextColor(51, 65, 85);
      }
      doc.text(h, left + 1.2, yPosition + 4.5);
    });
    doc.setDrawColor(203, 213, 225);
    doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);

  records.forEach((record, index) => {
    if (yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
    }

    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    }

    const empLabel = `${record.employee_name || "-"} (${record.employee_code || ""})`;
    const cells: string[] = [String(index + 1), empLabel];

    for (let d = 1; d <= 31; d++) {
      if (d > daysInMonth) {
        cells.push("-");
      } else {
        const val = record[`day_${d}`] as string;
        cells.push(val ? String(val) : "-");
      }
    }
    cells.push(
      (record.total_present || 0).toFixed(1),
      (record.total_absent || 0).toFixed(1),
      (record.total_leaves || 0).toFixed(1),
      String(record.total_weekly_offs || 0)
    );

    cells.forEach((cell, i) => {
      const left = getColLeft(i);
      const width = (tableWidth * colWidths[i]) / colSum;
      let text = cell;
      const maxTextWidth = width - 1.5;
      if (doc.getTextWidth(text) > maxTextWidth) {
        text = doc.splitTextToSize(text, maxTextWidth)[0];
      }

      // Professional colors in matrix: Green P, Red A, Slate WO, Blue L, Amber H
      if (i >= 2 && i < 2 + 31) {
        const valStr = String(text).toUpperCase();
        if (valStr === "P") {
          doc.setTextColor(5, 150, 105); // Green for Present
          doc.setFont("helvetica", "bold");
        } else if (valStr === "A") {
          doc.setTextColor(220, 38, 38); // Red for Absent
          doc.setFont("helvetica", "bold");
        } else if (valStr === "WO" || valStr === "W") {
          doc.setTextColor(100, 116, 139); // Slate for Weekly Off
          doc.setFont("helvetica", "normal");
        } else if (valStr === "L") {
          doc.setTextColor(37, 99, 235); // Blue for Leave
          doc.setFont("helvetica", "bold");
        } else if (valStr === "H") {
          doc.setTextColor(217, 119, 6); // Amber for Holiday
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 2 + 31) {
        // Totals: Present (P)
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
      } else if (i === 2 + 31 + 1) {
        // Totals: Absent (A)
        const aVal = Number(record.total_absent || 0);
        if (aVal > 0) {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 2 + 31 + 2) {
        // Totals: Leaves (L)
        const lVal = Number(record.total_leaves || 0);
        if (lVal > 0) {
          doc.setTextColor(37, 99, 235);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 2 + 31 + 3) {
        // Totals: Weekly Offs (WO)
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
      } else {
        // S.No and Employee Name
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
      }

      doc.text(text, left + 1.2, yPosition + 4.5);
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  });

  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} - Powered by Velocity ERP`,
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  return doc;
};

export const exportYearlySummaryToPDF = async (
  records: YearlySummaryRecord[],
  year: number,
  filename: string = `yearly_summary_${year}`
) => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AKSHARA ERP - YEARLY BIOMETRIC ATTENDANCE SUMMARY", pageWidth / 2, yPosition + 5, { align: "center" });
  yPosition += 11;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Year: ${year}`, margin, yPosition);
  doc.text(`Total Records: ${records.length}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 8;

  const colWidths = [12, 24, 26, 52, 22, 22, 20, 18, 18, 24];
  const colSum = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 7.5;
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

  const headers = [
    "S.No",
    "Month",
    "Emp Code",
    "Employee Name",
    "Present",
    "Absent",
    "Leaves",
    "WO",
    "Holidays",
    "Worked Hrs",
  ];

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    headers.forEach((h, i) => {
      const left = getColLeft(i);
      if (h === "Present") {
        doc.setTextColor(5, 150, 105);
      } else if (h === "Absent") {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(30, 41, 59);
      }
      doc.text(h, left + 2, yPosition + 5);
    });
    doc.setDrawColor(203, 213, 225);
    doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  records.forEach((record, index) => {
    if (yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
    }

    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    }

    const cells = [
      String(index + 1),
      record.report_month_name?.trim() || "-",
      record.employee_code || "-",
      record.employee_name || "-",
      (record.total_present_days || 0).toFixed(1),
      (record.total_absent_days || 0).toFixed(1),
      (record.total_leave_days || 0).toFixed(1),
      String(record.total_weekly_offs || 0),
      String(record.total_holidays || 0),
      (record.total_worked_hours || 0).toFixed(2),
    ];

    cells.forEach((cell, i) => {
      const left = getColLeft(i);
      const width = (tableWidth * colWidths[i]) / colSum;
      let text = cell;
      const maxTextWidth = width - 4;
      if (doc.getTextWidth(text) > maxTextWidth) {
        text = doc.splitTextToSize(text, maxTextWidth)[0] + "..";
      }

      // Professional colors: Green for Present, Red for Absent
      if (i === 4) {
        // Present
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
      } else if (i === 5) {
        // Absent
        const aVal = Number(record.total_absent_days || 0);
        if (aVal > 0) {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 6) {
        // Leaves
        const lVal = Number(record.total_leave_days || 0);
        if (lVal > 0) {
          doc.setTextColor(37, 99, 235);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 8) {
        // Holidays
        const hVal = Number(record.total_holidays || 0);
        if (hVal > 0) {
          doc.setTextColor(217, 119, 6);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else {
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
      }

      doc.text(text, left + 2, yPosition + 5);
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} - Powered by Velocity ERP`,
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  return doc;
};

export const exportYearlyMatrixToPDF = async (
  records: YearlyMatrixRecord[],
  year: number,
  filename: string = `yearly_matrix_${year}`
) => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AKSHARA ERP - YEARLY BIOMETRIC ATTENDANCE MATRIX", pageWidth / 2, yPosition + 5, { align: "center" });
  yPosition += 11;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Year: ${year}`, margin, yPosition);
  doc.text(`Total Employees: ${records.length}`, pageWidth - margin, yPosition, { align: "right" });
  yPosition += 8;

  // Cols: S.No (10), Emp Code (22), Employee (45), Jan..Dec (12 * 11 = 132), Total P (18), Total A (18), Total L (18)
  const colWidths = [10, 22, 45, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 18, 18, 18];
  const colSum = colWidths.reduce((a, b) => a + b, 0);
  const rowHeight = 7;
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

  const headers = [
    "#",
    "Code",
    "Employee Name",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Tot P",
    "Tot A",
    "Tot L",
  ];

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    headers.forEach((h, i) => {
      const left = getColLeft(i);
      if (h === "Tot P") {
        doc.setTextColor(5, 150, 105);
      } else if (h === "Tot A") {
        doc.setTextColor(220, 38, 38);
      } else if (h === "Tot L") {
        doc.setTextColor(37, 99, 235);
      } else {
        doc.setTextColor(51, 65, 85);
      }
      doc.text(h, left + 1.5, yPosition + 4.8);
    });
    doc.setDrawColor(203, 213, 225);
    doc.line(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  };

  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  records.forEach((record, index) => {
    if (yPosition + rowHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
    }

    if (index % 2 === 1) {
      doc.setFillColor(249, 250, 251);
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight, "F");
    }

    const cells = [
      String(index + 1),
      record.employee_code || "-",
      record.employee_name || "-",
      (record.jan_present || 0).toFixed(1),
      (record.feb_present || 0).toFixed(1),
      (record.mar_present || 0).toFixed(1),
      (record.apr_present || 0).toFixed(1),
      (record.may_present || 0).toFixed(1),
      (record.jun_present || 0).toFixed(1),
      (record.jul_present || 0).toFixed(1),
      (record.aug_present || 0).toFixed(1),
      (record.sep_present || 0).toFixed(1),
      (record.oct_present || 0).toFixed(1),
      (record.nov_present || 0).toFixed(1),
      (record.dec_present || 0).toFixed(1),
      (record.yearly_total_present || 0).toFixed(1),
      (record.yearly_total_absent || 0).toFixed(1),
      (record.yearly_total_leaves || 0).toFixed(1),
    ];

    cells.forEach((cell, i) => {
      const left = getColLeft(i);
      const width = (tableWidth * colWidths[i]) / colSum;
      let text = cell;
      const maxTextWidth = width - 2;
      if (doc.getTextWidth(text) > maxTextWidth) {
        text = doc.splitTextToSize(text, maxTextWidth)[0];
      }

      // Professional colors in yearly matrix
      if (i >= 3 && i <= 14) {
        // Month presence columns (Jan-Dec)
        const mVal = parseFloat(text);
        if (mVal > 0) {
          doc.setTextColor(5, 150, 105); // Green for presence
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184); // Muted for 0
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 15) {
        // Tot P
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
      } else if (i === 16) {
        // Tot A
        const aVal = parseFloat(text);
        if (aVal > 0) {
          doc.setTextColor(220, 38, 38);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else if (i === 17) {
        // Tot L
        const lVal = parseFloat(text);
        if (lVal > 0) {
          doc.setTextColor(37, 99, 235);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
        }
      } else {
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
      }

      doc.text(text, left + 1.5, yPosition + 4.8);
    });

    doc.setDrawColor(220, 220, 220);
    doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);
    yPosition += rowHeight;
  });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} - Powered by Velocity ERP`,
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" }
  );

  return doc;
};

