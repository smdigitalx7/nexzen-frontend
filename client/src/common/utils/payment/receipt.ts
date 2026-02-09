/**
 * Opens a receipt PDF blob URL in a new tab with:
 * - Tab title = receipt number (or "Receipt")
 * - A download link so saving uses filename "{receiptNo}.pdf"
 */
export function openReceiptInNewTab(blobUrl: string, title?: string | null): void {
  const tabTitle = (title && String(title).trim()) || "Receipt";
  const safeTitle = tabTitle.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fileName = `${tabTitle}.pdf`;
  const safeFileName = fileName.replace(/"/g, "&quot;");
  const html = `<!DOCTYPE html><html><head><title>${safeTitle}</title><style>body{margin:0;overflow:hidden;font-family:system-ui,sans-serif}.receipt-toolbar{position:fixed;left:0;top:0;right:0;height:40px;background:#1e293b;color:#fff;display:flex;align-items:center;padding:0 12px;gap:12px;z-index:9999}.receipt-toolbar a{color:#38bdf8;text-decoration:none;font-size:14px}.receipt-toolbar a:hover{text-decoration:underline}</style></head><body><div class="receipt-toolbar"><a href="${blobUrl}" download="${safeFileName}">Download ${safeTitle}.pdf</a></div><embed src="${blobUrl}" type="application/pdf" width="100%" height="100%" style="position:fixed;left:0;top:40px;width:100%;height:calc(100% - 40px);border:0"/></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
