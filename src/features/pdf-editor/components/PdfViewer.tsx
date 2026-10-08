import React, { useState, useRef } from 'react';
import { usePdfStore } from '../hooks/usePdfStore';
import { PdfCanvasPage } from './PdfCanvasPage';

export function PdfViewer() {
  const {
    fileBytes,
    pages,
    selectedPageIndex,
    setSelectedPageIndex,
    isEditModeEnabled,
    zoomScale,
    selectedElementId,
    setSelectedElementId,
    removeAnnotation,
    updateTextAnnotation,
    updateTextAnnotationStyle,
    moveTextAnnotation,
    moveWhiteout,
    moveImageOverlay,
  } = usePdfStore();

  const selectedPage = pages[selectedPageIndex];
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editTextVal, setEditTextVal] = useState('');
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    type: 'text' | 'whiteout' | 'image';
  } | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);

  if (!selectedPage || !fileBytes) {
    return null;
  }

  const handleStartTextEdit = (id: string, currentText: string) => {
    if (!isEditModeEnabled) return;
    setEditingTextId(id);
    setEditTextVal(currentText);
    setSelectedElementId(id);
  };

  const handleSaveTextEdit = (id: string) => {
    if (editTextVal.trim()) {
      updateTextAnnotation(selectedPageIndex, id, editTextVal.trim());
    }
    setEditingTextId(null);
  };

  const handleKeyDownTextEdit = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveTextEdit(id);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (id: string, type: 'text' | 'whiteout' | 'image') => {
    if (!isEditModeEnabled) return;
    setSelectedElementId(id);
    setDraggingItem({ id, type });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!draggingItem || !pageContainerRef.current) return;

    const rect = pageContainerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((clientY - rect.top) / rect.height) * 100;

    const posX = Math.max(0, Math.min(92, relX));
    const posY = Math.max(0, Math.min(95, relY));

    if (draggingItem.type === 'text') {
      moveTextAnnotation(selectedPageIndex, draggingItem.id, posX, posY);
    } else if (draggingItem.type === 'whiteout') {
      moveWhiteout(selectedPageIndex, draggingItem.id, posX, posY);
    } else if (draggingItem.type === 'image') {
      moveImageOverlay(selectedPageIndex, draggingItem.id, posX, posY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingItem) {
      handleDragMove(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingItem && e.touches[0]) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  return (
    <div
      className="w-full flex flex-col md:flex-row gap-4 sm:gap-6 my-2 sm:my-4 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Sidebar Page Thumbnails (Responsive Horizontal on Mobile, Vertical on Desktop) */}
      <aside className="w-full md:w-60 flex md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-y-auto max-h-[160px] md:max-h-[700px] p-2 sm:p-3 bg-white/80 rounded-xl border border-[#14161B]/10 shadow-xs shrink-0">
        <h3 className="text-[11px] font-bold text-[#14161B] uppercase tracking-wider hidden md:block mb-1">
          Pages ({pages.length})
        </h3>
        {pages.map((p, idx) => {
          const isSelected = idx === selectedPageIndex;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPageIndex(idx)}
              className={`p-1.5 sm:p-2 rounded-lg border-2 text-center cursor-pointer transition-all shrink-0 w-24 sm:w-28 md:w-full ${
                isSelected
                  ? 'border-[#E5681A] bg-[#E5681A]/10 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center overflow-hidden rounded">
                <PdfCanvasPage
                  fileBytes={fileBytes}
                  pageIndex={p.pageIndex}
                  rotation={p.rotation}
                  scale={0.25}
                />
              </div>
              <p className="text-[11px] font-semibold text-[#14161B] mt-1.5">
                Page {idx + 1} {p.rotation > 0 ? `(${p.rotation}°)` : ''}
              </p>
            </div>
          );
        })}
      </aside>

      {/* Main Page Workspace */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 bg-white/95 rounded-2xl border border-[#14161B]/10 shadow-md min-h-[450px] sm:min-h-[550px] overflow-x-auto w-full">
        <div
          ref={pageContainerRef}
          onClick={() => setSelectedElementId(null)}
          className="relative max-w-full inline-block shadow-xl rounded-lg border border-gray-300 overflow-hidden bg-white my-auto touch-none transition-transform duration-200"
        >
          {/* Main PDF Page Render */}
          <PdfCanvasPage
            fileBytes={fileBytes}
            pageIndex={selectedPage.pageIndex}
            rotation={selectedPage.rotation}
            scale={1.3 * zoomScale}
          />

          {/* 1. Render Whiteout Eraser Masks */}
          {selectedPage.whiteouts.map((wo) => {
            const isSelected = selectedElementId === wo.id;
            return (
              <div
                key={wo.id}
                style={{
                  left: `${wo.x}%`,
                  top: `${wo.y}%`,
                  width: `${wo.width}%`,
                  height: `${wo.height}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(wo.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart(wo.id, 'whiteout');
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleDragStart(wo.id, 'whiteout');
                }}
                className={`absolute bg-white border border-dashed z-10 group flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#E5681A] ring-2 ring-[#E5681A]/40'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isEditModeEnabled ? 'cursor-move' : ''}`}
              >
                {isEditModeEnabled && (isSelected || true) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(selectedPageIndex, wo.id);
                    }}
                    title="Remove Mask"
                    className="opacity-0 group-hover:opacity-100 absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md z-30 min-h-[20px] min-w-[20px]"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {/* 2. Render Image Overlays */}
          {selectedPage.images.map((img) => {
            const isSelected = selectedElementId === img.id;
            return (
              <div
                key={img.id}
                style={{
                  left: `${img.x}%`,
                  top: `${img.y}%`,
                  width: `${img.width}%`,
                  height: `${img.height}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(img.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart(img.id, 'image');
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleDragStart(img.id, 'image');
                }}
                className={`absolute z-15 group border transition-all ${
                  isSelected
                    ? 'border-[#E5681A] ring-2 ring-[#E5681A]/40'
                    : 'border-transparent hover:border-[#E5681A]/60'
                } ${isEditModeEnabled ? 'cursor-move' : ''}`}
              >
                <img
                  src={img.dataUrl}
                  alt="Overlay"
                  className="w-full h-full object-contain block pointer-events-none"
                />
                {isEditModeEnabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(selectedPageIndex, img.id);
                    }}
                    title="Remove Image"
                    className="opacity-0 group-hover:opacity-100 absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md z-30 min-h-[20px] min-w-[20px]"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {/* 3. Render Text Annotations Overlay */}
          {selectedPage.textAnnotations.map((ann) => {
            const isSelected = selectedElementId === ann.id;
            return (
              <div
                key={ann.id}
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  fontSize: `${ann.fontSize}px`,
                  color: ann.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(ann.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDragStart(ann.id, 'text');
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleDragStart(ann.id, 'text');
                }}
                className={`absolute font-bold drop-shadow flex items-center gap-1.5 select-none z-20 bg-white/85 backdrop-blur-xs px-2 py-0.5 rounded border shadow-xs transition-all ${
                  isSelected
                    ? 'border-[#E5681A] ring-2 ring-[#E5681A]/40'
                    : 'border-black/10 hover:border-[#E5681A]/60'
                } ${isEditModeEnabled ? 'cursor-move group' : 'cursor-default'}`}
              >
                {/* Floating Mini Action Toolbar for Selected Text */}
                {isEditModeEnabled && isSelected && editingTextId !== ann.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -top-10 left-0 bg-[#14161B] text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-2 shadow-lg z-40 whitespace-nowrap animate-in fade-in duration-150 border border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => handleStartTextEdit(ann.id, ann.text)}
                      className="hover:text-[#E5681A] flex items-center gap-1 font-semibold"
                    >
                      ✏️ Edit
                    </button>
                    <div className="w-[1px] h-3 bg-white/20"></div>
                    <button
                      type="button"
                      onClick={() =>
                        updateTextAnnotationStyle(selectedPageIndex, ann.id, {
                          fontSize: Math.max(10, ann.fontSize - 2),
                        })
                      }
                      className="hover:text-[#E5681A] font-bold px-1"
                      title="Smaller Font"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateTextAnnotationStyle(selectedPageIndex, ann.id, {
                          fontSize: Math.min(48, ann.fontSize + 2),
                        })
                      }
                      className="hover:text-[#E5681A] font-bold px-1"
                      title="Larger Font"
                    >
                      A+
                    </button>
                    <div className="w-[1px] h-3 bg-white/20"></div>
                    <input
                      type="color"
                      value={ann.color}
                      onChange={(e) =>
                        updateTextAnnotationStyle(selectedPageIndex, ann.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-4 h-4 p-0 border-0 rounded cursor-pointer"
                      title="Change Text Color"
                    />
                    <div className="w-[1px] h-3 bg-white/20"></div>
                    <button
                      type="button"
                      onClick={() => removeAnnotation(selectedPageIndex, ann.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                      title="Delete Text"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {editingTextId === ann.id ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTextVal}
                      onChange={(e) => setEditTextVal(e.target.value)}
                      onKeyDown={(e) => handleKeyDownTextEdit(e, ann.id)}
                      className="bg-white text-black px-2 py-0.5 rounded border border-[#E5681A] text-xs focus:outline-none focus:ring-1 focus:ring-[#E5681A]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTextEdit(ann.id)}
                      className="bg-green-600 text-white text-[10px] px-2 py-1 rounded font-bold min-h-[30px]"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      onDoubleClick={() => handleStartTextEdit(ann.id, ann.text)}
                      title={isEditModeEnabled ? 'Double click or tap to edit text' : ''}
                    >
                      {ann.text}
                    </span>
                    {isEditModeEnabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAnnotation(selectedPageIndex, ann.id);
                        }}
                        title="Remove text"
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center leading-none min-h-[16px] min-w-[16px]"
                      >
                        ×
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
