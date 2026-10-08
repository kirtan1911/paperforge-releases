export interface TextAnnotation {
  id: string;
  text: string;
  x: number; // percentage X (0-100)
  y: number; // percentage Y (0-100)
  fontSize: number;
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

export interface HighlightAnnotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface ShapeAnnotation {
  id: string;
  type: 'rectangle' | 'ellipse';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
}

export interface WhiteoutRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageOverlay {
  id: string;
  dataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfPageInfo {
  id: string;
  pageIndex: number;
  rotation: number;
  textAnnotations: TextAnnotation[];
  drawingPaths?: DrawingPath[];
  highlights?: HighlightAnnotation[];
  shapes?: ShapeAnnotation[];
  whiteouts: WhiteoutRect[];
  images: ImageOverlay[];
}

export type SejdaToolType =
  | 'text'
  | 'links'
  | 'forms'
  | 'images'
  | 'sign'
  | 'whiteout'
  | 'annotate'
  | 'shapes'
  | 'select'
  | 'draw';

export interface PdfDocumentState {
  fileName: string | null;
  fileBytes: Uint8Array | null;
  pages: PdfPageInfo[];
  selectedPageIndex: number;
  isProcessing: boolean;
  isEditModeEnabled: boolean;
  activeTool: SejdaToolType;
  zoomScale: number;
  selectedElementId: string | null;
  highlightColor?: string;
}
