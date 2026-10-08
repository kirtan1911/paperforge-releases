# 03 · OS Detect + Download Button

## `src/shared/lib/platform.ts`
```ts
export type AppTarget = 'windows' | 'android' | 'other';

export function detectTarget(ua: string = navigator.userAgent): AppTarget {
  if (/android/i.test(ua)) return 'android';   // pehla android (UA ma "Linux" pan hoy)
  if (/windows nt/i.test(ua)) return 'windows';
  return 'other';                               // iPhone, iPad, Mac, Linux, ChromeOS
}

export function isInstalledApp(): boolean {
  const w = window as unknown as {
    electronAPI?: unknown;
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  return Boolean(w.electronAPI) || Boolean(w.Capacitor?.isNativePlatform?.());
}
```

## `src/features/download-app/links.ts`
```ts
const BASE = 'https://github.com/kirtan1911/paperforge-releases/releases/latest/download';

export const DOWNLOADS = {
  windows: { label: 'Download for Windows', file: 'PaperForge-Setup.exe', href: `${BASE}/PaperForge-Setup.exe`,
    hint: 'SmartScreen ma "More info → Run anyway" dabavo.' },
  android: { label: 'Download for Android', file: 'paperforge.apk', href: `${BASE}/paperforge.apk`,
    hint: 'Settings ma "Install unknown apps" allow karo.' },
} as const;
```

## `src/features/download-app/hooks/useLatestRelease.ts`
```ts
import { useEffect, useState } from 'react';

export interface LatestInfo {
  version: string;
  publishedAt: string;
  assets: Record<string, { size: number; downloads: number }>;
}

export function useLatestRelease() {
  const [info, setInfo] = useState<LatestInfo | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/latest', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setInfo)
      .catch(() => {});            // fail thay to pan button chale
    return () => ctrl.abort();
  }, []);
  return info;
}
```

## `DownloadAppButton.tsx`
```tsx
import { detectTarget, isInstalledApp } from '@/shared/lib/platform';
import { DOWNLOADS } from '../links';
import { useLatestRelease } from '../hooks/useLatestRelease';

export function DownloadAppButton() {
  const info = useLatestRelease();
  if (isInstalledApp()) return null;

  const target = detectTarget();
  if (target === 'other') {
    return <p className="text-sm opacity-70">Aa device mate app nathi — website ma j vapro.</p>;
  }

  const d = DOWNLOADS[target];
  const sizeMb = info?.assets[d.file]?.size
    ? ` · ${(info.assets[d.file].size / 1048576).toFixed(0)} MB` : '';

  return (
    <div className="flex flex-col gap-2">
      <a
        href={d.href}
        download
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#E5681A] px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2"
      >
        {d.label}{info ? ` (${info.version})` : ''}{sizeMb}
      </a>
      <p className="text-xs opacity-70">{d.hint}</p>
    </div>
  );
}
```

## Optional: "Other downloads" link
Chhelle nichhe nanu link j badha platforms batave (Android Chrome "Desktop site" mode ke wrong detect mate):
`Windows .exe · Android APK` — banne direct links.

## Vitest — `platform.test.ts`
```ts
import { describe, it, expect } from 'vitest';
import { detectTarget } from './platform';

const UA = {
  win: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
};

describe('detectTarget', () => {
  it('windows', () => expect(detectTarget(UA.win)).toBe('windows'));
  it('android', () => expect(detectTarget(UA.android)).toBe('android'));
  it('iphone', () => expect(detectTarget(UA.iphone)).toBe('other'));
  it('mac', () => expect(detectTarget(UA.mac)).toBe('other'));
  it('linux desktop', () => expect(detectTarget(UA.linux)).toBe('other'));
  it('empty ua', () => expect(detectTarget('')).toBe('other'));
});
```

## Dhyan
- iPadOS Safari Mac jevu dekhay → `other` — barabar j chhe (iOS app nathi).
- `download` attribute cross-origin ma ignore thai shake, pan GitHub `attachment` header aape chhe etle download j thase.
