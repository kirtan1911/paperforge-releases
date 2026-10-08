import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DownloadAppButton } from './DownloadAppButton';

const UA = {
  win: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 Instagram 300.0.0.0',
};

describe('DownloadAppButton Component', () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
    delete (window as unknown as { electronAPI?: unknown }).electronAPI;
    delete (window as unknown as { Capacitor?: unknown }).Capacitor;
  });

  const setUserAgent = (ua: string) => {
    Object.defineProperty(navigator, 'userAgent', {
      value: ua,
      writable: true,
      configurable: true,
    });
  };

  it('renders null inside installed native app (Electron)', () => {
    (window as unknown as { electronAPI: object }).electronAPI = {};
    const { container } = render(<DownloadAppButton />);
    expect(container.firstChild).toBeNull();
  });

  it('renders in-app browser banner when opened inside Instagram', () => {
    setUserAgent(UA.instagram);
    render(<DownloadAppButton />);
    expect(screen.getByText(/In-App Browser Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Open in Chrome \/ your browser to download/i)).toBeInTheDocument();
  });

  it('renders Download for Windows button on Windows OS', () => {
    setUserAgent(UA.win);
    render(<DownloadAppButton />);
    const link = screen.getByRole('link', { name: /Download for Windows/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kirtan1911/paperforge-releases/releases/latest/download/PaperForge-Setup.exe'
    );
    expect(screen.getByText(/SmartScreen: More info > Run anyway/i)).toBeInTheDocument();
  });

  it('renders Download for Android button on Android OS', () => {
    setUserAgent(UA.android);
    render(<DownloadAppButton />);
    const link = screen.getByRole('link', { name: /Download for Android/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kirtan1911/paperforge-releases/releases/latest/download/paperforge.apk'
    );
    expect(screen.getByText(/Allow Install unknown apps/i)).toBeInTheDocument();
  });

  it('renders Use the web version message for iPhone', () => {
    setUserAgent(UA.iphone);
    render(<DownloadAppButton />);
    expect(screen.getByText(/Use the web version/i)).toBeInTheDocument();
  });

  it('still renders download button when API fails or returns error', () => {
    setUserAgent(UA.win);
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
    render(<DownloadAppButton />);
    const link = screen.getByRole('link', { name: /Download for Windows/i });
    expect(link).toBeInTheDocument();
  });
});
