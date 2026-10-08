import { create } from 'zustand';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  PdfDocumentState,
  PdfPageInfo,
  TextAnnotation,
  WhiteoutRect,
  ImageOverlay,
  SejdaToolType,
} from '../types';
import { extractPageTextItems } from '../lib/pdfRenderer';

interface ExtendedPdfDocumentState extends PdfDocumentState {
  zoomScale: number;
  selectedElementId: string | null;
  highlightColor?: string;
}

interface PdfStoreActions {
  loadPdfFile: (file: File) => Promise<void>;
  loadDemoPdf: () => Promise<void>;
  setSelectedPageIndex: (index: number) => void;
  setZoomScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setSelectedElementId: (id: string | null) => void;
  rotatePage: (pageIndex: number, angle: number) => void;
  deletePage: (pageIndex: number) => void;
  movePageUp: (pageIndex: number) => void;
  movePageDown: (pageIndex: number) => void;
  toggleEditMode: () => void;
  scanAndEditDocumentText: (pageIndex?: number) => Promise<void>;
  addTextAnnotation: (annotation: Omit<TextAnnotation, 'id'>) => void;
  updateTextAnnotation: (pageIndex: number, annotationId: string, text: string) => void;
  updateTextAnnotationStyle: (pageIndex: number, annotationId: string, updates: Partial<TextAnnotation>) => void;
  moveTextAnnotation: (pageIndex: number, annotationId: string, x: number, y: number) => void;
  addWhiteout: (whiteout: Omit<WhiteoutRect, 'id'>) => void;
  moveWhiteout: (pageIndex: number, whiteoutId: string, x: number, y: number) => void;
  addImageOverlay: (image: Omit<ImageOverlay, 'id'>) => void;
  moveImageOverlay: (pageIndex: number, imageId: string, x: number, y: number) => void;
  removeAnnotation: (pageIndex: number, id: string) => void;
  setActiveTool: (tool: SejdaToolType) => void;
  exportPdf: () => Promise<Uint8Array | null>;
  reset: () => void;
}

