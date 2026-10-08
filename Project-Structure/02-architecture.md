# 02 · Architecture

```
     private repo: git tag v1.2.0 && git push --tags
                         │
                 GitHub Actions
          ┌──────────────┴───────────────┐
   windows-latest                    ubuntu-latest
   electron-builder                  gradlew assembleRelease
   PaperForge-Setup.exe              paperforge.apk (signed)
          └──────────────┬───────────────┘
          Public repo: paperforge-releases
               Release v1.2.0
                         ▲
        latest/download/<fixed-name>  (hamesha latest)
                         │
User ─► Vercel (React) ──┤  Button: OS detect → sachi link
                         │
                         └► /api/latest (Vercel function, cached)
                              └► GitHub API (public releases repo): version, date, size, download count
```

## Folder additions
```
paperforge/
├── api/
│   └── latest.ts                 # Vercel serverless function
├── .github/workflows/
│   └── release.yml               # build + publish
├── src/features/download-app/
│   ├── components/DownloadAppButton.tsx
│   ├── hooks/useLatestRelease.ts
│   ├── links.ts                  # fixed GitHub URLs (fallback)
│   └── index.ts
├── src/shared/lib/platform.ts    # detectTarget, isInstalledApp
└── vercel.json
```

## Rules
- Platform detection **sirf** `shared/lib/platform.ts` ma.
- Button feature `download-app/` andar; bija feature `index.ts` thi j import kare.
- File names **fixed** (`PaperForge-Setup.exe`, `paperforge.apk`) — link kyarey badlay nahi.
- App andar (Electron/Capacitor) button **hide**.

## Data flow
1. Page load → `detectTarget()` → button label/link set (instant, network vagar).
2. Background ma `/api/latest` fetch → version label + size + count. Fail thay to ignore.
3. Click → browser direct GitHub CDN thi download.
