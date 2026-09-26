import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./services', async () => {
  const { MockElectricalToolkitService } = await import('@voltwise/backend');
  return { toolkitService: new MockElectricalToolkitService(0) };
});

beforeEach(() => { vi.stubGlobal('scrollTo', vi.fn()); });

describe('App', () => {
  it('loads dashboard content through the service gateway', async () => {
    render(<App />);
    expect(await screen.findByText('Electrical standards,')).toBeInTheDocument();
    expect(screen.getByText('63')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Motors & Drives/i })).toBeInTheDocument();
  });

  it('searches in engineering language and opens a topic', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = await screen.findByLabelText('Search electrical topics');
    await user.type(input, 'motor breaker');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    expect(await screen.findByText('Results for “motor breaker”')).toBeInTheDocument();
    const topicButton = await screen.findByRole('button', { name: /Motor Short-Circuit Protection/i });
    await user.click(topicButton);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Short-Circuit Protection', level: 1 })).toBeInTheDocument());
    expect(screen.getAllByText('Article 430').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'What the Selected Standard Requires' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Worked Example' })).toBeInTheDocument();
    expect(screen.getAllByText('Needs source').length).toBeGreaterThan(0);
  });

  it('compares IEC, NEC, and PEC without forcing equivalence', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = await screen.findByLabelText('Search electrical topics');
    await user.type(input, 'generator neutral');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Generator Neutral Grounding/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Generator Neutral Grounding', level: 1 })).toBeInTheDocument());
    await user.click(screen.getByRole('tab', { name: /COMPARE/i }));
    expect(screen.getByRole('heading', { name: /Compare approaches/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Important distinction/i })).toBeInTheDocument();
  });

  it('shows a populated motor-current calculator and recalculates from user input', async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = await screen.findByLabelText('Search electrical topics');
    await user.type(search, 'motor full-load current');
    await user.click(screen.getByRole('button', { name: /^Search/i }));
    await user.click(await screen.findByRole('button', { name: /Motor Full-Load Current/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Motor Full-Load Current', level: 1 })).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Three-Phase Motor Current' })).toBeInTheDocument();
    expect(screen.getByText('67.5 A')).toBeInTheDocument();
    const power = screen.getByLabelText('Motor output power (kW)');
    await user.clear(power);
    await user.type(power, '30');
    expect(screen.getByText('54.73 A')).toBeInTheDocument();
    expect(screen.getByText(/Engineering calculation only/i)).toBeInTheDocument();
  });
});
