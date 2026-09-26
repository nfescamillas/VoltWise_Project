import type { Category, DashboardStats, SearchOptions, Standard, StandardId, Topic } from '../types';

/** The only contract the UI uses for data access. An HTTP implementation can replace the mock unchanged. */
export interface ElectricalToolkitService {
  getCategories(): Promise<Category[]>;
  getStandards(): Promise<Standard[]>;
  getStats(): Promise<DashboardStats>;
  getFeaturedTopics(limit?: number): Promise<Topic[]>;
  getRecentTopics(limit?: number): Promise<Topic[]>;
  getTopicsByCategory(categoryId: string): Promise<Topic[]>;
  getTopicsByStandard(standardId: StandardId): Promise<Topic[]>;
  getTopic(topicId: string): Promise<Topic | null>;
  getRelatedTopics(topicId: string): Promise<Topic[]>;
  searchTopics(query: string, options?: SearchOptions): Promise<Topic[]>;
}
