import { describe, it, expect, afterEach } from 'vitest';
import { detectTarget, isInstalledApp, isInAppBrowser } from './platform';

const SAMPLE_UAS = {
  win: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0',
  facebook: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UD1A.230803.041; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0.0.0;]',
  whatsapp: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.24.1.7',
  line: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/14.0.0',
};

describe('detectTarget', () => {
  it('detects Windows NT as windows', () => {
    expect(detectTarget(SAMPLE_UAS.win)).toBe('windows');
  });

  it('detects Android as android even if Linux is present', () => {
    expect(detectTarget(SAMPLE_UAS.android)).toBe('android');
  });

  it('returns other for iPhone', () => {
    expect(detectTarget(SAMPLE_UAS.iphone)).toBe('other');
  });

  it('returns other for iPad', () => {
    expect(detectTarget(SAMPLE_UAS.ipad)).toBe('other');
  });

  it('returns other for Mac', () => {
    expect(detectTarget(SAMPLE_UAS.mac)).toBe('other');
  });

  it('returns other for Linux desktop', () => {
    expect(detectTarget(SAMPLE_UAS.linux)).toBe('other');
  });

  it('returns other for empty UA string', () => {
    expect(detectTarget('')).toBe('other');
  });
});

describe('isInAppBrowser', () => {
  it('detects Instagram webview', () => {
    expect(isInAppBrowser(SAMPLE_UAS.instagram)).toBe(true);
  });

  it('detects Facebook webview', () => {
    expect(isInAppBrowser(SAMPLE_UAS.facebook)).toBe(true);
  });

  it('detects WhatsApp webview', () => {
    expect(isInAppBrowser(SAMPLE_UAS.whatsapp)).toBe(true);
  });

  it('detects Line webview', () => {
    expect(isInAppBrowser(SAMPLE_UAS.line)).toBe(true);
  });

  it('returns false for standard mobile Chrome', () => {
    expect(isInAppBrowser(SAMPLE_UAS.android)).toBe(false);
  });

  it('returns false for standard desktop Chrome', () => {
    expect(isInAppBrowser(SAMPLE_UAS.win)).toBe(false);
  });
});

describe('isInstalledApp', () => {
  afterEach(() => {
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  it('returns false in normal web environment', () => {
    expect(isInstalledApp()).toBe(false);
  });

  it('returns true when electronAPI is injected', () => {
    (window as unknown as { electronAPI: object }).electronAPI = {};
    expect(isInstalledApp()).toBe(true);
  });

  it('returns true when Capacitor.isNativePlatform returns true', () => {
    (window as unknown as { Capacitor: { isNativePlatform: () => boolean } }).Capacitor = {
      isNativePlatform: () => true,
    };
    expect(isInstalledApp()).toBe(true);
  });

  it('returns false when Capacitor.isNativePlatform returns false', () => {
    (window as unknown as { Capacitor: { isNativePlatform: () => boolean } }).Capacitor = {
      isNativePlatform: () => false,
    };
    expect(isInstalledApp()).toBe(false);
  });
});
