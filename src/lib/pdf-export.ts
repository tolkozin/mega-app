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
  const footerY = 297 - 6;
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
 * Slice a canvas into page-sized chunks and return them.
 */
function sliceCanvas(
  canvas: HTMLCanvasElement,
  scaledWidth: number,
  contentHeight: number,
): { imgData: string; height: number }[] {
  const imgRatio = canvas.width / canvas.height;
  const scaledHeight = scaledWidth / imgRatio;

  if (scaledHeight <= contentHeight) {
    return [{ imgData: canvas.toDataURL("image/png"), height: scaledHeight }];
  }

  // Need to slice across multiple pages
  const pages: { imgData: string; height: number }[] = [];
  const totalSlices = Math.ceil(scaledHeight / contentHeight);

  for (let s = 0; s < totalSlices; s++) {
    const srcY = Math.round((s * contentHeight * canvas.width) / scaledWidth);
    const srcHeight = Math.round((contentHeight * canvas.width) / scaledWidth);
    const actualSrcHeight = Math.min(srcHeight, canvas.height - srcY);

    if (actualSrcHeight <= 0) break;

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = actualSrcHeight;
    const ctx = sliceCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(
        canvas,
        0, srcY, canvas.width, actualSrcHeight,
        0, 0, canvas.width, actualSrcHeight,
      );
    }
    const sliceHeight = (actualSrcHeight * scaledWidth) / canvas.width;
    pages.push({ imgData: sliceCanvas.toDataURL("image/png"), height: sliceHeight });
  }

  return pages;
}

/**
 * Export an element to PDF. If the element contains children with
 * `data-pdf-page` attributes, each section is rendered and properly
 * paginated. Otherwise falls back to slicing the full element.
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
  const margin = 10;
  const footerHeight = 8;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2 - footerHeight;

  // Use a fixed render width for consistent output
  const renderWidth = element.scrollWidth;

  // Check for section-based page breaks
  const sections = element.querySelectorAll("[data-pdf-page]");

  if (sections.length > 0) {
    // ── Section-based export ──

    // 1. Render header (everything before first data-pdf-page)
    const headerEl = element.querySelector("[data-pdf-page]");
    let headerCanvas: HTMLCanvasElement | null = null;
    if (headerEl) {
      const wrapper = document.createElement("div");
      wrapper.style.width = `${element.offsetWidth}px`;
      wrapper.style.padding = "32px 40px";
      wrapper.style.fontFamily = "'Lato', sans-serif";
      wrapper.style.color = "#1C1D21";
      wrapper.style.backgroundColor = "#ffffff";

      let sibling = element.firstElementChild;
      while (sibling) {
        if (sibling.querySelector("[data-pdf-page]") || sibling.hasAttribute("data-pdf-page")) break;
        wrapper.appendChild(sibling.cloneNode(true));
        sibling = sibling.nextElementSibling;
      }

      if (wrapper.children.length > 0) {
        document.body.appendChild(wrapper);
        headerCanvas = await renderElement(html2canvas, wrapper, renderWidth);
        document.body.removeChild(wrapper);
      }
    }

    // 2. Render all sections
    const sectionCanvases: HTMLCanvasElement[] = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      const canvas = await renderElement(html2canvas, section, renderWidth);
      sectionCanvases.push(canvas);
    }

    // 3. Build pages — slice sections that are too tall
    const allCanvases = headerCanvas ? [headerCanvas, ...sectionCanvases] : sectionCanvases;
    const allSlices: { imgData: string; height: number }[] = [];

    for (const canvas of allCanvases) {
      const slices = sliceCanvas(canvas, contentWidth, contentHeight);
      allSlices.push(...slices);
    }

    // 4. Write to PDF
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const totalPages = allSlices.length;

    for (let i = 0; i < allSlices.length; i++) {
      if (i > 0) pdf.addPage();
      const { imgData, height } = allSlices[i];
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, height);
      addFooter(pdf, i + 1, totalPages, pageWidth, margin);
    }

    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
    return;
  }

  // ── Fallback: slice full element across pages ──
  const canvas = await renderElement(html2canvas, element, element.scrollWidth);
  const slices = sliceCanvas(canvas, contentWidth, contentHeight);

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const totalPages = slices.length;

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();
    const { imgData, height } = slices[i];
    pdf.addImage(imgData, "PNG", margin, margin, contentWidth, height);
    addFooter(pdf, i + 1, totalPages, pageWidth, margin);
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
