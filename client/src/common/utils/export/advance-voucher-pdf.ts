import type { AdvanceRead } from "@/features/general/types/advances";
import { getExportFilename } from "./excel-export-utils";

interface AdvanceVoucherData {
  advance: AdvanceRead;
  employeeName: string;
  employeeSalary: number;
  branchName: string;
  appliedByUserName: string;
}

/**
 * Generate Advance Voucher PDF (Half A4 size)
 * Opens in a new tab for printing
 */
export const generateAdvanceVoucherPDF = async (data: AdvanceVoucherData): Promise<void> => {
  const {
    advance,
    employeeName,
    employeeSalary,
    branchName,
    appliedByUserName,
  } = data;

  const { default: jsPDF } = await import("jspdf");
  // Half A4 size in landscape: 148.5mm x 105mm (A4 is 210mm x 297mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [148.5, 105], // Half A4 landscape
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 148.5mm (landscape width)
  const pageHeight = doc.internal.pageSize.getHeight(); // 105mm (landscape height)
  const margin = 5;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin * 2.5;

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    options: {
      fontSize?: number;
      fontStyle?: "normal" | "bold" | "italic";
      align?: "left" | "center" | "right";
    } = {}
  ) => {
    const { fontSize = 9, fontStyle = "normal", align = "left" } = options;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    doc.text(text, x, y, { align });
  };

  // Helper function to draw line
  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lineWidth: number = 0.3
  ) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(lineWidth);
    doc.line(x1, y1, x2, y2);
  };

  // Helper function to format currency (Rs. instead of ₹, no extra spaces)
  const formatCurrency = (amount: number): string => {
    return `Rs.${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Draw border around the voucher
  drawLine(margin, margin, pageWidth - margin, margin, 0.5); // Top
  drawLine(margin, margin, margin, pageHeight - margin, 0.5); // Left
  drawLine(
    pageWidth - margin,
    margin,
    pageWidth - margin,
    pageHeight - margin,
    0.5
  ); // Right
  drawLine(
    margin,
    pageHeight - margin,
    pageWidth - margin,
    pageHeight - margin,
    0.5
  ); // Bottom

  yPosition += 2;

  // Branch Name
  addText(branchName.toUpperCase(), pageWidth / 2, yPosition, {
    fontSize: 18,
    fontStyle: "bold",
    align: "center",
  });

  yPosition += 6;

  // Voucher Title
  addText("ADVANCE VOUCHER", pageWidth / 2, yPosition, {
    fontSize: 10,
    fontStyle: "bold",
    align: "center",
  });

  yPosition += 4;

  // Draw header line
  drawLine(margin + 2, yPosition, pageWidth - margin - 2, yPosition, 0.4);
  yPosition += 3.5;

  // Voucher Details Section - All left-aligned single column
  const lineHeight = 4.5;
  const columnX = margin + 2;
  const labelWidth = 40;
  const valueX = columnX + labelWidth + 2;

  // Name of Applied Employee
  addText("Name of Employee:", columnX, yPosition, {
    fontSize: 8,
    fontStyle: "bold",
  });
  addText(employeeName, valueX, yPosition, { fontSize: 8 });
  yPosition += lineHeight;

  // Advance Amount
  addText("Advance Amount:", columnX, yPosition, {
    fontSize: 8,
    fontStyle: "bold",
  });
  addText(formatCurrency(advance.advance_amount), valueX, yPosition, {
    fontSize: 8,
  });
  yPosition += lineHeight;

  // Date
  addText("Date:", columnX, yPosition, { fontSize: 8, fontStyle: "bold" });
  addText(formatDate(advance.advance_date), valueX, yPosition, { fontSize: 8 });
  yPosition += lineHeight;

  // Employee Salary
  addText("Employee Salary:", columnX, yPosition, {
    fontSize: 8,
    fontStyle: "bold",
  });
  addText(formatCurrency(employeeSalary), valueX, yPosition, { fontSize: 8 });
  yPosition += lineHeight;

  // Applied By User
  addText("Applied By:", columnX, yPosition, {
    fontSize: 8,
    fontStyle: "bold",
  });
  addText(appliedByUserName, valueX, yPosition, { fontSize: 8 });
  yPosition += lineHeight;

  // Request Reason (if available) - spans full width
  if (advance.request_reason) {
    yPosition += 2;
    addText("Reason:", columnX, yPosition, {
      fontSize: 8,
      fontStyle: "bold",
    });
    const reasonLines = doc.splitTextToSize(
      advance.request_reason,
      contentWidth - labelWidth - 4
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(reasonLines, valueX, yPosition);
    yPosition += reasonLines.length * 3;
  }

  yPosition += 2;

  // Draw separator line before signatures
  drawLine(margin + 2, yPosition, pageWidth - margin - 2, yPosition, 0.3);
  yPosition += 4;

  // Footer Section - Signatures (side by side)
  const signatureLineY = pageHeight - margin - 15;
  const signatureLabelY = signatureLineY + 2.5;

  // Left Signature - Advance Requester
  const leftSignatureX = margin + 32;
  drawLine(
    leftSignatureX - 28,
    signatureLineY,
    leftSignatureX + 28,
    signatureLineY,
    0.3
  );
  addText("Advance Requester", leftSignatureX, signatureLabelY, {
    fontSize: 7,
    fontStyle: "bold",
    align: "center",
  });
  addText(employeeName, leftSignatureX, signatureLabelY + 3, {
    fontSize: 6.5,
    align: "center",
  });

  // Right Signature - Accountant
  const rightSignatureX = pageWidth - margin - 32;
  drawLine(
    rightSignatureX - 28,
    signatureLineY,
    rightSignatureX + 28,
    signatureLineY,
    0.3
  );
  addText("Accountant Signature", rightSignatureX, signatureLabelY, {
    fontSize: 7,
    fontStyle: "bold",
    align: "center",
  });

  // Generate PDF blob and open in new tab
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const newWindow = window.open(pdfUrl, "_blank");

  if (newWindow) {
    // Clean up URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  } else {
    // Fallback: Download if popup blocked
    doc.save(
      getExportFilename(`Advance_Voucher_${advance.advance_id}`, "pdf")
    );
  }
};
