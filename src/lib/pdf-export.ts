import type React from "react";

/**
 * Render a single element to a canvas via html2canvas.
 */
async function renderElement(
  html2canvas: (el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement>,
  el: HTMLElement,
  windowWidth: number,
) {
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth,
    windowHeight: el.scrollHeight,
  });
}

/**
 * Add a footer to the current PDF page.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addFooter(
  pdf: any,
  pageNum: number,
  totalPages: number,
  pageWidth: number,
  margin: number,
) {
  const footerY = 297 - margin - 2;
  pdf.setFontSize(7);
  pdf.setTextColor(130, 130, 165);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.text(`Generated on ${date} | Confidential`, margin, footerY);
  pdf.text(`${pageNum} / ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
}

/**
 * Export an element to PDF. If the element contains children with
 * `data-pdf-page` attributes, each section gets its own PDF page.
 * Otherwise falls back to slicing the full element across pages.
 */
export async function exportToPDF(
  elementRef: React.RefObject<HTMLElement | null>,
  filename: string,
): Promise<void> {
  if (!elementRef.current) return;

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const element = elementRef.current;

  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const footerHeight = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - footerHeight;

  // Check for section-based page breaks
  const sections = element.querySelectorAll("[data-pdf-page]");

  if (sections.length > 0) {
    // ── Section-based export: each [data-pdf-page] gets its own page ──
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const windowWidth = element.scrollWidth;

    // First: render the report header (everything before the first data-pdf-page)
    // We'll render the whole element as page 1, then overlay sections
    // Simpler approach: collect all section canvases first, then paginate

    const canvases: HTMLCanvasElement[] = [];

    // Render header section: clone the element, hide all data-pdf-page + Divider siblings
    // Instead, render each data-pdf-page section individually
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      const canvas = await renderElement(html2canvas, section, windowWidth);
      canvases.push(canvas);
    }

    // Also render the report header (the part before sections)
    // Find the first data-pdf-page and render everything above it
    const headerEl = element.querySelector("[data-pdf-page]");
    let headerCanvas: HTMLCanvasElement | null = null;
    if (headerEl) {
      // Create a wrapper with the header content
      const wrapper = document.createElement("div");
      wrapper.style.cssText = element.style.cssText;
      wrapper.style.padding = "40px 48px";
      wrapper.style.fontFamily = "'Lato', sans-serif";
      wrapper.style.color = "#1C1D21";
      wrapper.style.backgroundColor = "#ffffff";
      wrapper.style.width = `${element.offsetWidth}px`;

      // Copy header children (before the first data-pdf-page)
      let sibling = element.firstElementChild;
      while (sibling) {
        if (sibling.querySelector("[data-pdf-page]") || sibling.hasAttribute("data-pdf-page")) break;
        wrapper.appendChild(sibling.cloneNode(true));
        sibling = sibling.nextElementSibling;
      }

      if (wrapper.children.length > 0) {
        document.body.appendChild(wrapper);
        headerCanvas = await renderElement(html2canvas, wrapper, windowWidth);
        document.body.removeChild(wrapper);
      }
    }

    // Count total pages needed
    const allCanvases = headerCanvas ? [headerCanvas, ...canvases] : canvases;
    const totalPages = allCanvases.length;

    for (let i = 0; i < allCanvases.length; i++) {
      if (i > 0) pdf.addPage();
      const canvas = allCanvases[i];
      const imgData = canvas.toDataURL("image/png");
      const imgRatio = canvas.width / canvas.height;
      const scaledWidth = contentWidth;
      const scaledHeight = Math.min(scaledWidth / imgRatio, contentHeight);

      pdf.addImage(imgData, "PNG", margin, margin, scaledWidth, scaledHeight);
      addFooter(pdf, i + 1, totalPages, pageWidth, margin);
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return;
  }

  // ── Fallback: slice full element across pages ──
  const canvas = await renderElement(html2canvas, element, element.scrollWidth);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;
  const scaledWidth = contentWidth;
  const scaledHeight = scaledWidth / ratio;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const totalPages = Math.ceil(scaledHeight / contentHeight);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    const srcY = (page * contentHeight * imgWidth) / scaledWidth;
    const srcHeight = (contentHeight * imgWidth) / scaledWidth;

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
    addFooter(pdf, page + 1, totalPages, pageWidth, margin);
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
