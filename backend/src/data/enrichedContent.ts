/** Compatibility exports retained for callers that track the PEC migration. */
export const firstBatchTopicIds = [
  'motor-full-load-current', 'motor-branch-circuit-conductors', 'motor-overload-protection',
  'motor-short-circuit-and-ground-fault-protection', 'conductor-ampacity',
  'temperature-correction-and-adjustment-factors', 'voltage-drop',
  'grounding-and-bonding-fundamentals', 'generator-neutral-grounding',
  'transformer-primary-and-secondary-protection', 'working-clearances',
  'services-and-service-equipment',
] as const;
export const enrichedTopicIds = ['motor-branch-circuit-conductors'] as const;
