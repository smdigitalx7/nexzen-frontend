import {
  SchoolAdmissionListItem,
  SchoolAdmissionDetails,
} from "@/features/school/types/admissions";
import { CollegeAdmissionDetails } from "@/features/college/types/admissions";
import { assets, brand } from "@/lib/config";
import { getExportFilename } from "./excel-export-utils";

// IMPORTANT: ExcelJS is large — load it only when exporting.
async function loadExcelJS(): Promise<any> {
  const mod: any = await import("exceljs");
  return mod?.default ?? mod;
}

/**
 * Export all admissions to Excel with professional formatting
 */
export async function exportAdmissionsToExcel(
  admissions: SchoolAdmissionListItem[],
  fileName: string = "School_Admissions"
) {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Admissions");

  // Set column widths
  worksheet.columns = [
    { header: "Student ID", key: "student_id", width: 12 },
    { header: "Admission No", key: "admission_no", width: 18 },
    { header: "Admission Date", key: "admission_date", width: 15 },
    { header: "Student Name", key: "student_name", width: 25 },
    { header: "Class", key: "class_name", width: 12 },
    { header: "Admission Fee Status", key: "admission_fee_paid", width: 20 },
    { header: "Payable Tuition Fee", key: "payable_tuition_fee", width: 25 },
    {
      header: "Payable Transport Fee",
      key: "payable_transport_fee",
      width: 25,
    },
  ];

  // Style header row - Professional neutral design
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Corporate-grade neutral
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // ✅ FIX: Add data rows in chunks to prevent UI blocking
  const CHUNK_SIZE = 50;
  const processAdmissionChunk = async (startIndex: number) => {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, admissions.length);

    for (let i = startIndex; i < endIndex; i++) {
      const admission = admissions[i];
      const row = worksheet.addRow({
        student_id: admission.student_id,
        admission_no: admission.admission_no,
        admission_date: admission.admission_date,
        student_name: admission.student_name,
        class_name: admission.class_name,
        admission_fee_paid: admission.admission_fee_paid,
        payable_tuition_fee: admission.payable_tuition_fee,
        payable_transport_fee: admission.payable_transport_fee,
      });

      // Style data rows
      row.alignment = { vertical: "middle", horizontal: "left" };
      row.height = 20;

      // Conditional formatting for admission fee status
      const statusCell = row.getCell("admission_fee_paid");
      if (admission.admission_fee_paid === "PAID") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD4EDDA" }, // Light green
        };
        statusCell.font = { color: { argb: "FF155724" }, bold: true };
      } else if (admission.admission_fee_paid === "PENDING") {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFF3CD" }, // Light yellow
        };
        statusCell.font = { color: { argb: "FF856404" }, bold: true };
      }
    }

    // Yield to browser if more chunks remain
    if (endIndex < admissions.length) {
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => resolve(), { timeout: 50 });
        } else {
          setTimeout(() => resolve(), 0);
        }
      });
      await processAdmissionChunk(endIndex);
    }
  };

  await processAdmissionChunk(0);

  // ✅ FIX: Add borders to all cells in chunks
  const processBorderChunk = async (startRow: number) => {
    const endRow = Math.min(startRow + CHUNK_SIZE, worksheet.rowCount);

    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      if (row) {
        row.eachCell((cell: any) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    }

    // Yield to browser if more chunks remain
    if (endRow < worksheet.rowCount) {
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => resolve(), { timeout: 50 });
        } else {
          setTimeout(() => resolve(), 0);
        }
      });
      await processBorderChunk(endRow + 1);
    }
  };

  await processBorderChunk(1);

  // Add summary row
  const lastRow = worksheet.lastRow;
  if (lastRow) {
    const summaryRow = worksheet.addRow([
      "",
      "",
      "",
      `Total Admissions: ${admissions.length}`,
      "",
      "",
      "",
      "",
    ]);
    summaryRow.font = { bold: true, size: 11 };
    summaryRow.getCell(4).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE9ECEF" },
    };
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getExportFilename(fileName, "xlsx");
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export single admission to Excel with detailed information
 */
