import { describe, expect, it, vi } from 'vitest';
import { HttpElectricalToolkitService } from './HttpElectricalToolkitService';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('HttpElectricalToolkitService', () => {
  it('calls the default browser fetch with its required global receiver', async () => {
    const stats = { topicCount: 63, categoryCount: 8, standardCount: 3, reviewedCount: 63 };
    const browserFetch = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(jsonResponse(stats));
    });
    vi.stubGlobal('fetch', browserFetch);

    try {
      await expect(new HttpElectricalToolkitService('/api/v1').getStats()).resolves.toEqual(stats);
      expect(browserFetch).toHaveBeenCalledWith('/api/v1/stats', expect.any(Object));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('maps service methods to the API routes and query parameters', async () => {
    const fetcher = vi.fn().mockImplementation(() => Promise.resolve(jsonResponse([])));
    const service = new HttpElectricalToolkitService('https://api.example.test/api/v1/', fetcher);

    await service.getFeaturedTopics(2);
    await service.getTopicsByCategory('motors & drives');
    await service.searchTopics('motor breaker', { categoryId: 'motors', standardId: 'nec', limit: 3 });

    expect(fetcher).toHaveBeenNthCalledWith(1, 'https://api.example.test/api/v1/topics/featured?limit=2', expect.any(Object));
    expect(fetcher).toHaveBeenNthCalledWith(2, 'https://api.example.test/api/v1/categories/motors%20%26%20drives/topics', expect.any(Object));
    expect(fetcher).toHaveBeenNthCalledWith(3, 'https://api.example.test/api/v1/topics/search?q=motor+breaker&categoryId=motors&standardId=nec&limit=3', expect.any(Object));
  });

  it('returns decoded API data', async () => {
    const stats = { topicCount: 63, categoryCount: 8, standardCount: 3, reviewedCount: 63 };
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(stats));

    await expect(new HttpElectricalToolkitService('/api/v1', fetcher).getStats()).resolves.toEqual(stats);
  });

  it('rejects unsuccessful responses with useful status context', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ detail: 'Unavailable' }, 503));

    await expect(new HttpElectricalToolkitService('/api/v1', fetcher).getCategories())
      .rejects.toThrow('Voltwise API request failed (503');
  });
});
