import { FilePlus2, Printer, Save } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CalculatorId } from '../types';
import { calculationRecordStore, type CalculationFieldValue, type LocalCalculationRecord } from '../services';

interface CalculationFieldsContextValue {
  fields: Record<string, CalculationFieldValue>;
  setField: (key: string, value: CalculationFieldValue) => void;
}

const CalculationFieldsContext = createContext<CalculationFieldsContextValue | null>(null);

export function EngineeringCalculator({ id }: { id: CalculatorId }) {
  const calculators: Record<CalculatorId, { title: string; reference: string; view: ReactNode }> = {
    'three-phase-current': { title: 'Three-Phase Motor Current', reference: 'General engineering current estimate; verify the applicable PEC Article 4.30 current basis.', view: <ThreePhaseCurrentCalculator /> },
    'voltage-drop': { title: 'AC Voltage Drop', reference: 'General engineering calculation; see applicable PEC branch-circuit and feeder notes.', view: <VoltageDropCalculator /> },
    'conductor-design': { title: 'Conductor Ampacity and Voltage Drop', reference: 'PEC §§3.10.1.15, 1.10.1.14(c), 2.10.2.1(a), and 2.15.1.2(a).', view: <ConductorDesignWorksheet /> },
    'transformer-current': { title: 'Transformer Rated Current', reference: 'General engineering rated-current calculation; apply PEC Article 4.50 separately.', view: <TransformerCurrentCalculator /> },
    'transformer-protection': { title: 'Transformer Rated Current and Protection', reference: 'PEC §4.50.1.3 and Table 4.50.1.3(b), supplied PDF pp. 417-419.', view: <TransformerProtectionWorksheet /> },
    'motor-disconnect-controller': { title: 'Motor Disconnect and Controller', reference: 'PEC §§4.30.6.1-.4, 4.30.7.1-.11, and 4.30.9.1-.13, supplied PDF pp. 386-397.', view: <MotorDisconnectControllerWorksheet /> },
    'transformer-grounding': { title: 'Transformer Grounding and Bonding', reference: 'PEC §§2.50.1.4, 2.50.2.9, 2.50.2.11, and 4.50.1.10, supplied PDF pp. 110-118 and 422.', view: <TransformerGroundingWorksheet /> },
    'working-clearance': { title: 'Working Clearances', reference: 'PEC §1.10.2.1(a)-(f) and Table 1.10.2.1(a)(1), supplied PDF pp. 22-24.', view: <WorkingClearanceWorksheet /> },
    'service-equipment': { title: 'Services and Service Equipment', reference: 'PEC Article 2.30 and §2.50.2.5, supplied PDF pp. 75-90 and 113-115.', view: <ServiceEquipmentWorksheet /> },
    'generator-neutral-grounding': { title: 'Generator Neutral Grounding', reference: 'PEC Separately Derived System definition; §§2.50.2.1(d), 2.50.2.11, 4.45.1.13, and 7.2.1.6, supplied PDF pp. 10, 113-119, 416, and 740-741.', view: <GeneratorNeutralGroundingWorksheet /> },
  };
  const calculator = calculators[id];
  return <PrintableCalculationSheet calculatorId={id} title={calculator.title} reference={calculator.reference}>{calculator.view}</PrintableCalculationSheet>;
}

function PrintableCalculationSheet({ calculatorId, title, reference, children }: { calculatorId: CalculatorId; title: string; reference: string; children: ReactNode }) {
  const [records, setRecords] = useState(() => calculationRecordStore.read().filter((record) => record.calculatorId === calculatorId));
  const [activeId, setActiveId] = useState('');
  const [project, setProject] = useState('');
  const [equipment, setEquipment] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [checkedBy, setCheckedBy] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [assumptions, setAssumptions] = useState('');
  const [sourceEvidence, setSourceEvidence] = useState('');
  const [fields, setFields] = useState<Record<string, CalculationFieldValue>>({});
  const [savedMessage, setSavedMessage] = useState('Not saved');
  const setField = useCallback((key: string, value: CalculationFieldValue) => {
    setFields((current) => {
      if (current[key] === value) return current;
      setSavedMessage('Unsaved changes');
      return { ...current, [key]: value };
    });
  }, []);
  const requiredMetadata = Boolean(project.trim() && equipment.trim() && preparedBy.trim());
  const workflowReady = fields.workflowReady === true;
  const status: LocalCalculationRecord['status'] = !requiredMetadata || !workflowReady ? 'incomplete' : checkedBy.trim() && sourceEvidence.trim() ? 'complete' : 'needs-verification';

  function newRecord() {
    setActiveId(''); setProject(''); setEquipment(''); setPreparedBy(''); setCheckedBy('');
    setDate(new Date().toISOString().slice(0, 10)); setAssumptions(''); setSourceEvidence(''); setFields({}); setSavedMessage('New unsaved record');
  }

  function loadRecord(id: string) {
    const record = records.find((item) => item.id === id);
    if (!record) return newRecord();
    setActiveId(record.id); setProject(record.project); setEquipment(record.equipment); setPreparedBy(record.preparedBy); setCheckedBy(record.checkedBy);
    setDate(record.calculationDate); setAssumptions(record.assumptions); setSourceEvidence(record.sourceEvidence); setFields(record.fields); setSavedMessage(`Loaded ${record.project} · ${record.equipment}`);
  }

  function saveRecord() {
    const id = activeId || `${calculatorId}-${Date.now()}`;
    const record: LocalCalculationRecord = { id, calculatorId, project, equipment, preparedBy, checkedBy, calculationDate: date, assumptions, sourceEvidence, fields, status, updatedAt: new Date().toISOString() };
    calculationRecordStore.save(record);
    const next = calculationRecordStore.read().filter((item) => item.calculatorId === calculatorId);
    setRecords(next); setActiveId(id); setSavedMessage('Saved locally');
  }

  useEffect(() => {
    const requestedId = calculationRecordStore.consumeOpenRequest(calculatorId);
    if (requestedId) loadRecord(requestedId);
  }, []);

  return <section className="calculation-sheet" aria-label={`${title} calculation record`}>
    <header className="calculation-sheet__header"><div><span>PHILIPPINE ELECTRICAL ENGINEERING TOOLKIT</span><h3>{title} - Calculation Record</h3><p>Complete the project record, verify every source input, save locally, then print or save as PDF.</p></div><div className="calculation-sheet__actions"><button onClick={saveRecord}><Save /> Save record</button><button onClick={newRecord}><FilePlus2 /> New</button><button className="calculation-sheet__print" onClick={() => window.print()}><Printer /> Print / Save PDF</button></div></header>
    <div className="calculation-sheet__saved"><label><span>Saved calculation</span><select aria-label="Saved calculation record" value={activeId} onChange={(event) => loadRecord(event.target.value)}><option value="">New / unsaved record</option>{records.map((record) => <option key={record.id} value={record.id}>{record.project || 'Untitled'} · {record.equipment || 'No equipment ID'} · {record.status.replace('-', ' ')}</option>)}</select></label><b className={`record-status record-status--${status}`}>{status.replace('-', ' ').toUpperCase()}</b><em>{savedMessage}</em></div>
    <div className="calculation-sheet__metadata">
      <label><span>Project</span><input value={project} onChange={(event) => setProject(event.target.value)} placeholder="Project name / number" /></label>
      <label><span>Equipment / circuit ID</span><input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Tag or circuit designation" /></label>
      <label><span>Prepared by</span><input value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} placeholder="Name / license reference" /></label>
      <label><span>Checked by</span><input value={checkedBy} onChange={(event) => setCheckedBy(event.target.value)} placeholder="Independent reviewer" /></label>
      <label><span>Calculation date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label className="wide"><span>Assumptions and input sources</span><textarea value={assumptions} onChange={(event) => setAssumptions(event.target.value)} placeholder="Record nameplate data, official table rows, conductor data, manufacturer information, and design assumptions…" /></label>
      <label className="wide"><span>PEC lookup / evidence</span><textarea value={sourceEvidence} onChange={(event) => setSourceEvidence(event.target.value)} placeholder="Record the official PEC table row, clause, equipment marking, drawing, or field evidence used…" /></label>
    </div>
    <CalculationFieldsContext.Provider value={{ fields, setField }}><div className="calculation-sheet__body">{children}</div></CalculationFieldsContext.Provider>
    <footer className="calculation-sheet__footer"><div><strong>PEC source basis</strong><span>{reference}</span></div><div><strong>Record status</strong><span>{status === 'complete' ? 'Worksheet, metadata, source evidence, and independent reviewer recorded.' : status === 'needs-verification' ? 'Worksheet complete; source evidence or independent review remains open.' : 'Required worksheet or project inputs remain incomplete.'}</span></div><p>This calculation record does not replace the official PEC, local requirements, the authority having jurisdiction, equipment instructions, or professional engineering judgment.</p></footer>
  </section>;
}