export async function exportSingleAdmissionToExcel(
  admission: SchoolAdmissionDetails,
  fileName?: string
) {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Admission Details");

  // Set column widths
  worksheet.columns = [{ width: 30 }, { width: 40 }];

  // Title - Professional neutral design
  const titleRow = worksheet.addRow(["STUDENT ADMISSION DETAILS", ""]);
  titleRow.font = { bold: true, size: 16, color: { argb: "FF374151" } }; // Professional Dark Gray
  titleRow.alignment = { horizontal: "center" };
  worksheet.mergeCells(`A1:B1`);
  titleRow.height = 30;

  worksheet.addRow([]); // Empty row

  // Basic Information Section - Professional neutral design
  const basicInfoHeader = worksheet.addRow(["BASIC INFORMATION", ""]);
  basicInfoHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  basicInfoHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Consistent with headers
  };
  worksheet.mergeCells(`A${basicInfoHeader.number}:B${basicInfoHeader.number}`);

  worksheet.addRow(["Admission No:", admission.admission_no]);
  worksheet.addRow(["Admission Date:", admission.admission_date]);
  worksheet.addRow(["Academic Year:", admission.academic_year]);
  worksheet.addRow(["Branch:", admission.branch_name]);
  worksheet.addRow(["Student Name:", admission.student_name]);
  worksheet.addRow(["Gender:", admission.gender]);
  worksheet.addRow(["Date of Birth:", admission.dob]);
  worksheet.addRow(["Class:", admission.class_name]);

  worksheet.addRow([]); // Empty row

  // Parent/Guardian Information - Professional neutral design
  const parentInfoHeader = worksheet.addRow([
    "PARENT/GUARDIAN INFORMATION",
    "",
  ]);
  parentInfoHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  parentInfoHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Consistent with headers
  };
  worksheet.mergeCells(
    `A${parentInfoHeader.number}:B${parentInfoHeader.number}`
  );

  worksheet.addRow([
    "Father/Guardian Name:",
    admission.father_or_guardian_name,
  ]);
  worksheet.addRow([
    "Father/Guardian Aadhar:",
    admission.father_or_guardian_aadhar_no,
  ]);
  worksheet.addRow([
    "Father/Guardian Mobile:",
    admission.father_or_guardian_mobile,
  ]);
  worksheet.addRow([
    "Father/Guardian Occupation:",
    admission.father_or_guardian_occupation,
  ]);
  worksheet.addRow([
    "Mother/Guardian Name:",
    admission.mother_or_guardian_name,
  ]);
  worksheet.addRow([
    "Mother/Guardian Aadhar:",
    admission.mother_or_guardian_aadhar_no,
  ]);
  worksheet.addRow([
    "Mother/Guardian Mobile:",
    admission.mother_or_guardian_mobile,
  ]);
  worksheet.addRow([
    "Mother/Guardian Occupation:",
    admission.mother_or_guardian_occupation,
  ]);

  worksheet.addRow([]); // Empty row

  // Address Information - Professional neutral design
  const addressHeader = worksheet.addRow(["ADDRESS INFORMATION", ""]);
  addressHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  addressHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Consistent with headers
  };
  worksheet.mergeCells(`A${addressHeader.number}:B${addressHeader.number}`);

  worksheet.addRow(["Present Address:", admission.present_address]);
  worksheet.addRow(["Permanent Address:", admission.permanent_address]);

  worksheet.addRow([]); // Empty row

  // Fee Information - Professional neutral design
  const feeHeader = worksheet.addRow(["FEE INFORMATION", ""]);
  feeHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  feeHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Consistent with headers
  };
  worksheet.mergeCells(`A${feeHeader.number}:B${feeHeader.number}`);

  worksheet.addRow(["Admission Fee:", `₹${admission.admission_fee}`]);
  worksheet.addRow(["Admission Fee Status:", admission.admission_fee_paid]);
  worksheet.addRow(["Tuition Fee:", `₹${admission.tuition_fee}`]);
  worksheet.addRow([
    "Tuition Concession:",
    admission.tuition_concession ? `₹${admission.tuition_concession}` : "None",
  ]);
  worksheet.addRow([
    "Payable Tuition Fee:",
    `₹${admission.payable_tuition_fee}`,
  ]);
  worksheet.addRow(["Book Fee:", `₹${admission.book_fee}`]);

  worksheet.addRow([]); // Empty row

  // Transport Information - Professional neutral design
  const transportHeader = worksheet.addRow(["TRANSPORT INFORMATION", ""]);
  transportHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  transportHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF374151" }, // Professional Dark Gray - Consistent with headers
  };
  worksheet.mergeCells(`A${transportHeader.number}:B${transportHeader.number}`);

  worksheet.addRow(["Transport Required:", admission.transport_required]);
  worksheet.addRow(["Route:", admission.route_ || "N/A"]);
  worksheet.addRow(["Distance Slab:", admission.slab || "N/A"]);
  worksheet.addRow(["Transport Fee:", `₹${admission.transport_fee || 0}`]);
  worksheet.addRow([
    "Transport Concession:",
    `₹${admission.transport_concession || 0}`,
  ]);
  worksheet.addRow([
    "Payable Transport Fee:",
    `₹${admission.payable_transport_fee || 0}`,
  ]);

  // ✅ FIX: Style all label cells (column A) in chunks to prevent UI blocking
  const CHUNK_SIZE = 50;
  const processLabelChunk = async (startRow: number) => {
    const endRow = Math.min(startRow + CHUNK_SIZE, worksheet.rowCount);

    for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
      if (rowNumber > 1) {
        const row = worksheet.getRow(rowNumber);
        if (row) {
          const labelCell = row.getCell(1);
          labelCell.font = { bold: true };
          labelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF3F4F6" },
          };
        }
      }
    }

    // Yield to browser if more chunks remain
    if (endRow < worksheet.rowCount) {
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => resolve(), { timeout: 50 });
        } else {
          setTimeout(() => resolve(), 0);
        }
      });
      await processLabelChunk(endRow + 1);
    }
  };

  await processLabelChunk(1);

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download =
    fileName ||
    getExportFilename(`Admission_${admission.admission_no}`, "xlsx");
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export school admission form to PDF with professional black & white format
 */
