import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, CheckCircle2, CircleDashed } from 'lucide-react';
import { EngineeringCalculator } from '../components/EngineeringCalculators';
import { ContentSection, DesignWorkflowView, EngineeringDiagram, EngineeringTableView, FormulaCard, NoteList, RequirementList, StandardReference, WorkedExampleView } from '../components/TopicContent';
import type { Category, Topic } from '../types';

export function TopicPage({ topic, category, related, onBack, onTopic }: { topic: Topic; category?: Category; related: Topic[]; onBack: () => void; onTopic: (id: string) => void }) {
  const content = topic.standards.pec;
  if (!content) return <section className="topic-page"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back</button><div className="empty-state"><h2>Planned module</h2><p>No technical content has been populated for this source family.</p></div></section>;
  const notes = content.engineeringNotes?.length ? content.engineeringNotes : topic.engineeringNotes;
  const mistakes = content.commonMistakes?.length ? content.commonMistakes : topic.commonMistakes;
  const nav = [
    ['quick-answer', 'Quick answer', Boolean(content.quickAnswer)], ['requirement', 'What the PEC requires', Boolean(content.summary)],
    ['applicability', 'Applicability', Boolean(content.applicability?.length)], ['key-requirements', 'Key design rules', Boolean(content.requirements.length)],
    ['tables', 'Engineering tables', Boolean(content.tables?.length)], ['formulas', 'Formulas', Boolean(content.formulas?.length)], ['calculators', 'Interactive worksheet', Boolean(content.calculators?.length)],
    ['figures', 'Figures', Boolean(content.figures?.length)], ['examples', 'Worked examples', Boolean(content.examples?.length)],
    ['workflows', 'Design workflow', Boolean(content.workflows?.length)], ['exceptions', 'Exceptions', Boolean(content.exceptions?.length)],
    ['mistakes', 'Common mistakes', Boolean(mistakes.length)], ['related', 'Related topics', Boolean(related.length)],
    ['reference', 'PEC references', true], ['completeness', 'Completeness', Boolean(topic.completeness?.length)],
  ] as const;

  return <section className="topic-page">
    <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to PEC topics</button>
    <header className="topic-header"><div><span className="topic-header__category"><i style={{ background: category?.accent }} />PEC · {category?.name}</span><h1>{topic.title}</h1><p>{topic.description}</p></div><button className="save-button"><Bookmark size={18} /> Save reference</button></header>
    <div className="topic-meta"><span className={`review-pill review-pill--${topic.reviewStatus.toLowerCase().replaceAll(' ', '-')}`}><CheckCircle2 /> {topic.reviewStatus}</span><span><CalendarDays /> Reviewed {formatDate(topic.lastReviewed)}</span><span>{topic.sourceStatus}</span></div>
    <div className="pec-source-strip"><strong>PHILIPPINE ELECTRICAL CODE</strong><span>ACTIVE SOURCE</span><small>{content.edition}</small></div>
    <div className="topic-layout"><main>
      {content.quickAnswer && <ContentSection id="quick-answer" label="QUICK ANSWER" title="Practical answer" className="quick-answer"><p>{content.quickAnswer}</p></ContentSection>}
      {content.summary && <ContentSection id="requirement" label="PEC REQUIREMENT" title="What the PEC requires" className="requirement"><Paragraphs text={content.summary} /></ContentSection>}
      {content.applicability?.length ? <ContentSection id="applicability" label="SCOPE" title="Applicability"><div className="applicability-grid"><div><h3>Applies to</h3><RequirementList items={content.applicability} /></div>{content.notApplicable?.length ? <div><h3>Does not necessarily apply to</h3><RequirementList items={content.notApplicable} /></div> : null}{content.importantConditions?.length ? <div><h3>Important conditions</h3><RequirementList items={content.importantConditions} /></div> : null}</div></ContentSection> : null}
      {content.requirements.length ? <ContentSection id="key-requirements" label="DESIGN RULES" title="Key design rules"><RequirementList items={content.requirements} /></ContentSection> : null}
      {content.tables?.length ? <ContentSection id="tables" label="ENGINEERING TABLE" title="Decision and requirement tables">{content.tables.map((table) => <EngineeringTableView key={table.title} table={table} />)}</ContentSection> : null}
      {content.formulas?.length ? <ContentSection id="formulas" label="FORMULA" title="Engineering formulas">{content.formulas.map((formula) => <FormulaCard key={formula.name} formula={formula} />)}</ContentSection> : null}
      {content.calculators?.length ? <ContentSection id="calculators" label="ENGINEERING TOOL" title="Interactive worksheet">{content.calculators.map((calculator) => <EngineeringCalculator key={calculator} id={calculator} />)}</ContentSection> : null}
      {content.figures?.length ? <ContentSection id="figures" label="ORIGINAL FIGURE" title="Engineering diagrams">{content.figures.map((figure) => <EngineeringDiagram key={figure.title} figure={figure} />)}</ContentSection> : null}
      {content.examples?.length ? <ContentSection id="examples" label="WORKED EXAMPLE" title="Worked examples">{content.examples.map((example) => <WorkedExampleView key={example.title} example={example} />)}</ContentSection> : null}
      {content.workflows?.length ? <ContentSection id="workflows" label="DESIGN WORKFLOW" title="How to apply the requirement">{content.workflows.map((workflow) => <DesignWorkflowView key={workflow.title} workflow={workflow} />)}</ContentSection> : null}
      {topic.engineeringExplanation && <ContentSection label="ENGINEERING NOTE" title="Why this matters" className="explanation"><p>{topic.engineeringExplanation}</p></ContentSection>}
      {notes.length ? <ContentSection label="FIELD CONSIDERATION" title="Practical design context" className="notes"><NoteList items={notes} /></ContentSection> : null}
      {content.exceptions?.length ? <ContentSection id="exceptions" label="EXCEPTION" title="Important exceptions and special cases" className="exceptions"><NoteList items={content.exceptions} kind="warning" /></ContentSection> : null}
      {mistakes.length ? <ContentSection id="mistakes" label="COMMON MISTAKE" title="Watch for these pitfalls" className="mistakes"><NoteList items={mistakes} kind="warning" /></ContentSection> : null}
      {related.length ? <ContentSection id="related" label="RELATED PEC TOPICS" title="Continue the design review"><div className="related-grid">{related.map((item) => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title}<ArrowRight /></button>)}</div></ContentSection> : null}
      <StandardReference content={content} />
      {content.verification && <ContentSection label="SOURCE TRACEABILITY" title="Verification metadata" className="verification"><dl className="verification-grid"><div><dt>Status</dt><dd>{content.verification.reviewStatus}</dd></div><div><dt>Document</dt><dd>{content.verification.standard}</dd></div><div><dt>Edition</dt><dd>{content.verification.edition}</dd></div><div><dt>Last reviewed</dt><dd>{formatDate(content.verification.lastReviewed)}</dd></div><div className="wide"><dt>References</dt><dd>{content.verification.references.join('; ')}</dd></div><div className="wide"><dt>Source status</dt><dd>{content.verification.sourceStatus}</dd></div></dl></ContentSection>}
      {topic.completeness?.length ? <ContentSection id="completeness" label="INTERNAL QUALITY GATE" title="Content completeness"><div className="completeness-grid">{topic.completeness.map((item) => <div key={item.item} className={`completeness-item completeness-item--${item.status}`}>{item.status === 'complete' ? <Check /> : <CircleDashed />}<span>{item.item}</span><strong>{item.status.replace('-', ' ')}</strong></div>)}</div><p className="fine-note">A complete structure does not override source status. This topic remains Needs verification until the edition identity and all technical values are independently confirmed.</p></ContentSection> : null}
    </main><aside className="topic-aside"><div><span>ON THIS PAGE</span>{nav.filter(([, , show]) => show).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div><div><span>RELATED PEC TOPICS</span>{related.map((item) => <button key={item.id} onClick={() => onTopic(item.id)}>{item.title}<ArrowRight /></button>)}</div></aside></div>
  </section>;
}

function Paragraphs({ text }: { text: string }) { return <>{text.split(/\n\s*\n/).map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}</>; }
function formatDate(value: string) { const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
