import { CheckCircle2, CircleDashed, FileCheck2, Filter, Search, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { verificationRecordStore, type LocalReviewRecord } from '../services';
import type { Topic } from '../types';

type GateStatus = 'complete' | 'pending';
type FilterId = 'all' | 'edition' | 'technical' | 'independent';

export function VerificationPage({ topics, onTopic }: { topics: Topic[]; onTopic: (id: string) => void }) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<Record<string, LocalReviewRecord>>(() => verificationRecordStore.read());
  useEffect(() => { verificationRecordStore.write(records); }, [records]);

  const filtered = useMemo(() => topics.filter((topic) => {
    if (query && !`${topic.title} ${topic.standards.pec?.reference ?? ''}`.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'edition') return true;
    if (filter === 'technical') return technicalGate(topic).status === 'pending';
    if (filter === 'independent') return !records[topic.id]?.independentReviewComplete;
    return true;
  }), [filter, query, records, topics]);

  const independentComplete = topics.filter((topic) => records[topic.id]?.independentReviewComplete).length;
  return <section className="verification-page page">
    <header className="verification-page__header"><div><span>PEC SOURCE GOVERNANCE</span><h1>Verification workspace</h1><p>Turn every “Needs verification” label into a visible checklist, evidence record, and next action.</p></div><div className="verification-page__score"><strong>{independentComplete}/{topics.length}</strong><span>Independent reviews recorded</span></div></header>

    <section className="edition-evidence" aria-label="PEC edition evidence"><FileCheck2 /><div><span>DOCUMENT IDENTITY GATE</span><h2>PEC edition remains unconfirmed</h2><p>The supplied file begins directly with Chapter 1 and does not include a usable cover, title, copyright, or edition page. PDF metadata reports the title “Chapter 6,” a 2007 creation date, and a 2011 modification date; those values do not establish the official PEC edition.</p><strong>Next action: obtain the official cover/title/copyright pages or a publisher-issued complete copy, then reconcile every chapter’s edition metadata.</strong></div><b>NEEDS SOURCE</b></section>

    <section className="verification-summary" aria-label="Verification gate summary">
      <SummaryCard value={topics.length} label="Source files available" status="complete" />
      <SummaryCard value={topics.length} label="Clause locations recorded" status="complete" />
      <SummaryCard value="0" label="Edition identities confirmed" status="pending" />
      <SummaryCard value={independentComplete} label="Independent reviews" status={independentComplete === topics.length ? 'complete' : 'pending'} />
    </section>

    <div className="verification-tools"><label><Search /><input aria-label="Search verification queue" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topic or PEC reference…" /></label><div><Filter />{([
      ['all', 'All topics'], ['edition', 'Edition pending'], ['technical', 'Technical checks'], ['independent', 'Independent review'],
    ] as const).map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div></div>

    <div className="verification-queue">{filtered.map((topic) => {
      const content = topic.standards.pec;
      const record = records[topic.id] ?? emptyRecord();
      const gates = [
        { label: 'Source document available', status: 'complete' as GateStatus, evidence: 'Supplied PEC Part 1 PDF is available.', action: 'Keep the controlled source path with the review record.' },
        { label: 'Article and section located', status: content?.references?.length ? 'complete' as GateStatus : 'pending' as GateStatus, evidence: content?.reference ?? 'No locator recorded.', action: 'Locate and record the exact article, section, table, and PDF page.' },
        technicalGate(topic),
        { label: 'Exceptions and table notes checked', status: content?.exceptions?.length ? 'complete' as GateStatus : 'pending' as GateStatus, evidence: content?.exceptions?.length ? `${content.exceptions.length} exceptions or special cases recorded.` : 'No exception review recorded.', action: 'Review every exception and note attached to the cited clauses and tables.' },
        { label: 'Edition identified', status: 'pending' as GateStatus, evidence: 'The supplied PDF has no reliable edition page.', action: 'Obtain official cover/title/copyright pages or a publisher-issued complete copy.' },
        { label: 'Independent technical review', status: record.independentReviewComplete ? 'complete' as GateStatus : 'pending' as GateStatus, evidence: record.independentReviewComplete ? `${record.reviewer || 'Reviewer'} recorded review on ${record.reviewDate || 'an unspecified date'}.` : 'No independent reviewer sign-off recorded.', action: 'Have a qualified reviewer recheck the cited clauses, values, notes, and engineering interpretation.' },
      ];
      return <article className="verification-card" key={topic.id}>
        <header><div><span>{topic.categoryId.toUpperCase()}</span><h2>{topic.title}</h2><p>{content?.reference}</p></div><button onClick={() => onTopic(topic.id)}>Open chapter</button></header>
        <div className="verification-gates">{gates.map((gate) => <div key={gate.label} className={`verification-gate verification-gate--${gate.status}`}>{gate.status === 'complete' ? <CheckCircle2 /> : <CircleDashed />}<div><strong>{gate.label}</strong><span>{gate.evidence}</span><small>Next: {gate.action}</small></div><b>{gate.status.toUpperCase()}</b></div>)}</div>
        <div className="review-record"><h3><ShieldCheck /> Independent review record</h3><div className="review-record__fields"><label><span>Reviewer</span><input value={record.reviewer} onChange={(event) => updateRecord(topic.id, { reviewer: event.target.value }, records, setRecords)} placeholder="Name / license reference" /></label><label><span>Review date</span><input type="date" value={record.reviewDate} onChange={(event) => updateRecord(topic.id, { reviewDate: event.target.value }, records, setRecords)} /></label><label className="wide"><span>Evidence and review notes</span><textarea value={record.evidence} onChange={(event) => updateRecord(topic.id, { evidence: event.target.value }, records, setRecords)} placeholder="Record checked clauses, table notes, discrepancies, and resolution…" /></label></div><label className="review-check"><input type="checkbox" checked={record.independentReviewComplete} onChange={(event) => updateRecord(topic.id, { independentReviewComplete: event.target.checked }, records, setRecords)} /><span>Independent clause/value review completed. This does not override the separate edition-identity gate.</span></label></div>
      </article>;
    })}</div>
  </section>;
}

function SummaryCard({ value, label, status }: { value: number | string; label: string; status: GateStatus }) {
  return <div className={`verification-summary__card verification-summary__card--${status}`}><strong>{value}</strong><span>{label}</span><b>{status === 'complete' ? 'COMPLETE' : 'PENDING'}</b></div>;
}

function technicalGate(topic: Topic) {
  const content = topic.standards.pec;
  const complete = Boolean(content?.formulas?.length && content.tables?.length && content.examples?.length && content.verification?.references.length);
  return { label: 'Technical values and relationships checked', status: complete ? 'complete' as GateStatus : 'pending' as GateStatus, evidence: complete ? 'Formulas, tables, examples, and source references are recorded.' : 'One or more technical evidence groups are missing.', action: 'Recheck numerical values and relationships against every cited PEC clause and table note.' };
}

function emptyRecord(): LocalReviewRecord { return { reviewer: '', reviewDate: '', evidence: '', independentReviewComplete: false }; }
function updateRecord(id: string, patch: Partial<LocalReviewRecord>, records: Record<string, LocalReviewRecord>, setRecords: (value: Record<string, LocalReviewRecord>) => void) {
  setRecords({ ...records, [id]: { ...emptyRecord(), ...records[id], ...patch } });
}
