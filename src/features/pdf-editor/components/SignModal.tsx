import React, { useState, useRef, useEffect } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';

interface SignModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignModal({ isOpen, onClose }: SignModalProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'draw' | 'upload'>('type');
  const [typedName, setTypedName] = useState('PaperForge User');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { addImageOverlay, addTextAnnotation } = usePdfStore();

  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#14161B';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [activeTab]);

  if (!isOpen) return null;

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const handleStopDraw = () => {
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleInsertSignature = () => {
    if (activeTab === 'type') {
      if (typedName.trim()) {
        addTextAnnotation({
          text: typedName.trim(),
          x: 40,
          y: 60,
          fontSize: 22,
          fontFamily: 'cursive',
          color: '#14161B',
        });
      }
    } else if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        addImageOverlay({
          dataUrl,
          x: 40,
          y: 60,
          width: 25,
          height: 12,
        });
      }
    }
    onClose();
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addImageOverlay({
          dataUrl: reader.result,
          x: 40,
          y: 60,
          width: 25,
          height: 12,
        });
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14161B] text-[#F6F3EC] border border-[#E5681A]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-lg font-bold text-[#E5681A] flex items-center gap-2">
            ✍️ Add Signature
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold min-h-[36px] min-w-[36px]"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#F6F3EC]/10 rounded-xl p-1 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('type')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'type' ? 'bg-[#E5681A] text-white shadow' : 'hover:bg-white/10'
            }`}
          >
            ⌨️ Type Name
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'draw' ? 'bg-[#E5681A] text-white shadow' : 'hover:bg-white/10'
            }`}
          >
            ✏️ Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'upload' ? 'bg-[#E5681A] text-white shadow' : 'hover:bg-white/10'
            }`}
          >
            📁 Upload Image
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'type' && (
          <div className="space-y-3">
            <label className="block text-xs text-gray-300">Type your full name:</label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full bg-[#F6F3EC] text-[#14161B] p-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#E5681A]"
              placeholder="e.g. John Doe"
            />
            <div className="p-4 bg-white text-[#14161B] rounded-xl text-center shadow-inner">
              <span className="text-2xl italic font-serif tracking-wide">{typedName || 'Signature Preview'}</span>
            </div>
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>Draw your signature below:</span>
              <button
                type="button"
                onClick={handleClearCanvas}
                className="text-red-400 hover:text-red-300 underline"
              >
                Clear Pad
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={420}
              height={140}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleStopDraw}
              onMouseLeave={handleStopDraw}
              className="w-full h-36 bg-white rounded-xl border-2 border-dashed border-[#E5681A]/40 cursor-crosshair block"
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-3 text-center py-4">
            <p className="text-xs text-gray-300">Select a PNG or JPG signature file:</p>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleUploadImage}
              className="hidden"
              id="signature-upload-input"
            />
            <label
              htmlFor="signature-upload-input"
              className="inline-flex items-center gap-2 bg-[#E5681A] text-[#F6F3EC] px-6 py-3 rounded-xl font-semibold text-xs cursor-pointer hover:opacity-90 min-h-[44px]"
            >
              📁 Choose Signature File
            </label>
          </div>
        )}

        {/* Footer Actions */}
        {activeTab !== 'upload' && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertSignature}
              style={{ backgroundColor: '#E5681A', color: '#F6F3EC' }}
              className="px-6 py-2 text-xs font-semibold rounded-lg min-h-[44px]"
            >
              Insert Signature
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
