import { describe, expect, it } from 'vitest';
import { MockBackendClient } from './mockBackend';

describe('MockBackendClient', () => {
  it('returns structured image results matching the search contract', async () => {
    const client = new MockBackendClient();

    const response = await client.search({
      request_id: 'kiosk-2026-05-17T06:30:00.000Z-8f3a',
      raw_text: 'I want a mermaid coloring page',
    });

    expect(response).toMatchObject({
      request_id: 'kiosk-2026-05-17T06:30:00.000Z-8f3a',
      query: 'mermaid coloring page',
    });
    expect(response.images[0]).toMatchObject({
      id: 'img_01',
      title: 'Mermaid coloring page',
      source: 'local-mock',
      content_type: 'image/jpeg',
      printable: true,
    });
    expect(response.images[0]?.thumbnail_url).toContain('data:image/svg+xml');
    expect(response.images[0]?.full_url).toContain('data:image/svg+xml');
    expect(response.images[0]?.print_url).toBe('https://example.com/mermaid1-print.jpg');
  });

  it('returns a user-safe print response matching the print contract', async () => {
    const client = new MockBackendClient();

    const response = await client.print({
      request_id: 'kiosk-2026-05-17T06:30:00.000Z-8f3a',
      image_id: 'img_01',
      print_url: 'https://example.com/mermaid1-print.jpg',
    });

    expect(response).toEqual({
      request_id: 'kiosk-2026-05-17T06:30:00.000Z-8f3a',
      status: 'success',
      message: 'Sent img_01 to printer',
    });
  });
});
