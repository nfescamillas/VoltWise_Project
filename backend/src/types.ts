export type StandardId = 'iec' | 'nec' | 'pec';
export type ReviewStatus = 'Draft' | 'Reviewed' | 'Verified' | 'Needs update' | 'Needs source' | 'Needs verification';
export type FormulaBasis = 'standard-defined' | 'derived-from-standard' | 'general-engineering';

export interface FormulaVariable {
  symbol: string;
  definition: string;
  unit: string;
}

export interface EngineeringFormula {
  name: string;
  expression: string;
  variables: FormulaVariable[];
  units: string;
  basis: FormulaBasis;
  sourceReference?: string;
  whenToUse?: string;
  workedInputExample?: string;
  notes?: string[];
}

export interface EngineeringTable {
  title: string;
  type: 'comparison' | 'decision' | 'workflow' | 'requirement';
  columns: string[];
  rows: string[][];
  sourceReference?: string;
  purpose?: string;
  howToApply?: string[];
}

export interface EngineeringFigure {
  title: string;
  type: 'schematic' | 'flowchart' | 'conceptual';
  description: string;
  nodes: string[];
  paths?: string[][];
  annotation?: string;
  sourceBasis: string;
  asset?: string;
}

export interface DesignWorkflow {
  title: string;
  steps: string[];
  note?: string;
}

export type CalculatorId = 'three-phase-current' | 'voltage-drop' | 'transformer-current';

export interface WorkedExample {
  title: string;
  given: string[];
  assumptions: string[];
  applicableRule: string;
  steps: string[];
  result: string;
  interpretation: string;
  sourceReferences: string[];
}

export interface VerificationMetadata {
  standard: string;
  edition: string;
  references: string[];
  reviewStatus: ReviewStatus;
  lastReviewed: string;
  sourceStatus: string;
}

export interface StandardReferenceDetail {
  article?: string;
  section?: string;
  clause?: string;
  table?: string;
  annex?: string;
  relatedStandards?: string[];
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  icon: string;
}

export interface Standard {
  id: StandardId;
  name: string;
  fullName: string;
  edition: string;
  description: string;
}

export interface TopicStandard {
  standardId: StandardId;
  standardName?: string;
  edition: string;
  reference: string;
  references?: string[];
  referenceDetails?: StandardReferenceDetail;
  summary: string;
  quickAnswer?: string;
  requirements: string[];
  terminology?: string;
  applicability?: string[];
  notApplicable?: string[];
  importantConditions?: string[];
  formulas?: EngineeringFormula[];
  tables?: EngineeringTable[];
  figures?: EngineeringFigure[];
  examples?: WorkedExample[];
  workflows?: DesignWorkflow[];
  calculators?: CalculatorId[];
  engineeringNotes?: string[];
  exceptions?: string[];
  commonMistakes?: string[];
  verification?: VerificationMetadata;
  comparison?: {
    terminology: string;
    designBasis: string;
    distinction: string;
  };
}

export interface Topic {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  synonyms: string[];
  standards: Partial<Record<StandardId, TopicStandard>>;
  engineeringExplanation: string;
  engineeringNotes: string[];
  commonMistakes: string[];
  relatedTopicIds: string[];
  lastReviewed: string;
  reviewStatus: ReviewStatus;
  sourceStatus: string;
}

export interface DashboardStats {
  topicCount: number;
  categoryCount: number;
  standardCount: number;
  reviewedCount: number;
}

export interface SearchOptions {
  categoryId?: string;
  standardId?: StandardId;
  limit?: number;
}
