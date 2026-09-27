import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { calculationRecordStore } from './services';

vi.mock('./services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./services')>();
  const { MockElectricalToolkitService } = await import('@voltwise/backend');
  return { ...actual, toolkitService: new MockElectricalToolkitService(0) };
});
beforeEach(() => { vi.stubGlobal('scrollTo', vi.fn()); window.localStorage.clear(); window.sessionStorage.clear(); });

describe('App', () => {
  it('loads the Philippine PEC-first dashboard', async () => {
    render(<App />);
    expect(await screen.findByText('Philippine electrical practice,')).toBeInTheDocument();
    expect(screen.getByText('PEC active. Distribution and Grid planned.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Motors/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('TOOLKIT COMPLETE')).toHaveLength(4);
    expect(screen.getByText('15 handbook chapters structured')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Motor Branch-Circuit Conductors/i })).toBeInTheDocument();
  });

  it('shows active/planned source-family boundaries', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(await screen.findByRole('button', { name: /Source families/i }));
    expect(screen.getByRole('button', { name: /Philippine Electrical Code/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Philippine Distribution Code/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Philippine Grid Code/i })).toBeDisabled();
  });

  it('searches engineering language and opens PEC fault protection', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'motor breaker');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    const card = await screen.findByRole('button', { name: /Motor Short-Circuit and Ground-Fault Protection/i }); await user.click(card);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Short-Circuit and Ground-Fault Protection', level: 1 })).toBeInTheDocument());
    expect(screen.getAllByText(/NEEDS VERIFICATION/i).length).toBeGreaterThan(0);
  });

  it('renders the gold-standard motor conductor toolkit', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, '4.30.2.2');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Motor Branch-Circuit Conductors/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Branch-Circuit Conductors', level: 1 })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Engineering formulas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Worked examples' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Engineering diagrams' })).toBeInTheDocument();
    expect(screen.getByText('I_min = 1.25 x I_PEC-FLC')).toBeInTheDocument();
    expect(screen.getByText(/supplied PDF p\. 375/i)).toBeInTheDocument();
  });

  it('renders the completed temperature-correction chapter', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'cable derating');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Temperature Correction \/ Adjustment Factors/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Temperature Correction / Adjustment Factors', level: 1 })).toBeInTheDocument());
    expect(screen.getByText('I_derated = I_table x k_T x k_CCC')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Worked examples' })).toBeInTheDocument();
    expect(screen.getAllByText(/Table 3\.10\.1\.15\(b\)\(2\)\(a\)/i).length).toBeGreaterThan(0);
  });

  it('renders the interactive conductor worksheet', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'conductor ampacity');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /^CONDUCTORS.*Conductor Ampacity/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Interactive worksheet' })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Conductor Ampacity and Voltage Drop' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print / Save PDF' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Project name / number')).toBeInTheDocument();
    expect(screen.getByText('THERMAL CHECK PASSES')).toBeInTheDocument();
    const factor = screen.getByLabelText('Conductor-count adjustment (decimal)');
    await user.clear(factor); await user.type(factor, '0.5');
    expect(screen.getByText('THERMAL CHECK FAILS')).toBeInTheDocument();
  });

  it('runs and saves the motor disconnect and controller worksheet', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'local motor isolator');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Motor Disconnecting Means/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Disconnect and Controller' })).toBeInTheDocument());
    expect(screen.getByText('74.75 A')).toBeInTheDocument();
    expect(screen.getByText('DISCONNECT FUNCTION CHECK INCOMPLETE')).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Disconnect is in sight from the motor and driven machinery/));
    await user.click(screen.getByLabelText('Applicable Table 4.30.6.2(b) path recorded'));
    expect(screen.getByText('DISCONNECT FUNCTION CHECK PASSES')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Project name / number'), 'Plant A');
    await user.type(screen.getByPlaceholderText('Tag or circuit designation'), 'M-101');
    await user.type(screen.getByPlaceholderText('Name / license reference'), 'Engineer');
    await user.click(screen.getByRole('button', { name: 'Save record' }));
    expect(screen.getByText('Saved locally')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Plant A · M-101/i })).toBeInTheDocument();
  });

  it('renders the transformer grounding topology decision tool without inventing conductor sizes', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'transformer XO bond');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Transformer Grounding and Bonding/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Transformer Grounding and Bonding - Calculation Record' })).toBeInTheDocument());
    expect(screen.getByText('208.18 A')).toBeInTheDocument();
    expect(screen.getByText('GROUNDING WORKFLOW INCOMPLETE')).toBeInTheDocument();
    expect(screen.getByText(/No bonding-conductor size is invented/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Structural steel and metal piping review is recorded/));
    await user.click(screen.getByLabelText(/Official SBJ \/ EGC \/ GEC table rows and materials are recorded/));
    expect(screen.getByText('GROUNDING WORKFLOW READY FOR REVIEW')).toBeInTheDocument();
  });

  it('runs the working-clearance field-verification worksheet from the verified PEC table path', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, '900 mm clearance');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Working Clearances/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Working Clearances - Calculation Record' })).toBeInTheDocument());
    expect(screen.getByText('1000 mm')).toBeInTheDocument();
    expect(screen.getByText('NEEDS PEC TABLE RECORD')).toBeInTheDocument();
    expect(screen.getByText('DIMENSION CHECK PASSES')).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Table 1\.10\.2\.1\(a\)\(1\) row is recorded/));
    await user.type(screen.getByLabelText('Field measurement / site-photo reference'), 'Photo WC-01, measured 2026-09-27');
    expect(screen.getByText('WORKING-SPACE RECORD READY FOR REVIEW')).toBeInTheDocument();
  });

  it('coordinates service ampacity, disconnects, GFPE, fault duty, and grounding in one worksheet', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'six disconnect rule');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Services and Service Equipment/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Services and Service Equipment - Calculation Record' })).toBeInTheDocument());
    expect(screen.getByText('420 A')).toBeInTheDocument();
    expect(screen.getByText('Triggered by entered system')).toBeInTheDocument();
    expect(screen.getByText('PROTECTION ACTION REQUIRED')).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Article 2\.20 load calculation/));
    await user.click(screen.getByLabelText('GFPE is provided when triggered'));
    await user.click(screen.getByLabelText(/GFPE performance test and written record/));
    await user.click(screen.getByLabelText(/Grounding-electrode conductor and electrode-system evidence/));
    expect(screen.getByText('SERVICE RECORD READY FOR REVIEW')).toBeInTheDocument();
  });

  it('provides an actionable PEC verification workspace', async () => {
    const user = userEvent.setup(); render(<App />);
    await user.click(await screen.findByRole('button', { name: /Verification workspace/i }));
    expect(screen.getByRole('heading', { name: 'Verification workspace', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('PEC edition remains unconfirmed')).toBeInTheDocument();
    expect(screen.getAllByText('Independent technical review')).toHaveLength(15);
    const reviewerFields = screen.getAllByPlaceholderText('Name / license reference');
    await user.type(reviewerFields[0], 'Independent reviewer');
    await user.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByText('1/15')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Open chapter' })[0]);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Branch-Circuit Conductors', level: 1 })).toBeInTheDocument());
  });

  it('renders the generator neutral decision chapter', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'generator neutral');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Generator Neutral Grounding/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Generator Neutral Grounding / Separately Derived Systems', level: 1 })).toBeInTheDocument());
    expect(screen.getByText(/Pole count is a clue/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Generator neutral decision guide' })).toBeInTheDocument();
  });

  it('classifies generator neutral topology only after operating-state evidence is recorded', async () => {
    const user = userEvent.setup(); render(<App />);
    const input = await screen.findByLabelText('Search electrical topics'); await user.type(input, 'four pole ATS');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Generator Neutral Grounding/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Generator Neutral Grounding - Calculation Record' })).toBeInTheDocument());
    expect(screen.getByText('INSUFFICIENT TOPOLOGY INFORMATION')).toBeInTheDocument();
    await user.click(screen.getByLabelText(/One-line and ATS contact schematic are recorded/));
    await user.click(screen.getByLabelText(/Normal, emergency, test, bypass, and maintenance states are mapped/));
    await user.click(screen.getByLabelText(/Generator and transfer-equipment instructions\/listing are recorded/));
    await user.click(screen.getByLabelText(/Multiple-source warning and source identification are recorded/));
    expect(screen.getByText('NON-SEPARATELY-DERIVED PATH INDICATED')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Generator neutral-to-frame bond is installed'));
    expect(screen.getByText('DUPLICATE BOND / PARALLEL-PATH RISK')).toBeInTheDocument();
  });

  it('lists, duplicates, and reopens locally saved calculation records', async () => {
    calculationRecordStore.save({ id: 'clearance-one', calculatorId: 'working-clearance', project: 'Plant D', equipment: 'MDP-01', preparedBy: 'Engineer', checkedBy: '', calculationDate: '2026-09-27', assumptions: 'Field measured.', sourceEvidence: 'PEC Table 1.10.2.1(a)(1)', fields: { voltageToGround: 277, clearanceCondition: '2', workflowReady: true }, status: 'needs-verification', updatedAt: '2026-09-27T00:00:00.000Z' });
    const user = userEvent.setup(); render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Calculation records' }));
    expect(screen.getByRole('heading', { name: 'Calculation records', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plant D' })).toBeInTheDocument();
    expect(screen.getByText('MDP-01')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Duplicate/i }));
    expect(screen.getByText(/Duplicated Plant D · MDP-01/i)).toBeInTheDocument();
    expect(screen.getByText('MDP-01 copy')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /Reopen/i })[0]);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Working Clearances - Calculation Record' })).toBeInTheDocument());
    expect(screen.getByLabelText('Project')).toHaveValue('Plant D');
    expect(screen.getByLabelText('Saved calculation record')).not.toHaveValue('');
  });
});
