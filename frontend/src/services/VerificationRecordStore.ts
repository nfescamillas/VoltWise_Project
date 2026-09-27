export interface LocalReviewRecord {
  reviewer: string;
  reviewDate: string;
  evidence: string;
  independentReviewComplete: boolean;
}

const STORAGE_KEY = 'pec-verification-records-v1';

export class VerificationRecordStore {
  read(): Record<string, LocalReviewRecord> {
    try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, LocalReviewRecord>; }
    catch { return {}; }
  }

  write(records: Record<string, LocalReviewRecord>) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export const verificationRecordStore = new VerificationRecordStore();
