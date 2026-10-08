import React, { useState, useRef } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';
import { SignModal } from './SignModal';
import { SejdaToolType } from '../types';

export function SejdaToolbar() {
  const {
    fileName,
    pages,
    selectedPageIndex,
    rotatePage,
    deletePage,
    activeTool,
    setActiveTool,
    zoomScale,
    zoomIn,
    zoomOut,
    resetZoom,
    addTextAnnotation,
    addWhiteout,
    addImageOverlay,
    exportPdf,
    reset,
    isProcessing,
  } = usePdfStore();

  const [showSignModal, setShowSignModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#14161B');
  const [fontSize, setFontSize] = useState(16);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const tools: Array<{ id: SejdaToolType; label: string; icon: string }> = [
    { id: 'text', label: 'Text', icon: '✍️' },
    { id: 'sign', label: 'Sign', icon: '🖊️' },
    { id: 'whiteout', label: 'Whiteout', icon: '⬜' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'annotate', label: 'Annotate', icon: '🖍️' },
    { id: 'select', label: 'Select', icon: '✋' },
  ];

  const handleSelectTool = (toolId: SejdaToolType) => {
    setActiveTool(toolId);
    if (toolId === 'sign') {
      setShowSignModal(true);
    } else if (toolId === 'text') {
      setShowTextModal(true);
    } else if (toolId === 'whiteout') {
      addWhiteout({ x: 30, y: 40, width: 40, height: 15 });
    } else if (toolId === 'images') {
      imageInputRef.current?.click();
    }
  };

  const handleAddText = () => {
    if (!textInput.trim()) return;
    addTextAnnotation({
      text: textInput.trim(),
      x: 35,
      y: 45,
      fontSize,
      color: textColor,
    });
    setTextInput('');
    setShowTextModal(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addImageOverlay({
          dataUrl: reader.result,
          x: 35,
          y: 35,
          width: 30,
          height: 30,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenExportModal = () => {
    const defaultName = fileName ? fileName.replace(/\.pdf$/i, '') + '-edited.pdf' : 'Sejda-PaperForge.pdf';
    setCustomFilename(defaultName);
    setShowExportModal(true);
  };

  const handleSaveWithCustomFilename = async () => {
    const bytes = await exportPdf();
    if (!bytes) return;

    let finalName = customFilename.trim();
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }

    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <>
      <div className="w-full bg-[#14161B] text-[#F6F3EC] p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sticky top-2 z-30 border border-[#E5681A]/30">
        {/* Document Info */}
        <div className="flex items-center gap-2 overflow-hidden border-b md:border-b-0 border-white/10 pb-2 md:pb-0">
          <span className="text-sm font-bold text-[#E5681A] truncate max-w-[150px] sm:max-w-[200px]">
            {fileName ?? 'Document'}
          </span>
          <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-gray-300">
            Page {selectedPageIndex + 1} of {pages.length}
          </span>
        </div>

        {/* Sejda Icon Tools Switcher */}
        <div className="flex flex-wrap items-center bg-white/10 p-1 rounded-xl gap-1">
          {tools.map((t) => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTool(t.id)}
                style={{
                  backgroundColor: isActive ? '#E5681A' : 'transparent',
                  color: '#F6F3EC',
                  minHeight: '44px',
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-white/10 min-h-[44px]"
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageFileChange}
            className="hidden"
          />
        </div>

        {/* Zoom & Page Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Zoom */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={zoomOut}
              title="Zoom Out"
              className="p-2 hover:bg-white/20 rounded text-xs font-bold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ➖
            </button>
            <button
              type="button"
              onClick={resetZoom}
              title="Reset Zoom"
              className="px-2 py-1 hover:bg-white/20 text-[11px] font-mono cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {Math.round(zoomScale * 77)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              title="Zoom In"
              className="p-2 hover:bg-white/20 rounded text-xs font-bold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ➕
            </button>
          </div>

          {/* Page Actions */}
          <div className="flex items-center bg-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => rotatePage(selectedPageIndex, 90)}
              title="Rotate Page"
              className="p-2 hover:bg-white/20 rounded text-xs font-semibold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              🔄
            </button>
            <button
              type="button"
              disabled={pages.length <= 1}
              onClick={() => deletePage(selectedPageIndex)}
              title="Delete Page"
              className="p-2 hover:bg-red-600/80 rounded text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center text-red-300"
            >
              🗑️
            </button>
          </div>

          {/* Sejda Style Green/Orange Apply Changes Main Action */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleOpenExportModal}
            style={{ backgroundColor: '#2E7D32', color: '#FFFFFF', minHeight: '44px' }}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg hover:bg-[#1B5E20] transition-all cursor-pointer min-h-[44px] inline-flex items-center gap-1.5 uppercase tracking-wide"
          >
            <span>{isProcessing ? 'Processing...' : '✅ Apply Changes'}</span>
          </button>

          <button
            type="button"
            onClick={reset}
            title="Close Document"
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Signature Modal */}
      <SignModal isOpen={showSignModal} onClose={() => setShowSignModal(false)} />

      {/* Add Text Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161B] border border-[#E5681A]/40 text-[#F6F3EC] p-5 sm:p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#E5681A]">Add Text to Page</h3>
            <div>
              <label htmlFor="pdf-text-input" className="block text-xs text-gray-300 mb-1">
                Enter text:
              </label>
              <input
                id="pdf-text-input"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Approved / Confirmed"
                className="w-full bg-[#F6F3EC] text-[#14161B] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E5681A]"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="text-font-size" className="block text-xs text-gray-300 mb-1">
                  Font Size: {fontSize}px
                </label>
                <input
                  id="text-font-size"
                  type="range"
                  min="10"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="text-color" className="block text-xs text-gray-300 mb-1">
                  Color:
                </label>
                <input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-9 p-0 rounded cursor-pointer border-0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTextModal(false)}
                className="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddText}
                style={{ backgroundColor: '#E5681A', color: '#F6F3EC' }}
                className="px-5 py-2 text-xs font-semibold rounded-lg min-h-[44px]"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export with Custom Filename Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161B] border border-[#E5681A]/40 text-[#F6F3EC] p-5 sm:p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#E5681A]">Export PDF File</h3>
            <div>
              <label htmlFor="custom-filename-input" className="block text-xs text-gray-300 mb-1">
                Custom Filename:
              </label>
              <input
                id="custom-filename-input"
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="My-Edited-Document.pdf"
                className="w-full bg-[#F6F3EC] text-[#14161B] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E5681A] font-medium text-sm"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSaveWithCustomFilename}
                style={{ backgroundColor: '#2E7D32', color: '#FFFFFF' }}
                className="px-6 py-2 text-xs font-bold rounded-lg min-h-[44px] flex items-center gap-2 uppercase"
              >
                {isProcessing ? 'Processing PDF...' : '📥 Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
