import type {
  Category,
  DashboardStats,
  ElectricalToolkitService,
  SearchOptions,
  Standard,
  StandardId,
  Topic,
} from '@voltwise/backend';

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export class HttpElectricalToolkitService implements ElectricalToolkitService {
  private readonly baseUrl: string;

  constructor(baseUrl = '/api/v1', private readonly fetcher: Fetcher = globalThis.fetch) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getCategories() { return this.get<Category[]>('/categories'); }
  getStandards() { return this.get<Standard[]>('/standards'); }
  getStats() { return this.get<DashboardStats>('/stats'); }
  getFeaturedTopics(limit = 4) { return this.get<Topic[]>('/topics/featured', { limit }); }
  getRecentTopics(limit = 5) { return this.get<Topic[]>('/topics/recent', { limit }); }
  getTopicsByCategory(categoryId: string) { return this.get<Topic[]>(`/categories/${encodeURIComponent(categoryId)}/topics`); }
  getTopicsByStandard(standardId: StandardId) { return this.get<Topic[]>(`/standards/${encodeURIComponent(standardId)}/topics`); }
  getTopic(topicId: string) { return this.get<Topic | null>(`/topics/${encodeURIComponent(topicId)}`); }
  getRelatedTopics(topicId: string) { return this.get<Topic[]>(`/topics/${encodeURIComponent(topicId)}/related`); }

  searchTopics(query: string, options: SearchOptions = {}) {
    return this.get<Topic[]>('/topics/search', {
      q: query,
      categoryId: options.categoryId,
      standardId: options.standardId,
      limit: options.limit,
    });
  }

  private async get<T>(path: string, parameters: Record<string, string | number | undefined> = {}): Promise<T> {
    const query = new URLSearchParams();
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, String(value));
    });
    const suffix = query.size ? `?${query.toString()}` : '';
    const response = await this.fetcher(`${this.baseUrl}${path}${suffix}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Voltwise API request failed (${response.status} ${response.statusText})`);
    }

    return response.json() as Promise<T>;
  }
}
