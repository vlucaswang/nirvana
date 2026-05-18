export type KioskState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'GALLERY' | 'PRINTING';

export interface ImageResult {
  id: string;
  title: string;
  source: string;
  thumbnail_url: string;
  full_url: string;
  print_url: string;
  content_type: string;
  width: number;
  height: number;
  printable: boolean;
}

export interface SearchRequest {
  request_id: string;
  raw_text: string;
}

export interface SearchResponse {
  request_id: string;
  query: string;
  images: ImageResult[];
}

export interface PrintRequest {
  request_id: string;
  image_id: string;
  print_url: string;
}

export interface PrintResponse {
  request_id: string;
  status: 'success' | 'error';
  message: string;
}

export interface BackendClient {
  search(payload: SearchRequest): Promise<SearchResponse>;
  print(payload: PrintRequest): Promise<PrintResponse>;
}
