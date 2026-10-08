import type { VercelRequest, VercelResponse } from '@vercel/node';

const REPO = 'kirtan1911/paperforge-releases';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'PaperForge-Vercel-Function',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
    if (!response.ok) {
      throw new Error(`GitHub release fetch returned ${response.status}`);
    }

    const data = (await response.json()) as {
      tag_name: string;
      published_at: string;
      assets?: Array<{ name: string; size: number; download_count: number }>;
    };

    const assets: Record<string, { size: number; downloads: number }> = {};
    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        assets[asset.name] = {
          size: asset.size,
          downloads: asset.download_count,
        };
      }
    }

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    return res.status(200).json({
      version: data.tag_name,
      publishedAt: data.published_at,
      assets,
    });
  } catch {
    // Generic 502 response on failure without exposing internal stack or details
    return res.status(502).json({ error: 'Release info unavailable' });
  }
}
