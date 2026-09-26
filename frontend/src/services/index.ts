import { HttpElectricalToolkitService } from './HttpElectricalToolkitService';

/** Frontend service gateway. Components must access backend data through this module. */
export const toolkitService = new HttpElectricalToolkitService(import.meta.env.VITE_API_BASE_URL ?? '/api/v1');
export { HttpElectricalToolkitService } from './HttpElectricalToolkitService';
export type { ElectricalToolkitService } from '@voltwise/backend';
