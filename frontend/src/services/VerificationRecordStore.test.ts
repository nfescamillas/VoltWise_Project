import { beforeEach, describe, expect, it } from 'vitest';
import { VerificationRecordStore } from './VerificationRecordStore';

describe('VerificationRecordStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('persists independent review evidence locally', () => {
    const store = new VerificationRecordStore();
    store.write({ topic: { reviewer: 'Reviewer', reviewDate: '2026-09-27', evidence: 'Checked table notes.', independentReviewComplete: true } });
    expect(store.read().topic).toEqual({ reviewer: 'Reviewer', reviewDate: '2026-09-27', evidence: 'Checked table notes.', independentReviewComplete: true });
  });

  it('returns an empty record set when storage is invalid', () => {
    window.localStorage.setItem('pec-verification-records-v1', '{invalid');
    expect(new VerificationRecordStore().read()).toEqual({});
  });
});
