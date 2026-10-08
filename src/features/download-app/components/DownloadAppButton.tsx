import { useState } from 'react';
import { detectTarget, isInstalledApp, isInAppBrowser } from '@/shared/lib/platform';
import { DOWNLOADS } from '../links';
import { useLatestRelease } from '../hooks/useLatestRelease';

export function DownloadAppButton() {
  const info = useLatestRelease();
  const [showOtherDownloads, setShowOtherDownloads] = useState(false);

  // Hidden inside native app containers (Electron / Capacitor)
  if (isInstalledApp()) {
    return null;
  }

  // In-app webview (Instagram, Facebook, WhatsApp, Line) detection
  if (isInAppBrowser()) {
    return (
      <div
        role="region"
        aria-label="In-app browser warning"
        style={{ backgroundColor: '#14161B', color: '#F6F3EC', borderColor: 'rgba(229, 104, 26, 0.4)' }}
        className="w-full max-w-md rounded-xl p-4 text-center shadow-md border"
      >
        <p className="font-semibold text-base mb-1" style={{ color: '#E5681A' }}>
          In-App Browser Detected
        </p>
        <p className="text-sm opacity-90">
          Open in Chrome / your browser to download
        </p>
      </div>
    );
  }

  const target = detectTarget();

  // Non-target OS (iPhone, iPad, Mac, Linux desktop)
  if (target === 'other') {
    return (
      <div className="flex flex-col items-center gap-3 w-full max-w-md text-center">
        <p className="text-sm font-medium opacity-80" style={{ color: '#14161B' }}>
          Use the web version
        </p>
        <button
          type="button"
          onClick={() => setShowOtherDownloads(!showOtherDownloads)}
          style={{ color: '#E5681A', minHeight: '44px' }}
          className="text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-[#E5681A] rounded px-3 py-2 inline-flex items-center justify-center cursor-pointer"
          aria-expanded={showOtherDownloads}
          aria-label="Toggle other download options"
        >
          {showOtherDownloads ? 'Hide other downloads' : 'Other downloads (Windows / Android)'}
        </button>

        {showOtherDownloads && (
          <div className="flex flex-wrap justify-center gap-3 mt-1 p-3 bg-white/80 rounded-lg border border-[#14161B]/10 w-full">
            <a
              href={DOWNLOADS.windows.href}
              download
              aria-label="Download PaperForge for Windows .exe"
              style={{ backgroundColor: '#14161B', color: '#F6F3EC', minHeight: '44px' }}
              className="text-xs font-semibold px-4 py-2 rounded inline-flex items-center justify-center no-underline"
            >
              Windows (.exe)
            </a>
            <a
              href={DOWNLOADS.android.href}
              download
              aria-label="Download PaperForge for Android APK"
              style={{ backgroundColor: '#14161B', color: '#F6F3EC', minHeight: '44px' }}
              className="text-xs font-semibold px-4 py-2 rounded inline-flex items-center justify-center no-underline"
            >
              Android (.apk)
            </a>
          </div>
        )}
      </div>
    );
  }

  const d = DOWNLOADS[target];
  const assetInfo = info?.assets?.[d.file];
  const sizeMb = assetInfo?.size
    ? ` · ${(assetInfo.size / (1024 * 1024)).toFixed(1)} MB`
    : '';
  const versionStr = info?.version ? ` (${info.version})` : '';

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md">
      <a
        href={d.href}
        download
        aria-label={`${d.label}${versionStr}${sizeMb}`}
        style={{
          backgroundColor: '#E5681A',
          color: '#F6F3EC',
          minHeight: '44px',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(229, 104, 26, 0.25)',
        }}
        className="w-full text-center text-sm sm:text-base cursor-pointer hover:opacity-95 transition-opacity"
      >
        {d.label}{versionStr}{sizeMb}
      </a>
      <p className="text-xs text-[#14161B] opacity-75 text-center font-medium">
        {d.hint}
      </p>

      <button
        type="button"
        onClick={() => setShowOtherDownloads(!showOtherDownloads)}
        style={{ color: '#14161B', minHeight: '44px' }}
        className="mt-1 text-xs opacity-70 hover:opacity-100 hover:underline focus:outline-none rounded px-2 py-1 inline-flex items-center justify-center cursor-pointer"
        aria-expanded={showOtherDownloads}
        aria-label="Show alternative platform downloads"
      >
        {showOtherDownloads ? 'Hide options' : 'Other downloads'}
      </button>

      {showOtherDownloads && (
        <div className="flex flex-wrap justify-center gap-3 p-3 bg-white/80 rounded-lg border border-[#14161B]/10 w-full text-xs">
          <a
            href={DOWNLOADS.windows.href}
            download
            aria-label="Download PaperForge for Windows .exe setup"
            style={{ color: '#14161B', minHeight: '44px' }}
            className="text-xs font-semibold underline hover:text-[#E5681A] inline-flex items-center px-2"
          >
            Windows (.exe)
          </a>
          <span className="self-center text-gray-400">•</span>
          <a
            href={DOWNLOADS.android.href}
            download
            aria-label="Download PaperForge for Android APK package"
            style={{ color: '#14161B', minHeight: '44px' }}
            className="text-xs font-semibold underline hover:text-[#E5681A] inline-flex items-center px-2"
          >
            Android (.apk)
          </a>
        </div>
      )}
    </div>
  );
}
