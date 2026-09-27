import { MockElectricalToolkitService } from '@voltwise/backend';
import type {
  Category,
  DashboardStats,
  ElectricalToolkitService,
  SearchOptions,
  Standard,
  StandardId,
  Topic,
} from '@voltwise/backend';

/**
 * The versioned local PEC catalog is authoritative during the source-curation
 * phase. The remote adapter remains injected so a future API can adopt the same
 * contract without allowing legacy IEC/NEC records to leak into this release.
 */
export class ToolkitService implements ElectricalToolkitService {
  constructor(
    _remote: ElectricalToolkitService,
    private readonly local: ElectricalToolkitService = new MockElectricalToolkitService(0),
  ) {}

  getCategories() { return this.local.getCategories(); }
  getStandards() { return this.local.getStandards(); }

  getStats(): Promise<DashboardStats> { return this.local.getStats(); }

  getFeaturedTopics(limit = 4) {
    return this.local.getFeaturedTopics(limit);
  }

  getRecentTopics(limit = 5) {
    return this.local.getRecentTopics(limit);
  }

  getTopicsByCategory(categoryId: string) {
    return this.local.getTopicsByCategory(categoryId);
  }

  getTopicsByStandard(standardId: StandardId) {
    return this.local.getTopicsByStandard(standardId);
  }

  async getTopic(topicId: string) {
    return this.local.getTopic(topicId);
  }

  getRelatedTopics(topicId: string) {
    return this.local.getRelatedTopics(topicId);
  }

  async searchTopics(query: string, options: SearchOptions = {}) {
    return this.local.searchTopics(query, options);
  }

}

export type { Category, Standard };
