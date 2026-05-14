import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function hasVisibleContent(page) {
  return Boolean(page?.innerText?.trim());
}

export async function exportResumePdf(element, fileName) {
  if (!element) {
    throw new Error('未找到简历预览内容');
  }

  element.classList.add('exporting-pdf');

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const pages = Array.from(element.querySelectorAll('.resume-page')).filter(hasVisibleContent);
    const targets = pages.length ? pages : [element];

    for (const [index, page] of targets.entries()) {
      const canvas = await html2canvas(page, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        scrollX: 0,
        scrollY: 0,
      });

      if (index > 0) {
        pdf.addPage();
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }

    pdf.save(fileName);
  } finally {
    element.classList.remove('exporting-pdf');
  }
}
