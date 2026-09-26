import type { Category, Standard, StandardId, Topic, TopicStandard } from '../types';

export const categories: Category[] = [
  { id: 'conductors', name: 'Conductors & Cables', shortName: 'Conductors', description: 'Ampacity, sizing, derating, and voltage drop.', accent: '#0b7285', icon: 'cable' },
  { id: 'protection', name: 'Overcurrent Protection', shortName: 'Protection', description: 'Breakers, fuses, fault protection, and coordination.', accent: '#c2410c', icon: 'shield' },
  { id: 'grounding', name: 'Grounding & Bonding', shortName: 'Grounding', description: 'Earthing systems, bonding, and protective conductors.', accent: '#2f855a', icon: 'ground' },
  { id: 'motors', name: 'Motors & Drives', shortName: 'Motors', description: 'Motor circuits, protection, controls, and drives.', accent: '#2563a8', icon: 'motor' },
  { id: 'transformers', name: 'Transformers', shortName: 'Transformers', description: 'Protection, conductors, grounding, and installation.', accent: '#7c3aed', icon: 'transformer' },
  { id: 'generators', name: 'Generators & Standby', shortName: 'Generators', description: 'Generator systems, transfer equipment, and emergency power.', accent: '#b7791f', icon: 'generator' },
  { id: 'distribution', name: 'Panels & Distribution', shortName: 'Distribution', description: 'Panels, switchgear, bus systems, and clearances.', accent: '#475569', icon: 'panel' },
  { id: 'industrial', name: 'Industrial Systems', shortName: 'Industrial', description: 'Controls, PLCs, VFDs, isolation, and safety circuits.', accent: '#be185d', icon: 'factory' },
];

export const standards: Standard[] = [
  { id: 'iec', name: 'IEC', fullName: 'International Electrotechnical Commission', edition: 'Current supported editions', description: 'International standards for electrical installations, equipment, and safety.' },
  { id: 'nec', name: 'NEC', fullName: 'NFPA 70 — National Electrical Code', edition: '2023', description: 'United States benchmark for safe electrical design and installation.' },
  { id: 'pec', name: 'PEC', fullName: 'Philippine Electrical Code', edition: '2017', description: 'Electrical installation requirements used in the Philippines.' },
];

const topicNames: Record<string, string[]> = {
  conductors: ['Conductor Ampacity', 'Cable Sizing Principles', 'Ambient-Temperature Correction', 'Cable Grouping and Derating', 'Parallel Conductors', 'Neutral Conductor Sizing', 'Protective Conductor Sizing', 'Voltage-Drop Guidance', 'Copper vs Aluminum Conductors'],
  protection: ['Circuit Breakers', 'Fuses', 'Overload Protection', 'Short-Circuit Protection', 'Ground-Fault Protection', 'Interrupting Capacity', 'Protective-Device Coordination'],
  grounding: ['Grounding Terminology', 'Equipment Grounding Conductors', 'Protective Earth Conductors', 'Grounding Electrode Systems', 'Bonding', 'Neutral-to-Ground Connections', 'Separately Derived Systems', 'Generator Grounding', 'IEC TN, TT, and IT Earthing Arrangements'],
  motors: ['Motor Full-Load Current', 'Motor Branch-Circuit Conductors', 'Motor Overload Protection', 'Motor Short-Circuit Protection', 'Motor Disconnecting Means', 'Motor Controllers', 'Multiple-Motor Feeders', 'VFD-Fed Motors', 'Soft-Starter Installations', 'Motor Control Centers'],
  transformers: ['Transformer Rated Current', 'Transformer Primary Protection', 'Transformer Secondary Protection', 'Transformer Conductors', 'Transformer Grounding', 'Dry-Type Transformer Installation'],
  generators: ['Generator Conductor Sizing', 'Generator Overcurrent Protection', 'Generator Neutral Grounding', 'Transfer Switches', 'Separately Derived Generator Systems', 'Emergency Systems', 'Standby Systems'],
  distribution: ['Panelboards', 'Switchboards', 'Switchgear', 'Motor Control Centers in Distribution', 'Busbar and Bus Ratings', 'Working Clearances', 'Equipment SCCR and Interrupting Ratings'],
  industrial: ['Industrial Control Panels', 'PLC and Control Panels', 'Control Transformers', 'Control Wiring', '24 VDC Control Systems', 'VFD Installation', 'Isolation and Disconnects', 'Emergency-Stop Electrical Considerations'],
};

