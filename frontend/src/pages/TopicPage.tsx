import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EngineeringCalculator } from '../components/EngineeringCalculators';
import { ContentSection, DesignWorkflowView, EngineeringDiagram, EngineeringTableView, FormulaCard, NoteList, RequirementList, StandardReference, WorkedExampleView } from '../components/TopicContent';
import type { Category, StandardId, Topic } from '../types';

type ActiveTab = StandardId | 'compare';

export function TopicPage({ topic, category, related, onBack, onTopic }: { topic: Topic; category?: Category; related: Topic[]; onBack: () => void; onTopic: (id: string) => void }) {
  const available = Object.keys(topic.standards) as StandardId[];
  const preferred = available.includes('nec') ? 'nec' : available[0];
  const [active, setActive] = useState<ActiveTab>(preferred);
  useEffect(() => setActive(preferred), [topic.id, preferred]);

  return <section className="topic-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to library</button>
    <header className="topic-header"><div><span className="topic-header__category"><i style={{ background: category?.accent }} />{category?.name}</span><h1>{topic.title}</h1><p>{topic.description}</p></div><button className="save-button"><Bookmark size={18} /> Save reference</button></header>
    <div className="topic-meta"><span className={`review-pill review-pill--${topic.reviewStatus.toLowerCase().replaceAll(' ', '-')}`}><CheckCircle2 /> {topic.reviewStatus}</span><span><CalendarDays /> Reviewed {formatDate(topic.lastReviewed)}</span><span>{topic.sourceStatus}</span></div>
    <div className="standard-tabs" role="tablist" aria-label="Standard view">{available.map((id) => <button role="tab" aria-selected={active === id} key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><strong>{id.toUpperCase()}</strong><small>{topic.standards[id]?.edition}</small></button>)}<button role="tab" aria-selected={active === 'compare'} className={active === 'compare' ? 'active' : ''} onClick={() => setActive('compare')}><strong>COMPARE</strong><small>Side by side</small></button></div>
    {active === 'compare' ? <CompareView topic={topic} /> : <StandardView topic={topic} standardId={active} related={related} onTopic={onTopic} />}
  </section>;
}

