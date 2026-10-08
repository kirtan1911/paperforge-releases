import React, { useRef } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';

export function PdfUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loadPdfFile, loadDemoPdf, isProcessing } = usePdfStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      loadPdfFile(file);
    } else if (file) {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      loadPdfFile(file);
    } else if (file) {
      alert('Please drop a valid PDF file.');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white/90 backdrop-blur rounded-2xl border-2 border-dashed border-[#14161B]/20 shadow-lg transition-all hover:border-[#E5681A]">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center text-center space-y-4 py-6"
      >
        <div className="w-16 h-16 rounded-full bg-[#E5681A]/10 text-[#E5681A] flex items-center justify-center text-2xl font-bold">
          📄
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#14161B]">
            Drop your PDF file here
          </h2>
          <p className="text-sm text-[#14161B]/70 mt-1">
            Edit, rotate, reorder, delete pages, and add annotations 100% in your browser.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-file-input"
        />

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            style={{ backgroundColor: '#E5681A', color: '#F6F3EC', minHeight: '44px' }}
            className="px-6 py-3 rounded-xl font-semibold shadow hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base"
          >
            {isProcessing ? 'Processing...' : '📁 Select PDF File'}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => loadDemoPdf()}
            style={{ backgroundColor: '#14161B', color: '#F6F3EC', minHeight: '44px' }}
            className="px-5 py-3 rounded-xl font-semibold shadow hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2 text-sm sm:text-base"
          >
            ✨ Try Demo Document
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#14161B]/60 pt-4 border-t border-[#14161B]/10 w-full justify-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          <span>🔒 100% Private — Files stay in your browser. No server upload.</span>
        </div>
      </div>
    </div>
  );
}
