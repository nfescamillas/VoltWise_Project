import type { ReviewStatus, Topic } from '../types';

const statuses = new Set<ReviewStatus>(['Draft', 'Reviewed', 'Verified', 'Needs update', 'Needs source', 'Needs verification']);
const placeholderPattern = /^(\.\.\.|tbd|content coming soon|see (nec|iec|pec)|refer to article)/i;

export function validateCatalog(topics: Topic[], knownAssets: string[] = []): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const knownIds = new Set(topics.map((topic) => topic.id));

  for (const topic of topics) {
    if (ids.has(topic.id)) errors.push(`Duplicate topic id: ${topic.id}`);
    ids.add(topic.id);
    if (!statuses.has(topic.reviewStatus)) errors.push(`${topic.id}: invalid review status ${topic.reviewStatus}`);
    for (const relatedId of topic.relatedTopicIds) {
      if (!knownIds.has(relatedId)) errors.push(`${topic.id}: broken related topic ${relatedId}`);
    }
    for (const [standardId, content] of Object.entries(topic.standards)) {
      if (!content) continue;
      const path = `${topic.id}/${standardId}`;
      if (!content.edition.trim()) errors.push(`${path}: missing edition`);
      if (!content.reference.trim() && !content.references?.some((item) => item.trim())) errors.push(`${path}: missing reference`);
      if (topic.reviewStatus !== 'Draft' && placeholderPattern.test(content.summary.trim())) errors.push(`${path}: placeholder summary in production content`);
      const emptySections = [
        ['requirements', content.requirements], ['applicability', content.applicability],
        ['engineering notes', content.engineeringNotes], ['exceptions', content.exceptions],
        ['common mistakes', content.commonMistakes],
      ] as const;
      for (const [name, values] of emptySections) {
        if (values?.some((value) => !value.trim())) errors.push(`${path}: empty item in ${name}`);
      }
      if ((topic.reviewStatus === 'Reviewed' || topic.reviewStatus === 'Verified') &&
          (!content.summary.trim() || !content.requirements.length || !content.applicability?.length || !content.verification)) {
        errors.push(`${path}: production content lacks summary, applicability, requirements, or verification metadata`);
      }
      for (const formula of content.formulas ?? []) {
        if (!formula.name.trim() || !formula.expression.trim() || !formula.variables.length || !formula.units.trim()) errors.push(`${path}: malformed formula ${formula.name || '(unnamed)'}`);
        if (!formula.variables.every((variable) => variable.symbol.trim() && variable.definition.trim() && variable.unit.trim())) errors.push(`${path}: malformed formula variable in ${formula.name}`);
      }
      for (const table of content.tables ?? []) {
        if (!table.columns.length || table.rows.some((row) => row.length !== table.columns.length)) errors.push(`${path}: inconsistent table columns in ${table.title}`);
      }
      for (const figure of content.figures ?? []) {
        if (figure.asset && !knownAssets.includes(figure.asset)) errors.push(`${path}: missing diagram asset ${figure.asset}`);
        if (!figure.asset && !figure.nodes.length) errors.push(`${path}: diagram ${figure.title} has no asset or nodes`);
      }
      for (const workflow of content.workflows ?? []) {
        if (!workflow.title.trim() || workflow.steps.length < 2 || workflow.steps.some((step) => !step.trim())) errors.push(`${path}: malformed design workflow`);
      }
      if (content.verification && !statuses.has(content.verification.reviewStatus)) errors.push(`${path}: invalid verification review status`);
      if (content.verification?.reviewStatus === 'Verified') {
        if (!content.verification.lastReviewed || !content.verification.references.length || !content.verification.sourceStatus || !content.summary.trim() || !content.requirements.length) {
          errors.push(`${path}: verified content lacks sufficient metadata or substantive content`);
        }
      }
    }
  }
  return errors;
}
