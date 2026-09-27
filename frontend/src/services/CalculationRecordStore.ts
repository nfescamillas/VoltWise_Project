import type { CalculatorId } from '../types';

export type CalculationFieldValue = string | number | boolean;
export type CalculationRecordStatus = 'incomplete' | 'needs-verification' | 'complete';

export interface LocalCalculationRecord {
  id: string;
  calculatorId: CalculatorId;
  project: string;
  equipment: string;
  preparedBy: string;
  checkedBy: string;
  calculationDate: string;
  assumptions: string;
  sourceEvidence: string;
  fields: Record<string, CalculationFieldValue>;
  status: CalculationRecordStatus;
  updatedAt: string;
}

const STORAGE_KEY = 'pec-calculation-records-v1';
const OPEN_REQUEST_KEY = 'pec-calculation-open-request-v1';
const CALCULATOR_IDS: CalculatorId[] = ['three-phase-current', 'voltage-drop', 'transformer-current', 'conductor-design', 'transformer-protection', 'motor-disconnect-controller', 'transformer-grounding', 'working-clearance', 'service-equipment', 'generator-neutral-grounding'];

interface CalculationRecordExport {
  schema: 'pec-calculation-records';
  version: 1;
  exportedAt: string;
  records: LocalCalculationRecord[];
}

export class CalculationRecordStore {
  read(): LocalCalculationRecord[] {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Array.isArray(value) ? value.filter(isCalculationRecord) : [];
    } catch { return []; }
  }

  write(records: LocalCalculationRecord[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  save(record: LocalCalculationRecord) {
    const records = this.read();
    const index = records.findIndex((item) => item.id === record.id);
    if (index >= 0) records[index] = record;
    else records.push(record);
    this.write(records);
    return record;
  }

  remove(id: string) {
    this.write(this.read().filter((record) => record.id !== id));
  }

  duplicate(id: string, now = new Date()) {
    const source = this.read().find((record) => record.id === id);
    if (!source) return null;
    const copy: LocalCalculationRecord = {
      ...source,
      id: `${source.calculatorId}-${now.getTime()}`,
      equipment: source.equipment ? `${source.equipment} copy` : 'Copy',
      checkedBy: '',
      status: source.status === 'incomplete' ? 'incomplete' : 'needs-verification',
      updatedAt: now.toISOString(),
      fields: { ...source.fields },
    };
    this.save(copy);
    return copy;
  }

  exportJson(records = this.read(), now = new Date()) {
    const payload: CalculationRecordExport = { schema: 'pec-calculation-records', version: 1, exportedAt: now.toISOString(), records };
    return JSON.stringify(payload, null, 2);
  }

  importJson(text: string, mode: 'merge' | 'replace' = 'merge') {
    const parsed: unknown = JSON.parse(text);
    const candidates = Array.isArray(parsed) ? parsed : isObject(parsed) && parsed.schema === 'pec-calculation-records' && parsed.version === 1 ? parsed.records : null;
    if (!Array.isArray(candidates) || !candidates.every(isCalculationRecord)) throw new Error('The selected file is not a supported calculation-record export.');
    const imported = candidates as LocalCalculationRecord[];
    if (mode === 'replace') this.write(imported);
    else {
      const merged = new Map(this.read().map((record) => [record.id, record]));
      imported.forEach((record) => merged.set(record.id, record));
      this.write([...merged.values()]);
    }
    return imported.length;
  }

  requestOpen(record: LocalCalculationRecord) {
    window.sessionStorage.setItem(OPEN_REQUEST_KEY, JSON.stringify({ id: record.id, calculatorId: record.calculatorId }));
  }

  consumeOpenRequest(calculatorId: CalculatorId) {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(OPEN_REQUEST_KEY) ?? 'null');
      if (!isObject(parsed) || parsed.calculatorId !== calculatorId || typeof parsed.id !== 'string') return null;
      window.sessionStorage.removeItem(OPEN_REQUEST_KEY);
      return parsed.id;
    } catch { return null; }
  }
}

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isCalculationRecord(value: unknown): value is LocalCalculationRecord {
  if (!isObject(value)) return false;
  return typeof value.id === 'string' && typeof value.calculatorId === 'string' && CALCULATOR_IDS.includes(value.calculatorId as CalculatorId) && typeof value.project === 'string' && typeof value.equipment === 'string'
    && typeof value.preparedBy === 'string' && typeof value.checkedBy === 'string' && typeof value.calculationDate === 'string'
    && typeof value.assumptions === 'string' && typeof value.sourceEvidence === 'string' && isObject(value.fields)
    && typeof value.status === 'string' && ['incomplete', 'needs-verification', 'complete'].includes(value.status) && typeof value.updatedAt === 'string';
}

export const calculationRecordStore = new CalculationRecordStore();
