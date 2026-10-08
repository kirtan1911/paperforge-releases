# 06 · Testing Checklist

## Unit (Vitest)
- [ ] `detectTarget`: Windows, Android, iPhone, iPad, Mac, Linux, empty UA
- [ ] `isInstalledApp`: `electronAPI` present, `Capacitor.isNativePlatform()` true/false
- [ ] `DownloadAppButton`: windows → .exe link, android → .apk link, other → message, installed → null
- [ ] `useLatestRelease`: success, 502 error, network fail (button still renders)

## Manual — Website
| Device | Expected |
|---|---|
| Windows Chrome / Edge / Firefox | "Download for Windows" → .exe |
| Android Chrome / Samsung Internet | "Download for Android" → .apk |
| Android Chrome "Desktop site" ON | Wrong detect possible → "Other downloads" link kaam kare |
| iPhone / iPad / Mac | "Use web version" message |
| Linux desktop | Web version message |
| 360px width | Button no horizontal scroll, tap target ≥ 44px |

## Manual — Download
- [ ] **Incognito / logout** window ma button click → download thay (404 nahi) — private repo fix verify
- [ ] .exe install thay, SmartScreen "More info → Run anyway" thi chale
- [ ] APK install thay (Unknown apps allow pachi)
- [ ] Nava release pachi **link badalya vagar** navi file aave
- [ ] APK **update** (v1 upar v2) data-loss vagar install thay — same keystore!
- [ ] App khole to download button dekhay nahi (Electron + APK)

## API
- [ ] `/api/latest` → version + assets + download_count
- [ ] Response header `Cache-Control: s-maxage=600`
- [ ] GitHub down hoy (token galat karo) → 502, button hajhu chale
- [ ] Offline → button chale (hardcoded link)

## Security
- [ ] CSP `connect-src 'self'` — console ma CSP error nahi
- [ ] `paperforge-releases` ma source/secrets kai nathi
- [ ] `RELEASES_REPO_TOKEN` sirf releases repo ni Contents access
- [ ] Keystore / passwords repo ma commit nathi (`git log -p | grep -i keystore`)
- [ ] `GITHUB_TOKEN` public repo read-only scope j
- [ ] Error response ma internal details nahi

## Definition of Done
- [ ] Badha upar na checks pass
- [ ] Zero console errors
- [ ] Release workflow ek vaar end-to-end chali (tag → Release ma 2 files)
