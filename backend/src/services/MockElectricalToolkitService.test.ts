import { describe, expect, it } from 'vitest';
import { MockElectricalToolkitService } from './MockElectricalToolkitService';

describe('MockElectricalToolkitService', () => {
  const service = new MockElectricalToolkitService(0);

  it('provides the complete MVP catalog', async () => {
    const [stats, categories, standards] = await Promise.all([service.getStats(), service.getCategories(), service.getStandards()]);
    expect(stats.topicCount).toBe(63);
    expect(stats.reviewedCount).toBe(63);
    expect(categories).toHaveLength(8);
    expect(standards.map((item) => item.id)).toEqual(['iec', 'nec', 'pec']);
  });

  it('finds topics using field terminology and ranks title matches', async () => {
    const results = await service.searchTopics('motor breaker');
    expect(results[0].id).toBe('motor-short-circuit-protection');
  });

  it('searches standard references and applies category filters', async () => {
    const results = await service.searchTopics('Article 430', { categoryId: 'motors', standardId: 'nec' });
    expect(results).toHaveLength(10);
    expect(results.every((item) => item.categoryId === 'motors')).toBe(true);
  });

  it('returns defensive copies so callers cannot mutate mock storage', async () => {
    const first = await service.getTopic('conductor-ampacity');
    first!.title = 'Changed';
    const second = await service.getTopic('conductor-ampacity');
    expect(second!.title).toBe('Conductor Ampacity');
  });

  it('resolves valid related topics', async () => {
    const related = await service.getRelatedTopics('working-clearances');
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((item) => item.id !== 'working-clearances')).toBe(true);
  });
});
