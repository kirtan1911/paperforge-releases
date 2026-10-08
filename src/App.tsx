import { DownloadAppButton } from '@/features/download-app';
import { PdfUploader, SejdaToolbar, SejdaBottomBar, PdfViewer, usePdfStore } from '@/features/pdf-editor';

export default function App() {
  const { fileBytes } = usePdfStore();

  return (
    <div className="min-h-screen bg-[#F6F3EC] text-[#14161B] flex flex-col font-sans selection:bg-[#E5681A] selection:text-white pb-20">
      {/* Navigation & Header */}
      <header className="sticky top-0 z-30 bg-[#F6F3EC]/90 backdrop-blur-md border-b border-[#14161B]/10 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#14161B] text-[#F6F3EC] flex items-center justify-center font-black text-xl shadow">
              P
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#14161B] leading-none">
                PaperForge <span className="text-xs text-[#E5681A] font-bold">Pro PDF Editor</span>
              </h1>
              <p className="text-xs text-[#14161B]/70 font-medium mt-0.5">
                Sejda-style client-side PDF editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-green-500/10 text-green-700 px-3 py-1.5 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              100% Private (No Uploads)
            </span>
            <DownloadAppButton />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {!fileBytes ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="text-center max-w-2xl mb-4 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#14161B]">
                Sejda-Style PDF Editor in your browser
              </h2>
              <p className="text-base text-[#14161B]/80 font-medium">
                Edit text, sign documents, add images, whiteout, and rotate pages 100% offline.
              </p>
            </div>

            <PdfUploader />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mt-8">
              <div className="bg-white/80 p-4 rounded-xl border border-[#14161B]/10 shadow-xs">
                <div className="text-2xl mb-2">✍️</div>
                <h3 className="font-bold text-[#14161B] text-sm">Inline Text & Signatures</h3>
                <p className="text-xs text-[#14161B]/70 mt-1">
                  Click anywhere to edit text, type cursive signatures, or draw signatures on canvas.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-[#14161B]/10 shadow-xs">
                <div className="text-2xl mb-2">⬜</div>
                <h3 className="font-bold text-[#14161B] text-sm">Whiteout & Images</h3>
                <p className="text-xs text-[#14161B]/70 mt-1">
                  Erase sensitive text/images with whiteout masks, or overlay custom PNG/JPG images.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-[#14161B]/10 shadow-xs">
                <div className="text-2xl mb-2">🛡️</div>
                <h3 className="font-bold text-[#14161B] text-sm">100% Client-Side Privacy</h3>
                <p className="text-xs text-[#14161B]/70 mt-1">
                  Your files stay on your device. Zero server uploads, zero logins.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-4">
            <SejdaToolbar />
            <PdfViewer />
            <SejdaBottomBar />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#14161B]/10 py-4 px-6 text-center text-xs text-[#14161B]/60">
        PaperForge — Sejda-Style PDF Editor · Built for Web, Windows & Android
      </footer>
    </div>
  );
}
