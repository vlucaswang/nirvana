import type { BackendClient, ImageResult, PrintRequest, PrintResponse, SearchRequest, SearchResponse } from './types';

const colorPageSvg = (title: string, accent: string): string => {
  const encoded = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#fffaf0"/>
      <rect x="45" y="45" width="810" height="1110" rx="42" fill="none" stroke="${accent}" stroke-width="18"/>
      <circle cx="450" cy="330" r="120" fill="none" stroke="#2d3142" stroke-width="18"/>
      <path d="M315 580c80-120 190-120 270 0 35 52 34 132-3 206l-132 260-132-260c-37-74-38-154-3-206z" fill="none" stroke="#2d3142" stroke-width="18"/>
      <path d="M285 295c80-65 250-65 330 0M360 335c25 24 55 24 80 0M460 335c25 24 55 24 80 0" fill="none" stroke="#2d3142" stroke-width="14" stroke-linecap="round"/>
      <path d="M260 785c-58 35-102 90-120 160M640 785c58 35 102 90 120 160" fill="none" stroke="${accent}" stroke-width="18" stroke-linecap="round"/>
      <text x="450" y="1110" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#2d3142">${title}</text>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
};

const mockImages: ImageResult[] = [
  {
    id: 'img_01',
    title: 'Mermaid coloring page',
    source: 'local-mock',
    thumbnail_url: colorPageSvg('Mermaid', '#287c76'),
    full_url: colorPageSvg('Mermaid', '#287c76'),
    print_url: 'https://example.com/mermaid1-print.jpg',
    content_type: 'image/jpeg',
    width: 1200,
    height: 1600,
    printable: true,
  },
  {
    id: 'img_02',
    title: 'Cute mermaid outline',
    source: 'local-mock',
    thumbnail_url: colorPageSvg('Cute Mermaid', '#8a5a44'),
    full_url: colorPageSvg('Cute Mermaid', '#8a5a44'),
    print_url: 'https://example.com/mermaid2-print.jpg',
    content_type: 'image/jpeg',
    width: 1024,
    height: 1536,
    printable: true,
  },
  {
    id: 'img_03',
    title: 'Ocean princess coloring sheet',
    source: 'local-mock',
    thumbnail_url: colorPageSvg('Ocean Princess', '#3f6f9f'),
    full_url: colorPageSvg('Ocean Princess', '#3f6f9f'),
    print_url: 'https://example.com/mermaid3-print.jpg',
    content_type: 'image/jpeg',
    width: 1100,
    height: 1500,
    printable: true,
  },
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class MockBackendClient implements BackendClient {
  async search(payload: SearchRequest): Promise<SearchResponse> {
    await delay(700);
    return {
      request_id: payload.request_id,
      query: payload.raw_text.toLowerCase().includes('mermaid') ? 'mermaid coloring page' : `${payload.raw_text} coloring page`,
      images: mockImages,
    };
  }

  async print(payload: PrintRequest): Promise<PrintResponse> {
    await delay(900);
    return {
      request_id: payload.request_id,
      status: 'success',
      message: `Sent ${payload.image_id} to printer`,
    };
  }
}
