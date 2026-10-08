# 05 · Vercel Deploy + `/api/latest`

## Deploy steps
1. Code GitHub par push.
2. Vercel → *Add New → Project* → repo import.
3. Framework: **Vite** · Build: `npm run build` · Output: `dist`.
4. Source repo private chhe — Vercel GitHub integration ma e repo select karo (Vercel private repo support kare chhe).
5. `GITHUB_TOKEN` env var optional — releases repo public chhe, etle vagar token pan chale (cache hovathi rate limit ni chinta nahi).
6. Deploy → URL → pachi custom domain.

`netlify.toml` ni jagya e `vercel.json` (niche).

## `api/latest.ts`
```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPO = 'kirtan1911/paperforge-releases'; // public repo

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    const data = await r.json();

    const assets: Record<string, { size: number; downloads: number }> = {};
    for (const a of data.assets ?? []) {
      assets[a.name] = { size: a.size, downloads: a.download_count };
    }

    // CDN cache 10 min → GitHub rate limit ni chinta nahi
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    res.status(200).json({
      version: data.tag_name,
      publishedAt: data.published_at,
      assets,
    });
  } catch {
    res.status(502).json({ error: 'Release info unavailable' }); // internal details nahi
  }
}
```
```bash
npm i -D @vercel/node
```

## `vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "no-referrer" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; worker-src 'self' blob:; connect-src 'self'" }
      ]
    }
  ]
}
```
`connect-src 'self'` j rahe — `/api/latest` same origin chhe. Download links `<a href>` navigation chhe, CSP ne affect nathi karta.

> CSP deploy pachi browser console ma test karo; PDF.js worker mate `worker-src` tweak karvu pade to karo.

## Electron / Capacitor mate
App andar `/api/latest` relative URL kaam nahi kare (file:// / capacitor://). Button app andar hide j chhe (`isInstalledApp()`), etle fetch pan nathi thatu. Jo kyarey app andar version check joiye to full URL `https://YOUR-APP.vercel.app/api/latest` vapro ane CSP ma add karo.

## Jyare Render add karvu (future)
Backend sachu joiye (accounts, DB) tyare:
1. Render ma Web Service banavo, CORS `origin: 'https://YOUR-APP.vercel.app'`.
2. Vercel CSP `connect-src` ma `https://YOUR-API.onrender.com` add.
3. Free tier sleep — UI ma loading state, kritical flow (PDF edit/download) ne backend par depend na rakho.
