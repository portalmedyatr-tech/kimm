import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TikfinityWidget from './TikfinityWidget';

describe('TikfinityWidget', () => {
  beforeEach(() => {
    // Clear any existing message listeners
    // Note: jsdom handles event listeners globally; tests will clean up DOM between runs
    // Reset fetch
    // @ts-ignore
    global.fetch = undefined;
  });

  it('renders iframe and accepts postMessage from origin', async () => {
    render(<TikfinityWidget cid="1209191" apiBaseUrl="https://tikfinity.zerody.one" timeoutMs={1000} />);

    // simulate message from trusted origin
    const payload = { cid: '1209191', hello: 'world' };
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://tikfinity.zerody.one', data: payload }));

    await waitFor(() => expect(screen.getByText('Veri alındı')).toBeInTheDocument());
    expect(screen.getByText(/hello/)).toBeInTheDocument();
  });

  it('falls back to fetch when iframe does not respond', async () => {
    // mock fetch
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ fromFetch: true }) }));

    render(<TikfinityWidget cid="555" apiBaseUrl="https://tikfinity.zerody.one" timeoutMs={20} />);

    await waitFor(() => expect(screen.getByText('Veri alındı')).toBeInTheDocument(), { timeout: 1000 });
    expect(screen.getByText(/fromFetch/)).toBeInTheDocument();
  });
});
