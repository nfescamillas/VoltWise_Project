import { describe, expect, it } from 'vitest';
import type { Topic } from '../types';
import { topics } from './catalog';
import { firstBatchTopicIds } from './enrichedContent';
import { validateCatalog } from './validateCatalog';

describe('PEC catalog validation', () => {
  it('accepts the shipped catalog', () => { expect(validateCatalog(topics)).toEqual([]); });
  it('keeps all twelve first targets in the PEC backlog', () => {
    expect(firstBatchTopicIds).toHaveLength(12);
    for (const id of firstBatchTopicIds) expect(topics.find((item) => item.id === id)?.standards.pec).toBeTruthy();
  });
  it('fully structures the motor conductor reference implementation', () => {
    const topic = topics.find((item) => item.id === 'motor-branch-circuit-conductors')!; const pec = topic.standards.pec!;
    expect(pec.summary.split(/\s+/).length).toBeGreaterThan(500);
    expect(pec.formulas?.length).toBeGreaterThanOrEqual(3); expect(pec.tables?.length).toBeGreaterThanOrEqual(2);
    expect(pec.figures?.length).toBeGreaterThanOrEqual(2); expect(pec.examples?.length).toBeGreaterThanOrEqual(2);
    expect(pec.workflows?.[0].steps.length).toBeGreaterThanOrEqual(10); expect(pec.commonMistakes?.length).toBeGreaterThanOrEqual(5);
    expect(topic.completeness?.every((item) => item.status === 'complete')).toBe(true);
    expect(topic.reviewStatus).toBe('Needs verification');
  });
  it('fully structures the other three coordinated motor chapters', () => {
    for (const id of ['motor-full-load-current', 'motor-overload-protection', 'motor-short-circuit-and-ground-fault-protection']) {
      const topic = topics.find((item) => item.id === id)!; const pec = topic.standards.pec!;
      expect(pec.summary.split(/\s+/).length).toBeGreaterThan(350);
      expect(pec.formulas?.length).toBeGreaterThanOrEqual(2);
      expect(pec.tables?.length).toBeGreaterThanOrEqual(2);
      expect(pec.figures?.length).toBeGreaterThanOrEqual(2);
      expect(pec.examples?.length).toBeGreaterThanOrEqual(2);
      expect(pec.workflows?.[0].steps.length).toBeGreaterThanOrEqual(9);
      expect(pec.commonMistakes?.length).toBeGreaterThanOrEqual(5);
      expect(topic.completeness?.every((item) => item.status === 'complete')).toBe(true);
    }
  });
  it('fully structures the three conductor-design chapters', () => {
    for (const id of ['conductor-ampacity', 'temperature-correction-and-adjustment-factors', 'voltage-drop']) {
      const topic = topics.find((item) => item.id === id)!; const pec = topic.standards.pec!;
      expect(pec.summary.split(/\s+/).length).toBeGreaterThan(250);
      expect(pec.formulas?.length).toBeGreaterThanOrEqual(2);
      expect(pec.tables?.length).toBeGreaterThanOrEqual(3);
      expect(pec.figures?.length).toBeGreaterThanOrEqual(2);
      expect(pec.examples?.length).toBeGreaterThanOrEqual(2);
      expect(pec.workflows?.[0].steps.length).toBeGreaterThanOrEqual(12);
      expect(pec.commonMistakes?.length).toBeGreaterThanOrEqual(5);
      expect(topic.completeness?.every((item) => item.status === 'complete')).toBe(true);
      expect(topic.reviewStatus).toBe('Needs verification');
    }
  });
  it('fully structures grounding fundamentals and generator neutral grounding', () => {
    for (const id of ['grounding-and-bonding-fundamentals', 'generator-neutral-grounding']) {
      const topic = topics.find((item) => item.id === id)!; const pec = topic.standards.pec!;
      expect(pec.summary.split(/\s+/).length).toBeGreaterThan(250);
      expect(pec.formulas?.length).toBeGreaterThanOrEqual(1);
      expect(pec.tables?.length).toBeGreaterThanOrEqual(3);
      expect(pec.figures?.length).toBeGreaterThanOrEqual(2);
      expect(pec.examples?.length).toBeGreaterThanOrEqual(2);
      expect(pec.workflows?.[0].steps.length).toBeGreaterThanOrEqual(12);
      expect(pec.commonMistakes?.length).toBeGreaterThanOrEqual(5);
      expect(topic.completeness?.every((item) => item.status === 'complete')).toBe(true);
    }
  });
  it('fully structures the motor equipment and transformer bonding batch', () => {
    for (const id of ['motor-disconnecting-means', 'motor-controllers-and-control-circuits', 'transformer-grounding-and-bonding']) {
      const topic = topics.find((item) => item.id === id)!; const pec = topic.standards.pec!;
      expect(pec.summary.split(/\s+/).length).toBeGreaterThan(350);
      expect(pec.formulas?.length).toBeGreaterThanOrEqual(2);
      expect(pec.tables?.length).toBeGreaterThanOrEqual(3);
      expect(pec.figures?.length).toBeGreaterThanOrEqual(2);
      expect(pec.examples?.length).toBeGreaterThanOrEqual(2);
      expect(pec.workflows?.[0].steps.length).toBeGreaterThanOrEqual(15);
      expect(pec.commonMistakes?.length).toBeGreaterThanOrEqual(5);
      expect(topic.completeness?.every((item) => item.status === 'complete')).toBe(true);
      expect(topic.reviewStatus).toBe('Needs verification');
    }
  });
  it('contains no active IEC or NEC records', () => {
    const serialized = JSON.stringify(topics);
    expect(serialized).not.toMatch(/\"iec\"\s*:/i); expect(serialized).not.toMatch(/\"nec\"\s*:/i);
  });
  it('detects malformed verified records', () => {
    const broken = structuredClone(topics[0]) as Topic;
    broken.id = topics[1].id; broken.relatedTopicIds = ['missing-topic']; broken.reviewStatus = 'Verified';
    const content = broken.standards.pec!; content.edition = ''; content.reference = ''; content.references = [];
    content.formulas = [{ name: '', expression: '', variables: [], units: '', basis: 'general-engineering' }];
    content.tables = [{ title: 'Bad', type: 'decision', columns: ['A', 'B'], rows: [['one']] }];
    content.figures = [{ title: 'Bad asset', type: 'schematic', description: '', nodes: [], sourceBasis: '', asset: 'missing.svg' }];
    content.verification = { standard: '', edition: '', references: [], reviewStatus: 'Verified', lastReviewed: '', sourceStatus: '' };
    const errors = validateCatalog([topics[1], broken]).join('\n');
    expect(errors).toMatch(/Duplicate topic id|broken related topic/); expect(errors).toMatch(/missing edition/);
    expect(errors).toMatch(/missing reference/); expect(errors).toMatch(/malformed formula/);
    expect(errors).toMatch(/inconsistent table columns/); expect(errors).toMatch(/missing diagram asset/);
    expect(errors).toMatch(/verified content lacks sufficient metadata/);
  });
});
