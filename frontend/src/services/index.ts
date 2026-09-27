import { HttpElectricalToolkitService } from './HttpElectricalToolkitService';
import { ToolkitService } from './ToolkitService';

/** Frontend service gateway. Components must access backend data through this module. */
export const toolkitService = new ToolkitService(
  new HttpElectricalToolkitService(import.meta.env.VITE_API_BASE_URL ?? '/api/v1'),
);
export { HttpElectricalToolkitService } from './HttpElectricalToolkitService';
export { ToolkitService } from './ToolkitService';
export { verificationRecordStore } from './VerificationRecordStore';
export type { LocalReviewRecord } from './VerificationRecordStore';
export { calculationRecordStore } from './CalculationRecordStore';
export type { CalculationFieldValue, CalculationRecordStatus, LocalCalculationRecord } from './CalculationRecordStore';
export type { ElectricalToolkitService } from '@voltwise/backend';
