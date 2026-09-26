import { MockElectricalToolkitService } from './MockElectricalToolkitService';
import type { ElectricalToolkitService } from './ElectricalToolkitService';

// Swap this one binding for an HTTP implementation when a backend is available.
export const toolkitService: ElectricalToolkitService = new MockElectricalToolkitService();
export type { ElectricalToolkitService } from './ElectricalToolkitService';
