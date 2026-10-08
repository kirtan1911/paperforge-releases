# 01 · Decision — Best Outcome

## Options
| # | Setup | Pros | Cons |
|---|---|---|---|
| A | Vercel frontend + **Render backend** serves .exe/.apk | Tamari original idea | Free Render sleep, file size/bandwidth limits, extra moving part |
| B | Vercel frontend + **files in Vercel `public/`** | Sauthi simple | Repo bloat, deploy slow, file size limits, version history nathi |
| C | Vercel + **GitHub Releases** + Vercel function | Free, fast CDN, version history, ek j deploy | Release process setup karvo pade |
| D | C + Render backend | Backend features mate ready | Aa feature mate overkill |

## Verdict: **Option C**
1. **GitHub Releases** files host kare — free, large files OK, har version no history.
2. **Vercel** frontend + nani `/api/latest` function (cache sathe) — sleep nahi, same origin.
3. **Render** — jyare sachu backend joiye tyare j (login, DB, analytics). PaperForge no motto promise "file server par nathi jati" chhe, etle backend ochhu j rakho.

## Private repo problem + solution
Source repo **private** hoy to tena Releases na `latest/download` link logged-out user ne **404** aape. Public sharing mate aa nahi chale.

| Solution | Verdict |
|---|---|
| **Alag public repo `paperforge-releases`** (sirf Releases + nano README) | **Selected** — source private, downloads public, free |
| Main repo public karvo | Source khulo thai jay |
| Bija hosting (R2/Drive) par files | Extra setup, direct-link issues |

Flow: private repo ma code → Actions build kare → **public releases repo** ma upload. Releases repo ma source/secrets kyarey nahi mukvu.

## Final choices (Q&A)
- Render backend: **nahi**
- Repo: **private** (source) + public releases repo
- Hetu: **public sharing** (dosto, social media)
- Code signing: **nahi** (SmartScreen hint)
- Android: **APK j**, Play Store nahi

## Kem Render skip?
- Download button ne **backend par depend** na karvu joiye. Cold start = button 60 sec late.
- CSP `connect-src 'self'` strict rahe (privacy story majboot).
- Ochha parts = ochha bugs ("No code break" goal).

## Jyare Render add karvu?
- User accounts / cloud save
- Usage analytics (privacy-friendly)
- Server-side OCR (future)

## Risks
| Risk | Mitigation |
|---|---|
| GitHub API rate limit (60/hr/IP unauth) | Vercel function cache `s-maxage=600` + hardcoded fallback link |
| Private repo Actions minutes limit | Free plan ma monthly cap; Windows build vadhare minutes khaay. Release nai vaar j chalavo |
| Unsigned .exe ne antivirus false positive | Releases README ma note + VirusTotal scan link |
| Windows SmartScreen warning | UI ma instruction; public release mate code signing vichaaro |
| Android "Unknown apps" block | UI ma instruction; signed release APK |
| Keystore gum | Backup 2 jagya, GitHub Secrets ma base64 |
| "Desktop site" mode ma Android Chrome Linux dekhay | Fallback: manual "Other downloads" link |
