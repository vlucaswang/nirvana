# Design Document: Kiosk Frontend Web App

## 1. Overview
A lightweight, zero-build single-page web application (SPA) designed to run in Safari Fullscreen (Add to Home Screen) on iPadOS. It acts as a "dumb terminal" kiosk. It captures voice input, delegates all complex processing to a backend integration center, displays an image grid, and sends a print command.

## 2. Technical Stack
*   **HTML5 / CSS3:** Flexbox/CSS Grid for responsive, child-friendly layout.
*   **Vanilla JavaScript (ES6+):** No heavy frameworks (React/Vue) to ensure instant loading and zero build compilation overhead.
*   **Web APIs:** Native `webkitSpeechRecognition` (for on-device iOS voice-to-text), `fetch` API.

## 3. Core State Machine
The application UI must strictly adhere to the following states:
1.  **`IDLE`**: Displays a large, prominent microphone button with text like "Tap to Speak".
2.  **`LISTENING`**: Displays a pulsing background/ring animation indicating the microphone is capturing audio.
3.  **`PROCESSING`**: Displays a full-screen loading spinner or a "Searching for images..." animation.
4.  **`GALLERY`**: Displays a clean, scrollable 2x3 or 3x2 grid of results with large touch targets.
5.  **`PRINTING`**: Displays a success animation overlay blocking further input, holding for 5 seconds before returning automatically to `IDLE`.

## 4. Functional Requirements & Implementation Steps
*   **Initialization:** Request microphone permissions on the first page load. Prevent default Safari browser behaviors like pull-to-refresh and elastic bouncing by applying `touch-action: none; overflow: hidden;` to the body.
*   **Voice Capture:** Instantiate `webkitSpeechRecognition`. Set `continuous = false` and `interimResults = false`. On the `onresult` event, capture the final transcript string and transition to the `PROCESSING` state.
*   **Search Request:** Send an asynchronous `POST` request to the backend `SEARCH_WEBHOOK_URL` containing the transcript and a client-generated request ID.
*   **Gallery Rendering:** Clear old states and parse the structured image result payload. Generate image cards dynamically from `thumbnail_url` and retain `id`, `full_url`, and `print_url` for print selection. Each image must feature an oversized, highly visible "Print" button overlay.
*   **Print Request:** When an image's print button is tapped, immediately trigger a `POST` request to the backend `PRINT_WEBHOOK_URL` containing the selected image ID and print URL, then transition to the `PRINTING` state.
*   **Inactivity Safeguard:** Implement a 120-second idle timer when in the `GALLERY` state. If no touch events occur within this window, automatically reset the application state to `IDLE` to clear the screen for the next user.

## 5. API Contracts
### POST `/webhook/search`
**Request Payload:**
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "raw_text": "I want a mermaid coloring page"
}
```

**Response Payload (200 OK):**
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "query": "mermaid coloring page",
  "images": [
    {
      "id": "img_01",
      "title": "Mermaid coloring page",
      "source": "example.com",
      "thumbnail_url": "https://example.com/mermaid1-thumb.jpg",
      "full_url": "https://example.com/mermaid1.jpg",
      "print_url": "https://example.com/mermaid1-print.jpg",
      "content_type": "image/jpeg",
      "width": 1200,
      "height": 1600,
      "printable": true
    },
    {
      "id": "img_02",
      "title": "Cute mermaid outline",
      "source": "example.com",
      "thumbnail_url": "https://example.com/mermaid2-thumb.jpg",
      "full_url": "https://example.com/mermaid2.jpg",
      "print_url": "https://example.com/mermaid2-print.jpg",
      "content_type": "image/jpeg",
      "width": 1024,
      "height": 1536,
      "printable": true
    }
  ]
}
```

### POST `/webhook/print`
**Request Payload:**
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "image_id": "img_01",
  "print_url": "https://example.com/mermaid1-print.jpg"
}
```

**Response Payload (200 OK):**
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "success",
  "message": "Sent to printer"
}
```

**Error Payload:**
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "error",
  "message": "The printer is offline. Please try again later."
}
```

## 6. Contract Notes
*   `request_id` lets the frontend correlate search and print attempts with backend logs.
*   `id` is the stable selection key for the kiosk session. The frontend should pass the selected `image_id` back even when it also sends `print_url`.
*   `thumbnail_url` is optimized for the gallery. `full_url` is used for enlarge/preview. `print_url` is the backend-approved URL or cached file endpoint to print.
*   `printable = false` results should not show a print button. They may still be displayed if useful, but the preferred MVP behavior is to filter them out server-side.
*   The backend should return plain URLs, not Markdown links.

## 7. iPad Kiosk Deployment

### Simple Home Setup
Use Safari or an Add to Home Screen web app with Guided Access.

Steps:
1. Open the kiosk URL on the iPad.
2. Add it to the Home Screen if using the web-app style.
3. Enable Guided Access in iPadOS Accessibility settings.
4. Open the kiosk app.
5. Start Guided Access and disable hardware buttons or touch regions as needed.
6. Set iPad auto-lock behavior so normal sleep/wake returns to the kiosk.

This is enough for normal day-to-day use. It keeps the kiosk in front while the iPad sleeps and wakes. It does not guarantee automatic relaunch after a full device restart, battery drain, or system update.

### Robust Kiosk Setup
Use a supervised iPad with Apple Configurator or MDM Single App Mode.

Single App Mode forces one selected app to open and prevents switching away. Apple documents that the selected app reopens immediately after the device restarts. This is the correct path if the kiosk must recover automatically after reboot.

Recommended app target:
*   **Best:** A tiny native iOS wrapper app using `WKWebView` that opens the local kiosk URL, then lock that app with Single App Mode.
*   **Acceptable:** Safari locked with Single App Mode, if Safari UI and exact URL recovery are acceptable.
*   **Not ideal:** Relying only on a Home Screen web clip when automatic post-reboot recovery is required.

Tradeoff:
*   Guided Access is simple and does not require wiping/supervising the iPad.
*   Single App Mode is more reliable but requires a supervised device. Enabling supervision usually requires setting up the iPad as a new or erased device.
