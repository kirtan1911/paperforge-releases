import React, { useState, useRef } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';

export function PdfToolbar() {
  const {
    fileName,
    pages,
    selectedPageIndex,
    rotatePage,
    deletePage,
    movePageUp,
    movePageDown,
    isEditModeEnabled,
    toggleEditMode,
    zoomScale,
    zoomIn,
    zoomOut,
    resetZoom,
    scanAndEditDocumentText,
    setActiveTool,
    addTextAnnotation,
    addWhiteout,
    addImageOverlay,
    exportPdf,
    reset,
    isProcessing,
  } = usePdfStore();

  const [textInput, setTextInput] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [customFilename, setCustomFilename] = useState('');
  const [textColor, setTextColor] = useState('#E5681A');
  const [fontSize, setFontSize] = useState(16);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleOpenExportModal = () => {
    const defaultName = fileName ? fileName.replace(/\.pdf$/i, '') + '-edited.pdf' : 'PaperForge-Document.pdf';
    setCustomFilename(defaultName);
    setShowExportModal(true);
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

  const handleAddWhiteout = () => {
    addWhiteout({
      x: 30,
      y: 40,
      width: 40,
      height: 15,
    });
    setActiveTool('select');
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
    <div className="w-full bg-[#14161B]/95 backdrop-blur-md text-[#F6F3EC] p-3 sm:p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sticky top-2 z-30 border border-white/10">
      {/* Top File Meta & Edit Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 overflow-hidden border-b md:border-b-0 border-[#F6F3EC]/10 pb-2 md:pb-0">
        <div className="flex items-center gap-2 max-w-full">
          <span className="text-sm sm:text-base font-bold text-[#E5681A] truncate max-w-[140px] sm:max-w-[200px]">
            {fileName ?? 'Document'}
          </span>
          <span className="text-[11px] bg-[#F6F3EC]/10 px-2 py-0.5 rounded text-gray-300">
            {selectedPageIndex + 1}/{pages.length}
          </span>
        </div>

        {/* Enable Edit Mode Main Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleEditMode}
            style={{
              backgroundColor: isEditModeEnabled ? '#E5681A' : 'rgba(246, 243, 236, 0.15)',
              color: '#F6F3EC',
              minHeight: '44px',
            }}
            className="px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 min-h-[44px]"
          >
            <span>{isEditModeEnabled ? '✏️ Edit Mode ON' : '👁️ View Only'}</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => scanAndEditDocumentText()}
            title="Scan & make all PDF text clickable & editable"
            className="px-3 py-2 bg-[#F6F3EC]/15 hover:bg-[#F6F3EC]/25 text-[#F6F3EC] rounded-lg text-xs font-semibold cursor-pointer min-h-[44px] flex items-center gap-1"
          >
            <span>🔍 Scan Text</span>
          </button>
        </div>
      </div>

      {/* Editing & Zoom Toolbar Tools */}
      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center bg-[#F6F3EC]/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom Out (-)"
            className="p-2 hover:bg-[#F6F3EC]/20 rounded text-xs font-bold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ➖
          </button>
          <button
            type="button"
            onClick={resetZoom}
            title="Reset Zoom (100%)"
            className="px-2 py-1 hover:bg-[#F6F3EC]/20 text-[11px] font-mono cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            {Math.round(zoomScale * 77)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            title="Zoom In (+)"
            className="p-2 hover:bg-[#F6F3EC]/20 rounded text-xs font-bold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ➕
          </button>
        </div>

        {/* Page Rotation */}
        <div className="flex items-center bg-[#F6F3EC]/10 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => rotatePage(selectedPageIndex, -90)}
            title="Rotate Left (-90°)"
            className="p-2 hover:bg-[#F6F3EC]/20 rounded text-xs font-semibold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            🔄 -90°
          </button>
          <button
            type="button"
            onClick={() => rotatePage(selectedPageIndex, 90)}
            title="Rotate Right (+90°)"
            className="p-2 hover:bg-[#F6F3EC]/20 rounded text-xs font-semibold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            🔄 +90°
          </button>
        </div>

        {/* Page Order */}
        <div className="flex items-center bg-[#F6F3EC]/10 rounded-lg p-0.5">
          <button
            type="button"
            disabled={selectedPageIndex === 0}
            onClick={() => movePageUp(selectedPageIndex)}
            title="Move Page Up"
            className="p-2 hover:bg-[#F6F3EC]/20 disabled:opacity-40 rounded text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ⬆️
          </button>
          <button
            type="button"
            disabled={selectedPageIndex >= pages.length - 1}
            onClick={() => movePageDown(selectedPageIndex)}
            title="Move Page Down"
            className="p-2 hover:bg-[#F6F3EC]/20 disabled:opacity-40 rounded text-xs cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            ⬇️
          </button>
        </div>

        {/* Delete Page */}
        <button
          type="button"
          disabled={pages.length <= 1}
          onClick={() => deletePage(selectedPageIndex)}
          title="Delete Selected Page"
          className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium cursor-pointer disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          🗑️
        </button>

        {/* Add Annotations (Only enabled when Edit Mode is ON) */}
        {isEditModeEnabled && (
          <div className="flex flex-wrap items-center bg-[#F6F3EC]/10 rounded-lg p-0.5 gap-1">
            <button
              type="button"
              onClick={() => setShowTextModal(true)}
              className="px-3 py-2 text-xs font-semibold rounded cursor-pointer hover:bg-[#F6F3EC]/20 min-h-[44px] flex items-center gap-1"
            >
              ✍️ Text
            </button>

            <button
              type="button"
              onClick={handleAddWhiteout}
              className="px-3 py-2 text-xs font-semibold rounded cursor-pointer hover:bg-[#F6F3EC]/20 min-h-[44px] flex items-center gap-1"
              title="Cover or Erase Image/Text"
            >
              ⬜ Mask
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="px-3 py-2 text-xs font-semibold rounded cursor-pointer hover:bg-[#F6F3EC]/20 min-h-[44px] flex items-center gap-1"
              title="Add Image or Signature"
            >
              🖼️ Image
            </button>
          </div>
        )}

        {/* Export with Custom Filename */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleOpenExportModal}
          style={{ backgroundColor: '#E5681A', color: '#F6F3EC', minHeight: '44px' }}
          className="px-4 py-2 rounded-lg font-semibold text-xs shadow hover:opacity-90 transition-all cursor-pointer min-h-[44px] inline-flex items-center gap-1"
        >
          📥 Export
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
                style={{ backgroundColor: '#E5681A', color: '#F6F3EC' }}
                className="px-6 py-2 text-xs font-semibold rounded-lg min-h-[44px] flex items-center gap-2"
              >
                {isProcessing ? 'Saving PDF...' : '📥 Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
