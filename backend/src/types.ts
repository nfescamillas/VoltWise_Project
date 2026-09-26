export type StandardId = 'iec' | 'nec' | 'pec';
export type ReviewStatus = 'Draft' | 'Reviewed' | 'Verified' | 'Needs update';

export interface Category {
  id: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
}

export interface Standard {
  id: StandardId;
  name: string;
  fullName: string;
  edition: string;
  description: string;
}

export interface TopicStandard {
  standardId: StandardId;
  edition: string;
  reference: string;
  summary: string;
  requirements: string[];
  terminology?: string;
}

export interface Topic {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  synonyms: string[];
  standards: Partial<Record<StandardId, TopicStandard>>;
  engineeringExplanation: string;
  engineeringNotes: string[];
  commonMistakes: string[];
  relatedTopicIds: string[];
  lastReviewed: string;
  reviewStatus: ReviewStatus;
  sourceStatus: string;
}

export interface DashboardStats {
  topicCount: number;
  categoryCount: number;
  standardCount: number;
  reviewedCount: number;
}

export interface SearchOptions {
  categoryId?: string;
  standardId?: StandardId;
  limit?: number;
}
