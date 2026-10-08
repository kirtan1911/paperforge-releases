import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

export async function getPdfjsDocument(fileBytes: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  const cacheKey = fileBytes.byteLength + '-' + fileBytes[0] + '-' + fileBytes[fileBytes.byteLength - 1];
  if (pdfDocCache.has(cacheKey)) {
    return pdfDocCache.get(cacheKey)!;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: fileBytes.slice(),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  pdfDocCache.set(cacheKey, pdfDoc);
  return pdfDoc;
}

export async function renderPdfPageToCanvas(
  fileBytes: Uint8Array,
  pageIndex: number, // 0-based
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<void> {
  try {
    const pdfDoc = await getPdfjsDocument(fileBytes);
    const page = await pdfDoc.getPage(pageIndex + 1); // 1-based in PDF.js

    // High-DPI Retina Display Crisp Canvas Rendering
    const dpr = window.devicePixelRatio || 2;
    const viewport = page.getViewport({ scale: scale * dpr });
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Display size in CSS pixels
    canvas.style.width = `${viewport.width / dpr}px`;
    canvas.style.height = `${viewport.height / dpr}px`;

    context.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;
  } catch (err) {
    console.error(`Failed to render page ${pageIndex}:`, err);
  }
}

export interface ExtractedPdfText {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
  fontSize: number;
}

export async function extractPageTextItems(
  fileBytes: Uint8Array,
  pageIndex: number
): Promise<ExtractedPdfText[]> {
  try {
    const pdfDoc = await getPdfjsDocument(fileBytes);
    const page = await pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    const items: ExtractedPdfText[] = [];

    for (let i = 0; i < textContent.items.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = textContent.items[i] as any;
      if (!item.str || !item.str.trim()) continue;

      const tx = item.transform; // [scaleX, skewX, skewY, scaleY, translateX, translateY]
      const pdfX = tx[4];
      const pdfY = tx[5];
      const fontSize = Math.abs(tx[0] || tx[3] || item.height || 12);

      const relX = (pdfX / viewport.width) * 100;
      const relY = ((viewport.height - pdfY - fontSize) / viewport.height) * 100;

      items.push({
        id: `ext-text-${pageIndex}-${i}-${Date.now()}`,
        text: item.str,
        x: Math.max(0, Math.min(95, relX)),
        y: Math.max(0, Math.min(95, relY)),
        width: Math.max(5, ((item.width || 50) / viewport.width) * 100),
        height: Math.max(3, ((fontSize * 1.2) / viewport.height) * 100),
        fontSize: Math.max(10, Math.round(fontSize)),
      });
    }

    return items;
  } catch (err) {
    console.error('Failed to extract text from PDF page:', err);
    return [];
  }
}
