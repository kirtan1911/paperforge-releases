# 07 · Claude Code Prompts

Dar prompt alag step mate. Pehla plan batavva kaho, pachi code.

## Step 1 — Detection + button
```
Add a download-app feature under src/features/download-app. Put detectTarget(ua) and isInstalledApp() in src/shared/lib/platform.ts (android is checked before windows; everything else is 'other'). Build DownloadAppButton: windows -> PaperForge-Setup.exe, android -> paperforge.apk, from GitHub Releases latest/download URLs in links.ts. Hide inside Electron/Capacitor. Show a short hint under the button (SmartScreen / Install unknown apps). Add an "Other downloads" fallback link. Add Vitest tests with sample user-agent strings. Show me the plan first.
```

## Step 2 — Vercel API
```
Add api/latest.ts as a Vercel serverless function that fetches the latest GitHub release of kirtan1911/paperforge-releases and returns {version, publishedAt, assets:{name:{size,downloads}}}. Cache with s-maxage=600. On failure return 502 with a generic message. Add useLatestRelease hook that never blocks the button if the fetch fails. Replace netlify.toml with vercel.json keeping connect-src 'self'.
```

## Step 3 — Release workflow
```
Create .github/workflows/release.yml triggered on v* tags: build the Windows NSIS installer on windows-latest (artifactName PaperForge-Setup.exe), build a signed release APK on ubuntu-latest from secrets (keystore base64, passwords, alias) renamed to paperforge.apk, then publish both to a GitHub Release in the separate PUBLIC repo kirtan1911/paperforge-releases using softprops/action-gh-release with a RELEASES_REPO_TOKEN secret (source repo is private). Run the workflow only on tags. Configure signingConfigs in android/app/build.gradle using env vars. Do not commit any keystore.
```

## Step 4 — Test + review
```
Run the full test checklist in docs/download-feature/06-testing-checklist.md. Use Chrome DevTools device emulation (Windows desktop, Pixel, iPhone, 360px) to verify the button per device, check console errors and CSP violations, and confirm the button still works when /api/latest fails.
```
