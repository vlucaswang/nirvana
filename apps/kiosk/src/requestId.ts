export function createRequestId(now = new Date()): string {
  const random = crypto.getRandomValues(new Uint32Array(1))[0]?.toString(16).padStart(8, '0') ?? '00000000';
  return `kiosk-${now.toISOString()}-${random.slice(0, 4)}`;
}