function StandardView({ topic, standardId, related, onTopic }: { topic: Topic; standardId: StandardId; related: Topic[]; onTopic: (id: string) => void }) {
  const content = topic.standards[standardId]!;
  const notes = content.engineeringNotes?.length ? content.engineeringNotes : topic.engineeringNotes;
  const mistakes = content.commonMistakes?.length ? content.commonMistakes : topic.commonMistakes;
  const nav = [
    ['quick-answer', 'Quick answer', Boolean(content.quickAnswer)], ['requirement', 'Standard requirement', Boolean(content.summary)],
    ['applicability', 'Applicability', Boolean(content.applicability?.length)], ['key-requirements', 'Key requirements', Boolean(content.requirements.length)],
    ['tables', 'Quick reference table', Boolean(content.tables?.length)], ['formulas', 'Formula / design rule', Boolean(content.formulas?.length)],
    ['calculators', 'Calculator', Boolean(content.calculators?.length)],
    ['figures', 'Figure / diagram', Boolean(content.figures?.length)], ['examples', 'Worked example', Boolean(content.examples?.length)],
    ['workflows', 'Design workflow', Boolean(content.workflows?.length)], ['explanation', 'Engineering explanation', Boolean(topic.engineeringExplanation)],
    ['exceptions', 'Important exceptions', Boolean(content.exceptions?.length)], ['mistakes', 'Common mistakes', Boolean(mistakes.length)],
    ['related', 'Related requirements', Boolean(related.length)], ['reference', 'Official reference', true], ['verification', 'Verification', Boolean(content.verification)],
  ] as const;

  return <div className="topic-layout"><main>
    {content.quickAnswer && <ContentSection id="quick-answer" label="QUICK ANSWER" title="Practical Answer" className="quick-answer"><p>{content.quickAnswer}</p></ContentSection>}
    {content.summary && <ContentSection id="requirement" label="STANDARD REQUIREMENT" title="What the Selected Standard Requires" className="requirement"><p>{content.summary}</p></ContentSection>}
    {content.applicability?.length ? <ContentSection id="applicability" label="SCOPE" title="Applicability"><div className="applicability-grid"><div><h3>Applicable</h3><RequirementList items={content.applicability} /></div>{content.notApplicable?.length ? <div><h3>Not directly applicable / separate review</h3><RequirementList items={content.notApplicable} /></div> : null}{content.importantConditions?.length ? <div><h3>Important conditions</h3><RequirementList items={content.importantConditions} /></div> : null}</div></ContentSection> : null}
    {content.requirements.length ? <ContentSection id="key-requirements" label="REQUIREMENTS" title="Key Requirements"><RequirementList items={content.requirements} /></ContentSection> : null}
    {content.tables?.length ? <ContentSection id="tables" label="QUICK REFERENCE" title="Engineering Tables">{content.tables.map((table) => <EngineeringTableView key={table.title} table={table} />)}</ContentSection> : null}
    {content.formulas?.length ? <ContentSection id="formulas" label="FORMULA / DESIGN RULE" title="Engineering Formulas">{content.formulas.map((formula) => <FormulaCard key={formula.name} formula={formula} />)}</ContentSection> : null}
    {content.calculators?.length ? <ContentSection id="calculators" label="CALCULATION TOOL" title="Interactive Calculator">{content.calculators.map((calculator) => <EngineeringCalculator key={calculator} id={calculator} />)}</ContentSection> : null}
    {content.figures?.length ? <ContentSection id="figures" label="ORIGINAL ENGINEERING FIGURE" title="Engineering Diagrams">{content.figures.map((figure) => <EngineeringDiagram key={figure.title} figure={figure} />)}</ContentSection> : null}
    {content.examples?.length ? <ContentSection id="examples" label="APPLICATION" title="Worked Example">{content.examples.map((example) => <WorkedExampleView key={example.title} example={example} />)}</ContentSection> : null}
    {content.workflows?.length ? <ContentSection id="workflows" label="HOW TO APPLY THIS" title="Design Workflow">{content.workflows.map((workflow) => <DesignWorkflowView key={workflow.title} workflow={workflow} />)}</ContentSection> : null}
    {topic.engineeringExplanation && <ContentSection id="explanation" label="ENGINEERING EXPLANATION" title="How to interpret this in practice" className="explanation"><p>{topic.engineeringExplanation}</p>{content.terminology && <p>{content.terminology}</p>}</ContentSection>}
    {notes.length ? <ContentSection label="ENGINEERING NOTES" title="Practical Design Context" className="notes"><NoteList items={notes} /></ContentSection> : null}
    {content.exceptions?.length ? <ContentSection id="exceptions" label="IMPORTANT EXCEPTIONS / NOTES" title="Conditions Requiring Additional Review" className="exceptions"><NoteList items={content.exceptions} kind="warning" /></ContentSection> : null}
    {mistakes.length ? <ContentSection id="mistakes" label="COMMON MISTAKES" title="Watch for These Pitfalls" className="mistakes"><NoteList items={mistakes} kind="warning" /></ContentSection> : null}
    {related.length ? <ContentSection id="related" label="RELATED REQUIREMENTS" title="Continue the Design Review"><div className="related-grid">{related.map((item) => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title}<ArrowRight /></button>)}</div></ContentSection> : null}
    <StandardReference content={content} />
    {content.verification && <ContentSection id="verification" label="SOURCE / REVIEW METADATA" title="Verification Information" className="verification"><dl className="verification-grid"><div><dt>Status</dt><dd><span className={`verification-badge verification-badge--${content.verification.reviewStatus.toLowerCase().replaceAll(' ', '-')}`}>{content.verification.reviewStatus}</span></dd></div><div><dt>Standard</dt><dd>{content.verification.standard}</dd></div><div><dt>Edition</dt><dd>{content.verification.edition}</dd></div><div><dt>Last reviewed</dt><dd>{formatDate(content.verification.lastReviewed)}</dd></div><div className="wide"><dt>References</dt><dd>{content.verification.references.join('; ')}</dd></div><div className="wide"><dt>Source status</dt><dd>{content.verification.sourceStatus}</dd></div></dl></ContentSection>}
  </main><aside className="topic-aside"><div><span>ON THIS PAGE</span>{nav.filter(([, , show]) => show).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div><div><span>RELATED TOPICS</span>{related.map((item) => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title}<ArrowRight /></button>)}</div></aside></div>;
}

function CompareView({ topic }: { topic: Topic }) {
  const entries = Object.entries(topic.standards) as [StandardId, NonNullable<Topic['standards'][StandardId]>][];
  return <div className="compare-view">
    <div className="compare-intro"><span>STANDARD COMPARISON</span><h2>Compare approaches without assuming equivalence</h2><p>These summaries identify the design questions and broad source locations. Differences must be verified in each official edition.</p></div>
    <div className="table-scroll"><table className="comparison-table"><thead><tr><th>Item</th>{entries.map(([id]) => <th key={id}>{id.toUpperCase()}</th>)}</tr></thead><tbody>
      <CompareRow label="Main reference" entries={entries.map(([, content]) => content.references?.join('; ') || content.reference)} />
      <CompareRow label="Terminology" entries={entries.map(([, content]) => content.comparison?.terminology || content.terminology || 'See standard-specific terminology.')} />
      <CompareRow label="Design basis" entries={entries.map(([, content]) => content.comparison?.designBasis || content.summary)} />
      <CompareRow label="Important distinction" entries={entries.map(([, content]) => content.comparison?.distinction || 'Verify the standard-specific application.')} />
      <CompareRow label="Review status" entries={entries.map(([, content]) => content.verification?.reviewStatus || topic.reviewStatus)} badge />
    </tbody></table></div>
  </div>;
}

function CompareRow({ label, entries, badge = false }: { label: string; entries: string[]; badge?: boolean }) {
  return <tr><th scope="row">{label}</th>{entries.map((entry, index) => <td key={`${label}-${index}`}>{badge ? <span className={`verification-badge verification-badge--${entry.toLowerCase().replaceAll(' ', '-')}`}>{entry}</span> : entry}</td>)}</tr>;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
