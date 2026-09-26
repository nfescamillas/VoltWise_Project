import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

beforeEach(() => { vi.stubGlobal('scrollTo', vi.fn()); });

describe('App', () => {
  it('loads dashboard content entirely through the mock service', async () => {
    render(<App />);
    expect(await screen.findByText('Electrical standards,')).toBeInTheDocument();
    expect(screen.getAllByText('63')).toHaveLength(2);
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
    expect(screen.getByText('Article 430')).toBeInTheDocument();
  });
});
