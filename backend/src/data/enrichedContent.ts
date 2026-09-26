import type { CalculatorId, DesignWorkflow, EngineeringFigure, EngineeringFormula, EngineeringTable, StandardId, TopicStandard } from '../types';

type Blueprint = {
  summary: string;
  quickAnswer?: string;
  applicability: string[];
  notApplicable?: string[];
  importantConditions?: string[];
  requirements: string[];
  formula?: EngineeringFormula;
  formulas?: EngineeringFormula[];
  table: EngineeringTable;
  figure: Omit<EngineeringFigure, 'sourceBasis' | 'type'> & { type?: EngineeringFigure['type'] };
  extraFigures?: Array<Omit<EngineeringFigure, 'sourceBasis' | 'type'> & { type?: EngineeringFigure['type'] }>;
  example: { title: string; given: string[]; assumptions: string[]; rule: string; steps: string[]; result: string; interpretation: string };
  workflows?: DesignWorkflow[];
  calculators?: CalculatorId[];
  notes: string[];
  exceptions: string[];
  mistakes: string[];
};

const profiles: Record<StandardId, {
  name: string;
  edition: string;
  approach: string;
  sourceNote: string;
  terminology: string;
}> = {
  iec: {
    name: 'IEC installation and equipment standards',
    edition: 'Current supported editions — exact publication years require source confirmation',
    approach: 'IEC requirements may be distributed across installation, equipment, and product standards; the applicable national adoption must also be checked.',
    sourceNote: 'Needs source: confirm each clause against the applicable IEC publication and its national adoption.',
    terminology: 'IEC terminology emphasizes protective conductors, earthing arrangements, and coordinated protective measures.',
  },
  nec: {
    name: 'NFPA 70 — National Electrical Code',
    edition: '2023',
    approach: 'The NEC organizes installation rules by article and often separates conductor, overload, fault-protection, and equipment requirements.',
    sourceNote: 'Needs source: broad article locator retained; subsection, exception, and table citations require verification in NFPA 70 (2023).',
    terminology: 'NEC terminology is used for branch circuits, equipment grounding conductors, and overcurrent protective devices.',
  },
  pec: {
    name: 'PEC — Philippine Electrical Code',
    edition: '2017',
    approach: 'PEC requirements must be checked independently, including Philippine amendments, local rules, and the authority having jurisdiction.',
    sourceNote: 'Needs source: verify all detailed rules in PEC 2017; similarity to NEC structure is not treated as proof of equivalence.',
    terminology: 'PEC terminology and locally adopted installation practice govern; NEC wording is not automatically interchangeable.',
  },
};

const genericSelectionTable = (title: string, questions: string[]): EngineeringTable => ({
  title,
  type: 'workflow',
  columns: ['Design check', 'Engineer action'],
  rows: questions.map((question) => [question, 'Record the project condition, then verify the governing value in the cited official edition.']),
  purpose: 'An original workflow table; it does not reproduce an official standards table.',
  howToApply: ['Work from top to bottom.', 'Record the official source used for each selected value.', 'Recheck the final selection after all corrections and exceptions.'],
});

const powerFormula: EngineeringFormula = {
  name: 'Three-phase line current (engineering estimate)',
  expression: 'I = P / (√3 × V × η × PF)',
  variables: [
    { symbol: 'I', definition: 'Line current', unit: 'A' },
    { symbol: 'P', definition: 'Output power', unit: 'W' },
    { symbol: 'V', definition: 'Line-to-line voltage', unit: 'V' },
    { symbol: 'η', definition: 'Efficiency as a decimal', unit: '—' },
    { symbol: 'PF', definition: 'Power factor as a decimal', unit: '—' },
  ],
  units: 'Use watts and volts to obtain amperes.',
  basis: 'general-engineering',
  whenToUse: 'Estimate balanced three-phase motor line current from output power before final equipment data are available.',
  workedInputExample: '37 kW ÷ (√3 × 400 V × 0.92 × 0.86) = 67.5 A (approximately).',
  notes: ['This equation estimates operating current; it does not replace a current value mandated by the selected standard.'],
};

