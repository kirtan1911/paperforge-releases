import { useState } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';

export function SejdaBottomBar() {
  const { fileName, pages, selectedPageIndex, exportPdf, isProcessing } = usePdfStore();
  const [customFilename, setCustomFilename] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleOpenExport = () => {
    const defaultName = fileName ? fileName.replace(/\.pdf$/i, '') + '-edited.pdf' : 'Sejda-PaperForge.pdf';
    setCustomFilename(defaultName);
    setShowModal(true);
  };

  const handleDownload = async () => {
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
    setShowModal(false);
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#14161B]/95 backdrop-blur-md text-[#F6F3EC] px-6 py-3 rounded-full shadow-2xl border border-white/20 flex items-center gap-4 max-w-lg w-[90%] sm:w-auto justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>
            Page {selectedPageIndex + 1} of {pages.length}
          </span>
        </div>

        <button
          type="button"
          disabled={isProcessing}
          onClick={handleOpenExport}
          style={{ backgroundColor: '#2E7D32', color: '#FFFFFF', minHeight: '44px' }}
          className="px-6 py-2.5 rounded-full font-black text-xs shadow-lg hover:bg-[#1B5E20] transition-all cursor-pointer inline-flex items-center gap-2 uppercase tracking-wide"
        >
          <span>{isProcessing ? 'Processing...' : '✅ Apply Changes'}</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161B] border border-[#E5681A]/40 text-[#F6F3EC] p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#E5681A]">Your document is ready!</h3>
            <p className="text-xs text-gray-300">Enter your filename below to download:</p>
            <div>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder="Sejda-PaperForge-Edited.pdf"
                className="w-full bg-[#F6F3EC] text-[#14161B] p-3 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#E5681A]"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleDownload}
                style={{ backgroundColor: '#2E7D32', color: '#FFFFFF' }}
                className="px-6 py-2.5 text-xs font-bold rounded-lg min-h-[44px] flex items-center gap-2 uppercase"
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
