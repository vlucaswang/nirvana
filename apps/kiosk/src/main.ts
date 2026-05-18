import './styles.css';
import { MockBackendClient } from './mockBackend';
import { createRequestId } from './requestId';
import type { BackendClient, ImageResult, KioskState, SearchResponse } from './types';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface AppModel {
  state: KioskState;
  requestId: string | null;
  transcript: string;
  query: string;
  images: ImageResult[];
  selectedImage: ImageResult | null;
  message: string;
  error: string | null;
}

const galleryIdleMs = 120_000;
const backend: BackendClient = new MockBackendClient();
const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('Missing #app root element');
}

const appRoot = root;
let galleryTimer: number | null = null;
let recognition: SpeechRecognition | null = null;

const model: AppModel = {
  state: 'IDLE',
  requestId: null,
  transcript: '',
  query: '',
  images: [],
  selectedImage: null,
  message: '',
  error: null,
};

function setState(nextState: KioskState): void {
  model.state = nextState;
  if (nextState === 'GALLERY') {
    armGalleryTimer();
  } else {
    clearGalleryTimer();
  }
  render();
}

function resetApp(): void {
  recognition?.stop();
  model.state = 'IDLE';
  model.requestId = null;
  model.transcript = '';
  model.query = '';
  model.images = [];
  model.selectedImage = null;
  model.message = '';
  model.error = null;
  clearGalleryTimer();
  render();
}

function clearGalleryTimer(): void {
  if (galleryTimer !== null) {
    window.clearTimeout(galleryTimer);
    galleryTimer = null;
  }
}

function armGalleryTimer(): void {
  clearGalleryTimer();
  galleryTimer = window.setTimeout(resetApp, galleryIdleMs);
}

async function submitSearch(rawText: string): Promise<void> {
  model.requestId = createRequestId();
  model.transcript = rawText;
  model.error = null;
  model.message = 'Searching for coloring pages';
  setState('PROCESSING');

  try {
    const response: SearchResponse = await backend.search({
      request_id: model.requestId,
      raw_text: rawText,
    });

    model.query = response.query;
    model.images = response.images.filter((image) => image.printable);
    model.message = model.images.length > 0 ? 'Choose a page to print' : 'No printable pages found';
    setState('GALLERY');
  } catch {
    model.error = 'Search failed. Please try again.';
    setState('IDLE');
  }
}

async function submitPrint(image: ImageResult): Promise<void> {
  if (!model.requestId) {
    model.error = 'The search session expired. Please search again.';
    setState('IDLE');
    return;
  }

  model.selectedImage = image;
  model.message = 'Sending to printer';
  model.error = null;
  setState('PRINTING');

  try {
    const response = await backend.print({
      request_id: model.requestId,
      image_id: image.id,
      print_url: image.print_url,
    });

    model.message = response.message;
    model.error = response.status === 'error' ? response.message : null;
  } catch {
    model.error = 'The printer is offline. Please try again later.';
  }

  render();
  window.setTimeout(resetApp, 5_000);
}

function startListening(): void {
  model.error = null;
  model.message = 'Listening';
  setState('LISTENING');

  const SpeechRecognitionApi = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!SpeechRecognitionApi) {
    window.setTimeout(() => void submitSearch('I want a mermaid coloring page'), 900);
    return;
  }

  recognition = new SpeechRecognitionApi();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-AU';
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript?.trim() || 'I want a mermaid coloring page';
    void submitSearch(transcript);
  };
  recognition.onerror = () => {
    model.error = 'I could not hear that. Please try again.';
    setState('IDLE');
  };
  recognition.onend = () => {
    if (model.state === 'LISTENING') {
      setState('IDLE');
    }
  };
  recognition.start();
}

