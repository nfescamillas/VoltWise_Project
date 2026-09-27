import { describe, expect, it, vi } from 'vitest';
import { MockElectricalToolkitService } from '@voltwise/backend';
import type { ElectricalToolkitService } from '@voltwise/backend';
import { ToolkitService } from './ToolkitService';

const local = new MockElectricalToolkitService(0);
const remote = local as ElectricalToolkitService;

describe('ToolkitService', () => {
  it('keeps the versioned PEC catalog authoritative over a legacy API', async () => {
    const legacy = { ...remote, getStandards: vi.fn().mockResolvedValue([]) } as ElectricalToolkitService;
    const service = new ToolkitService(legacy, local);
    expect((await service.getStandards()).map((item) => item.id)).toEqual(['pec', 'pdc', 'pgc']);
  });
  it('returns the complete local gold-standard topic', async () => {
    const service = new ToolkitService(remote, local);
    const topic = await service.getTopic('motor-branch-circuit-conductors');
    expect(topic?.standards.pec?.formulas).toHaveLength(3);
    expect(topic?.standards.pec?.examples).toHaveLength(2);
  });
  it('searches enriched formula and source content locally', async () => {
    const service = new ToolkitService(remote, local);
    expect((await service.searchTopics('reactance'))[0].id).toBe('motor-branch-circuit-conductors');
  });
});
