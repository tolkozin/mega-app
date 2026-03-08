import type React from "react";

export async function exportToPDF(
  elementRef: React.RefObject<HTMLElement | null>,
  filename: string
): Promise<void> {
  if (!elementRef.current) return;

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const element = elementRef.current;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const footerHeight = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - footerHeight;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;

  // Scale image to fit page width
  const scaledWidth = contentWidth;
  const scaledHeight = scaledWidth / ratio;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const totalPages = Math.ceil(scaledHeight / contentHeight);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    // Clip region for this page
    const srcY = (page * contentHeight * imgWidth) / scaledWidth;
    const srcHeight = (contentHeight * imgWidth) / scaledWidth;

    // Create a temporary canvas for the page slice
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = imgWidth;
    pageCanvas.height = Math.min(srcHeight, imgHeight - srcY);
    const ctx = pageCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(canvas, 0, -srcY);
    }
    const pageImgData = pageCanvas.toDataURL("image/png");

    const sliceHeight = (pageCanvas.height * scaledWidth) / imgWidth;
    pdf.addImage(pageImgData, "PNG", margin, margin, scaledWidth, sliceHeight);

    // Footer
    const footerY = pageHeight - margin - 2;
    pdf.setFontSize(7);
    pdf.setTextColor(130, 130, 165);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(
      `Generated on ${date} | Confidential`,
      margin,
      footerY
    );
    pdf.text(
      `${page + 1} / ${totalPages}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
