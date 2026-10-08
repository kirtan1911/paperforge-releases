import { useEffect, useRef, useState } from 'react';
import { renderPdfPageToCanvas } from '../lib/pdfRenderer';

interface PdfCanvasPageProps {
  fileBytes: Uint8Array;
  pageIndex: number;
  rotation?: number;
  scale?: number;
  className?: string;
}

export function PdfCanvasPage({
  fileBytes,
  pageIndex,
  rotation = 0,
  scale = 1.3,
  className = '',
}: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (canvasRef.current && fileBytes) {
      setIsLoading(true);
      renderPdfPageToCanvas(fileBytes, pageIndex, canvasRef.current, scale)
        .then(() => {
          if (isMounted) setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [fileBytes, pageIndex, scale]);

  return (
    <div className={`relative inline-block transition-transform duration-200 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100/90 backdrop-blur-xs flex items-center justify-center text-xs text-[#E5681A] font-semibold z-10 rounded">
          <span className="animate-pulse">Loading HD View...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ transform: `rotate(${rotation}deg)` }}
        className="max-w-full h-auto shadow-md rounded border border-gray-200 block transition-transform duration-200 bg-white"
      />
    </div>
  );
}
