import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { DesignWorkflow, EngineeringFigure, EngineeringFormula, EngineeringTable, TopicStandard, WorkedExample } from '../types';

export function ContentSection({ id, label, title, className = '', children }: { id?: string; label: string; title: string; className?: string; children: React.ReactNode }) {
  return <article id={id} className={`content-section ${className}`}><span>{label}</span><h2>{title}</h2>{children}</article>;
}

export function RequirementList({ items }: { items: string[] }) {
  return <ul>{items.map((item) => <li key={item}><CheckCircle2 />{item}</li>)}</ul>;
}

export function StandardReference({ content }: { content: TopicStandard }) {
  const references = content.references?.length ? content.references : [content.reference];
  const details = content.referenceDetails ? [
    ['Article', content.referenceDetails.article], ['Section', content.referenceDetails.section],
    ['Clause', content.referenceDetails.clause], ['Table', content.referenceDetails.table],
    ['Annex', content.referenceDetails.annex],
  ].filter((entry): entry is [string, string] => Boolean(entry[1])) : [];
  return <article id="reference" className="reference-banner">
    <span>STANDARD / EDITION / REFERENCE</span>
    <strong>{content.standardName ?? content.standardId.toUpperCase()}</strong>
    <small>{content.edition}</small>
    <div>{references.map((reference) => <em key={reference}>{reference}</em>)}</div>
    {details.length ? <dl className="reference-details">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null}
    {content.referenceDetails?.relatedStandards?.length ? <p className="reference-related"><strong>Related standards:</strong> {content.referenceDetails.relatedStandards.join('; ')}</p> : null}
  </article>;
}

export function FormulaCard({ formula }: { formula: EngineeringFormula }) {
  return <div className="formula-card">
    <header><h3>{formula.name}</h3><span className={`basis-badge basis-badge--${formula.basis}`}>{formula.basis}</span></header>
    <div className="formula-expression" aria-label={`${formula.name}: ${formula.expression}`}>{formula.expression}</div>
    <div className="table-scroll"><table><thead><tr><th>Variable</th><th>Meaning</th><th>Unit</th></tr></thead><tbody>{formula.variables.map((variable) => <tr key={variable.symbol}><th scope="row">{variable.symbol}</th><td>{variable.definition}</td><td>{variable.unit}</td></tr>)}</tbody></table></div>
    <p><strong>Units:</strong> {formula.units}</p>
    {formula.whenToUse && <p><strong>When to use:</strong> {formula.whenToUse}</p>}
    {formula.sourceReference && <p><strong>Basis/source:</strong> {formula.sourceReference}</p>}
    {formula.workedInputExample && <div className="formula-example"><strong>Worked input example</strong><span>{formula.workedInputExample}</span></div>}
    {formula.notes?.map((note) => <p key={note} className="fine-note">{note}</p>)}
  </div>;
}

export function EngineeringTableView({ table }: { table: EngineeringTable }) {
  return <div className="engineering-table">
    <header><h3>{table.title}</h3><span>{table.type}</span></header>
    {table.purpose && <p>{table.purpose}</p>}
    <div className="table-scroll"><table><thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
    {table.sourceReference && <p className="fine-note"><strong>Official reference:</strong> {table.sourceReference}</p>}
    {table.howToApply?.length ? <ol>{table.howToApply.map((step) => <li key={step}>{step}</li>)}</ol> : null}
  </div>;
}

export function EngineeringDiagram({ figure }: { figure: EngineeringFigure }) {
  return <figure className="engineering-diagram">
    <figcaption><strong>{figure.title}</strong><span>{figure.description}</span></figcaption>
    <div className="diagram-flow" role="img" aria-label={`${figure.title}: ${figure.nodes.join(' to ')}`}>{figure.nodes.map((node, index) => <div key={`${node}-${index}`}><span>{node}</span>{index < figure.nodes.length - 1 && <b aria-hidden="true">↓</b>}</div>)}</div>
    {figure.paths?.length ? <div className="diagram-paths">{figure.paths.map((path, pathIndex) => <div key={`${figure.title}-path-${pathIndex}`}>{path.map((node, index) => <div key={`${node}-${index}`}><span>{node}</span>{index < path.length - 1 && <b aria-hidden="true">→</b>}</div>)}</div>)}</div> : null}
    {figure.annotation && <p className="diagram-annotation">{figure.annotation}</p>}
    <small>{figure.sourceBasis}</small>
  </figure>;
}

export function DesignWorkflowView({ workflow }: { workflow: DesignWorkflow }) {
  return <div className="design-workflow">
    <h3>{workflow.title}</h3>
    <div>{workflow.steps.map((step, index) => <div className="workflow-step" key={step}><b>{index + 1}</b><span>{step}</span>{index < workflow.steps.length - 1 && <i aria-hidden="true">↓</i>}</div>)}</div>
    {workflow.note && <p>{workflow.note}</p>}
  </div>;
}

export function WorkedExampleView({ example }: { example: WorkedExample }) {
  return <div className="worked-example">
    <h3>{example.title}</h3>
    <div className="example-grid"><ExampleList title="Given" items={example.given} /><ExampleList title="Assumptions" items={example.assumptions} /></div>
    <h4>Applicable rule</h4><p>{example.applicableRule}</p>
    <h4>Steps</h4><ol>{example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
    <div className="example-result"><strong>Final result</strong><p>{example.result}</p></div>
    <h4>Engineering interpretation</h4><p>{example.interpretation}</p>
    <p className="fine-note"><strong>References to verify:</strong> {example.sourceReferences.join('; ')}</p>
  </div>;
}

function ExampleList({ title, items }: { title: string; items: string[] }) {
  return <div><h4>{title}</h4><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

export function NoteList({ items, kind = 'note' }: { items: string[]; kind?: 'note' | 'warning' }) {
  const Icon = kind === 'warning' ? TriangleAlert : Info;
  return <ul>{items.map((item) => <li key={item}><Icon />{item}</li>)}</ul>;
}