function render(): void {
  appRoot.className = `app-shell state-${model.state.toLowerCase()}`;
  appRoot.innerHTML = `
    <section class="kiosk-screen" data-state="${model.state}">
      ${renderHeader()}
      ${renderBody()}
    </section>
  `;

  appRoot.querySelector<HTMLButtonElement>('[data-action="listen"]')?.addEventListener('click', startListening);
  appRoot.querySelector<HTMLButtonElement>('[data-action="sample"]')?.addEventListener('click', () => {
    void submitSearch('I want a mermaid coloring page');
  });
  appRoot.querySelector<HTMLButtonElement>('[data-action="reset"]')?.addEventListener('click', resetApp);
  appRoot.querySelectorAll<HTMLButtonElement>('[data-print-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = model.images.find((candidate) => candidate.id === button.dataset.printId);
      if (image) {
        void submitPrint(image);
      }
    });
  });
  appRoot.querySelectorAll<HTMLButtonElement>('[data-preview-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const image = model.images.find((candidate) => candidate.id === button.dataset.previewId);
      if (image) {
        model.selectedImage = image;
        render();
      }
    });
  });
}

function renderHeader(): string {
  return `
    <header class="screen-header">
      <div>
        <p class="eyebrow">Nirvana Kiosk</p>
        <h1>${headlineForState()}</h1>
      </div>
      ${model.state !== 'IDLE' ? '<button class="icon-button" data-action="reset" aria-label="Reset kiosk">Reset</button>' : ''}
    </header>
  `;
}

function headlineForState(): string {
  if (model.state === 'LISTENING') return 'Listening';
  if (model.state === 'PROCESSING') return 'Searching';
  if (model.state === 'GALLERY') return model.query || 'Choose a page';
  if (model.state === 'PRINTING') return 'Printing';
  return 'What should we make?';
}

function renderBody(): string {
  if (model.state === 'IDLE') return renderIdle();
  if (model.state === 'LISTENING') return renderListening();
  if (model.state === 'PROCESSING') return renderProcessing();
  if (model.state === 'GALLERY') return renderGallery();
  return renderPrinting();
}

function renderIdle(): string {
  return `
    <div class="center-stage">
      <button class="mic-button" data-action="listen" aria-label="Start voice request">
        <span class="mic-icon" aria-hidden="true"></span>
      </button>
      <p class="primary-copy">Tap and ask for a coloring page.</p>
      <button class="secondary-button" data-action="sample">Use sample request</button>
      ${renderError()}
    </div>
  `;
}

function renderListening(): string {
  return `
    <div class="center-stage">
      <div class="listening-orb" aria-hidden="true"></div>
      <p class="primary-copy">Say what you want to print.</p>
      <p class="secondary-copy">Try: I want a mermaid coloring page</p>
    </div>
  `;
}

function renderProcessing(): string {
  return `
    <div class="center-stage">
      <div class="spinner" aria-hidden="true"></div>
      <p class="primary-copy">${model.message}</p>
      <p class="secondary-copy">${model.transcript}</p>
    </div>
  `;
}

function renderGallery(): string {
  const preview = model.selectedImage ?? model.images[0] ?? null;
  return `
    <div class="gallery-layout">
      <section class="preview-panel" aria-label="Selected image preview">
        ${
          preview
            ? `<img src="${preview.full_url}" alt="${preview.title}" />
               <div class="preview-meta">
                 <h2>${preview.title}</h2>
                 <p>${preview.source} · ${preview.width} x ${preview.height}</p>
                 <button class="print-button" data-print-id="${preview.id}">Print this page</button>
               </div>`
            : '<p class="primary-copy">No printable pages found.</p>'
        }
      </section>
      <section class="results-grid" aria-label="Image results">
        ${model.images.map(renderImageCard).join('')}
      </section>
    </div>
  `;
}

function renderImageCard(image: ImageResult): string {
  const selected = model.selectedImage?.id === image.id;
  return `
    <article class="image-card ${selected ? 'is-selected' : ''}">
      <button data-preview-id="${image.id}" aria-label="Preview ${image.title}">
        <img src="${image.thumbnail_url}" alt="${image.title}" />
        <span>${image.title}</span>
      </button>
    </article>
  `;
}

function renderPrinting(): string {
  const success = !model.error && model.message.toLowerCase().includes('sent');
  return `
    <div class="center-stage">
      <div class="status-mark ${success ? 'success' : ''}" aria-hidden="true">${success ? '✓' : ''}</div>
      <p class="primary-copy">${model.error ?? model.message}</p>
      <p class="secondary-copy">Returning to the start screen soon.</p>
    </div>
  `;
}

function renderError(): string {
  return model.error ? `<p class="error-copy" role="alert">${model.error}</p>` : '';
}

render();