export async function exportSchoolAdmissionFormToPDF(
  admission: SchoolAdmissionDetails
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let yPos = 15;

  // Try to load logo
  let logoDataUrl: string | null = null;
  try {
    const response = await fetch(assets.logo("school"));
    const blob = await response.blob();
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Logo not loaded, continuing without logo
  }

  // Header with Logo and School Name
  yPos += 5;

  // Set header text position for vertical alignment
  const headerYPos = yPos + 2;
  const headerFontSize = 20;

  // Left-align logo if present - align vertically with header text
  if (logoDataUrl) {
    const logoWidth = 25;
    const logoHeight = 25;
    const logoYPos = headerYPos - logoHeight / 2;
    doc.addImage(
      logoDataUrl,
      "PNG",
      margin + 2,
      logoYPos,
      logoWidth,
      logoHeight
    );
  }

  doc.setFontSize(headerFontSize);
  doc.setFont("helvetica", "bold");
  doc.text(
    String(admission.branch_name || brand.getDefaultSchoolName()),
    pageWidth / 2,
    headerYPos,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT ADMISSION FORM", pageWidth / 2, headerYPos + 6, {
    align: "center",
  });

  yPos = headerYPos + 18;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  // Admission Info (Compact)
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Admission No: ${String(admission.admission_no || "")}`,
    margin,
    yPos
  );
  doc.text(
    `Date: ${String(admission.admission_date || "")}`,
    pageWidth / 2,
    yPos
  );
  doc.text(
    `A.Y: ${String(admission.academic_year || "")}`,
    pageWidth - margin - 30,
    yPos
  );
  yPos += 8;

  // Two-column layout for clean design
  const col1 = margin;
  const col2 = pageWidth / 2;
  const labelWidth = 40;
  const valueSpacing = 5; // Spacing between label and value
  const lineHeight = 5.5; // Increased line height for better readability

  // STUDENT DETAILS
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(admission.student_name || ""), col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Class:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(admission.class_name || ""), col2 + labelWidth, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Gender:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(admission.gender || ""), col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Date of Birth:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(String(admission.dob || ""), col2 + labelWidth, yPos);
  yPos += 8;

  // FATHER/GUARDIAN
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FATHER / GUARDIAN DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.father_or_guardian_name || ""),
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.father_or_guardian_occupation || ""),
    col2 + labelWidth,
    yPos
  );
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.father_or_guardian_aadhar_no || ""),
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.father_or_guardian_mobile || ""),
    col2 + labelWidth,
    yPos
  );
  yPos += 8;

  // MOTHER/GUARDIAN
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("MOTHER / GUARDIAN DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.mother_or_guardian_name || ""),
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.mother_or_guardian_occupation || ""),
    col2 + labelWidth,
    yPos
  );
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.mother_or_guardian_aadhar_no || ""),
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    String(admission.mother_or_guardian_mobile || ""),
    col2 + labelWidth,
    yPos
  );
  yPos += 8;

  // ADDRESS
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ADDRESS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Present:", col1, yPos);
  doc.setFont("helvetica", "normal");
  const presentLines = doc.splitTextToSize(
    String(admission.present_address || ""),
    75
  );
  doc.text(presentLines, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Permanent:", col2, yPos);
  doc.setFont("helvetica", "normal");
  const permanentLines = doc.splitTextToSize(
    String(admission.permanent_address || ""),
    75
  );
  doc.text(permanentLines, col2 + labelWidth, yPos);
  yPos += Math.max(presentLines.length, permanentLines.length) * 4.5 + 6;

  // FEE STRUCTURE - Clean Table
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("FEE STRUCTURE", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  // Fee table with better spacing
  const tableStartX = margin;
  const colW = [55, 30, 30, 40, 28];

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);

  // Table header
  let xP = tableStartX;
  ["Fee Type", "Amount", "Concession", "Payable", "Status"].forEach((h, i) => {
    doc.rect(xP, yPos - 3, colW[i], 6);
    doc.text(h, xP + 2, yPos + 1);
    xP += colW[i];
  });
  yPos += 6;

  // Table rows
  doc.setFont("helvetica", "normal");
  const fees = [
    [
      "Admission Fee",
      String(admission.admission_fee || ""),
      "-",
      String(admission.admission_fee || ""),
      String(admission.admission_fee_paid || ""),
    ],
    [
      "Tuition Fee",
      String(admission.tuition_fee || ""),
      String(admission.tuition_concession || "-"),
      String(admission.payable_tuition_fee || "").split(" ")[0],
      "Pending",
    ],
    [
      "Book Fee",
      String(admission.book_fee || ""),
      "-",
      String(admission.book_fee || ""),
      "Pending",
    ],
  ];

  if (admission.transport_required === "YES") {
    fees.push([
      "Transport Fee",
      String(admission.transport_fee || ""),
      String(admission.transport_concession || "-"),
      String(admission.payable_transport_fee || "").split(" ")[0],
      "Pending",
    ]);
  }

  fees.forEach((row) => {
    xP = tableStartX;
    row.forEach((cell, i) => {
      doc.rect(xP, yPos - 3, colW[i], 6);
      let text = String(cell);
      // Add ₹ symbol to monetary columns (Amount, Concession, Payable)
      if (i === 1 || i === 2 || i === 3) {
        // For concession, only add ₹ if it's not "-"
        if (i === 2 && (cell === "-" || cell === "")) {
          text = "-";
        } else {
          // Use Rs. prefix for compatibility with jsPDF fonts
          text = `Rs. ${cell}`;
        }
      }
      doc.text(text, xP + 2, yPos + 1);
      xP += colW[i];
    });
    yPos += 6;
  });
  yPos += 6;

  // TRANSPORT INFO (if applicable)
  if (admission.transport_required === "YES") {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSPORT DETAILS", margin, yPos);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Route:", col1, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(String(admission.route_ || "N/A"), col1 + labelWidth, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Distance Slab:", col2, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(String(admission.slab || "N/A"), col2 + labelWidth, yPos);
    yPos += 8;
  }

  // DECLARATION & SIGNATURES
  yPos += 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("DECLARATION & SIGNATURES", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const declaration =
    "I hereby declare that the information provided above is true and correct to the best of my knowledge.";
  const declLines = doc.splitTextToSize(
    declaration,
    pageWidth - 2 * margin - 4
  );
  doc.text(declLines, margin + 2, yPos);
  yPos += declLines.length * 4 + 10;

  // Signature labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Parent/Guardian Signature", margin + 8, yPos);
  doc.text("School Authority", pageWidth - margin - 5 - 70, yPos);
  yPos += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Date:", margin + 8, yPos);
  doc.text("Date:", pageWidth - margin - 5 - 70, yPos);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 287, {
    align: "center",
  });

  // Border around entire page
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);

  // Save PDF
  doc.save(
    getExportFilename(
      `Admission_Form_${String(admission.admission_no || "N/A")}`,
      "pdf"
    )
  );
}

/**
 * Export college admission form to PDF with professional black & white format
 */
export async function exportCollegeAdmissionFormToPDF(
  admission: CollegeAdmissionDetails
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let yPos = 15;

  // Try to load logo
  let logoDataUrl: string | null = null;
  try {
    const response = await fetch(assets.logo("college"));
    const blob = await response.blob();
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Logo not loaded, continuing without logo
  }

  // Header with Logo and College Name
  yPos += 5;

  // Set header text position for vertical alignment
  const headerYPos = yPos + 2;
  const headerFontSize = 20;

  // Left-align logo if present - align vertically with header text
  if (logoDataUrl) {
    const logoWidth = 25;
    const logoHeight = 25;
    const logoYPos = headerYPos - logoHeight / 2;
    doc.addImage(
      logoDataUrl,
      "PNG",
      margin + 2,
      logoYPos,
      logoWidth,
      logoHeight
    );
  }

  doc.setFontSize(headerFontSize);
  doc.setFont("helvetica", "bold");
  doc.text(
    String(admission.branch_name || brand.getDefaultCollegeName()),
    pageWidth / 2,
    headerYPos,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT ADMISSION FORM", pageWidth / 2, headerYPos + 6, {
    align: "center",
  });

  yPos = headerYPos + 18;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  // Admission Info (Compact)
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Admission No: ${admission.admission_no || "N/A"}`, margin, yPos);
  doc.text(`Date: ${admission.admission_date || "N/A"}`, pageWidth / 2, yPos);
  doc.text(
    `A.Y: ${admission.academic_year || "N/A"}`,
    pageWidth - margin - 30,
    yPos
  );
  yPos += 6;

  // Two-column layout for compact design
  const col1 = margin;
  const col2 = pageWidth / 2;
  const labelWidth = 38;
  const lineHeight = 4.5;

  // STUDENT DETAILS
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.student_name || "N/A", col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Group/Course:", col2, yPos);
  doc.setFont("helvetica", "normal");
  const groupCourse =
    admission.group_name && admission.course_name
      ? `${admission.group_name} - ${admission.course_name}`
      : admission.group_name || admission.course_name || "N/A";
  doc.text(groupCourse, col2 + 25, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Gender:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.gender || "N/A", col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Date of Birth:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.dob || "N/A", col2 + 25, yPos);
  yPos += 6;

  // FATHER/GUARDIAN
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("FATHER / GUARDIAN DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_name || "N/A", col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_occupation || "N/A", col2 + 25, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    admission.father_or_guardian_aadhar_no || "N/A",
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_mobile || "N/A", col2 + 25, yPos);
  yPos += 6;

  // MOTHER/GUARDIAN
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("MOTHER / GUARDIAN DETAILS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_name || "N/A", col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_occupation || "N/A", col2 + 25, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(
    admission.mother_or_guardian_aadhar_no || "N/A",
    col1 + labelWidth,
    yPos
  );

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_mobile || "N/A", col2 + 25, yPos);
  yPos += 6;

  // ADDRESS
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ADDRESS", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Present:", col1, yPos);
  doc.setFont("helvetica", "normal");
  const presentLines = doc.splitTextToSize(
    admission.present_address || "N/A",
    75
  );
  doc.text(presentLines, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Permanent:", col2, yPos);
  doc.setFont("helvetica", "normal");
  const permanentLines = doc.splitTextToSize(
    admission.permanent_address || "N/A",
    75
  );
  doc.text(permanentLines, col2 + 25, yPos);
  yPos += Math.max(presentLines.length, permanentLines.length) * 4 + 4;

  // FEE STRUCTURE - Compact Table
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("FEE STRUCTURE", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 7;

  // Compact fee table
  const tableStartX = margin;
  const colW = [52, 28, 28, 38, 25];

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);

  // Table header
  let xP = tableStartX;
  ["Fee Type", "Amount", "Concession", "Payable", "Status"].forEach((h, i) => {
    doc.rect(xP, yPos - 3, colW[i], 5);
    doc.text(h, xP + 1, yPos);
    xP += colW[i];
  });
  yPos += 5;

  // Table rows
  doc.setFont("helvetica", "normal");
  const admissionFee = String(admission.admission_fee || 0);
  const tuitionFee = String(admission.total_tuition_fee || 0);
  const bookFee = String(admission.book_fee || 0);
  const tuitionConcession = String(admission.tuition_concession || 0);
  const payableTuitionFee = admission.payable_tuition_fee
    ? String(admission.payable_tuition_fee).split(" ")[0]
    : "0";

  const fees = [
    [
      "Admission Fee",
      admissionFee,
      "-",
      admissionFee,
      admission.admission_fee_paid || "PENDING",
    ],
    [
      "Tuition Fee",
      tuitionFee,
      tuitionConcession !== "0" && tuitionConcession !== "0.00"
        ? tuitionConcession
        : "-",
      payableTuitionFee,
      "Pending",
    ],
    ["Book Fee", bookFee, "-", bookFee, "Pending"],
  ];

  if (admission.transport_required === "YES") {
    const transportFee = String(admission.transport_fee || 0);
    const transportConcession =
      admission.transport_concession &&
      admission.transport_concession !== "0" &&
      admission.transport_concession !== "0.00"
        ? String(admission.transport_concession)
        : "-";
    const payableTransportFee = admission.payable_transport_fee
      ? String(admission.payable_transport_fee).split(" ")[0]
      : "0";
    fees.push([
      "Transport Fee",
      transportFee,
      transportConcession,
      payableTransportFee,
      "Pending",
    ]);
  }

  fees.forEach((row) => {
    xP = tableStartX;
    row.forEach((cell, i) => {
      doc.rect(xP, yPos - 3, colW[i], 5);
      let text = String(cell);
      // Add ₹ symbol to monetary columns (Amount, Concession, Payable)
      if (i > 0 && i < 4) {
        // For concession column (i === 2), only add ₹ if it's not "-"
        if (i === 2 && (cell === "-" || cell === "")) {
          text = "-";
        } else {
          // Use Rs. prefix for compatibility with jsPDF fonts
          text = `Rs. ${cell}`;
        }
      }
      doc.text(text, xP + 1, yPos);
      xP += colW[i];
    });
    yPos += 5;
  });
  yPos += 4;

  // TRANSPORT INFO (if applicable)
  if (admission.transport_required === "YES") {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSPORT DETAILS", margin, yPos);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Route:", col1, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(admission.route_ || "N/A", col1 + 20, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Distance Slab:", col2, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(admission.slab || "N/A", col2 + 28, yPos);
    yPos += 6;
  }

  // DECLARATION & SIGNATURES
  yPos += 12;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DECLARATION & SIGNATURES", margin, yPos);
  doc.setLineWidth(0.2);
  doc.line(margin, yPos + 1, pageWidth - margin, yPos + 1);
  yPos += 8;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const declaration =
    "I hereby declare that the information provided above is true and correct to the best of my knowledge.";
  const declLines = doc.splitTextToSize(
    declaration,
    pageWidth - 2 * margin - 4
  );
  doc.text(declLines, margin + 2, yPos);
  yPos += declLines.length * 3 + 6;

  // Signature labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Parent/Guardian Signature", margin + 15, yPos);
  doc.text("College Authority", pageWidth - margin - 50, yPos);
  yPos += 4;

  doc.setFont("helvetica", "normal");
  doc.text("Date:", margin + 15, yPos);
  doc.text("Date:", pageWidth - margin - 50, yPos);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.setFont("helvetica", "italic");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 287, {
    align: "center",
  });

  // Border around entire page
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);

  // Save PDF
  doc.save(
    getExportFilename(
      `Admission_Form_${admission.admission_no || "N/A"}`,
      "pdf"
    )
  );
}

// Legacy export for backward compatibility
export const exportAdmissionFormToPDF = exportSchoolAdmissionFormToPDF;
