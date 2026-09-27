import { describe, expect, it } from 'vitest';
import { MockElectricalToolkitService } from './MockElectricalToolkitService';

describe('MockElectricalToolkitService', () => {
  const service = new MockElectricalToolkitService(0);
  it('exposes PEC as active and PDC/PGC as planned', async () => {
    const [stats, categories, standards] = await Promise.all([service.getStats(), service.getCategories(), service.getStandards()]);
    expect(stats.topicCount).toBe(15); expect(categories).toHaveLength(10);
    expect(standards.map((item) => [item.id, item.status])).toEqual([['pec', 'active'], ['pdc', 'planned'], ['pgc', 'planned']]);
  });
  it('finds motor fault protection in field language', async () => {
    const results = await service.searchTopics('motor breaker');
    expect(results.slice(0, 3).map((topic) => topic.id)).toEqual([
      'motor-short-circuit-and-ground-fault-protection',
      'motor-overload-protection',
      'motor-branch-circuit-conductors',
    ]);
  });
  it('searches PEC references and applies filters', async () => {
    const results = await service.searchTopics('4.30.2.2', { categoryId: 'motors', standardId: 'pec' });
    expect(results[0].id).toBe('motor-branch-circuit-conductors');
    expect(results.every((item) => item.categoryId === 'motors')).toBe(true);
  });
  it('searches formula content', async () => {
    expect((await service.searchTopics('reactance'))[0].id).toBe('motor-branch-circuit-conductors');
  });
  it('searches the completed conductor toolkit by field language and PEC locator', async () => {
    expect((await service.searchTopics('cable derating'))[0].id).toBe('temperature-correction-and-adjustment-factors');
    expect((await service.searchTopics('3 percent voltage drop'))[0].id).toBe('voltage-drop');
    expect((await service.searchTopics('3.10.1.15'))[0].id).toBe('conductor-ampacity');
  });
  it('returns defensive copies', async () => {
    const first = await service.getTopic('conductor-ampacity'); first!.title = 'Changed';
    expect((await service.getTopic('conductor-ampacity'))!.title).toBe('Conductor Ampacity');
  });
  it('resolves valid related topics', async () => {
    const related = await service.getRelatedTopics('working-clearances');
    expect(related.length).toBeGreaterThan(0); expect(related.every((item) => item.id !== 'working-clearances')).toBe(true);
  });
  it('finds the completed generator grounding decision guide', async () => {
    const results = await service.searchTopics('generator neutral');
    expect(results[0].id).toBe('generator-neutral-grounding');
    expect(results[0].standards.pec?.figures?.length).toBeGreaterThanOrEqual(3);
  });
  it('exposes all published chapters as structured toolkits', async () => {
    const topics = await service.searchTopics('');
    expect(topics).toHaveLength(15);
    for (const topic of topics) {
      expect(topic.completeness?.every((item) => item.status !== 'incomplete')).toBe(true);
      expect(topic.standards.pec?.formulas?.length).toBeGreaterThan(0);
      expect(topic.standards.pec?.tables?.length).toBeGreaterThan(0);
      expect(topic.standards.pec?.figures?.length).toBeGreaterThan(0);
      expect(topic.standards.pec?.examples?.length).toBeGreaterThan(0);
    }
  });
  it('searches the completed transformer, clearance, and service chapters', async () => {
    expect((await service.searchTopics('transformer breaker'))[0].id).toBe('transformer-primary-and-secondary-protection');
    expect((await service.searchTopics('900 mm clearance'))[0].id).toBe('working-clearances');
    expect((await service.searchTopics('six disconnect rule'))[0].id).toBe('services-and-service-equipment');
  });
  it('searches the motor equipment and transformer bonding batch', async () => {
    expect((await service.searchTopics('local motor isolator'))[0].id).toBe('motor-disconnecting-means');
    expect((await service.searchTopics('control transformer fuse'))[0].id).toBe('motor-controllers-and-control-circuits');
    expect((await service.searchTopics('transformer XO bond'))[0].id).toBe('transformer-grounding-and-bonding');
  });
});