function useRecordField(key: string, initialValue: number): [number, (value: number) => void];
function useRecordField(key: string, initialValue: boolean): [boolean, (value: boolean) => void];
function useRecordField(key: string, initialValue: string): [string, (value: string) => void];
function useRecordField(key: string, initialValue: CalculationFieldValue): [any, (value: any) => void] {
  const context = useContext(CalculationFieldsContext);
  if (!context) throw new Error('Calculation field used outside a calculation sheet.');
  useEffect(() => { if (context.fields[key] === undefined) context.setField(key, initialValue); }, [context, initialValue, key]);
  return [context.fields[key] ?? initialValue, (value: CalculationFieldValue) => context.setField(key, value)];
}

function MotorDisconnectControllerWorksheet() {
  const [motorVoltage, setMotorVoltage] = useRecordField('motorVoltage', 480);
  const [motorHp, setMotorHp] = useRecordField('motorHp', 50);
  const [flc, setFlc] = useRecordField('flc', 65);
  const [controllerVoltage, setControllerVoltage] = useRecordField('controllerVoltage', 480);
  const [controllerHp, setControllerHp] = useRecordField('controllerHp', 50);
  const [controlVa, setControlVa] = useRecordField('controlVa', 300);
  const [controlPrimaryVoltage, setControlPrimaryVoltage] = useRecordField('controlPrimaryVoltage', 480);
  const [controllerInSight, setControllerInSight] = useRecordField('controllerInSight', true);
  const [motorInSight, setMotorInSight] = useRecordField('motorInSight', false);
  const [exceptionPath, setExceptionPath] = useRecordField('exceptionPath', 'none');
  const [lockable, setLockable] = useRecordField('lockable', false);
  const [opensAll, setOpensAll] = useRecordField('opensAll', true);
  const [indicatesPosition, setIndicatesPosition] = useRecordField('indicatesPosition', true);
  const [accessible, setAccessible] = useRecordField('accessible', true);
  const [hpMarked, setHpMarked] = useRecordField('hpMarked', true);
  const [multipleSources, setMultipleSources] = useRecordField('multipleSources', false);
  const [sourcesDocumented, setSourcesDocumented] = useRecordField('sourcesDocumented', false);
  const [controlLeavesEnclosure, setControlLeavesEnclosure] = useRecordField('controlLeavesEnclosure', true);
  const [tablePathRecorded, setTablePathRecorded] = useRecordField('tablePathRecorded', false);
  const [, setWorkflowReady] = useRecordField('workflowReady', false);

  const numericValid = positive(motorVoltage, motorHp, flc, controllerVoltage, controllerHp, controlVa, controlPrimaryVoltage);
  const disconnectMinimum = numericValid ? 1.15 * flc : NaN;
  const controlPrimaryCurrent = numericValid ? controlVa / controlPrimaryVoltage : NaN;
  const specialControlPath = Number.isFinite(controlPrimaryCurrent) && controlPrimaryCurrent < 2;
  const controlPrimaryMaximum = specialControlPath ? 5 * controlPrimaryCurrent : NaN;
  const controllerRatingPass = numericValid && controllerVoltage >= motorVoltage && controllerHp >= motorHp && hpMarked;
  const locationPass = controllerInSight && (motorInSight || (exceptionPath !== 'none' && lockable));
  const sourcePass = !multipleSources || sourcesDocumented;
  const operationPass = opensAll && indicatesPosition && accessible;
  const ready = numericValid && controllerRatingPass && locationPass && sourcePass && operationPass && tablePathRecorded;
  useEffect(() => setWorkflowReady(ready), [ready, setWorkflowReady]);

  return <div className="calculator-panel conductor-worksheet decision-worksheet">
    <header><div><span>INTERACTIVE PEC APPLICATION WORKSHEET</span><h3>Motor Disconnect and Controller</h3></div><code>I disconnect,min = 1.15 × I FLC</code></header>
    <div className="worksheet-note"><strong>One worksheet, four distinct functions.</strong><span>Controller, disconnect, overload protection, and branch fault protection remain separate even when a listed assembly combines them.</span></div>
    <div className="calculator-subsection"><h4>Motor and equipment ratings</h4><div className="calculator-grid">
      <NumberField label="Motor voltage" unit="V" value={motorVoltage} setValue={setMotorVoltage} />
      <NumberField label="Motor horsepower" unit="hp" value={motorHp} setValue={setMotorHp} />
      <NumberField label="Verified PEC full-load current" unit="A" value={flc} setValue={setFlc} />
      <NumberField label="Controller voltage rating" unit="V" value={controllerVoltage} setValue={setControllerVoltage} />
      <NumberField label="Controller horsepower rating" unit="hp" value={controllerHp} setValue={setControllerHp} />
      <ChecklistToggle label="Controller HP marking verified" checked={hpMarked} setChecked={setHpMarked} />
    </div><div className={`worksheet-result ${controllerRatingPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>General disconnect ampere basis: <b>{format(disconnectMinimum, 'A')}</b></span><span>Controller rating: <b>{controllerRatingPass ? 'Meets entered voltage / hp checks' : 'Does not meet entered checks'}</b></span><strong>{numericValid ? 'VERIFY LISTING, DUTY, AND STANDARD DEVICE' : 'NEEDS INPUT'}</strong></div></div>

    <div className="calculator-subsection"><h4>Location, operation, and energy sources</h4><div className="decision-checklist">
      <DecisionRow label="Disconnect is in sight from the controller" reference="§4.30.9.2(a)" checked={controllerInSight} setChecked={setControllerInSight} />
      <DecisionRow label="Disconnect is in sight from the motor and driven machinery" reference="§4.30.9.2(b)" checked={motorInSight} setChecked={setMotorInSight} />
      <label className="calculator-field"><span>Out-of-sight exception basis</span><select aria-label="Out-of-sight exception basis" value={exceptionPath} onChange={(event) => setExceptionPath(event.target.value)}><option value="none">No documented exception</option><option value="impractical">Impracticable / increased hazard path</option><option value="industrial">Industrial written-procedure path</option></select></label>
      <DecisionRow label="Permanent at-device lock provision verified" reference="§4.30.9.2(b) Exception" checked={lockable} setChecked={setLockable} />
      <DecisionRow label="All ungrounded conductors open together" reference="§4.30.9.3" checked={opensAll} setChecked={setOpensAll} />
      <DecisionRow label="Open / closed position is indicated" reference="§4.30.9.4" checked={indicatesPosition} setChecked={setIndicatesPosition} />
      <DecisionRow label="At least one disconnect is readily accessible" reference="§4.30.9.7" checked={accessible} setChecked={setAccessible} />
      <DecisionRow label="Equipment has more than one energy source" reference="§4.30.9.13" checked={multipleSources} setChecked={setMultipleSources} />
      {multipleSources && <DecisionRow label="Every source and required warning is documented" reference="§4.30.9.13" checked={sourcesDocumented} setChecked={setSourcesDocumented} />}
    </div><div className={`worksheet-result ${locationPass && sourcePass && operationPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Location: <b>{locationPass ? 'Route documented' : 'Local sight or complete exception needed'}</b></span><span>Sources: <b>{sourcePass ? 'Source check recorded' : 'Multiple-source documentation needed'}</b></span><strong>{locationPass && sourcePass && operationPass ? 'DISCONNECT FUNCTION CHECK PASSES' : 'DISCONNECT FUNCTION CHECK INCOMPLETE'}</strong></div></div>

    <div className="calculator-subsection"><h4>Control transformer and conductor protection route</h4><div className="calculator-grid">
      <NumberField label="Control transformer rating" unit="VA" value={controlVa} setValue={setControlVa} />
      <NumberField label="Control transformer primary voltage" unit="V" value={controlPrimaryVoltage} setValue={setControlPrimaryVoltage} />
      <ChecklistToggle label="Control conductors leave enclosure" checked={controlLeavesEnclosure} setChecked={setControlLeavesEnclosure} />
      <ChecklistToggle label="Applicable Table 4.30.6.2(b) path recorded" checked={tablePathRecorded} setChecked={setTablePathRecorded} />
    </div><div className={`worksheet-result ${tablePathRecorded ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Rated primary current: <b>{format(controlPrimaryCurrent, 'A')}</b></span><span>Below-2-A 500% ceiling: <b>{specialControlPath ? format(controlPrimaryMaximum, 'A') : 'Not applicable—use another permitted path'}</b></span><span>Routing column: <b>{controlLeavesEnclosure ? 'Extends beyond enclosure—review Column C' : 'Within enclosure—review Column B'}</b></span><strong>{tablePathRecorded ? 'OFFICIAL TABLE PATH RECORDED' : 'OFFICIAL TABLE LOOKUP REQUIRED'}</strong></div></div>

    <div className="worksheet-topology" role="img" aria-label="Motor power and control functional diagram"><div>Branch OCPD</div><b>→</b><div>Disconnect</div><b>→</b><div>Controller</div><b>→</b><div>Overload</div><b>→</b><div>Motor</div><span>Control source → control OCPD → stop / safety chain → controller coil</span></div>
    <div className="worksheet-sources"><strong>Final verification before release</strong><ul><li>Record the exact PEC FLC source and disconnect listing/horsepower data.</li><li>Confirm locked-rotor interruption capability and available-fault-current ratings.</li><li>Read the applicable Table 4.30.6.2(b) column rather than using a generic control-wire fuse.</li><li>Test that one accidental ground cannot start the motor or bypass a shutdown where §4.30.6.3 applies.</li><li>Coordinate overload, branch fault protection, grounding, enclosure, and working-space requirements.</li></ul><p>Sources: PEC Parts 4.30.6, 4.30.7, and 4.30.9. The calculated values are screening results, not certified product selections.</p></div>
  </div>;
}

function TransformerGroundingWorksheet() {
  const [rating, setRating] = useRecordField('transformerRating', 75);
  const [secondaryVoltage, setSecondaryVoltage] = useRecordField('secondaryVoltage', 208);
  const [phase, setPhase] = useRecordField('phase', 'three');
  const [isolated, setIsolated] = useRecordField('isolatedWindings', true);
  const [groundedSystem, setGroundedSystem] = useRecordField('groundedSystem', true);
  const [sbjLocation, setSbjLocation] = useRecordField('sbjLocation', 'source');
  const [noParallelPath, setNoParallelPath] = useRecordField('noParallelPath', false);
  const [gecAtSbj, setGecAtSbj] = useRecordField('gecAtSbj', true);
  const [neutralIsolated, setNeutralIsolated] = useRecordField('neutralIsolated', true);
  const [equipmentBonded, setEquipmentBonded] = useRecordField('equipmentBonded', true);
  const [pipingSteelReviewed, setPipingSteelReviewed] = useRecordField('pipingSteelReviewed', false);
  const [metallicPath, setMetallicPath] = useRecordField('metallicPath', true);
  const [officialTableRecorded, setOfficialTableRecorded] = useRecordField('officialTableRecorded', false);
  const [, setWorkflowReady] = useRecordField('workflowReady', false);
  const valid = positive(rating, secondaryVoltage);
  const current = valid ? rating * 1000 / ((phase === 'three' ? Math.sqrt(3) : 1) * secondaryVoltage) : NaN;
  const sbjPass = groundedSystem ? sbjLocation === 'source' || sbjLocation === 'first-disconnect' || (sbjLocation === 'both' && noParallelPath) : sbjLocation === 'none';
  const groundedTopologyPass = !groundedSystem || (gecAtSbj && neutralIsolated);
  const ready = valid && isolated && sbjPass && groundedTopologyPass && equipmentBonded && pipingSteelReviewed && metallicPath && officialTableRecorded;
  useEffect(() => setWorkflowReady(ready), [ready, setWorkflowReady]);
  const topologyStatus = !isolated ? 'STOP—confirm separately derived classification' : sbjPass && groundedTopologyPass ? 'Topology checks pass' : 'Bonding topology needs correction';

  return <div className="calculator-panel conductor-worksheet decision-worksheet">
    <header><div><span>INTERACTIVE PEC DECISION WORKSHEET</span><h3>Transformer Grounding and Bonding</h3></div><code>One SBJ point · GEC at SBJ · downstream neutral isolated</code></header>
    <div className="worksheet-note"><strong>No bonding-conductor size is invented.</strong><span>The tool calculates rated secondary current for context, then requires the official derived-phase-conductor and PEC table selections to be recorded.</span></div>
    <div className="calculator-subsection"><h4>Source classification</h4><div className="calculator-grid">
      <NumberField label="Transformer rating" unit="kVA" value={rating} setValue={setRating} />
      <NumberField label="Secondary line voltage" unit="V" value={secondaryVoltage} setValue={setSecondaryVoltage} />
      <label className="calculator-field"><span>Phase</span><select aria-label="Transformer secondary phase" value={phase} onChange={(event) => setPhase(event.target.value)}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
      <ChecklistToggle label="Isolated-winding transformer / derived source confirmed" checked={isolated} setChecked={setIsolated} />
      <ChecklistToggle label="Derived system is intentionally grounded" checked={groundedSystem} setChecked={setGroundedSystem} />
    </div><div className={`worksheet-result ${isolated ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Rated secondary current: <b>{format(current, 'A')}</b></span><span>Classification: <b>{isolated ? 'Separately derived path selected' : 'Separately derived status not established'}</b></span><strong>{isolated ? 'CONTINUE TO BONDING TOPOLOGY' : 'STOP AND VERIFY SOURCE TOPOLOGY'}</strong></div></div>

    <div className="calculator-subsection"><h4>System bonding topology</h4><div className="decision-checklist">
      <label className="calculator-field"><span>System bonding jumper location</span><select aria-label="System bonding jumper location" value={sbjLocation} onChange={(event) => setSbjLocation(event.target.value)}><option value="source">At transformer source</option><option value="first-disconnect">At first disconnect / OCPD</option><option value="both">At source and first disconnect</option><option value="none">No SBJ—ungrounded-system path</option></select></label>
      {sbjLocation === 'both' && <DecisionRow label="Exact no-parallel-grounded-conductor-path exception verified" reference="§2.50.2.11(a)(1) Exception 2" checked={noParallelPath} setChecked={setNoParallelPath} />}
      {groundedSystem && <DecisionRow label="Grounding electrode conductor connects at the SBJ point" reference="§2.50.2.11(a)(3)" checked={gecAtSbj} setChecked={setGecAtSbj} />}
      {groundedSystem && <DecisionRow label="Grounded conductor / neutral is isolated downstream" reference="§2.50.2.11(a)" checked={neutralIsolated} setChecked={setNeutralIsolated} />}
      <DecisionRow label="Transformer enclosure, guards, and exposed metal are bonded" reference="§4.50.1.10" checked={equipmentBonded} setChecked={setEquipmentBonded} />
      <DecisionRow label="Structural steel and metal piping review is recorded" reference="§2.50.2.11(a)(6)" checked={pipingSteelReviewed} setChecked={setPipingSteelReviewed} />
      <DecisionRow label="Continuous low-impedance metallic fault path is verified" reference="§2.50.1.4" checked={metallicPath} setChecked={setMetallicPath} />
      <DecisionRow label="Official SBJ / EGC / GEC table rows and materials are recorded" reference="§§2.50.2.9, 2.50.2.11" checked={officialTableRecorded} setChecked={setOfficialTableRecorded} />
    </div><div className={`worksheet-result ${ready ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Bonding point: <b>{sbjLocation.replace('-', ' ')}</b></span><span>Topology: <b>{topologyStatus}</b></span><strong>{ready ? 'GROUNDING WORKFLOW READY FOR REVIEW' : 'GROUNDING WORKFLOW INCOMPLETE'}</strong></div></div>

    <div className="worksheet-topology worksheet-topology--transformer" role="img" aria-label="Transformer grounded secondary topology"><div>Transformer secondary</div><b>→</b><div className={sbjPass ? 'active' : 'warning'}>Selected SBJ: {sbjLocation.replace('-', ' ')}</div><b>→</b><div>First disconnect</div><b>→</b><div>Isolated downstream neutral</div><span>Fault path: equipment grounding conductor → system bonding jumper → transformer winding</span><span>Electrode path: SBJ point → grounding electrode conductor → grounding electrode</span></div>
    <div className="worksheet-sources"><strong>Required official lookups and evidence</strong><ul><li>Size derived phase conductors before selecting the system bonding jumper and grounding electrode conductor.</li><li>Record the exact PEC table rows, conductor materials, and large-conductor provisions used.</li><li>Inspect factory bond straps and downstream panel bonding screws for duplicate connections.</li><li>Trace normal neutral current separately from the metallic ground-fault path.</li><li>Coordinate transformer OCP, secondary conductor protection, available fault current, ventilation, and working space.</li></ul><p>Sources: PEC §§2.50.1.4, 2.50.2.9, 2.50.2.11, and 4.50.1.10. Earth is not treated as the effective fault-current path.</p></div>
  </div>;
}

function WorkingClearanceWorksheet() {
  const [voltageToGround, setVoltageToGround] = useRecordField('voltageToGround', 277);
  const [condition, setCondition] = useRecordField('clearanceCondition', '2');
  const [equipmentWidth, setEquipmentWidth] = useRecordField('equipmentWidth', 600);
  const [equipmentHeight, setEquipmentHeight] = useRecordField('equipmentHeight', 1900);
  const [measuredDepth, setMeasuredDepth] = useRecordField('measuredDepth', 1000);
  const [measuredWidth, setMeasuredWidth] = useRecordField('measuredWidth', 800);
  const [measuredHeadroom, setMeasuredHeadroom] = useRecordField('measuredHeadroom', 2100);
  const [equipmentRating, setEquipmentRating] = useRecordField('equipmentRating', 800);
  const [scopeConfirmed, setScopeConfirmed] = useRecordField('scopeConfirmed', true);
  const [tableRowRecorded, setTableRowRecorded] = useRecordField('tableRowRecorded', false);
  const [doorSwing, setDoorSwing] = useRecordField('doorSwing', true);
  const [spaceClear, setSpaceClear] = useRecordField('spaceClear', true);
  const [illumination, setIllumination] = useRecordField('illumination', true);
  const [dedicatedSpace, setDedicatedSpace] = useRecordField('dedicatedSpace', true);
  const [containsServiceDevices, setContainsServiceDevices] = useRecordField('containsServiceDevices', true);
  const [egressRecorded, setEgressRecorded] = useRecordField('egressRecorded', false);
  const [fieldEvidence, setFieldEvidence] = useRecordField('clearanceFieldEvidence', '');
  const [, setWorkflowReady] = useRecordField('workflowReady', false);

  const numericValid = positive(voltageToGround, equipmentWidth, equipmentHeight, measuredDepth, measuredWidth, measuredHeadroom, equipmentRating) && voltageToGround <= 600;
  const requiredDepth = !numericValid ? NaN : voltageToGround <= 150 ? 900 : condition === '1' ? 900 : condition === '2' ? 1000 : 1200;
  const requiredWidth = numericValid ? Math.max(equipmentWidth, 750) : NaN;
  const requiredHeadroom = numericValid ? Math.max(equipmentHeight, 2000) : NaN;
  const dimensionPass = numericValid && measuredDepth >= requiredDepth && measuredWidth >= requiredWidth && measuredHeadroom >= requiredHeadroom;
  const largeEquipmentTrigger = equipmentRating >= 1200 && containsServiceDevices;
  const egressPass = !largeEquipmentTrigger || egressRecorded;
  const operationalPass = doorSwing && spaceClear && illumination && dedicatedSpace && egressPass;
  const ready = scopeConfirmed && tableRowRecorded && dimensionPass && operationalPass && Boolean(fieldEvidence.trim());
  useEffect(() => setWorkflowReady(ready), [ready, setWorkflowReady]);
  const conditionName = condition === '1' ? 'Condition 1 — open or insulated opposite side' : condition === '2' ? 'Condition 2 — grounded surface opposite' : 'Condition 3 — exposed live parts opposite';

  return <div className="calculator-panel conductor-worksheet decision-worksheet clearance-worksheet">
    <header><div><span>INTERACTIVE PEC FIELD-VERIFICATION WORKSHEET</span><h3>Working Clearances</h3></div><code>D min = table lookup · W min = max(W equipment, 750 mm)</code></header>
    <div className="worksheet-note"><strong>Dimensions come from the verified PEC path.</strong><span>Select voltage-to-ground and the actual opposing condition, record the official table row, then compare field measurements. A generic “900 mm” assumption is not accepted.</span></div>

    <div className="calculator-subsection"><h4>Applicability and PEC condition</h4><div className="calculator-grid">
      <NumberField label="Nominal voltage to ground" unit="V" value={voltageToGround} setValue={setVoltageToGround} />
      <label className="calculator-field"><span>Opposing-surface condition</span><select aria-label="Opposing-surface condition" value={condition} onChange={(event) => setCondition(event.target.value)}><option value="1">Condition 1 — open / insulated</option><option value="2">Condition 2 — grounded surface</option><option value="3">Condition 3 — exposed live parts</option></select></label>
      <NumberField label="Equipment rating" unit="A" value={equipmentRating} setValue={setEquipmentRating} />
      <ChecklistToggle label="Equipment is 600 V or less and energized work is within scope" checked={scopeConfirmed} setChecked={setScopeConfirmed} />
      <ChecklistToggle label="Table 1.10.2.1(a)(1) row is recorded in PEC evidence" checked={tableRowRecorded} setChecked={setTableRowRecorded} />
      <ChecklistToggle label="Equipment contains overcurrent, switching, or control devices" checked={containsServiceDevices} setChecked={setContainsServiceDevices} />
    </div><div className={`worksheet-result ${numericValid && tableRowRecorded ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Classification: <b>{numericValid ? conditionName : 'Confirm scope and voltage'}</b></span><span>Required depth: <b>{format(requiredDepth, 'mm')}</b></span><strong>{tableRowRecorded ? 'OFFICIAL TABLE ROW RECORDED' : 'NEEDS PEC TABLE RECORD'}</strong></div></div>

    <div className="calculator-subsection"><h4>Measured working-space envelope</h4><div className="calculator-grid">
      <NumberField label="Equipment width" unit="mm" value={equipmentWidth} setValue={setEquipmentWidth} />
      <NumberField label="Equipment height" unit="mm" value={equipmentHeight} setValue={setEquipmentHeight} />
      <NumberField label="Measured clear depth" unit="mm" value={measuredDepth} setValue={setMeasuredDepth} />
      <NumberField label="Measured clear width" unit="mm" value={measuredWidth} setValue={setMeasuredWidth} />
      <NumberField label="Measured headroom" unit="mm" value={measuredHeadroom} setValue={setMeasuredHeadroom} />
      <label className="calculator-field wide"><span>Field measurement / site-photo reference</span><input aria-label="Field measurement / site-photo reference" value={fieldEvidence} onChange={(event) => setFieldEvidence(event.target.value)} placeholder="Drawing, measurement sheet, photo ID, date, and location…" /></label>
    </div><div className={`worksheet-result ${dimensionPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Required width: <b>{format(requiredWidth, 'mm')}</b></span><span>Required headroom: <b>{format(requiredHeadroom, 'mm')}</b></span><strong>{dimensionPass ? 'DIMENSION CHECK PASSES' : 'DIMENSION CHECK FAILS'}</strong></div></div>

    <div className="calculator-subsection"><h4>Operational and room checks</h4><div className="decision-checklist">
      <DecisionRow label="Equipment doors and hinged panels open at least 90 degrees" reference="§1.10.2.1(a)(2)" checked={doorSwing} setChecked={setDoorSwing} />
      <DecisionRow label="Working space is clear and not used for storage" reference="§1.10.2.1(b)" checked={spaceClear} setChecked={setSpaceClear} />
      <DecisionRow label="Required illumination is provided" reference="§1.10.2.1(d)" checked={illumination} setChecked={setIllumination} />
      <DecisionRow label="Dedicated electrical space is coordinated" reference="§1.10.2.1(f)" checked={dedicatedSpace} setChecked={setDedicatedSpace} />
      {largeEquipmentTrigger && <DecisionRow label="Large-equipment entrances, exit path, door swing, and hardware are recorded" reference="§1.10.2.1(c)" checked={egressRecorded} setChecked={setEgressRecorded} />}
    </div><div className={`worksheet-result ${operationalPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Large-equipment review: <b>{largeEquipmentTrigger ? egressRecorded ? 'Recorded' : 'Required' : 'Trigger not reached'}</b></span><span>Field evidence: <b>{fieldEvidence.trim() ? 'Recorded' : 'Open'}</b></span><strong>{ready ? 'WORKING-SPACE RECORD READY FOR REVIEW' : 'WORKING-SPACE RECORD INCOMPLETE'}</strong></div></div>

    <div className="clearance-geometry" role="img" aria-label="Working-space plan and elevation diagram"><div className="clearance-geometry__equipment">Electrical equipment<span>{equipmentWidth} mm wide</span></div><div className="clearance-geometry__depth">Clear depth<br/><b>{Number.isFinite(requiredDepth) ? `${requiredDepth} mm minimum` : 'lookup required'}</b></div><div className="clearance-geometry__width">Clear width ≥ {Number.isFinite(requiredWidth) ? `${requiredWidth} mm` : '—'} · door/panel opens 90°</div><div className="clearance-geometry__height">Clear headroom ≥ {Number.isFinite(requiredHeadroom) ? `${requiredHeadroom} mm` : '—'}</div></div>
    <div className="worksheet-sources"><strong>Field release checks</strong><ul><li>Confirm voltage to ground rather than line-to-line voltage alone.</li><li>Treat concrete, brick, and tile opposite the equipment as grounded surfaces.</li><li>Measure after doors, finishes, pads, ducts, piping, shelving, and fire protection are installed.</li><li>Record any exception or large-equipment single-entrance path against its exact clause.</li><li>Keep the working envelope visible in architectural and MEP coordination drawings.</li></ul><p>Sources: PEC §1.10.2.1(a)-(f) and Table 1.10.2.1(a)(1), supplied PDF pp. 22-24.</p></div>
  </div>;
}

function ServiceEquipmentWorksheet() {
  const [noncontinuous, setNoncontinuous] = useRecordField('serviceNoncontinuousLoad', 320);
  const [continuous, setContinuous] = useRecordField('serviceContinuousLoad', 80);
  const [conductorAmpacity, setConductorAmpacity] = useRecordField('serviceConductorAmpacity', 500);
  const [disconnectRating, setDisconnectRating] = useRecordField('serviceDisconnectRating', 1200);
  const [minimumCategory, setMinimumCategory] = useRecordField('serviceMinimumCategory', 'other');
  const [serviceCount, setServiceCount] = useRecordField('serviceCount', 1);
  const [additionalBasis, setAdditionalBasis] = useRecordField('additionalServiceBasis', false);
  const [additionalIdentification, setAdditionalIdentification] = useRecordField('additionalServiceIdentification', false);
  const [disconnectCount, setDisconnectCount] = useRecordField('serviceDisconnectCount', 1);
  const [disconnectsGrouped, setDisconnectsGrouped] = useRecordField('serviceDisconnectsGrouped', true);
  const [suitableMarked, setSuitableMarked] = useRecordField('serviceEquipmentMarked', true);
  const [locationPass, setLocationPass] = useRecordField('serviceLocationPass', true);
  const [opensAll, setOpensAll] = useRecordField('serviceOpensAll', true);
  const [ocpAdjacent, setOcpAdjacent] = useRecordField('serviceOcpAdjacent', true);
  const [voltageToGround, setVoltageToGround] = useRecordField('serviceVoltageToGround', 277);
  const [lineVoltage, setLineVoltage] = useRecordField('serviceLineVoltage', 480);
  const [solidWye, setSolidWye] = useRecordField('serviceSolidWye', true);
  const [gfpeProvided, setGfpeProvided] = useRecordField('serviceGfpeProvided', false);
  const [gfpeSetting, setGfpeSetting] = useRecordField('serviceGfpeSetting', 1200);
  const [gfpeDelay, setGfpeDelay] = useRecordField('serviceGfpeDelay', 1);
  const [gfpeTested, setGfpeTested] = useRecordField('serviceGfpeTested', false);
  const [availableFault, setAvailableFault] = useRecordField('serviceAvailableFault', 25);
  const [interruptingRating, setInterruptingRating] = useRecordField('serviceInterruptingRating', 35);
  const [mainBond, setMainBond] = useRecordField('serviceMainBond', true);
  const [gecRecorded, setGecRecorded] = useRecordField('serviceGecRecorded', false);
  const [officialEvidence, setOfficialEvidence] = useRecordField('serviceOfficialEvidence', false);
  const [, setWorkflowReady] = useRecordField('workflowReady', false);

  const loadsValid = [noncontinuous, continuous].every((value) => Number.isFinite(value) && value >= 0) && noncontinuous + continuous > 0;
  const countsValid = Number.isInteger(serviceCount) && serviceCount >= 1 && Number.isInteger(disconnectCount) && disconnectCount >= 1;
  const numericValid = loadsValid && countsValid && positive(conductorAmpacity, disconnectRating, voltageToGround, lineVoltage, availableFault, interruptingRating) && Number.isFinite(gfpeSetting) && Number.isFinite(gfpeDelay) && gfpeSetting >= 0 && gfpeDelay >= 0;
  const requiredAmpacity = numericValid ? noncontinuous + 1.25 * continuous : NaN;
  const minimumRatings: Record<string, number> = { limited: 15, 'two-circuit': 30, dwelling: 100, other: 60 };
  const categoryMinimum = minimumRatings[minimumCategory] ?? 60;
  const ratingPass = numericValid && conductorAmpacity >= requiredAmpacity && disconnectRating >= Math.max(requiredAmpacity, categoryMinimum);
  const additionalServicePass = serviceCount === 1 || (additionalBasis && additionalIdentification);
  const disconnectPass = disconnectCount <= 6 && disconnectsGrouped && suitableMarked && locationPass && opensAll && ocpAdjacent;
  const gfpeTriggered = solidWye && voltageToGround > 150 && lineVoltage <= 600 && disconnectRating >= 1000;
  const gfpePass = !gfpeTriggered || (gfpeProvided && gfpeSetting <= 1200 && gfpeDelay <= 1 && gfpeTested);
  const faultDutyPass = interruptingRating >= availableFault;
  const groundingPass = mainBond && gecRecorded;
  const ready = numericValid && ratingPass && additionalServicePass && disconnectPass && gfpePass && faultDutyPass && groundingPass && officialEvidence;
  useEffect(() => setWorkflowReady(ready), [ready, setWorkflowReady]);

  return <div className="calculator-panel conductor-worksheet decision-worksheet service-worksheet">
    <header><div><span>INTERACTIVE PEC SERVICE-DESIGN WORKSHEET</span><h3>Services and Service Equipment</h3></div><code>I service = I noncontinuous + 1.25 × I continuous</code></header>
    <div className="worksheet-note"><strong>No conductor or equipment size is selected automatically.</strong><span>The calculated ampacity, service minimum, disconnect rating, protection, grounding, and fault duty are independent checks. Record the exact PEC and product evidence before release.</span></div>

    <div className="calculator-subsection"><h4>Load, conductor, and disconnect ratings</h4><div className="calculator-grid">
      <NumberField label="Calculated noncontinuous load" unit="A" value={noncontinuous} setValue={setNoncontinuous} />
      <NumberField label="Calculated continuous load" unit="A" value={continuous} setValue={setContinuous} />
      <NumberField label="Selected service-conductor ampacity" unit="A" value={conductorAmpacity} setValue={setConductorAmpacity} />
      <NumberField label="Service-disconnect rating" unit="A" value={disconnectRating} setValue={setDisconnectRating} />
      <label className="calculator-field"><span>Minimum-rating category</span><select aria-label="Minimum service rating category" value={minimumCategory} onChange={(event) => setMinimumCategory(event.target.value)}><option value="limited">One limited-load circuit — 15 A</option><option value="two-circuit">Not more than two two-wire circuits — 30 A</option><option value="dwelling">One-family dwelling — 100 A, three-wire</option><option value="other">Other installation — 60 A</option></select></label>
      <ChecklistToggle label="Article 2.20 load calculation and §2.30.4.3 path are recorded" checked={officialEvidence} setChecked={setOfficialEvidence} />
    </div><div className={`worksheet-result ${ratingPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Required pre-adjustment ampacity: <b>{format(requiredAmpacity, 'A')}</b></span><span>Applicable stated minimum: <b>{format(categoryMinimum, 'A')}</b></span><strong>{ratingPass ? 'RATING CHECK PASSES' : 'RATING CHECK FAILS'}</strong></div></div>

    <div className="calculator-subsection"><h4>Service boundary and disconnecting means</h4><div className="calculator-grid">
      <NumberField label="Number of services" unit="count" value={serviceCount} setValue={setServiceCount} />
      <NumberField label="Grouped service disconnects" unit="count" value={disconnectCount} setValue={setDisconnectCount} />
      {serviceCount > 1 && <ChecklistToggle label="Permitted additional-service basis is documented" checked={additionalBasis} setChecked={setAdditionalBasis} />}
      {serviceCount > 1 && <ChecklistToggle label="Permanent identification of every service and location is provided" checked={additionalIdentification} setChecked={setAdditionalIdentification} />}
    </div><div className="decision-checklist">
      <DecisionRow label="Service disconnects are grouped" reference="§2.30.6.3" checked={disconnectsGrouped} setChecked={setDisconnectsGrouped} />
      <DecisionRow label="Equipment is marked suitable for use as service equipment" reference="§2.30.5.5" checked={suitableMarked} setChecked={setSuitableMarked} />
      <DecisionRow label="Disconnect is readily accessible, outside or nearest entrance, and not in a bathroom" reference="§2.30.6.1" checked={locationPass} setChecked={setLocationPass} />
      <DecisionRow label="All ungrounded service conductors open together" reference="§2.30.6" checked={opensAll} setChecked={setOpensAll} />
      <DecisionRow label="Service OCP is integral with or immediately adjacent to disconnect" reference="§2.30.7.2" checked={ocpAdjacent} setChecked={setOcpAdjacent} />
    </div><div className={`worksheet-result ${additionalServicePass && disconnectPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Service count: <b>{additionalServicePass ? 'Accepted path recorded' : 'Exception evidence required'}</b></span><span>Disconnect maximum: <b>{disconnectCount <= 6 ? 'Within six-device screen' : 'Exceeds six-device screen'}</b></span><strong>{additionalServicePass && disconnectPass ? 'SERVICE BOUNDARY CHECK PASSES' : 'SERVICE BOUNDARY CHECK INCOMPLETE'}</strong></div></div>

    <div className="calculator-subsection"><h4>Ground-fault protection and fault duty</h4><div className="calculator-grid">
      <NumberField label="Nominal voltage to ground" unit="V" value={voltageToGround} setValue={setVoltageToGround} />
      <NumberField label="Nominal phase-to-phase voltage" unit="V" value={lineVoltage} setValue={setLineVoltage} />
      <ChecklistToggle label="Service is solidly grounded wye" checked={solidWye} setChecked={setSolidWye} />
      <ChecklistToggle label="GFPE is provided when triggered" checked={gfpeProvided} setChecked={setGfpeProvided} />
      <NumberField label="GFPE setting" unit="A" value={gfpeSetting} setValue={setGfpeSetting} />
      <NumberField label="GFPE delay at 3000 A or more" unit="s" value={gfpeDelay} setValue={setGfpeDelay} step="0.1" />
      <ChecklistToggle label="GFPE performance test and written record are complete" checked={gfpeTested} setChecked={setGfpeTested} />
      <NumberField label="Available fault current" unit="kA" value={availableFault} setValue={setAvailableFault} step="0.1" />
      <NumberField label="Equipment interrupting rating" unit="kA" value={interruptingRating} setValue={setInterruptingRating} step="0.1" />
    </div><div className={`worksheet-result ${gfpePass && faultDutyPass ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>GFPE screen: <b>{gfpeTriggered ? 'Triggered by entered system' : 'Trigger not reached'}</b></span><span>Fault duty: <b>{faultDutyPass ? 'Entered rating exceeds available fault current' : 'Interrupting rating is insufficient'}</b></span><strong>{gfpePass && faultDutyPass ? 'PROTECTION SCREEN PASSES' : 'PROTECTION ACTION REQUIRED'}</strong></div></div>

    <div className="calculator-subsection"><h4>Service grounding and final release</h4><div className="decision-checklist">
      <DecisionRow label="Main bonding connection is located at the service" reference="§2.50.2.5" checked={mainBond} setChecked={setMainBond} />
      <DecisionRow label="Grounding-electrode conductor and electrode-system evidence is recorded" reference="§2.50.2.5" checked={gecRecorded} setChecked={setGecRecorded} />
    </div><div className={`worksheet-result ${ready ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Grounding/bonding: <b>{groundingPass ? 'Recorded' : 'Evidence required'}</b></span><span>PEC evidence: <b>{officialEvidence ? 'Recorded' : 'Open'}</b></span><strong>{ready ? 'SERVICE RECORD READY FOR REVIEW' : 'SERVICE RECORD INCOMPLETE'}</strong></div></div>

    <div className="worksheet-topology service-topology" role="img" aria-label="Service equipment functional one-line"><div>Utility source</div><b>→</b><div>Service point</div><b>→</b><div>Service conductors</div><b>→</b><div>Metering</div><b>→</b><div>Service disconnect + OCP</div><b>→</b><div>Feeders</div><span>Grounded conductor → main bonding jumper at service → equipment grounding path</span><span>Service bonding point → grounding-electrode conductor → grounding electrode system</span></div>
    <div className="worksheet-sources"><strong>Release package must retain</strong><ul><li>Utility/premises service point and ownership boundary.</li><li>Article 2.20 calculation and continuous-load classification.</li><li>Conductor table, material, terminal, parallel-conductor, and conditions-of-use evidence.</li><li>Service-equipment listing/marking and available-fault-current study.</li><li>GFPE settings and performance-test record when triggered.</li><li>Grounding, bonding, labeling, working-clearance, and additional-service evidence.</li></ul><p>Sources: PEC Article 2.30, §2.50.2.5, and §1.10.1.9. Results are design-review screens, not certified equipment selections.</p></div>
  </div>;
}

function GeneratorNeutralGroundingWorksheet() {
  const [rating, setRating] = useRecordField('generatorRating', 500);
  const [voltage, setVoltage] = useRecordField('generatorVoltage', 400);
  const [nameplateCurrent, setNameplateCurrent] = useRecordField('generatorNameplateCurrent', 720);
  const [atsPoles, setAtsPoles] = useRecordField('generatorAtsPoles', '3');
  const [transferMode, setTransferMode] = useRecordField('generatorTransferMode', 'solid-neutral');
  const [neutralConnected, setNeutralConnected] = useRecordField('generatorNeutralConnected', true);
  const [schematicRecorded, setSchematicRecorded] = useRecordField('generatorSchematicRecorded', false);
  const [allModesRecorded, setAllModesRecorded] = useRecordField('generatorAllModesRecorded', false);
  const [manufacturerRecorded, setManufacturerRecorded] = useRecordField('generatorManufacturerRecorded', false);
  const [generatorBond, setGeneratorBond] = useRecordField('generatorNeutralFrameBond', false);
  const [serviceBond, setServiceBond] = useRecordField('generatorServiceBond', true);
  const [sbjLocation, setSbjLocation] = useRecordField('generatorSbjLocation', 'none');
  const [gecAtSbj, setGecAtSbj] = useRecordField('generatorGecAtSbj', false);
  const [downstreamNeutralIsolated, setDownstreamNeutralIsolated] = useRecordField('generatorDownstreamNeutralIsolated', true);
  const [faultPath, setFaultPath] = useRecordField('generatorFaultPath', true);
  const [transferInterlock, setTransferInterlock] = useRecordField('generatorTransferInterlock', true);
  const [sourceWarning, setSourceWarning] = useRecordField('generatorSourceWarning', false);
  const [, setWorkflowReady] = useRecordField('workflowReady', false);

  const numericValid = positive(rating, voltage, nameplateCurrent);
  const estimatedCurrent = numericValid ? rating * 1000 / (Math.sqrt(3) * voltage) : NaN;
  const topologyEvidence = schematicRecorded && allModesRecorded && manufacturerRecorded;
  const classification = transferMode === 'parallel' ? 'additional-analysis' : !topologyEvidence || transferMode === 'unknown' ? 'insufficient' : neutralConnected ? 'non-derived' : transferMode === 'switched-neutral' ? 'separately-derived' : 'insufficient';
  const duplicateBondRisk = neutralConnected && generatorBond;
  const nonDerivedBondingPass = classification === 'non-derived' && !generatorBond && serviceBond && faultPath;
  const derivedBondLocationPass = sbjLocation === 'generator' ? generatorBond : sbjLocation === 'first-disconnect' ? !generatorBond : false;
  const derivedBondingPass = classification === 'separately-derived' && derivedBondLocationPass && gecAtSbj && downstreamNeutralIsolated && faultPath;
  const operatingPass = transferInterlock && sourceWarning;
  const outcome = duplicateBondRisk ? 'DUPLICATE BOND / PARALLEL-PATH RISK' : classification === 'insufficient' ? 'INSUFFICIENT TOPOLOGY INFORMATION' : classification === 'additional-analysis' ? 'NEEDS PEC VERIFICATION' : nonDerivedBondingPass ? 'NON-SEPARATELY-DERIVED PATH INDICATED' : derivedBondingPass ? 'SEPARATELY DERIVED PATH INDICATED' : 'NEEDS PEC VERIFICATION';
  const ready = numericValid && operatingPass && (outcome === 'NON-SEPARATELY-DERIVED PATH INDICATED' || outcome === 'SEPARATELY DERIVED PATH INDICATED');
  useEffect(() => setWorkflowReady(ready), [ready, setWorkflowReady]);
  const statusClass = duplicateBondRisk || outcome === 'INSUFFICIENT TOPOLOGY INFORMATION' ? 'worksheet-result--fail' : ready ? 'worksheet-result--pass' : '';

  return <div className="calculator-panel conductor-worksheet decision-worksheet generator-worksheet">
    <header><div><span>INTERACTIVE PEC TOPOLOGY DECISION WORKSHEET</span><h3>Generator Neutral Grounding</h3></div><code>Classification follows conductor continuity — not ATS pole count alone</code></header>
    <div className="worksheet-note"><strong>A four-pole ATS is evidence, not the conclusion.</strong><span>Map the neutral in normal, emergency, test, bypass, isolation, and maintenance states. The actual electrical continuity, bonding point, listing, and manufacturer schematic govern the decision.</span></div>

    <div className="calculator-subsection"><h4>Generator and transfer-equipment evidence</h4><div className="calculator-grid">
      <NumberField label="Generator rating" unit="kVA" value={rating} setValue={setRating} />
      <NumberField label="Generator line voltage" unit="V" value={voltage} setValue={setVoltage} />
      <NumberField label="Generator nameplate current" unit="A" value={nameplateCurrent} setValue={setNameplateCurrent} />
      <label className="calculator-field"><span>ATS pole description</span><select aria-label="ATS pole description" value={atsPoles} onChange={(event) => setAtsPoles(event.target.value)}><option value="3">Three-pole label</option><option value="4">Four-pole label</option><option value="other">Other / verify schematic</option></select></label>
      <label className="calculator-field"><span>Transfer topology under review</span><select aria-label="Generator transfer topology" value={transferMode} onChange={(event) => setTransferMode(event.target.value)}><option value="solid-neutral">Solid / unswitched neutral</option><option value="switched-neutral">Switched neutral</option><option value="parallel">Closed transition / parallel / overlap</option><option value="unknown">Unknown topology</option></select></label>
      <ChecklistToggle label="Generator neutral remains directly connected to normal-source neutral" checked={neutralConnected} setChecked={setNeutralConnected} />
    </div><div className="decision-checklist">
      <DecisionRow label="One-line and ATS contact schematic are recorded" reference="PEC definition; §7.2.1.6" checked={schematicRecorded} setChecked={setSchematicRecorded} />
      <DecisionRow label="Normal, emergency, test, bypass, and maintenance states are mapped" reference="§7.2.1.6" checked={allModesRecorded} setChecked={setAllModesRecorded} />
      <DecisionRow label="Generator and transfer-equipment instructions/listing are recorded" reference="Equipment evidence" checked={manufacturerRecorded} setChecked={setManufacturerRecorded} />
    </div><div className={`worksheet-result ${topologyEvidence ? 'worksheet-result--pass' : 'worksheet-result--fail'}`}><span>Estimated rated current: <b>{format(estimatedCurrent, 'A')}</b></span><span>Nameplate comparison: <b>{numericValid ? `${format(nameplateCurrent, 'A')} recorded` : 'Needs input'}</b></span><strong>{topologyEvidence ? 'TOPOLOGY EVIDENCE RECORDED' : 'TOPOLOGY EVIDENCE INCOMPLETE'}</strong></div></div>

    <div className="calculator-subsection"><h4>Bonding, electrode, and fault-current paths</h4><div className="calculator-grid">
      <ChecklistToggle label="Generator neutral-to-frame bond is installed" checked={generatorBond} setChecked={setGeneratorBond} />
      <ChecklistToggle label="Normal service bonding point remains documented" checked={serviceBond} setChecked={setServiceBond} />
      <label className="calculator-field"><span>Derived-system bonding-jumper location</span><select aria-label="Generator system bonding jumper location" value={sbjLocation} onChange={(event) => setSbjLocation(event.target.value)}><option value="none">No derived-system SBJ selected</option><option value="generator">At generator source</option><option value="first-disconnect">At first disconnect / OCPD</option></select></label>
      <ChecklistToggle label="Grounding-electrode conductor connects at selected SBJ point" checked={gecAtSbj} setChecked={setGecAtSbj} />
    </div><div className="decision-checklist">
      <DecisionRow label="Downstream neutral remains isolated from equipment grounding" reference="§2.50.2.11" checked={downstreamNeutralIsolated} setChecked={setDownstreamNeutralIsolated} />
      <DecisionRow label="Low-impedance metallic fault path returns to the governing bond" reference="§§2.50.1.4, 4.45.1.13" checked={faultPath} setChecked={setFaultPath} />
      <DecisionRow label="Transfer equipment prevents unintended source interconnection" reference="§7.2.1.6" checked={transferInterlock} setChecked={setTransferInterlock} />
      <DecisionRow label="Multiple-source warning and source identification are recorded" reference="Field / operating evidence" checked={sourceWarning} setChecked={setSourceWarning} />
    </div></div>

    <div className={`generator-outcome ${statusClass}`} role="status"><span>TOPOLOGY DETERMINATION</span><strong>{outcome}</strong><p>{duplicateBondRisk ? 'A generator neutral bond with a solid connection to the service neutral can place normal neutral current on bonded metal.' : classification === 'non-derived' ? 'The entered topology retains a direct grounded-conductor connection to the service-supplied system.' : classification === 'separately-derived' ? 'The entered topology isolates the generator neutral from the normal system and requires a complete derived-system bonding arrangement.' : 'Complete the schematics and operating-state evidence before assigning a grounding classification.'}</p></div>

    <div className={`generator-topology generator-topology--${classification}`} role="img" aria-label="Generator neutral and transfer-equipment topology"><div>Normal source<span>{serviceBond ? 'Service bond recorded' : 'Bond evidence open'}</span></div><b>↔</b><div>Transfer equipment<span>{transferMode.replaceAll('-', ' ')}</span></div><b>↔</b><div>Load<span>Downstream neutral {downstreamNeutralIsolated ? 'isolated' : 'bonded'}</span></div><i/><div>Generator<span>{generatorBond ? 'Neutral-frame bond installed' : 'Neutral-frame bond open'}</span></div><p>Neutral to normal source during generator operation: <strong>{neutralConnected ? 'DIRECT CONNECTION RECORDED' : 'NO DIRECT CONNECTION RECORDED'}</strong></p><p>Fault path: generator/load enclosures → equipment grounding conductor → governing system bonding point → source winding.</p></div>

    <div className="worksheet-sources"><strong>Required commissioning evidence</strong><ul><li>One-line, ATS elementary diagram, neutral-contact timing, and bypass/isolation diagram.</li><li>Generator factory neutral-link position and transfer-equipment listing.</li><li>Safe continuity verification for every operating and maintenance state.</li><li>Exact system-bonding-jumper, grounding-electrode-conductor, and equipment-grounding-conductor table records.</li><li>Normal neutral-current path and metallic ground-fault-current path shown separately.</li><li>Additional engineering and PEC review for closed-transition, overlap, or parallel operation.</li></ul><p>Sources: PEC Separately Derived System definition; §§2.50.2.1(d), 2.50.2.11, 4.45.1.13, and 7.2.1.6. No grounding-conductor size is generated by this tool.</p></div>
  </div>;
}

function ChecklistToggle({ label, checked, setChecked }: { label: string; checked: boolean; setChecked: (value: boolean) => void }) {
  return <label className="worksheet-toggle"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>{label}</span></label>;
}

function DecisionRow({ label, reference, checked, setChecked }: { label: string; reference: string; checked: boolean; setChecked: (value: boolean) => void }) {
  return <label className={`decision-row ${checked ? 'decision-row--checked' : ''}`}><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span><strong>{label}</strong><small>{reference}</small></span><b>{checked ? 'RECORDED' : 'OPEN'}</b></label>;
}

function TransformerProtectionWorksheet() {
  const [rating, setRating] = useState(150);
  const [primaryVoltage, setPrimaryVoltage] = useState(480);
  const [secondaryVoltage, setSecondaryVoltage] = useState(208);
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const [arrangement, setArrangement] = useState<'primary-only' | 'both'>('both');
  const valid = positive(rating, primaryVoltage, secondaryVoltage);
  const phaseFactor = phase === 'three' ? Math.sqrt(3) : 1;
  const primaryCurrent = valid ? rating * 1000 / (phaseFactor * primaryVoltage) : NaN;
  const secondaryCurrent = valid ? rating * 1000 / (phaseFactor * secondaryVoltage) : NaN;
  const primaryMultiplier = arrangement === 'both' ? 2.5 : primaryCurrent < 2 ? 3 : primaryCurrent < 9 ? 1.67 : 1.25;
  const secondaryMultiplier = secondaryCurrent < 9 ? 1.67 : 1.25;
  const primaryMaximum = valid ? primaryCurrent * primaryMultiplier : NaN;
  const secondaryMaximum = arrangement === 'both' && valid ? secondaryCurrent * secondaryMultiplier : NaN;
  return <div className="calculator-panel conductor-worksheet">
    <header><div><span>INTERACTIVE PEC APPLICATION WORKSHEET</span><h3>Transformer Rated Current and Protection</h3></div><code>I = S / (phase factor × V)</code></header>
    <div className="worksheet-note"><strong>Scope: PEC Table 4.50.1.3(b), 600 V and less.</strong><span>Results are calculated table maxima—not automatically permitted standard device sizes. Read all table notes and verify conductor protection.</span></div>
    <div className="calculator-grid">
      <NumberField label="Transformer rating" unit="kVA" value={rating} setValue={setRating} />
      <NumberField label="Primary winding voltage" unit="V" value={primaryVoltage} setValue={setPrimaryVoltage} />
      <NumberField label="Secondary winding voltage" unit="V" value={secondaryVoltage} setValue={setSecondaryVoltage} />
      <label className="calculator-field"><span>Phase</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
      <label className="calculator-field"><span>Protection arrangement</span><select value={arrangement} onChange={(event) => setArrangement(event.target.value as 'primary-only' | 'both')}><option value="primary-only">Primary only</option><option value="both">Primary and secondary</option></select></label>
    </div>
    <div className="worksheet-result worksheet-result--pass"><span>Primary rated current: <b>{format(primaryCurrent, 'A')}</b></span><span>Primary table maximum ({Math.round(primaryMultiplier * 100)}%): <b>{format(primaryMaximum, 'A')}</b></span><span>Secondary rated current: <b>{format(secondaryCurrent, 'A')}</b></span><span>Secondary table maximum: <b>{arrangement === 'both' ? format(secondaryMaximum, 'A') : 'Not part of primary-only table arrangement'}</b></span><strong>{valid ? 'CALCULATION READY FOR DEVICE REVIEW' : 'NEEDS INPUT'}</strong></div>
    <div className="worksheet-sources"><strong>Required verification before selection</strong><ul><li>Confirm every winding is 600 V or less; otherwise use Table 4.50.1.3(a).</li><li>Confirm transformer construction, nameplate kVA, voltages, impedance, and manufacturer instructions.</li><li>Read Notes 1–3 attached to Table 4.50.1.3(b), including standard-size treatment.</li><li>Check primary and secondary conductor protection independently.</li><li>Verify available fault current, interrupting rating, grounding, ventilation, and clearances.</li></ul><p>Source: PEC §4.50.1.3 and Table 4.50.1.3(b), supplied PDF pp. 417–419. Engineering worksheet only; it does not certify a protective-device selection.</p></div>
  </div>;
}

function ConductorDesignWorksheet() {
  const [required, setRequired] = useState(55);
  const [tableAmpacity, setTableAmpacity] = useState(90);
  const [temperatureFactor, setTemperatureFactor] = useState(0.91);
  const [adjustmentFactor, setAdjustmentFactor] = useState(0.70);
  const [terminalLimit, setTerminalLimit] = useState(85);
  const [equipmentLimit, setEquipmentLimit] = useState(100);
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const [current, setCurrent] = useState(55);
  const [length, setLength] = useState(0.12);
  const [resistance, setResistance] = useState(0.35);
  const [reactance, setReactance] = useState(0.08);
  const [voltage, setVoltage] = useState(440);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const thermalValid = positive(required, tableAmpacity, temperatureFactor, adjustmentFactor, terminalLimit, equipmentLimit) && temperatureFactor <= 1.5 && adjustmentFactor <= 1;
  const corrected = thermalValid ? tableAmpacity * temperatureFactor * adjustmentFactor : NaN;
  const usable = thermalValid ? Math.min(corrected, terminalLimit, equipmentLimit) : NaN;
  const thermalPass = thermalValid ? usable >= required : false;
  const voltageValid = positive(current, length, voltage, powerFactor) && resistance >= 0 && reactance >= 0 && powerFactor <= 1;
  const sinPhi = voltageValid ? Math.sqrt(1 - powerFactor ** 2) : NaN;
  const phaseFactor = phase === 'single' ? 2 : Math.sqrt(3);
  const drop = voltageValid ? phaseFactor * current * length * (resistance * powerFactor + reactance * sinPhi) : NaN;
  const percentage = voltageValid ? drop / voltage * 100 : NaN;
  return <div className="calculator-panel conductor-worksheet">
    <header><div><span>INTERACTIVE PEC APPLICATION WORKSHEET</span><h3>Conductor Ampacity and Voltage Drop</h3></div><code>Iusable = min(Itable × kT × kCCC, Iterminal, Iequipment)</code></header>
    <div className="worksheet-note"><strong>Official-table values are user inputs.</strong><span>The worksheet never invents a conductor size or factor. Verify each entered value in the cited PEC table and equipment markings.</span></div>
    <div className="calculator-subsection"><h4>Thermal ampacity</h4><div className="calculator-grid">
      <NumberField label="Required circuit ampacity" unit="A" value={required} setValue={setRequired} />
      <NumberField label="Official base table ampacity" unit="A" value={tableAmpacity} setValue={setTableAmpacity} />
      <NumberField label="Ambient correction factor" unit="decimal" value={temperatureFactor} setValue={setTemperatureFactor} step="0.01" />
      <NumberField label="Conductor-count adjustment" unit="decimal" value={adjustmentFactor} setValue={setAdjustmentFactor} step="0.01" />
      <NumberField label="Termination ampacity limit" unit="A" value={terminalLimit} setValue={setTerminalLimit} />
      <NumberField label="Equipment marked limit" unit="A" value={equipmentLimit} setValue={setEquipmentLimit} />
    </div><div className={`worksheet-result ${thermalValid ? thermalPass ? 'worksheet-result--pass' : 'worksheet-result--fail' : ''}`}><span>Corrected / adjusted: <b>{format(corrected, 'A')}</b></span><span>Final usable: <b>{format(usable, 'A')}</b></span><strong>{thermalValid ? thermalPass ? 'THERMAL CHECK PASSES' : 'THERMAL CHECK FAILS' : 'NEEDS INPUT'}</strong></div></div>
    <div className="calculator-subsection"><h4>Voltage performance</h4><div className="calculator-grid">
      <label className="calculator-field"><span>System</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
      <NumberField label="Modeled current" unit="A" value={current} setValue={setCurrent} />
      <NumberField label="One-way length" unit="km" value={length} setValue={setLength} step="0.01" />
      <NumberField label="AC resistance" unit="Ω/km" value={resistance} setValue={setResistance} step="0.01" />
      <NumberField label="Reactance" unit="Ω/km" value={reactance} setValue={setReactance} step="0.01" />
      <NumberField label="System voltage" unit="V" value={voltage} setValue={setVoltage} />
      <NumberField label="Power factor" unit="decimal" value={powerFactor} setValue={setPowerFactor} step="0.01" />
    </div><div className="worksheet-result"><span>Calculated drop: <b>{format(drop, 'V')}</b></span><span>Percent drop: <b>{format(percentage, '%')}</b></span><strong>{voltageValid ? 'COMPARE WITH DOCUMENTED CRITERION' : 'NEEDS INPUT'}</strong></div></div>
    <div className="worksheet-sources"><strong>PEC checks still required</strong><ul><li>Confirm the governing load ampacity rule.</li><li>Record the exact ampacity table, material, size, insulation column, and ambient basis.</li><li>Count current-carrying conductors and classify the neutral.</li><li>Verify §1.10.1.14(c) terminal and connector limits.</li><li>Document the voltage-drop criterion and whether it is a PEC note, equipment limit, AHJ requirement, or engineering recommendation.</li></ul><p>Primary references: PEC §§3.10.1.15, 1.10.1.14(c), 2.10.2.1(a), and 2.15.1.2(a). Engineering calculation only; it does not certify a conductor selection.</p></div>
  </div>;
}

function ThreePhaseCurrentCalculator() {
  const [power, setPower] = useState(37);
  const [voltage, setVoltage] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.86);
  const [efficiency, setEfficiency] = useState(0.92);
  const current = positive(power, voltage, powerFactor, efficiency) ? power * 1000 / (Math.sqrt(3) * voltage * powerFactor * efficiency) : NaN;
  return <CalculatorShell title="Three-Phase Motor Current" formula="I = P / (√3 × V × η × PF)" result={format(current, 'A')}>
    <NumberField label="Motor output power" unit="kW" value={power} setValue={setPower} />
    <NumberField label="Line-to-line voltage" unit="V" value={voltage} setValue={setVoltage} />
    <NumberField label="Power factor" unit="decimal" value={powerFactor} setValue={setPowerFactor} step="0.01" />
    <NumberField label="Efficiency" unit="decimal" value={efficiency} setValue={setEfficiency} step="0.01" />
  </CalculatorShell>;
}

function VoltageDropCalculator() {
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const [current, setCurrent] = useState(80);
  const [length, setLength] = useState(0.12);
  const [resistance, setResistance] = useState(0.30);
  const [reactance, setReactance] = useState(0.08);
  const [voltage, setVoltage] = useState(400);
  const [powerFactor, setPowerFactor] = useState(0.85);
  const valid = positive(current, length, voltage, powerFactor) && resistance >= 0 && reactance >= 0 && powerFactor <= 1;
  const sinPhi = valid ? Math.sqrt(1 - powerFactor ** 2) : NaN;
  const factor = phase === 'single' ? 2 : Math.sqrt(3);
  const drop = valid ? factor * current * length * (resistance * powerFactor + reactance * sinPhi) : NaN;
  const percentage = valid ? drop / voltage * 100 : NaN;
  return <CalculatorShell title="AC Voltage Drop" formula={`${phase === 'single' ? '1φ: 2' : '3φ: √3'} × I × L × (R cosφ + X sinφ)`} result={`${format(drop, 'V')} · ${format(percentage, '%')}`}>
    <label className="calculator-field"><span>System</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
    <NumberField label="Current" unit="A" value={current} setValue={setCurrent} />
    <NumberField label="One-way length" unit="km" value={length} setValue={setLength} step="0.01" />
    <NumberField label="Resistance" unit="Ω/km" value={resistance} setValue={setResistance} step="0.01" />
    <NumberField label="Reactance" unit="Ω/km" value={reactance} setValue={setReactance} step="0.01" />
    <NumberField label="System voltage" unit="V" value={voltage} setValue={setVoltage} />
    <NumberField label="Power factor" unit="decimal" value={powerFactor} setValue={setPowerFactor} step="0.01" />
  </CalculatorShell>;
}

function TransformerCurrentCalculator() {
  const [rating, setRating] = useState(500);
  const [voltage, setVoltage] = useState(400);
  const [phase, setPhase] = useState<'single' | 'three'>('three');
  const current = positive(rating, voltage) ? rating * 1000 / ((phase === 'three' ? Math.sqrt(3) : 1) * voltage) : NaN;
  return <CalculatorShell title="Transformer Rated Current" formula={phase === 'three' ? 'I = S / (√3 × V)' : 'I = S / V'} result={format(current, 'A')}>
    <NumberField label="Transformer rating" unit="kVA" value={rating} setValue={setRating} />
    <NumberField label="Winding voltage" unit="V" value={voltage} setValue={setVoltage} />
    <label className="calculator-field"><span>Phase</span><select value={phase} onChange={(event) => setPhase(event.target.value as 'single' | 'three')}><option value="single">Single phase</option><option value="three">Three phase</option></select></label>
  </CalculatorShell>;
}

function CalculatorShell({ title, formula, result, children }: { title: string; formula: string; result: string; children: React.ReactNode }) {
  return <div className="calculator-panel">
    <header><div><span>INTERACTIVE ENGINEERING CALCULATION</span><h3>{title}</h3></div><code>{formula}</code></header>
    <div className="calculator-grid">{children}</div>
    <output className="calculator-result" aria-live="polite"><span>Calculated result</span><strong>{result}</strong></output>
    <p>Engineering calculation only. Final conductor and protection selections must follow the selected standard and verified project inputs.</p>
  </div>;
}

function NumberField({ label, unit, value, setValue, step = 'any' }: { label: string; unit: string; value: number; setValue: (value: number) => void; step?: string }) {
  return <label className="calculator-field"><span>{label}</span><div><input aria-label={`${label} (${unit})`} type="number" min="0" step={step} value={value} onChange={(event) => setValue(event.currentTarget.valueAsNumber)} /><em>{unit}</em></div></label>;
}

const positive = (...values: number[]) => values.every((value) => Number.isFinite(value) && value > 0);
const format = (value: number, unit: string) => Number.isFinite(value) ? `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${unit}` : `Enter valid inputs`;