const slug = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const referenceFor = (category: string, standard: StandardId): string => {
  const refs: Record<string, Record<StandardId, string>> = {
    conductors: { nec: 'Articles 210, 215 & 310', iec: 'IEC 60364-5-52', pec: 'PEC Part 1, Chapters 2 & 3' },
    protection: { nec: 'Articles 110 & 240', iec: 'IEC 60364-4-43 / IEC 60947', pec: 'PEC Part 1, Article 2.40' },
    grounding: { nec: 'Article 250', iec: 'IEC 60364-4-41 / 5-54', pec: 'PEC Part 1, Article 2.50' },
    motors: { nec: 'Article 430', iec: 'IEC 60364 / IEC 60947-4-1', pec: 'PEC Part 1, Article 4.30' },
    transformers: { nec: 'Article 450', iec: 'IEC 60076 / IEC 60364', pec: 'PEC Part 1, Article 4.50' },
    generators: { nec: 'Articles 445, 700 & 702', iec: 'IEC 60364-5-55 / 6', pec: 'PEC Part 1, Articles 4.45 & 7' },
    distribution: { nec: 'Articles 110, 408 & 409', iec: 'IEC 61439 / IEC 60947', pec: 'PEC Part 1, Articles 1.10 & 4.08' },
    industrial: { nec: 'Articles 409, 430 & 670', iec: 'IEC 60204-1 / IEC 61439', pec: 'PEC Part 1, Articles 4.09 & 6.70' },
  };
  return refs[category][standard];
};

const buildStandard = (standardId: StandardId, categoryId: string, title: string): TopicStandard => ({
  standardId,
  edition: standardId === 'nec' ? '2023' : standardId === 'pec' ? '2017' : 'Current supported edition',
  reference: referenceFor(categoryId, standardId),
  summary: `${title} must be selected and applied within the installation rules, equipment ratings, and safety provisions of the ${standardId.toUpperCase()} reference.`,
  requirements: [
    'Confirm equipment and conductor ratings for the actual operating conditions.',
    'Apply the referenced protection, installation, and identification requirements.',
    'Verify exceptions and local authority requirements before final design approval.',
  ],
});

const overrides: Record<string, Partial<Topic>> = {
  'motor-full-load-current': {
    description: 'The current value used as the starting point for motor circuit conductor and protection decisions.',
    synonyms: ['motor amps', 'motor FLC', 'motor current table', 'nameplate current'],
    engineeringExplanation: 'Code-table current and nameplate current serve different purposes. Branch conductors and short-circuit protection commonly begin with tabulated current, while overload protection is closely tied to the motor nameplate and service factor.',
    engineeringNotes: ['Record voltage, phase, frequency, duty, and service factor before selecting a basis.', 'A VFD input circuit is evaluated differently from the motor output circuit.'],
    commonMistakes: ['Using nameplate current for every motor-circuit calculation.', 'Ignoring the distinction between full-load current and full-load amperes.'],
  },
  'motor-overload-protection': {
    description: 'Protection against sustained overcurrent and overheating during motor operation.',
    synonyms: ['motor heater', 'overload relay', 'motor OL', 'thermal overload'],
    engineeringExplanation: 'Overload devices protect the motor from thermal damage. They are not intended to interrupt high-level short circuits, so the branch circuit normally also needs a fuse or circuit breaker selected under separate rules.',
    engineeringNotes: ['Coordinate settings with motor service factor, temperature rise, and starting profile.', 'Electronic overload relays can add phase-loss and imbalance protection.'],
    commonMistakes: ['Treating the branch breaker as the motor overload device.', 'Setting overloads only to avoid nuisance trips without checking motor thermal limits.'],
  },
  'motor-short-circuit-protection': {
    description: 'Branch-circuit protection for faults and high-magnitude short-circuit current.',
    synonyms: ['motor breaker', 'motor fuse', 'MCP', 'instantaneous trip'],
    engineeringExplanation: 'A motor branch protective device must allow normal starting current while clearing faults. This often produces a rating larger than the conductor ampacity would suggest under general circuit rules.',
    engineeringNotes: ['Check the controller combination rating and available fault current.', 'Document any permitted increase made to allow the motor to start.'],
    commonMistakes: ['Applying general branch-circuit breaker limits without the motor-specific rules.', 'Confusing fault protection with overload protection.'],
  },
  'conductor-ampacity': {
    description: 'The maximum current a conductor can carry continuously under its stated conditions of use.',
    synonyms: ['cable ampacity', 'wire current rating', 'conductor rating', 'amp table'],
    engineeringExplanation: 'Ampacity is not a single property of conductor size. Insulation rating, termination temperature, ambient conditions, installation method, grouping, and harmonic content can all determine the usable value.',
    engineeringNotes: ['Start with the correct installation-method table before applying correction factors.', 'The lowest-rated termination can govern the usable ampacity.'],
    commonMistakes: ['Selecting from a table without applying ambient or grouping corrections.', 'Using a 90 °C insulation column for terminals rated 75 °C.'],
  },
  'voltage-drop-guidance': {
    description: 'Design guidance for limiting conductor voltage loss to maintain equipment performance.',
    synonyms: ['voltage drop', 'cable volt loss', 'maximum voltage drop', 'VD calculation'],
    engineeringExplanation: 'Voltage drop is primarily a performance design check rather than a substitute for ampacity. Circuit length, load current, power factor, conductor impedance, and starting conditions should be considered.',
    engineeringNotes: ['Evaluate motor starting drop separately from steady-state drop.', 'Use actual route length and include return path as appropriate to the system.'],
    commonMistakes: ['Treating recommended percentage values as universal mandatory limits.', 'Calculating with nominal load when starting or inrush is the governing case.'],
  },
  'equipment-grounding-conductors': {
    description: 'The conductive fault-current path connecting non-current-carrying metal parts to the system ground.',
    synonyms: ['earth conductor', 'EGC', 'ground wire', 'equipment earth'],
    engineeringExplanation: 'The equipment grounding conductor provides a low-impedance fault path so the protective device operates promptly. It is not intended to carry normal load current.',
    engineeringNotes: ['Maintain continuity across raceway joints and removable equipment.', 'Increasing phase conductors for voltage drop may require a proportional EGC increase.'],
    commonMistakes: ['Using the earth as the effective fault-current return path.', 'Mixing equipment grounding and neutral functions downstream of the permitted bonding point.'],
  },
  'generator-neutral-grounding': {
    description: 'Selection and arrangement of neutral grounding and bonding for generator-supplied systems.',
    synonyms: ['generator neutral', 'genset grounding', 'four pole ATS', 'generator bond'],
    engineeringExplanation: 'Whether a generator is separately derived depends strongly on transfer-switch neutral switching. That classification determines the location of the neutral-to-ground bond and grounding-electrode connection.',
    engineeringNotes: ['Review the transfer scheme before deciding where to bond the neutral.', 'Ground-fault sensing must be coordinated with the chosen bonding arrangement.'],
    commonMistakes: ['Creating parallel neutral paths through duplicate bonds.', 'Assuming every generator is automatically a separately derived system.'],
  },
  'transformer-primary-protection': {
    description: 'Overcurrent protection on the supply side of a transformer.',
    synonyms: ['transformer breaker', 'primary fuse', 'transformer OCPD'],
    engineeringExplanation: 'Primary protection is selected from transformer current, permitted protection arrangements, conductor protection, and inrush behavior. Secondary conductor and device requirements remain a separate check.',
    engineeringNotes: ['Transformer energization can produce substantial inrush.', 'Evaluate both transformer protection and feeder conductor protection.'],
    commonMistakes: ['Assuming primary protection always protects secondary conductors.', 'Selecting a device without checking inrush tolerance.'],
  },
  'working-clearances': {
    description: 'Minimum clear working space around electrical equipment likely to require examination or service while energized.',
    synonyms: ['panel clearance', 'electrical room clearance', 'working space', 'switchboard clearance'],
    engineeringExplanation: 'Required depth, width, height, access, and illumination depend on voltage and the conditions around exposed live parts. The space must remain dedicated and unobstructed.',
    engineeringNotes: ['Coordinate clearances early with architectural and mechanical layouts.', 'Doors and removable panels may affect the practical service envelope.'],
    commonMistakes: ['Using working space for storage.', 'Measuring only from the wall rather than the equipment enclosure.'],
  },
};

