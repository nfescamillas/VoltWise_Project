import { Copy, Download, FileInput, FolderOpen, Printer, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { calculationRecordStore, type LocalCalculationRecord } from '../services';
import type { CalculatorId } from '../types';

const calculatorInfo: Record<CalculatorId, { label: string; topicId: string }> = {
  'three-phase-current': { label: 'Three-Phase Motor Current', topicId: 'motor-full-load-current' },
  'voltage-drop': { label: 'AC Voltage Drop', topicId: 'voltage-drop' },
  'transformer-current': { label: 'Transformer Rated Current', topicId: 'transformer-primary-and-secondary-protection' },
  'conductor-design': { label: 'Conductor Ampacity and Voltage Drop', topicId: 'conductor-ampacity' },
  'transformer-protection': { label: 'Transformer Protection', topicId: 'transformer-primary-and-secondary-protection' },
  'motor-disconnect-controller': { label: 'Motor Disconnect and Controller', topicId: 'motor-disconnecting-means' },
  'transformer-grounding': { label: 'Transformer Grounding and Bonding', topicId: 'transformer-grounding-and-bonding' },
  'working-clearance': { label: 'Working Clearances', topicId: 'working-clearances' },
  'service-equipment': { label: 'Services and Service Equipment', topicId: 'services-and-service-equipment' },
  'generator-neutral-grounding': { label: 'Generator Neutral Grounding', topicId: 'generator-neutral-grounding' },
};

type PrintScope = { type: 'record'; id: string } | { type: 'project'; project: string } | null;

export function CalculationRecordsPage({ onOpen }: { onOpen: (topicId: string, record: LocalCalculationRecord) => void }) {
  const [records, setRecords] = useState(() => calculationRecordStore.read());
  const [query, setQuery] = useState('');
  const [calculator, setCalculator] = useState('all');
  const [status, setStatus] = useState('all');
  const [project, setProject] = useState('all');
  const [message, setMessage] = useState('Records are stored only in this browser. Export a backup for project retention.');
  const [printScope, setPrintScope] = useState<PrintScope>(null);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clear = () => setPrintScope(null);
    window.addEventListener('afterprint', clear);
    return () => window.removeEventListener('afterprint', clear);
  }, []);

  const projects = useMemo(() => [...new Set(records.map((record) => record.project.trim()).filter(Boolean))].sort(), [records]);
  const filtered = useMemo(() => records.filter((record) => {
    const text = `${record.project} ${record.equipment} ${record.preparedBy} ${record.checkedBy} ${calculatorInfo[record.calculatorId]?.label ?? record.calculatorId}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (calculator === 'all' || record.calculatorId === calculator)
      && (status === 'all' || record.status === status) && (project === 'all' || record.project === project);
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [records, query, calculator, status, project]);

  const counts = records.reduce((result, record) => ({ ...result, [record.status]: result[record.status] + 1 }), { incomplete: 0, 'needs-verification': 0, complete: 0 });
  const refresh = () => setRecords(calculationRecordStore.read());
  const openRecord = (record: LocalCalculationRecord) => { calculationRecordStore.requestOpen(record); onOpen(calculatorInfo[record.calculatorId].topicId, record); };
  const duplicateRecord = (record: LocalCalculationRecord) => { const copy = calculationRecordStore.duplicate(record.id); refresh(); setMessage(copy ? `Duplicated ${record.project || 'untitled project'} · ${record.equipment || 'record'}. Independent review was reset.` : 'Record could not be duplicated.'); };
  const removeRecord = (record: LocalCalculationRecord) => {
    if (!window.confirm(`Delete ${record.project || 'Untitled'} · ${record.equipment || 'No equipment ID'}? This cannot be undone unless you exported a backup.`)) return;
    calculationRecordStore.remove(record.id); refresh(); setMessage('Calculation record deleted. Restore it from an exported JSON backup if required.');
  };
  const print = (scope: PrintScope) => { setPrintScope(scope); window.setTimeout(() => window.print(), 50); };
  const printVisible = (record: LocalCalculationRecord) => !printScope || printScope.type === 'record' ? !printScope || record.id === printScope.id : record.project === printScope.project;

  function exportRecords() {
    const selected = filtered.length ? filtered : records;
    const blob = new Blob([calculationRecordStore.exportJson(selected)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `pec-calculation-records-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(url); setMessage(`Exported ${selected.length} calculation record${selected.length === 1 ? '' : 's'} using schema version 1.`);
  }

  async function importRecords(file: File | undefined) {
    if (!file) return;
    try { const count = calculationRecordStore.importJson(await file.text()); refresh(); setMessage(`Imported ${count} supported calculation record${count === 1 ? '' : 's'}. Matching record IDs were updated.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The selected file could not be imported.'); }
    if (importInput.current) importInput.current.value = '';
  }

  return <section className="calculation-library page" data-printing={printScope ? 'true' : 'false'}>
    <header className="calculation-library__header"><div><span>LOCAL PROJECT WORKSPACE</span><h1>Calculation records</h1><p>Find, verify, reopen, duplicate, print, and transfer the engineering worksheets created in this browser.</p></div><div className="calculation-library__actions"><button onClick={exportRecords}><Download/> Export JSON</button><button onClick={() => importInput.current?.click()}><FileInput/> Import JSON</button><input ref={importInput} type="file" accept="application/json,.json" aria-label="Import calculation records" onChange={(event) => importRecords(event.target.files?.[0])}/></div></header>

    <div className="calculation-library__notice">{message}</div>
    <div className="calculation-library__summary"><div><strong>{records.length}</strong><span>Total records</span></div><div><strong>{counts.incomplete}</strong><span>Incomplete</span></div><div><strong>{counts['needs-verification']}</strong><span>Needs verification</span></div><div><strong>{counts.complete}</strong><span>Complete</span></div></div>

    <section className="calculation-library__filters" aria-label="Calculation record filters"><label className="record-search"><Search/><input aria-label="Search calculation records" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Project, equipment, engineer, or worksheet…"/></label><label><span>Worksheet</span><select aria-label="Filter by worksheet" value={calculator} onChange={(event) => setCalculator(event.target.value)}><option value="all">All worksheets</option>{Object.entries(calculatorInfo).map(([id, info]) => <option key={id} value={id}>{info.label}</option>)}</select></label><label><span>Status</span><select aria-label="Filter by calculation status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="incomplete">Incomplete</option><option value="needs-verification">Needs verification</option><option value="complete">Complete</option></select></label><label><span>Project package</span><select aria-label="Filter by project" value={project} onChange={(event) => setProject(event.target.value)}><option value="all">All projects</option>{projects.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><button disabled={project === 'all'} onClick={() => project !== 'all' && print({ type: 'project', project })}><Printer/> Print project package</button></section>

    {records.length === 0 ? <div className="calculation-library__empty"><FolderOpen/><h2>No calculation records yet</h2><p>Open a PEC topic with an engineering worksheet, complete the project header, and choose Save record.</p></div> : filtered.length === 0 ? <div className="calculation-library__empty"><Search/><h2>No matching records</h2><p>Change the search text or filters to see other project calculations.</p></div> : <div className="calculation-record-grid">{filtered.map((record) => <article key={record.id} className={`calculation-record-card ${printVisible(record) ? '' : 'calculation-record-card--print-hidden'}`}>
      <header><div><span>{calculatorInfo[record.calculatorId]?.label ?? record.calculatorId}</span><h2>{record.project || 'Untitled project'}</h2><p>{record.equipment || 'No equipment / circuit ID'}</p></div><b className={`record-status record-status--${record.status}`}>{record.status.replace('-', ' ').toUpperCase()}</b></header>
      <dl><div><dt>Prepared by</dt><dd>{record.preparedBy || 'Not recorded'}</dd></div><div><dt>Checked by</dt><dd>{record.checkedBy || 'Independent review open'}</dd></div><div><dt>Calculation date</dt><dd>{record.calculationDate || 'Not recorded'}</dd></div><div><dt>Updated</dt><dd>{formatRecordDate(record.updatedAt)}</dd></div><div className="wide"><dt>PEC evidence</dt><dd>{record.sourceEvidence || 'PEC clause/table evidence not recorded'}</dd></div></dl>
      <footer><button onClick={() => openRecord(record)}><FolderOpen/> Reopen</button><button onClick={() => duplicateRecord(record)}><Copy/> Duplicate</button><button onClick={() => print({ type: 'record', id: record.id })}><Printer/> Print</button><button className="danger" onClick={() => removeRecord(record)}><Trash2/> Delete</button></footer>
    </article>)}</div>}
  </section>;
}

function formatRecordDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}
