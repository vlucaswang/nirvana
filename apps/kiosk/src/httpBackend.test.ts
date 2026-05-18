import { afterEach, describe, expect, it, vi } from 'vitest';
import { HttpBackendClient } from './httpBackend';

describe('HttpBackendClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts search payloads to the configured webhook URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          request_id: 'req_1',
          query: 'mermaid coloring page',
          images: [],
        }),
      ),
    );
    const client = new HttpBackendClient({
      searchWebhookUrl: '/webhook/search',
      printWebhookUrl: '/webhook/print',
      authHeader: 'X-Nirvana-Kiosk-Key',
      authToken: 'dev-token',
    });

    await expect(client.search({ request_id: 'req_1', raw_text: 'I want a mermaid coloring page' })).resolves.toMatchObject({
      request_id: 'req_1',
      query: 'mermaid coloring page',
    });
    expect(fetchMock).toHaveBeenCalledWith('/webhook/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Nirvana-Kiosk-Key': 'dev-token',
      },
      body: JSON.stringify({ request_id: 'req_1', raw_text: 'I want a mermaid coloring page' }),
    });
  });

  it('throws when the webhook response is not successful', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    const client = new HttpBackendClient({
      searchWebhookUrl: '/webhook/search',
      printWebhookUrl: '/webhook/print',
      authHeader: 'X-Nirvana-Kiosk-Key',
      authToken: '',
    });

    await expect(client.print({ request_id: 'req_1', image_id: 'img_01', print_url: 'https://example.com/a.jpg' })).rejects.toThrow(
      'Webhook request failed with 500',
    );
  });
});
