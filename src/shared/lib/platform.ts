export type AppTarget = 'windows' | 'android' | 'other';

/**
 * Detects target platform from User Agent string.
 * Android is checked before Windows because Android UA strings can contain "Linux" or other desktop keywords.
 */
export function detectTarget(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): AppTarget {
  if (/android/i.test(ua)) return 'android';
  if (/windows nt/i.test(ua)) return 'windows';
  return 'other';
}

/**
 * Checks if the app is running inside Electron or Capacitor native container.
 */
export function isInstalledApp(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as {
    electronAPI?: unknown;
    Capacitor?: { isNativePlatform?: () => boolean };
  };
  return Boolean(w.electronAPI) || Boolean(w.Capacitor?.isNativePlatform?.());
}

/**
 * Detects if the page is running inside an in-app WebView (Instagram, Facebook, WhatsApp, Line, WeChat).
 */
export function isInAppBrowser(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  return /FBAN|FBAV|Instagram|WhatsApp|Line\/|MicroMessenger/i.test(ua);
}
