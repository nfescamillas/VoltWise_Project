import { describe, expect, it } from 'vitest';
import type { Topic } from '../types';
import { topics } from './catalog';
import { enrichedTopicIds } from './enrichedContent';
import { validateCatalog } from './validateCatalog';

describe('catalog validation', () => {
  it('accepts the shipped catalog', () => {
    expect(validateCatalog(topics)).toEqual([]);
  });

  it('migrates the ten validation topics for all three standards', () => {
    expect(enrichedTopicIds).toHaveLength(10);
    for (const id of enrichedTopicIds) {
      const topic = topics.find((item) => item.id === id)!;
      expect(topic.reviewStatus).toBe('Needs source');
      for (const standard of Object.values(topic.standards)) {
        expect(standard?.summary.length).toBeGreaterThan(120);
        expect(standard?.applicability?.length).toBeGreaterThan(0);
        expect(standard?.tables?.length).toBeGreaterThan(0);
        expect(standard?.figures?.length).toBeGreaterThan(0);
        expect(standard?.examples?.length).toBeGreaterThan(0);
        expect(standard?.verification?.reviewStatus).toBe('Needs source');
      }
    }
  });

  it('populates every required toolkit element for the first five topics', () => {
    const expectations = {
      'motor-full-load-current': { formulas: 1, figures: 1, calculators: 1 },
      'motor-branch-circuit-conductors': { formulas: 1, figures: 1, calculators: 0 },
      'motor-overload-protection': { formulas: 0, figures: 1, calculators: 0 },
      'voltage-drop-guidance': { formulas: 1, figures: 1, calculators: 1 },
      'generator-neutral-grounding': { formulas: 0, figures: 3, calculators: 0 },
    } as const;
    for (const [id, minimum] of Object.entries(expectations)) {
      const topic = topics.find((item) => item.id === id)!;
      for (const standard of Object.values(topic.standards)) {
        expect(standard?.quickAnswer).toBeTruthy();
        expect(standard?.tables?.[0].rows.length).toBeGreaterThanOrEqual(3);
        expect(standard?.formulas?.length).toBeGreaterThanOrEqual(minimum.formulas);
        expect(standard?.figures?.length).toBeGreaterThanOrEqual(minimum.figures);
        expect(standard?.examples?.length).toBeGreaterThan(0);
        expect(standard?.workflows?.[0].steps.length).toBeGreaterThanOrEqual(5);
        expect(standard?.calculators?.length ?? 0).toBeGreaterThanOrEqual(minimum.calculators);
      }
    }
  });

  it('detects duplicate ids, links, formulas, tables, assets, editions, and weak verified records', () => {
    const broken = structuredClone(topics[0]) as Topic;
    broken.id = topics[1].id;
    broken.relatedTopicIds = ['missing-topic'];
    broken.reviewStatus = 'Verified';
    const content = broken.standards.nec!;
    content.edition = '';
    content.reference = '';
    content.references = [];
    content.formulas = [{ name: '', expression: '', variables: [], units: '', basis: 'general-engineering' }];
    content.tables = [{ title: 'Bad', type: 'decision', columns: ['A', 'B'], rows: [['one']] }];
    content.figures = [{ title: 'Bad asset', type: 'schematic', description: '', nodes: [], sourceBasis: '', asset: 'missing.svg' }];
    content.verification = { standard: '', edition: '', references: [], reviewStatus: 'Verified', lastReviewed: '', sourceStatus: '' };
    const errors = validateCatalog([topics[1], broken]);
    expect(errors.join('\n')).toMatch(/Duplicate topic id/);
    expect(errors.join('\n')).toMatch(/broken related topic/);
    expect(errors.join('\n')).toMatch(/missing edition/);
    expect(errors.join('\n')).toMatch(/missing reference/);
    expect(errors.join('\n')).toMatch(/malformed formula/);
    expect(errors.join('\n')).toMatch(/inconsistent table columns/);
    expect(errors.join('\n')).toMatch(/missing diagram asset/);
    expect(errors.join('\n')).toMatch(/verified content lacks sufficient metadata/);
  });
});
