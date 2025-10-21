import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import {
  SchoolAdmissionListItem,
  SchoolAdmissionDetails,
} from "@/lib/types/school/admissions";

/**
 * Export all admissions to Excel with professional formatting
 */
export async function exportAdmissionsToExcel(
  admissions: SchoolAdmissionListItem[],
  fileName: string = "School_Admissions"
) {
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

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" }, // Blue background
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // Add data rows
  admissions.forEach((admission) => {
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
  });

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

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
  link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`;
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
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Admission Details");

  // Set column widths
  worksheet.columns = [{ width: 30 }, { width: 40 }];

  // Title
  const titleRow = worksheet.addRow(["STUDENT ADMISSION DETAILS", ""]);
  titleRow.font = { bold: true, size: 16, color: { argb: "FF2563EB" } };
  titleRow.alignment = { horizontal: "center" };
  worksheet.mergeCells(`A1:B1`);
  titleRow.height = 30;

  worksheet.addRow([]); // Empty row

  // Basic Information Section
  const basicInfoHeader = worksheet.addRow(["BASIC INFORMATION", ""]);
  basicInfoHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  basicInfoHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4B5563" },
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

  // Parent/Guardian Information
  const parentInfoHeader = worksheet.addRow([
    "PARENT/GUARDIAN INFORMATION",
    "",
  ]);
  parentInfoHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  parentInfoHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4B5563" },
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

  // Address Information
  const addressHeader = worksheet.addRow(["ADDRESS INFORMATION", ""]);
  addressHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  addressHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4B5563" },
  };
  worksheet.mergeCells(`A${addressHeader.number}:B${addressHeader.number}`);

  worksheet.addRow(["Present Address:", admission.present_address]);
  worksheet.addRow(["Permanent Address:", admission.permanent_address]);

  worksheet.addRow([]); // Empty row

  // Fee Information
  const feeHeader = worksheet.addRow(["FEE INFORMATION", ""]);
  feeHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  feeHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4B5563" },
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

  // Transport Information
  const transportHeader = worksheet.addRow(["TRANSPORT INFORMATION", ""]);
  transportHeader.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
  transportHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4B5563" },
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

  // Style all label cells (column A)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const labelCell = row.getCell(1);
      labelCell.font = { bold: true };
      labelCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" },
      };
    }
  });

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
    `Admission_${admission.admission_no}_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Export admission form to PDF with professional black & white format
 */
export async function exportAdmissionFormToPDF(
  admission: SchoolAdmissionDetails
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let yPos = 15;

  // Try to load logo
  let logoDataUrl: string | null = null;
  try {
    const response = await fetch("/assets/nexzen-logo.png");
    const blob = await response.blob();
    logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.log("Logo not loaded, continuing without logo");
  }

  // Header with Logo and School Name
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 2;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margin + 2, yPos, 20, 20);
  }

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    admission.branch_name || "NEXZEN SCHOOL",
    logoDataUrl ? margin + 25 : pageWidth / 2,
    yPos + 8,
    { align: logoDataUrl ? "left" : "center" }
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT ADMISSION FORM", pageWidth / 2, yPos + 15, {
    align: "center",
  });

  yPos += 22;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Admission Info (Compact)
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(`Admission No: ${admission.admission_no}`, margin, yPos);
  doc.text(`Date: ${admission.admission_date}`, pageWidth / 2, yPos);
  doc.text(`A.Y: ${admission.academic_year}`, pageWidth - margin - 30, yPos);
  yPos += 6;

  // Two-column layout for compact design
  const col1 = margin;
  const col2 = pageWidth / 2;
  const labelWidth = 38;
  const lineHeight = 4.5;

  // STUDENT DETAILS
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("STUDENT DETAILS", margin + 1, yPos + 2);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.student_name, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Class:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.class_name, col2 + 15, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Gender:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.gender, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Date of Birth:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.dob, col2 + 25, yPos);
  yPos += 6;

  // FATHER/GUARDIAN
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("FATHER / GUARDIAN DETAILS", margin + 1, yPos + 2);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_name, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_occupation, col2 + 25, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_aadhar_no, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.father_or_guardian_mobile, col2 + 25, yPos);
  yPos += 6;

  // MOTHER/GUARDIAN
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("MOTHER / GUARDIAN DETAILS", margin + 1, yPos + 2);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Name:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_name, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Occupation:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_occupation, col2 + 25, yPos);
  yPos += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("Aadhar:", col1, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_aadhar_no, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Mobile:", col2, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(admission.mother_or_guardian_mobile, col2 + 25, yPos);
  yPos += 6;

  // ADDRESS
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("ADDRESS", margin + 1, yPos + 2);
  yPos += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Present:", col1, yPos);
  doc.setFont("helvetica", "normal");
  const presentLines = doc.splitTextToSize(admission.present_address, 75);
  doc.text(presentLines, col1 + labelWidth, yPos);

  doc.setFont("helvetica", "bold");
  doc.text("Permanent:", col2, yPos);
  doc.setFont("helvetica", "normal");
  const permanentLines = doc.splitTextToSize(admission.permanent_address, 75);
  doc.text(permanentLines, col2 + 25, yPos);
  yPos += Math.max(presentLines.length, permanentLines.length) * 4 + 4;

  // FEE STRUCTURE - Compact Table
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("FEE STRUCTURE", margin + 1, yPos + 2);
  yPos += 7;

  // Compact fee table
  const tableStartX = margin;
  const colW = [52, 28, 28, 38, 25];

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

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
  const fees = [
    [
      "Admission Fee",
      admission.admission_fee,
      "-",
      admission.admission_fee,
      admission.admission_fee_paid,
    ],
    [
      "Tuition Fee",
      admission.tuition_fee,
      admission.tuition_concession || "-",
      admission.payable_tuition_fee.split(" ")[0],
      "Pending",
    ],
    ["Book Fee", admission.book_fee, "-", admission.book_fee, "Pending"],
  ];

  if (admission.transport_required === "YES") {
    fees.push([
      "Transport Fee",
      admission.transport_fee,
      admission.transport_concession || "-",
      admission.payable_transport_fee.split(" ")[0],
      "Pending",
    ]);
  }

  fees.forEach((row) => {
    xP = tableStartX;
    row.forEach((cell, i) => {
      doc.rect(xP, yPos - 3, colW[i], 5);
      const text = i > 0 && i < 4 ? `₹${cell}` : cell;
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
    doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
    doc.text("TRANSPORT DETAILS", margin + 1, yPos + 2);
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
  yPos += 3;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 5, "F");
  doc.text("DECLARATION & SIGNATURES", margin + 1, yPos + 2);
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

  // Signature lines
  doc.setFont("helvetica", "bold");
  doc.line(margin + 10, yPos, margin + 60, yPos);
  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin - 10, yPos);
  yPos += 4;

  doc.setFontSize(7);
  doc.text("Parent/Guardian Signature", margin + 15, yPos);
  doc.text("School Authority", pageWidth - margin - 50, yPos);
  yPos += 4;

  doc.setFont("helvetica", "normal");
  doc.text("Date: ______________", margin + 15, yPos);
  doc.text("Date: ______________", pageWidth - margin - 50, yPos);

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
    `Admission_Form_${admission.admission_no}_${
      new Date().toISOString().split("T")[0]
    }.pdf`
  );
}
