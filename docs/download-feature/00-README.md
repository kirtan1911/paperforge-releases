# PaperForge — Smart Download Feature (Overview)

> Website khole → laptop/PC hoy to **Windows .exe**, Android phone hoy to **APK** download. Baki devices ne web version.

## Best outcome (final verdict)
| Topic | Decision |
|---|---|
| Frontend | **Vercel** (static Vite build) |
| .exe / .apk files | **GitHub Releases** ni **alag public repo** `paperforge-releases` ma (source repo private) |
| OS detect | Client-side `navigator.userAgent` |
| Version / download count | **Vercel Serverless Function** `/api/latest` (Render nahi) |
| Render backend | **Aa feature mate jaruri nathi** — future ma j (accounts, analytics vagere) |
| Build automation | **GitHub Actions** (private repo) → tag push thatha .exe + .apk build → public releases repo ma publish |
| Windows code signing | **Nahi** — SmartScreen hint UI ma |
| Android | **APK j**, Play Store nahi |
| Fallback | API fail thay to pan hardcoded `latest/download` link chale |

Kem Render nahi? Free tier sleep thai jay (30–60 sec slow), alag deploy, alag CORS, alag CSP. Vercel function same domain par chale, sleep nathi, ek j deploy.

## Docs index
| File | Content |
|---|---|
| `01-decision-best-outcome.md` | Options compare + kem aa best |
| `02-architecture.md` | Diagram, folders, data flow |
| `03-os-detect-download-button.md` | `platform.ts` + button + tests |
| `04-release-pipeline.md` | GitHub Actions: .exe + signed APK + Release |
| `05-vercel-deploy-and-api.md` | `vercel.json`, `/api/latest`, CSP |
| `06-testing-checklist.md` | Test cases, edge cases |
| `07-claude-code-prompts.md` | Build mate ready prompts |

## Roadmap ma kya aave
Phase 7 (Web deploy) pachi, Phase 8 (.exe) ane Phase 9 (APK) puru thaya pachi aa feature.