export const usePdfStore = create<ExtendedPdfDocumentState & PdfStoreActions>((set, get) => ({
  fileName: null,
  fileBytes: null,
  pages: [],
  selectedPageIndex: 0,
  isProcessing: false,
  isEditModeEnabled: true,
  activeTool: 'select',
  zoomScale: 1.3,
  selectedElementId: null,
  highlightColor: '#FFE082',

  loadPdfFile: async (file: File) => {
    try {
      set({ isProcessing: true });
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();

      const pagesInfo: PdfPageInfo[] = Array.from({ length: pageCount }).map((_, idx) => ({
        id: `page-${idx}-${Date.now()}`,
        pageIndex: idx,
        rotation: 0,
        textAnnotations: [],
        drawingPaths: [],
        whiteouts: [],
        images: [],
      }));

      set({
        fileName: file.name,
        fileBytes: bytes,
        pages: pagesInfo,
        selectedPageIndex: 0,
        selectedElementId: null,
        isProcessing: false,
      });

      // Scan page 0 text cleanly
      setTimeout(() => {
        get().scanAndEditDocumentText(0);
      }, 200);
    } catch (err) {
      console.error('Failed to load PDF file:', err);
      set({ isProcessing: false });
      alert('Could not parse PDF file. Please ensure it is a valid PDF document.');
    }
  },

  loadDemoPdf: async () => {
    try {
      set({ isProcessing: true });
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page1 = pdfDoc.addPage([595.28, 841.89]);
      page1.drawText('PaperForge Sample Document', {
        x: 50,
        y: 750,
        size: 24,
        font,
        color: rgb(0.08, 0.09, 0.11),
      });
      page1.drawText('This sample PDF was created client-side directly in your browser!', {
        x: 50,
        y: 710,
        size: 14,
        color: rgb(0.9, 0.41, 0.1),
      });

      const pdfBytes = await pdfDoc.save();
      const pagesInfo: PdfPageInfo[] = [
        {
          id: `page-0-${Date.now()}`,
          pageIndex: 0,
          rotation: 0,
          textAnnotations: [
            {
              id: 'text-demo-1',
              text: 'Click & Edit This PDF Text!',
              x: 10,
              y: 40,
              fontSize: 18,
              color: '#E5681A',
            },
          ],
          drawingPaths: [],
          whiteouts: [],
          images: [],
        },
      ];

      set({
        fileName: 'PaperForge-Sample.pdf',
        fileBytes: pdfBytes,
        pages: pagesInfo,
        selectedPageIndex: 0,
        selectedElementId: null,
        isProcessing: false,
      });
    } catch (err) {
      console.error('Failed to create demo PDF:', err);
      set({ isProcessing: false });
    }
  },

  setSelectedPageIndex: (index: number) => {
    set({ selectedPageIndex: index, selectedElementId: null });
  },

  setZoomScale: (scale: number) => {
    set({ zoomScale: Math.max(0.6, Math.min(2.5, scale)) });
  },

  zoomIn: () => {
    set({ zoomScale: Math.min(2.5, get().zoomScale + 0.2) });
  },

  zoomOut: () => {
    set({ zoomScale: Math.max(0.6, get().zoomScale - 0.2) });
  },

  resetZoom: () => {
    set({ zoomScale: 1.3 });
  },

  setSelectedElementId: (id: string | null) => {
    set({ selectedElementId: id });
  },

  rotatePage: (pageIndex: number, angle: number) => {
    const pages = [...get().pages];
    if (pages[pageIndex]) {
      const currentRotation = pages[pageIndex].rotation;
      pages[pageIndex] = {
        ...pages[pageIndex],
        rotation: (currentRotation + angle + 360) % 360,
      };
      set({ pages });
    }
  },

  deletePage: (pageIndex: number) => {
    const pages = get().pages.filter((_, idx) => idx !== pageIndex);
    const newSelectedIndex = Math.min(get().selectedPageIndex, Math.max(0, pages.length - 1));
    set({ pages, selectedPageIndex: newSelectedIndex, selectedElementId: null });
  },

  movePageUp: (pageIndex: number) => {
    if (pageIndex <= 0) return;
    const pages = [...get().pages];
    const temp = pages[pageIndex - 1];
    pages[pageIndex - 1] = pages[pageIndex];
    pages[pageIndex] = temp;
    set({ pages, selectedPageIndex: pageIndex - 1 });
  },

  movePageDown: (pageIndex: number) => {
    const pages = [...get().pages];
    if (pageIndex >= pages.length - 1) return;
    const temp = pages[pageIndex + 1];
    pages[pageIndex + 1] = pages[pageIndex];
    pages[pageIndex] = temp;
    set({ pages, selectedPageIndex: pageIndex + 1 });
  },

  toggleEditMode: () => {
    set({ isEditModeEnabled: !get().isEditModeEnabled, selectedElementId: null });
  },

  scanAndEditDocumentText: async (targetPageIndex?: number) => {
    const { fileBytes, pages, selectedPageIndex } = get();
    const idx = targetPageIndex ?? selectedPageIndex;
    if (!fileBytes || !pages[idx]) return;

    try {
      set({ isProcessing: true });
      const extractedItems = await extractPageTextItems(fileBytes, pages[idx].pageIndex);
      if (extractedItems.length === 0) {
        set({ isProcessing: false });
        return;
      }

      const existingAnnIds = new Set(pages[idx].textAnnotations.map((a) => a.id));
      const newWhiteouts: WhiteoutRect[] = [];
      const newTextAnnotations: TextAnnotation[] = [];

      for (const item of extractedItems) {
        const annId = `ann-${item.id}`;
        if (existingAnnIds.has(annId)) continue;

        newWhiteouts.push({
          id: `wo-${item.id}`,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
        });

        newTextAnnotations.push({
          id: annId,
          text: item.text,
          x: item.x,
          y: item.y,
          fontSize: item.fontSize,
          color: '#14161B',
        });
      }

      const updatedPages = [...pages];
      updatedPages[idx] = {
        ...updatedPages[idx],
        whiteouts: [...updatedPages[idx].whiteouts, ...newWhiteouts],
        textAnnotations: [...updatedPages[idx].textAnnotations, ...newTextAnnotations],
      };

      set({ pages: updatedPages, isProcessing: false });
    } catch (err) {
      console.error('Failed to extract and enable text:', err);
      set({ isProcessing: false });
    }
  },

  addTextAnnotation: (annotation: Omit<TextAnnotation, 'id'>) => {
    const { pages, selectedPageIndex } = get();
    if (!pages[selectedPageIndex]) return;

    const newId = `text-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newAnnotation: TextAnnotation = {
      ...annotation,
      id: newId,
    };

    const updatedPages = [...pages];
    updatedPages[selectedPageIndex] = {
      ...updatedPages[selectedPageIndex],
      textAnnotations: [...updatedPages[selectedPageIndex].textAnnotations, newAnnotation],
    };

    set({ pages: updatedPages, selectedElementId: newId });
  },

  updateTextAnnotation: (pageIndex: number, annotationId: string, text: string) => {
    const { pages } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      textAnnotations: updatedPages[pageIndex].textAnnotations.map((ann) =>
        ann.id === annotationId ? { ...ann, text } : ann
      ),
    };

    set({ pages: updatedPages });
  },

  updateTextAnnotationStyle: (
    pageIndex: number,
    annotationId: string,
    updates: Partial<TextAnnotation>
  ) => {
    const { pages } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      textAnnotations: updatedPages[pageIndex].textAnnotations.map((ann) =>
        ann.id === annotationId ? { ...ann, ...updates } : ann
      ),
    };

    set({ pages: updatedPages });
  },

  moveTextAnnotation: (pageIndex: number, annotationId: string, x: number, y: number) => {
    const { pages } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      textAnnotations: updatedPages[pageIndex].textAnnotations.map((ann) =>
        ann.id === annotationId ? { ...ann, x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)) } : ann
      ),
    };

    set({ pages: updatedPages });
  },

  addWhiteout: (whiteout: Omit<WhiteoutRect, 'id'>) => {
    const { pages, selectedPageIndex } = get();
    if (!pages[selectedPageIndex]) return;

    const newId = `whiteout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newWhiteout: WhiteoutRect = {
      ...whiteout,
      id: newId,
    };

    const updatedPages = [...pages];
    updatedPages[selectedPageIndex] = {
      ...updatedPages[selectedPageIndex],
      whiteouts: [...updatedPages[selectedPageIndex].whiteouts, newWhiteout],
    };

    set({ pages: updatedPages, selectedElementId: newId });
  },

  moveWhiteout: (pageIndex: number, whiteoutId: string, x: number, y: number) => {
    const { pages } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      whiteouts: updatedPages[pageIndex].whiteouts.map((wo) =>
        wo.id === whiteoutId ? { ...wo, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } : wo
      ),
    };

    set({ pages: updatedPages });
  },

  addImageOverlay: (image: Omit<ImageOverlay, 'id'>) => {
    const { pages, selectedPageIndex } = get();
    if (!pages[selectedPageIndex]) return;

    const newId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newImage: ImageOverlay = {
      ...image,
      id: newId,
    };

    const updatedPages = [...pages];
    updatedPages[selectedPageIndex] = {
      ...updatedPages[selectedPageIndex],
      images: [...updatedPages[selectedPageIndex].images, newImage],
    };

    set({ pages: updatedPages, selectedElementId: newId });
  },

  moveImageOverlay: (pageIndex: number, imageId: string, x: number, y: number) => {
    const { pages } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      images: updatedPages[pageIndex].images.map((img) =>
        img.id === imageId ? { ...img, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } : img
      ),
    };

    set({ pages: updatedPages });
  },

  removeAnnotation: (pageIndex: number, id: string) => {
    const { pages, selectedElementId } = get();
    if (!pages[pageIndex]) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      textAnnotations: updatedPages[pageIndex].textAnnotations.filter((a) => a.id !== id),
      whiteouts: updatedPages[pageIndex].whiteouts.filter((w) => w.id !== id),
      images: updatedPages[pageIndex].images.filter((i) => i.id !== id),
    };

    set({
      pages: updatedPages,
      selectedElementId: selectedElementId === id ? null : selectedElementId,
    });
  },

  setActiveTool: (tool: SejdaToolType) => {
    set({ activeTool: tool });
  },

  exportPdf: async () => {
    const { fileBytes, pages } = get();
    if (!fileBytes || pages.length === 0) return null;

    try {
      set({ isProcessing: true });
      const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const helveticaFont = await newDoc.embedFont(StandardFonts.Helvetica);

      for (const pageMeta of pages) {
        const [copiedPage] = await newDoc.copyPages(srcDoc, [pageMeta.pageIndex]);

        // Apply rotation
        const currentRotation = copiedPage.getRotation().angle;
        copiedPage.setRotation({
          angle: (currentRotation + pageMeta.rotation) % 360,
        } as unknown as import('pdf-lib').Rotation);

        const { width, height } = copiedPage.getSize();

        // 1. Draw Whiteout Eraser Masks
        for (const wo of pageMeta.whiteouts) {
          const woX = (wo.x / 100) * width;
          const woW = (wo.width / 100) * width;
          const woH = (wo.height / 100) * height;
          const woY = height - (wo.y / 100) * height - woH;

          copiedPage.drawRectangle({
            x: Math.max(0, woX),
            y: Math.max(0, woY),
            width: woW,
            height: woH,
            color: rgb(1, 1, 1),
          });
        }

        // 2. Draw Image overlays
        for (const imgOverlay of pageMeta.images) {
          try {
            let embeddedImg;
            if (imgOverlay.dataUrl.includes('image/png')) {
              embeddedImg = await newDoc.embedPng(imgOverlay.dataUrl);
            } else {
              embeddedImg = await newDoc.embedJpg(imgOverlay.dataUrl);
            }

            const imgX = (imgOverlay.x / 100) * width;
            const imgW = (imgOverlay.width / 100) * width;
            const imgH = (imgOverlay.height / 100) * height;
            const imgY = height - (imgOverlay.y / 100) * height - imgH;

            copiedPage.drawImage(embeddedImg, {
              x: Math.max(0, imgX),
              y: Math.max(0, imgY),
              width: imgW,
              height: imgH,
            });
          } catch (imgErr) {
            console.error('Failed to embed image in PDF:', imgErr);
          }
        }

        // 3. Draw Text annotations
        for (const textAnn of pageMeta.textAnnotations) {
          const pdfX = (textAnn.x / 100) * width;
          const pdfY = height - (textAnn.y / 100) * height;

          let r = 0,
            g = 0,
            b = 0;
          if (textAnn.color.startsWith('#') && textAnn.color.length === 7) {
            r = parseInt(textAnn.color.substring(1, 3), 16) / 255;
            g = parseInt(textAnn.color.substring(3, 5), 16) / 255;
            b = parseInt(textAnn.color.substring(5, 7), 16) / 255;
          }

          copiedPage.drawText(textAnn.text, {
            x: Math.max(10, pdfX),
            y: Math.max(10, pdfY),
            size: textAnn.fontSize,
            font: helveticaFont,
            color: rgb(r, g, b),
          });
        }

        newDoc.addPage(copiedPage);
      }

      const outputBytes = await newDoc.save();
      set({ isProcessing: false });
      return outputBytes;
    } catch (err) {
      console.error('Failed to export PDF:', err);
      set({ isProcessing: false });
      alert('Error saving PDF file.');
      return null;
    }
  },

  reset: () => {
    set({
      fileName: null,
      fileBytes: null,
      pages: [],
      selectedPageIndex: 0,
      isProcessing: false,
      isEditModeEnabled: true,
      activeTool: 'select',
      zoomScale: 1.3,
      selectedElementId: null,
    });
  },
}));
