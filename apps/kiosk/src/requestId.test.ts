import { describe, expect, it, vi } from 'vitest';
import { createRequestId } from './requestId';

describe('createRequestId', () => {
  it('creates a kiosk request id with an ISO timestamp and random suffix', () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      const values = array as Uint32Array;
      values[0] = 0x8f3a1234;
      return array;
    });

    expect(createRequestId(new Date('2026-05-17T06:30:00.000Z'))).toBe('kiosk-2026-05-17T06:30:00.000Z-8f3a');
  });
});
