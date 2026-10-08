const BASE = 'https://github.com/kirtan1911/paperforge-releases/releases/latest/download';

export const DOWNLOADS = {
  windows: {
    label: 'Download for Windows',
    file: 'PaperForge-Setup.exe',
    href: `${BASE}/PaperForge-Setup.exe`,
    hint: 'SmartScreen: More info > Run anyway',
  },
  android: {
    label: 'Download for Android',
    file: 'paperforge.apk',
    href: `${BASE}/paperforge.apk`,
    hint: 'Allow Install unknown apps',
  },
} as const;