const blueprints: Record<string, Blueprint> = {
  'motor-full-load-current': {
    quickAnswer: 'Calculate current for early engineering estimates, but use the current basis required by the selected standard for each final conductor, overload, and fault-protection decision.',
    summary: 'Establish the motor current basis before sizing conductors or protection. A calculated current, a manufacturer nameplate value, and a standards table value can serve different purposes and must not be substituted without checking the governing rule.',
    applicability: ['Single- and three-phase motors supplied directly or through motor-control equipment.', 'Use separate rules for VFD input circuits, multispeed motors, intermittent duty, and other special applications.'],
    requirements: ['Record motor output rating, voltage, phase, frequency, duty, efficiency, power factor, service factor, and nameplate current.', 'Identify which current basis the selected standard assigns to each design function.', 'Use the equipment nameplate where the applicable overload or equipment rule calls for it; use an official table only where the standard directs.'],
    formula: powerFormula,
    table: { title: 'Motor current values and their uses', type: 'comparison', columns: ['Current value', 'What it represents', 'Typical engineering use', 'Final check'], rows: [['Calculated current', 'Estimate from power, voltage, efficiency, and power factor', 'Early load schedules and plausibility checks', 'Do not substitute for a standards-defined value'], ['Nameplate current', 'Manufacturer-rated motor current', 'Equipment-specific checks and overload work where applicable', 'Confirm the selected rule calls for it'], ['Standards table current', 'Current published for a defined motor rating', 'Code calculations where explicitly required', 'Use the correct voltage, phase, motor type, and edition']], purpose: 'Separates values that are often incorrectly treated as interchangeable.' },
    figure: { title: 'Current values are inputs to different checks', description: 'An original decision flow separating engineering estimates from standards-defined sizing currents.', nodes: ['Motor data', 'Current basis', 'Conductors', 'Overload protection', 'Fault protection'] },
    example: { title: '37 kW motor current estimate', given: ['37 kW, 400 V, three-phase motor', 'Assumed efficiency 0.92 and power factor 0.86'], assumptions: ['Balanced sinusoidal supply', 'Values are fictional and used only to demonstrate workflow'], rule: 'The governing standard-specific current basis must be selected before the estimate is used for design.', steps: ['Convert output power: P = 37,000 W.', 'Calculate I = 37,000 / (√3 × 400 × 0.92 × 0.86).', 'Calculated current ≈ 67.5 A.', 'Compare the estimate with the nameplate and the current basis required by the official rule.'], result: 'Approximately 67.5 A engineering estimate; not an automatically compliant sizing current.', interpretation: 'The estimate supports planning and plausibility checks, while the standards-defined basis controls final conductor and protection design.' },
    workflows: [{ title: 'Motor current basis workflow', steps: ['Record rating, voltage, phase, efficiency, power factor, duty, and service factor', 'Calculate an engineering estimate', 'Obtain the motor nameplate current', 'Identify the standard-required current basis for each design function', 'Document the value used for conductors, overloads, and fault protection'] }],
    calculators: ['three-phase-current'],
    notes: ['Keep a calculation record showing which current value was used for each design decision.'],
    exceptions: ['Special-duty, multispeed, wound-rotor, hermetic-refrigerant, and drive-fed motors can require different treatment.'],
    mistakes: ['Using nameplate current for every motor calculation.', 'Presenting a calculated current as though it came from a standards table.'],
  },
  'motor-branch-circuit-conductors': {
    quickAnswer: 'Choose a standards-defined motor current basis, establish the required minimum ampacity, and then prove that the conductor remains adequate after installation and termination constraints are applied.',
    summary: 'Size the motor branch-circuit conductors using the current basis and minimum relationship required by the applicable motor rules, then confirm that installation conditions do not reduce usable ampacity below the required value.',
    applicability: ['Conductors between the final branch protective device and a single motor or its controller.', 'Feeder conductors, multiple-motor circuits, VFD circuits, and intermittent-duty motors require additional or different checks.'],
    requirements: ['Determine the standards-defined motor current basis.', 'Apply the verified minimum conductor relationship from the official edition.', 'Select an ampacity using the correct wiring method and termination temperature.', 'Apply ambient, grouping, and other correction or adjustment factors.', 'Coordinate separately with overload and short-circuit/ground-fault protection.'],
    formula: { name: 'Conductor acceptance relationship', expression: 'I_usable ≥ I_required', variables: [{ symbol: 'I_usable', definition: 'Conductor ampacity after applicable corrections and terminal limitations', unit: 'A' }, { symbol: 'I_required', definition: 'Minimum ampacity produced by the verified standard-specific motor rule', unit: 'A' }], units: 'Both quantities are amperes.', basis: 'derived-from-standard', whenToUse: 'Use after the official rule establishes the required ampacity and the installation method establishes usable ampacity.', workedInputExample: 'If a verified rule produces I_required = 52.5 A, the selected conductor must have I_usable of at least 52.5 A.', notes: ['The relationship is a design check. The multiplier or sizing basis that creates I_required must be verified in the official edition.'] },
    table: { title: 'Motor branch-circuit design functions', type: 'requirement', columns: ['Design item', 'Purpose', 'Typical basis', 'Related requirement'], rows: [['Branch conductor', 'Carry motor current without excessive heating', 'Standard-defined motor current plus verified installation corrections', 'Motor conductor and general ampacity rules'], ['Overload relay', 'Protect the motor from sustained overload and heating', 'Motor/nameplate basis where the rule calls for it', 'Motor overload rule'], ['Breaker or fuse', 'Clear short circuit and ground fault', 'Device-specific motor rule', 'Branch fault-protection rule'], ['Disconnect', 'Provide isolation', 'Motor/controller location and rating rules', 'Motor disconnect rule']], purpose: 'The four selections are coordinated, but one current value or percentage does not perform every function.' },
    figure: { title: 'Motor branch circuit', description: 'Each block has a separate sizing or selection function.', nodes: ['Supply', 'Short-circuit / ground-fault protection', 'Disconnect', 'Contactor / controller', 'Overload protection', 'Motor'], annotation: 'Conductor sizing, breaker or fuse sizing, overload sizing, and disconnect sizing are related but separate requirements.' },
    example: { title: 'Select by corrected ampacity', given: ['Standards-defined current value: 42 A (fictional)', 'Cable installed with other loaded circuits in a warm area'], assumptions: ['No numeric standard multiplier is assumed', 'Official tables are available to the designer'], rule: 'The corrected ampacity must meet the verified minimum relationship for the circuit.', steps: ['Obtain the minimum ampacity relationship from the cited official rule.', 'Calculate the required ampacity using the 42 A basis.', 'Select a tentative conductor from the official ampacity table.', 'Apply verified temperature and grouping factors.', 'Increase conductor size if corrected ampacity is insufficient.'], result: 'The workflow produces a defensible conductor selection; a size is intentionally not stated until official table values are supplied.', interpretation: 'Conductor ampacity, overload setting, and fault-protective-device rating are three coordinated but distinct decisions.' },
    notes: ['Document pre-correction and post-correction ampacity.'],
    workflows: [{ title: 'Motor branch-circuit workflow', steps: ['Determine the standards-defined motor current basis', 'Establish required branch-conductor ampacity', 'Select wiring method and candidate conductor', 'Apply temperature, grouping, and other corrections', 'Select overload protection', 'Select branch short-circuit/ground-fault protection', 'Select the disconnect', 'Verify coordination and grounding/bonding'] }],
    exceptions: ['Duty cycle, motor type, drive output, flexible cable, and multiple motors can change the method.'],
    mistakes: ['Using one percentage for conductors, overloads, and breakers.', 'Selecting a conductor before applying correction factors.'],
  },
  'motor-overload-protection': {
    quickAnswer: 'Overload protection limits sustained thermal stress in the motor; it is not the breaker or fuse function used to clear high-magnitude faults.',
    summary: 'Provide motor overload protection that responds to sustained overcurrent or thermal stress. It is coordinated with the motor data and starting duty and is distinct from branch short-circuit and ground-fault protection.',
    applicability: ['Motors requiring protection against overload, stalled operation, or abnormal heating.', 'Integral thermal protection or supervised special applications may change the external-device requirements.'],
    requirements: ['Identify the motor nameplate data and the overload method.', 'Verify the permitted setting or sizing relationship for service factor, temperature rise, duty, and device type.', 'Confirm that the setting permits normal acceleration without compromising thermal protection.', 'Provide separate fault protection where required.'],
    table: { title: 'Motor protection functions', type: 'comparison', columns: ['Device or function', 'Protects against', 'Selection input', 'What it does not replace'], rows: [['Overload relay / thermal model', 'Sustained overload, stall, or abnormal heating', 'Motor data and verified overload rule', 'Branch short-circuit protection'], ['Breaker or fuse', 'Short circuit and ground fault', 'Device type, motor rule, and fault duty', 'Motor thermal overload protection'], ['Motor thermal sensor', 'Internal winding or bearing temperature', 'Manufacturer limits and control scheme', 'Required branch protective devices'], ['Controller', 'Starting and stopping duty', 'Utilization category, duty, and motor rating', 'Upstream fault interruption unless listed for it']], purpose: 'Original comparison table showing why protection functions must be selected separately.' },
    figure: { title: 'Fault protection versus overload protection', description: 'An original series diagram locating both functions in a typical motor branch circuit.', nodes: ['Branch breaker / fuse — fault protection', 'Controller — switching duty', 'Overload relay — thermal protection', 'Motor — protected load'], annotation: 'The upstream fault device and downstream overload function respond to different abnormal conditions and use different selection rules.' },
    example: { title: 'Set an overload without inventing a multiplier', given: ['Motor nameplate current: 18.6 A', 'Known service factor and starting time'], assumptions: ['Fictional motor data', 'No verified standards multiplier is embedded'], rule: 'Use the applicable official setting relationship and conditions for the chosen standard and device.', steps: ['Record the 18.6 A nameplate current and qualification data.', 'Look up the permitted relationship and maximum setting in the official source.', 'Set the relay accordingly and verify the acceleration curve.', 'Document any permitted increase and the reason.'], result: 'A setting is not published until the standard relationship and device instructions are verified.', interpretation: 'Avoiding nuisance trips is a coordination task, not permission to defeat motor thermal protection.' },
    notes: ['Electronic relays can add phase-loss, imbalance, and thermal-model functions.'],
    workflows: [{ title: 'Overload selection workflow', steps: ['Record motor nameplate and duty data', 'Identify the permitted overload method', 'Verify the applicable standard setting relationship', 'Check acceleration time and restart duty', 'Coordinate phase-loss and imbalance functions', 'Document any permitted setting increase', 'Commission and record the final setting'] }],
    exceptions: ['Integral protectors, automatically restarted equipment, and special-duty motors need additional review.'],
    mistakes: ['Treating the branch breaker as the overload device.', 'Increasing a setting without documenting the permitted condition.'],
  },
  'motor-short-circuit-protection': {
    summary: 'Select branch short-circuit and ground-fault protection to clear faults while allowing normal motor starting. Its rating can follow motor-specific rules and must be coordinated with the controller, conductors, overload protection, and available fault current.',
    applicability: ['Motor branch circuits using fuses, inverse-time breakers, instantaneous-trip devices, or listed combinations.', 'Feeder protection and overload protection remain separate checks.'],
    requirements: ['Identify the permitted protective-device type and the standards-defined motor current basis.', 'Verify the initial maximum relationship and any conditional increase from the official edition.', 'Confirm interrupting rating, combination/SCCR limitations, and conductor protection.', 'Document starting performance and selective-coordination considerations where applicable.'],
    table: genericSelectionTable('Motor fault-protection decision path', ['Protective-device type?', 'Starting current and acceleration time?', 'Available fault current?', 'Controller or combination rating?', 'Permitted increase documented?']),
    figure: { title: 'Motor protection layers', description: 'An original protection-chain diagram showing the separate thermal and fault functions.', nodes: ['Supply fault level', 'Branch SCPD', 'Controller SCCR', 'Overload', 'Motor'] },
    example: { title: 'Choose a device through coordinated checks', given: ['Fictional motor current basis: 64 A', 'High-inertia load with documented acceleration time'], assumptions: ['No device multiplier is assumed', 'Manufacturer time-current data are available'], rule: 'Start with the verified device-specific rule, then evaluate starting and fault performance.', steps: ['Select the allowed protective-device family.', 'Apply the verified rule to establish the initial maximum rating.', 'Overlay the starting-current profile on the device curve.', 'Check interrupting rating and controller combination rating.', 'If starting fails, use only a permitted adjustment and document it.'], result: 'The device selection remains pending until the official multiplier and equipment ratings are verified.', interpretation: 'A numerically larger motor branch device is not automatically an overload-protection failure because the functions differ.' },
    notes: ['Available fault current must not exceed the ratings of the assembled motor-control equipment.'],
    exceptions: ['Listed combination controllers and instantaneous-trip-only devices can have special conditions.'],
    mistakes: ['Applying general branch-circuit limits without motor-specific review.', 'Ignoring controller SCCR.'],
  },
  'conductor-ampacity': {
    summary: 'Determine usable conductor ampacity from the correct installation method and conductor characteristics, then apply all required corrections, adjustments, termination limits, and load rules before selecting a conductor.',
    applicability: ['Power and lighting conductors in raceways, cables, trays, and other recognized wiring methods.', 'Flexible cords, winding conductors, busbars, and equipment-internal wiring may use other standards.'],
    requirements: ['Identify conductor material, insulation, wiring method, ambient temperature, grouping, and load profile.', 'Use the official ampacity table that matches the installation.', 'Apply correction and adjustment factors without treating insulation temperature as automatic permission to exceed termination limits.', 'Check continuous/noncontinuous loading and neutral/harmonic treatment under the applicable rules.'],
    table: genericSelectionTable('Ampacity determination sequence', ['Wiring method?', 'Conductor material and insulation?', 'Ambient temperature?', 'Number of loaded conductors or grouping?', 'Termination rating?', 'Load and harmonic conditions?']),
    figure: { title: 'From base ampacity to usable ampacity', description: 'An original flow showing successive design constraints.', nodes: ['Load basis', 'Official base table', 'Corrections', 'Termination limit', 'Selected conductor'] },
    example: { title: 'Apply factors without reproducing a code table', given: ['Design current: 76 A', 'Warm ambient and grouped circuits'], assumptions: ['Fictional project', 'Official table values and factors must be supplied from the selected edition'], rule: 'Usable ampacity after applicable corrections must satisfy the governing load requirement and terminal limitations.', steps: ['Select the installation-method table.', 'Record the candidate base ampacity.', 'Apply verified ambient and grouping factors.', 'Check the corrected result against the design requirement.', 'Check the equipment termination temperature limitation.'], result: 'The example defines the calculation sequence but intentionally does not invent an ampacity or factor.', interpretation: 'Conductor size alone does not determine usable ampacity.' },
    notes: ['Keep the official table reference and every applied factor in the calculation record.'],
    exceptions: ['Special cables, rooftop exposure, harmonic-rich neutrals, parallel sets, and fire-resistant systems need additional rules.'],
    mistakes: ['Reading a table without correcting for the installation.', 'Using the highest insulation column despite a lower terminal rating.'],
  },
  'voltage-drop-guidance': {
    quickAnswer: 'Calculate steady-state and starting voltage loss with a declared impedance and length basis, then compare the result with a verified mandatory rule, recommendation, or project performance criterion.',
    summary: 'Evaluate conductor voltage loss as a performance and equipment-operability check. Determine whether the cited standard treats a target as mandatory, informational, recommended, or project design practice before labeling it a limit.',
    applicability: ['Feeders and branch circuits where length, current, starting duty, or sensitive loads can cause unacceptable terminal voltage.', 'Protection, ampacity, motor starting, and power-quality checks are still required separately.'],
    requirements: ['State whether length is one-way or loop length.', 'Use resistance at an appropriate conductor temperature and include reactance when material.', 'Evaluate steady-state and transient starting conditions separately.', 'Identify the authority for any percentage criterion.'],
    formula: { name: 'Approximate AC voltage drop', expression: '1φ: Vd = 2 × I × L × (R cosφ + X sinφ)\n3φ: Vd = √3 × I × L × (R cosφ + X sinφ)', variables: [{ symbol: 'Vd', definition: 'Voltage drop', unit: 'V' }, { symbol: 'I', definition: 'Circuit current', unit: 'A' }, { symbol: 'L', definition: 'One-way circuit length', unit: 'km' }, { symbol: 'R', definition: 'AC resistance per conductor at the assumed temperature', unit: 'Ω/km' }, { symbol: 'X', definition: 'Reactance per conductor', unit: 'Ω/km' }, { symbol: 'φ', definition: 'Load phase angle', unit: 'degrees' }], units: 'With Ω/km and km, the result is volts.', basis: 'general-engineering', whenToUse: 'Estimate balanced AC circuit voltage drop when conductor resistance, reactance, power factor, and one-way length are known.', workedInputExample: '3φ, 80 A, 0.12 km, R 0.30 Ω/km, X 0.08 Ω/km, PF 0.85 gives approximately 4.94 V.', notes: ['For DC or simplified resistive estimates, explicitly state omitted reactance and temperature assumptions.'] },
    table: { title: 'Common voltage-drop calculation approaches', type: 'comparison', columns: ['Approach', 'Inputs', 'Suitable use', 'Limitation'], rows: [['Resistance-only', 'Current, length, resistance', 'Early DC or near-unity-power-factor estimate', 'Omits reactance and phase angle'], ['R–X analytical', 'Current, length, R, X, power factor', 'Balanced single- or three-phase feeder estimate', 'Depends on representative impedance and temperature'], ['Manufacturer software / network model', 'Cable geometry, temperature, sources, loads, starting data', 'Detailed design and transient studies', 'Requires validated model inputs']], purpose: 'Choose a method proportionate to the circuit and document whether the acceptance criterion is mandatory, recommended, or project-defined.' },
    figure: { title: 'Voltage-drop calculation boundary', description: 'An original one-line diagram identifying source, route, and load terminals.', nodes: ['Source voltage', 'Feeder impedance', 'Branch impedance', 'Load terminal voltage'] },
    example: { title: 'Three-phase feeder drop', given: ['I = 80 A', 'L = 0.12 km one way', 'R = 0.30 Ω/km, X = 0.08 Ω/km', 'Power factor = 0.85 lagging'], assumptions: ['Balanced three-phase load', 'Impedance values are fictional example inputs'], rule: 'Use a stated engineering method, then compare the result with the verified project or standards criterion.', steps: ['sinφ = √(1 − 0.85²) ≈ 0.527.', 'Vd = √3 × 80 × 0.12 × (0.30 × 0.85 + 0.08 × 0.527).', 'Vd ≈ 4.94 V.', 'For a 400 V system, percentage drop ≈ 100 × 4.94 / 400 = 1.24%.'], result: 'Calculated steady-state drop: approximately 4.94 V, or 1.24% of 400 V.', interpretation: 'The arithmetic is general engineering; acceptability depends on the verified standard, project criterion, and load behavior.' },
    notes: ['Motor-starting and nonlinear-load studies may require a more complete network model.'],
    workflows: [{ title: 'Voltage-drop design workflow', steps: ['Define the operating case and acceptance criterion', 'Confirm one-way route length and system phase', 'Select resistance at the assumed conductor temperature', 'Include reactance and power factor where material', 'Calculate voltage drop and percentage', 'Repeat for starting or transient cases if required', 'Compare with the verified criterion and document the source'] }],
    calculators: ['voltage-drop'],
    exceptions: ['Emergency, fire-safety, sensitive electronic, and utility-interface circuits may have separate performance criteria.'],
    mistakes: ['Doubling a one-way length in a three-phase formula that already defines the path.', 'Calling a recommendation a mandatory limit.'],
  },
  'equipment-grounding-conductors': {
    summary: 'Provide a reliable protective fault-current path and bond exposed conductive parts so a fault can be detected and disconnected by the protective measure. Neutral and protective-conductor functions must remain distinct except at specifically permitted points.',
    applicability: ['Exposed conductive equipment parts, raceways, cable armor, and bonding paths associated with low-voltage installations.', 'Earthing-system type and supply arrangement determine the detailed path and terminology.'],
    requirements: ['Identify the earthing/grounding arrangement and permitted bonding point.', 'Size or select the protective conductor using the method required by the applicable standard.', 'Maintain electrical and mechanical continuity.', 'Coordinate impedance with the protective device and disconnection requirement.', 'Identify conductors correctly and avoid normal load current on protective paths.'],
    table: genericSelectionTable('Protective conductor design checks', ['Earthing or grounding arrangement?', 'Fault-current return path?', 'Sizing method?', 'Protective-device operating condition?', 'Continuity across joints?', 'Neutral separation maintained?']),
    figure: { title: 'Normal-current and fault-current paths', description: 'An original conceptual diagram separates neutral/load return from the equipment protective path.', nodes: ['Source bonding point', 'Line and neutral', 'Equipment enclosure', 'Protective conductor', 'Fault return'] },
    example: { title: 'Verify a protective path', given: ['Metal enclosure supplied by a feeder', 'Protective device and conductor route are known'], assumptions: ['No conductor size is assumed', 'The applicable earthing arrangement is documented'], rule: 'The selected path must meet the official sizing and automatic-disconnection requirements.', steps: ['Draw the complete fault loop.', 'Identify every bonding connection and parallel path.', 'Select the conductor by the verified table or calculation method.', 'Check protective-device operation using the verified fault-loop criterion.', 'Record continuity and inspection requirements.'], result: 'A compliant size and disconnection result require the official table/method and project impedance data.', interpretation: 'Earth itself is not assumed to be the sole effective fault-current return path.' },
    notes: ['Terminology differs: NEC equipment grounding conductor and IEC protective conductor are related concepts but not automatically identical in every application.'],
    exceptions: ['Combined protective-and-neutral conductors, impedance-grounded systems, and special installations have additional restrictions.'],
    mistakes: ['Treating neutral and protective earth as interchangeable.', 'Bonding them together at downstream equipment without a verified rule.'],
  },
  'generator-neutral-grounding': {
    quickAnswer: 'Trace the neutral in every ATS position before deciding where to bond the generator. A switched neutral and a solid neutral create different fault-return and source-classification questions.',
    summary: 'Determine the generator neutral and bonding arrangement from the source configuration and transfer scheme. Neutral switching is central to deciding whether the generator operates as a separately derived source and where a neutral-to-ground connection is permitted.',
    applicability: ['Low-voltage generator systems connected through transfer equipment.', 'Paralleled generators, medium-voltage systems, and impedance grounding require system studies beyond this quick reference.'],
    requirements: ['Document whether the transfer equipment switches the neutral.', 'Classify the source arrangement under the applicable standard.', 'Provide one intentional bonding arrangement for each operating mode as required.', 'Coordinate grounding-electrode, protective-conductor, and ground-fault sensing paths.', 'Verify transferred and non-transferred neutral behavior in every switch position.'],
    table: { title: 'Generator neutral decision guide', type: 'decision', columns: ['Question', 'If yes', 'If no'], rows: [['Is the neutral switched by the ATS?', 'Evaluate separately derived source requirements and a generator-side bond under the selected standard.', 'Neutral may remain common with the utility system; trace normal-current and fault-current paths.'], ['Is the generator neutral bonded locally?', 'Verify the bond is required and does not create a parallel neutral path.', 'Identify the upstream intentional bond and verify fault-return continuity.'], ['Is ground-fault protection installed?', 'Coordinate sensor placement and neutral treatment in every operating mode.', 'Continue the standard grounding and bonding checks; absence of GFP does not settle bonding.']], purpose: 'Explanatory decision aid. It does not replace the exact source-classification or bonding rule.' },
    figure: { title: 'Utility and generator through an ATS', description: 'Both sources feed one transfer point before the load.', nodes: ['Utility source', 'ATS source selection', 'Load'], paths: [['Generator source', 'ATS source selection', 'Load']], annotation: 'The neutral-pole configuration must be identified separately from the phase-source selection.' },
    extraFigures: [{ title: '3-pole ATS — neutral not switched', type: 'schematic', description: 'Either source can feed the switched phase poles while the load neutral remains connected to the common source-neutral system.', nodes: ['Selected utility or generator phases', '3-pole ATS', 'Load phases'], paths: [['Utility neutral', 'Common neutral bar', 'Load neutral'], ['Generator neutral', 'Common neutral bar']], annotation: 'A local generator neutral bond can create an objectionable parallel path; verify the selected standard and system design.' }, { title: '4-pole ATS — neutral switched', type: 'schematic', description: 'Phase conductors and neutral transfer together, isolating the inactive source neutral.', nodes: ['Utility phases + neutral', '4-pole ATS', 'Load phases + neutral'], paths: [['Generator phases + neutral', '4-pole ATS', 'Load phases + neutral'], ['Generator bonding point', 'Protective path', 'Load enclosure']], annotation: 'This arrangement prompts a separately derived source review; it does not by itself replace the official classification rule.' }],
    example: { title: 'Review a four-pole transfer arrangement', given: ['Utility and generator feed one ATS', 'All phase conductors and neutral are switched'], assumptions: ['Fictional low-voltage installation', 'No parallel source operation'], rule: 'Classify the generator arrangement and locate bonding only after verifying the applicable standard.', steps: ['Trace phase, neutral, and protective paths in utility mode.', 'Repeat in generator mode.', 'Identify whether switching isolates the generator neutral from the utility source bond.', 'Check the required generator bonding and grounding-electrode connection.', 'Verify ground-fault sensing in both modes.'], result: 'The diagram supports a separately-derived-source review, but the final classification and bond location remain source-dependent.', interpretation: 'ATS pole configuration is a design input, not a drafting detail.' },
    notes: ['Commissioning should test transfer positions and neutral continuity.'],
    workflows: [{ title: 'Generator neutral decision workflow', steps: ['Draw utility, generator, neutral, and protective paths', 'Identify whether the ATS switches the neutral', 'Trace each path in utility, generator, and transition states', 'Classify the generator arrangement under the selected standard', 'Locate the permitted intentional neutral-to-ground bond', 'Coordinate grounding electrode and ground-fault sensing', 'Inspect and test the installed transfer states'] }],
    exceptions: ['Overlapping-neutral transfer, multiple ATSs, paralleling gear, and impedance-grounded systems need specialist review.'],
    mistakes: ['Assuming every generator is separately derived.', 'Creating parallel neutral current through duplicate bonds.'],
  },
  'transformer-primary-protection': {
    summary: 'Coordinate transformer primary overcurrent protection with transformer rated current, inrush, conductor protection, secondary arrangements, and equipment fault ratings. Primary protection does not automatically complete every secondary-conductor protection obligation.',
    applicability: ['Power and distribution transformers supplied from low-voltage systems.', 'Instrument, control, dry-type, liquid-filled, and medium-voltage transformers may invoke different equipment or installation rules.'],
    requirements: ['Calculate rated primary current from transformer rating and voltage.', 'Select the permitted primary-only or primary-and-secondary protection arrangement.', 'Verify the official maximum device relationship and rounding provisions.', 'Check inrush tolerance and available fault current.', 'Evaluate primary and secondary conductors independently.'],
    formula: { name: 'Three-phase transformer rated current', expression: 'I = S / (√3 × V)', variables: [{ symbol: 'I', definition: 'Rated line current', unit: 'A' }, { symbol: 'S', definition: 'Three-phase apparent power', unit: 'VA' }, { symbol: 'V', definition: 'Line-to-line voltage', unit: 'V' }], units: 'Use volt-amperes and volts to obtain amperes.', basis: 'general-engineering', notes: ['This calculates rated current; protection multipliers and permitted next-size rules must come from the official standard.'] },
    table: genericSelectionTable('Transformer primary protection workflow', ['Transformer type and rating?', 'Primary rated current?', 'Protection arrangement?', 'Permitted device relationship?', 'Inrush checked?', 'Secondary conductors and protection checked?']),
    figure: { title: 'Transformer protection boundaries', description: 'An original one-line separating primary device, transformer, secondary conductors, and secondary device.', nodes: ['Source', 'Primary OCPD', 'Transformer', 'Secondary conductors', 'Secondary OCPD', 'Loads'] },
    example: { title: 'Calculate rated current before selecting protection', given: ['500 kVA, 11 kV/400 V, three-phase transformer'], assumptions: ['Fictional project', 'Losses ignored for rated-current calculation'], rule: 'Use rated current as an input, then apply the verified protection arrangement and device rule.', steps: ['Primary current = 500,000 / (√3 × 11,000) ≈ 26.2 A.', 'Secondary current = 500,000 / (√3 × 400) ≈ 721.7 A.', 'Select the applicable primary/secondary protection arrangement.', 'Apply only verified device relationships and check inrush.', 'Check secondary conductors separately.'], result: 'Rated currents are approximately 26.2 A primary and 721.7 A secondary; protective-device ratings remain pending official-rule verification.', interpretation: 'The large current transformation explains why primary protection alone may not fully protect secondary conductors.' },
    notes: ['Manufacturer inrush and withstand data are important coordination inputs.'],
    workflows: [{ title: 'Transformer protection workflow', steps: ['Record kVA, voltages, phase, type, and impedance', 'Calculate primary and secondary rated currents', 'Select the permitted protection arrangement', 'Apply verified protective-device rules', 'Check transformer inrush and device curves', 'Check primary and secondary conductors independently', 'Coordinate grounding, bonding, and fault ratings'] }],
    calculators: ['transformer-current'],
    exceptions: ['Autotransformers, supervised installations, fire pumps, and transformers with integral protection can use special rules.'],
    mistakes: ['Assuming the primary device always protects secondary conductors.', 'Selecting solely from rated current without checking inrush.'],
  },
  'working-clearances': {
    summary: 'Provide and preserve safe working space, access, illumination, and equipment-door clearance around equipment likely to require examination, adjustment, servicing, or maintenance while energized. Dimensions depend on the verified voltage and exposure condition.',
    applicability: ['Switchboards, panelboards, switchgear, motor-control equipment, and similar serviceable equipment.', 'Dedicated equipment space, egress, arc-flash boundaries, and accessibility can impose separate requirements.'],
    requirements: ['Classify nominal voltage and the condition on each side of the working space.', 'Use the official table for required depth where applicable.', 'Verify width, height, access/egress, illumination, and door opening.', 'Keep the required space clear of storage and conflicting building services.', 'Coordinate layout before architectural dimensions are fixed.'],
    table: genericSelectionTable('Clearance layout review', ['Nominal voltage?', 'Exposed-live-parts condition?', 'Required depth from official table?', 'Width and height?', 'Door swing and egress?', 'Dedicated space and foreign systems?', 'Illumination and storage control?']),
    figure: { title: 'Working-space measurement envelope', description: 'An original conceptual plan/elevation sequence for checking the service envelope.', nodes: ['Equipment face', 'Required depth', 'Required width', 'Required height', 'Access / egress'] },
    example: { title: 'Lay out a switchboard room', given: ['Front-access switchboard', 'Opposing wall and inward room access'], assumptions: ['Dimensions are deliberately omitted until an official table is consulted', 'Fictional room'], rule: 'Use the verified voltage/condition row plus all independent width, height, access, and dedicated-space rules.', steps: ['Classify voltage and opposing-surface condition.', 'Read the required depth from the official table.', 'Overlay equipment-door swing and service access.', 'Check width, height, egress, illumination, and dedicated space.', 'Issue the verified envelope to the architectural model.'], result: 'The layout is not released until each dimension is traced to the official edition.', interpretation: 'A floor-space rectangle alone is not a complete working-clearance review.' },
    notes: ['Arc-flash PPE boundaries and code working space answer different safety questions.'],
    exceptions: ['Low-voltage equipment, existing installations, guarded locations, and large equipment can have special provisions.'],
    mistakes: ['Using required working space for storage.', 'Checking depth but ignoring width, height, door swing, or egress.'],
  },
};

