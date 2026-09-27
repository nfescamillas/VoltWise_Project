import { categories, standards, topics } from '../data/catalog';
import type { ElectricalToolkitService } from './ElectricalToolkitService';
import type { DashboardStats, SearchOptions, StandardId, Topic } from '../types';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export class MockElectricalToolkitService implements ElectricalToolkitService {
  constructor(private readonly latencyMs = 80) {}

  private async result<T>(value: T): Promise<T> {
    if (this.latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return structuredClone(value);
  }

  async getCategories() { return this.result(categories); }
  async getStandards() { return this.result(standards); }

  async getStats(): Promise<DashboardStats> {
    return this.result({
      topicCount: topics.length,
      categoryCount: categories.length,
      standardCount: standards.length,
      reviewedCount: topics.filter((topic) => topic.reviewStatus === 'Reviewed' || topic.reviewStatus === 'Verified').length,
    });
  }

  async getFeaturedTopics(limit = 4) {
    const ids = ['motor-branch-circuit-conductors', 'motor-full-load-current', 'motor-overload-protection', 'motor-short-circuit-and-ground-fault-protection'];
    return this.result(ids.map((id) => topics.find((topic) => topic.id === id)!).slice(0, limit));
  }

  async getRecentTopics(limit = 5) { return this.result(topics.slice().reverse().slice(0, limit)); }
  async getTopicsByCategory(categoryId: string) { return this.result(topics.filter((topic) => topic.categoryId === categoryId)); }
  async getTopicsByStandard(standardId: StandardId) { return this.result(topics.filter((topic) => Boolean(topic.standards[standardId]))); }
  async getTopic(topicId: string) { return this.result(topics.find((topic) => topic.id === topicId) ?? null); }

  async getRelatedTopics(topicId: string) {
    const topic = topics.find((item) => item.id === topicId);
    return this.result(topic ? topic.relatedTopicIds.map((id) => topics.find((item) => item.id === id)).filter((item): item is Topic => Boolean(item)) : []);
  }

  async searchTopics(query: string, options: SearchOptions = {}) {
    const terms = normalize(query).split(' ').filter(Boolean);
    let matches = topics.filter((topic) => {
      if (options.categoryId && topic.categoryId !== options.categoryId) return false;
      if (options.standardId && !topic.standards[options.standardId]) return false;
      if (!terms.length) return true;
      const title = normalize(topic.title);
      const searchable = normalize([
        topic.title, topic.description, ...topic.synonyms,
        ...Object.values(topic.standards).flatMap((item) => item ? [
          item.reference, ...(item.references ?? []), item.summary, item.quickAnswer ?? '',
          ...(item.applicability ?? []), ...(item.notApplicable ?? []), ...(item.importantConditions ?? []),
          ...item.requirements, ...(item.engineeringNotes ?? []), ...(item.exceptions ?? []),
          ...(item.commonMistakes ?? []),
          ...(item.formulas ?? []).flatMap((formula) => [formula.name, formula.expression, ...formula.variables.flatMap((variable) => [variable.symbol, variable.definition])]),
          ...(item.tables ?? []).flatMap((table) => [table.title, ...table.columns, ...table.rows.flat()]),
          ...(item.figures ?? []).flatMap((figure) => [figure.title, figure.description, ...figure.nodes, ...(figure.paths ?? []).flat(), figure.annotation ?? '']),
          ...(item.examples ?? []).flatMap((example) => [example.title, ...example.given, ...example.assumptions, example.applicableRule, ...example.steps, example.result, example.interpretation]),
          ...(item.workflows ?? []).flatMap((workflow) => [workflow.title, ...workflow.steps, workflow.note ?? '']),
        ] : []),
      ].join(' '));
      return terms.every((term) => searchable.includes(term));
    });
    if (terms.length) {
      matches = matches.sort((a, b) => {
        const phrasePriorities: Record<string, string[]> = {
          'motor breaker': ['motor-short-circuit-and-ground-fault-protection', 'motor-overload-protection', 'motor-branch-circuit-conductors'],
          'generator neutral': ['generator-neutral-grounding', 'grounding-and-bonding-fundamentals'],
        };
        const priority = phrasePriorities[normalize(query)];
        if (priority) {
          const aIndex = priority.indexOf(a.id);
          const bIndex = priority.indexOf(b.id);
          if (aIndex >= 0 || bIndex >= 0) return (aIndex < 0 ? priority.length : aIndex) - (bIndex < 0 ? priority.length : bIndex);
        }
        const score = (topic: Topic) => terms.reduce((total, term) => total + (normalize(topic.title).includes(term) ? 3 : 0) + (topic.synonyms.some((s) => normalize(s).includes(term)) ? 2 : 0), 0);
        return score(b) - score(a) || a.title.localeCompare(b.title);
      });
    }
    return this.result(matches.slice(0, options.limit ?? matches.length));
  }
}
