import { config } from './config';
import { HttpBackendClient } from './httpBackend';
import { MockBackendClient } from './mockBackend';
import type { BackendClient } from './types';

export function createBackendClient(): BackendClient {
  if (config.backendMode === 'http') {
    return new HttpBackendClient({
      searchWebhookUrl: config.searchWebhookUrl,
      printWebhookUrl: config.printWebhookUrl,
      authHeader: config.kioskAuthHeader,
      authToken: config.kioskAuthToken,
    });
  }

  return new MockBackendClient();
}
