import { useEffect, useState } from 'react';

export interface LatestInfo {
  version: string;
  publishedAt: string;
  assets: Record<string, { size: number; downloads: number }>;
}

export function useLatestRelease(): LatestInfo | null {
  const [info, setInfo] = useState<LatestInfo | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    fetch('/api/latest', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Status ${r.status}`))))
      .then((data: LatestInfo) => {
        if (data && typeof data === 'object') {
          setInfo(data);
        }
      })
      .catch(() => {
        // Silently catch errors so UI button rendering is never blocked
      });

    return () => {
      ctrl.abort();
    };
  }, []);

  return info;
}
