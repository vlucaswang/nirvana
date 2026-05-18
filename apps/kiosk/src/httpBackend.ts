import type { BackendClient, PrintRequest, PrintResponse, SearchRequest, SearchResponse } from './types';

interface HttpBackendOptions {
  searchWebhookUrl: string;
  printWebhookUrl: string;
  authHeader: string;
  authToken: string;
}

export class HttpBackendClient implements BackendClient {
  constructor(private readonly options: HttpBackendOptions) {}

  async search(payload: SearchRequest): Promise<SearchResponse> {
    return this.post<SearchResponse>(this.options.searchWebhookUrl, payload);
  }

  async print(payload: PrintRequest): Promise<PrintResponse> {
    return this.post<PrintResponse>(this.options.printWebhookUrl, payload);
  }

  private async post<TResponse>(url: string, payload: unknown): Promise<TResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.options.authToken) {
      headers[this.options.authHeader] = this.options.authToken;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}