const allIds = Object.values(topicNames).flat().map(slug);

export const topics: Topic[] = Object.entries(topicNames).flatMap(([categoryId, names], categoryIndex) =>
  names.map((title, index) => {
    const id = slug(title);
    const related = [
      ...names.filter((name) => slug(name) !== id).slice(Math.max(0, index - 1), Math.max(0, index - 1) + 2).map(slug),
      allIds[(categoryIndex * 7 + index + 11) % allIds.length],
    ].filter((value, i, array) => value !== id && array.indexOf(value) === i).slice(0, 3);
    const base: Topic = {
      id,
      title,
      categoryId,
      description: `Practical guidance for applying ${title.toLowerCase()} requirements in electrical installations.`,
      synonyms: title.toLowerCase().split(/[\s/&-]+/).filter((word) => word.length > 3),
      standards: {
        iec: buildStandard('iec', categoryId, title),
        nec: buildStandard('nec', categoryId, title),
        pec: buildStandard('pec', categoryId, title),
      },
      engineeringExplanation: `${title} should be evaluated as part of the complete electrical system. Load characteristics, environmental conditions, equipment listings, protection, and the authority having jurisdiction can affect the final application.`,
      engineeringNotes: ['Document the design basis and the edition used.', 'Confirm manufacturer instructions and local amendments.'],
      commonMistakes: ['Applying a general rule without checking its exceptions.', 'Failing to coordinate the requirement with connected equipment.'],
      relatedTopicIds: related,
      lastReviewed: index % 3 === 0 ? '2026-08-14' : index % 3 === 1 ? '2026-07-22' : '2026-06-05',
      reviewStatus: index % 5 === 0 ? 'Verified' : 'Reviewed',
      sourceStatus: 'Curated summary — verify against official publication',
    };
    return { ...base, ...(overrides[id] ?? {}) };
  }),
);
