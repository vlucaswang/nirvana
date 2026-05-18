export interface AppConfig {
  backendMode: 'mock' | 'http';
  searchWebhookUrl: string;
  printWebhookUrl: string;
  kioskAuthHeader: string;
  kioskAuthToken: string;
}

export const config: AppConfig = {
  backendMode: import.meta.env.VITE_BACKEND_MODE === 'http' ? 'http' : 'mock',
  searchWebhookUrl: import.meta.env.VITE_SEARCH_WEBHOOK_URL ?? '/webhook/search',
  printWebhookUrl: import.meta.env.VITE_PRINT_WEBHOOK_URL ?? '/webhook/print',
  kioskAuthHeader: import.meta.env.VITE_KIOSK_AUTH_HEADER ?? 'X-Nirvana-Kiosk-Key',
  kioskAuthToken: import.meta.env.VITE_KIOSK_AUTH_TOKEN ?? '',
};