export const enrichedTopicIds = Object.keys(blueprints);

export function enrichStandard(topicId: string, standardId: StandardId, base: TopicStandard): TopicStandard {
  const blueprint = blueprints[topicId];
  if (!blueprint) return base;
  const profile = profiles[standardId];
  return {
    ...base,
    standardName: profile.name,
    edition: profile.edition,
    references: [base.reference],
    quickAnswer: blueprint.quickAnswer ?? blueprint.summary,
    summary: `${blueprint.summary} ${profile.approach}`,
    applicability: blueprint.applicability,
    notApplicable: blueprint.notApplicable ?? blueprint.exceptions,
    importantConditions: blueprint.importantConditions ?? blueprint.requirements.slice(0, 3),
    requirements: blueprint.requirements,
    terminology: profile.terminology,
    formulas: [...(blueprint.formulas ?? []), ...(blueprint.formula ? [blueprint.formula] : [])].map((formula) => ({ ...formula, sourceReference: formula.sourceReference ?? 'General engineering relationship; verify standards application separately.' })),
    tables: [{ ...blueprint.table, sourceReference: base.reference }],
    figures: [blueprint.figure, ...(blueprint.extraFigures ?? [])].map((figure) => ({ ...figure, type: figure.type ?? 'schematic', sourceBasis: 'Original Voltwise figure based on the summarized engineering concept.' })),
    examples: [{ ...blueprint.example, applicableRule: blueprint.example.rule, sourceReferences: [base.reference] }],
    workflows: blueprint.workflows,
    calculators: blueprint.calculators,
    engineeringNotes: blueprint.notes,
    exceptions: blueprint.exceptions,
    commonMistakes: blueprint.mistakes,
    verification: {
      standard: profile.name,
      edition: profile.edition,
      references: [base.reference],
      reviewStatus: 'Needs source',
      lastReviewed: '2026-09-26',
      sourceStatus: profile.sourceNote,
    },
    comparison: {
      terminology: profile.terminology,
      designBasis: profile.approach,
      distinction: standardId === 'pec' ? 'Do not infer equivalence from NEC structure; verify the PEC text and Philippine application.' : standardId === 'iec' ? 'The governing material may span several IEC publications and a national adoption.' : 'Motor and installation functions are commonly separated among NEC articles and must be coordinated.',
    },
  };
}
