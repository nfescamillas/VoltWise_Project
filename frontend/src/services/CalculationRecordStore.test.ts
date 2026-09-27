import { beforeEach, describe, expect, it } from 'vitest';
import { CalculationRecordStore, type LocalCalculationRecord } from './CalculationRecordStore';

describe('CalculationRecordStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('creates and updates locally saved engineering records', () => {
    const store = new CalculationRecordStore();
    const record: LocalCalculationRecord = { id: 'one', calculatorId: 'motor-disconnect-controller', project: 'Plant A', equipment: 'M-101', preparedBy: 'Engineer', checkedBy: '', calculationDate: '2026-09-27', assumptions: 'Verified nameplate.', sourceEvidence: 'PEC §4.30.9.10', fields: { flc: 68, lockable: true }, status: 'needs-verification', updatedAt: '2026-09-27T00:00:00.000Z' };
    store.save(record);
    store.save({ ...record, checkedBy: 'Reviewer', status: 'complete' });
    expect(store.read()).toHaveLength(1);
    expect(store.read()[0]).toMatchObject({ checkedBy: 'Reviewer', status: 'complete', fields: { flc: 68, lockable: true } });
  });

  it('recovers from invalid local storage', () => {
    window.localStorage.setItem('pec-calculation-records-v1', '{bad');
    expect(new CalculationRecordStore().read()).toEqual([]);
  });

  it('duplicates, removes, exports, and imports versioned records', () => {
    const store = new CalculationRecordStore();
    const record: LocalCalculationRecord = { id: 'service-one', calculatorId: 'service-equipment', project: 'Plant B', equipment: 'MSB-01', preparedBy: 'Engineer', checkedBy: 'Reviewer', calculationDate: '2026-09-27', assumptions: '', sourceEvidence: 'PEC Article 2.30', fields: { workflowReady: true }, status: 'complete', updatedAt: '2026-09-27T00:00:00.000Z' };
    store.save(record);
    const copy = store.duplicate(record.id, new Date('2026-09-28T00:00:00.000Z'));
    expect(copy).toMatchObject({ equipment: 'MSB-01 copy', checkedBy: '', status: 'needs-verification' });
    const exported = store.exportJson(store.read(), new Date('2026-09-29T00:00:00.000Z'));
    expect(JSON.parse(exported)).toMatchObject({ schema: 'pec-calculation-records', version: 1 });
    store.remove(record.id);
    expect(store.read()).toHaveLength(1);
    window.localStorage.clear();
    expect(store.importJson(exported)).toBe(2);
    expect(store.read()).toHaveLength(2);
  });

  it('rejects unsupported imports and transfers a reopen request through session storage', () => {
    const store = new CalculationRecordStore();
    expect(() => store.importJson('{"version":99,"records":[]}')).toThrow(/not a supported/i);
    const record: LocalCalculationRecord = { id: 'generator-one', calculatorId: 'generator-neutral-grounding', project: 'Plant C', equipment: 'GEN-01', preparedBy: 'Engineer', checkedBy: '', calculationDate: '2026-09-27', assumptions: '', sourceEvidence: '', fields: {}, status: 'incomplete', updatedAt: '2026-09-27T00:00:00.000Z' };
    store.requestOpen(record);
    expect(store.consumeOpenRequest('service-equipment')).toBeNull();
    expect(store.consumeOpenRequest('generator-neutral-grounding')).toBe('generator-one');
    expect(store.consumeOpenRequest('generator-neutral-grounding')).toBeNull();
  });
});
