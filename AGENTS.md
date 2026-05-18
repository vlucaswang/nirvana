# AGENTS.md

## Project Goal
Build `nirvana` as the iPad kiosk frontend for a local-only home assistant-style command center.

The first product journey is:
1. A user taps a large microphone button on an iPad kiosk.
2. The kiosk captures speech such as "I want a mermaid coloring page".
3. The kiosk sends the transcribed command to a local n8n webhook.
4. n8n uses local automation and a local LLM/router to search for printable image options.
5. The kiosk displays image results, lets the user preview/enlarge/select one, and sends the selection back to n8n.
6. n8n prints to a Brother DCP-L3560CDW over local IPP/CUPS or another local print protocol.
7. The kiosk shows success or a user-safe error message.

## Repository Scope
This repository owns the kiosk app and public interface contracts.

Keep in this repo:
*   iPad kiosk frontend source code.
*   UI state machine and interaction logic.
*   API client code for local n8n webhooks.
*   Mock API responses and frontend tests.
*   Public API contract docs.
*   iPad kiosk deployment notes.

Do not put in this repo:
*   n8n workflow exports.
*   n8n credentials or local deployment state.
*   printer IP addresses or CUPS configuration.
*   local LLM runtime files.
*   Home Assistant tokens.
*   real `.env` secrets.

Backend/local automation should live in a separate repo, currently expected to be `nirvana-local-automation`.

## Architecture Decisions
*   Use a dedicated kiosk web app for the iPad frontend.
*   Use n8n as the local workflow orchestrator for search and print webhooks.
*   Home Assistant is not required for the first coloring-page workflow. It is only an optional local integration for future smart-home device actions.
*   All backend and automation components must run locally on the home network.
*   Do not depend on cloud LLMs for default behavior. Prefer Ollama, LM Studio, or another local OpenAI-compatible endpoint.
*   A separate print microservice is not required for the MVP. The Brother DCP-L3560CDW should be targeted directly through local IPP/CUPS where practical.

## Frontend Requirements
The kiosk app should be simple, durable, and touch-friendly on iPad.

Required UI states:
*   `IDLE`: large microphone button, ready to speak.
*   `LISTENING`: obvious active microphone/listening feedback.
*   `PROCESSING`: searching/loading state.
*   `GALLERY`: image result grid with large touch targets.
*   `PRINTING`: print progress/result state that blocks duplicate input.

Core behavior:
*   Capture speech through browser/iPad-compatible APIs where possible.
*   Send a client-generated `request_id` with each search.
*   Render structured image objects from the backend.
*   Use `thumbnail_url` for the gallery, `full_url` for preview, and `print_url` for print selection.
*   Reset the gallery after inactivity.
*   Return user-safe errors rather than raw backend exceptions.

## API Contract
The kiosk talks to local n8n endpoints.

Search request:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "raw_text": "I want a mermaid coloring page"
}
```

Search response:
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
    }
  ]
}
```

Print request:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "image_id": "img_01",
  "print_url": "https://example.com/mermaid1-print.jpg"
}
```

Print response:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "success",
  "message": "Sent to printer"
}
```

Error response:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "error",
  "message": "The printer is offline. Please try again later."
}
```

The backend must return plain URLs, not Markdown links.

## Suggested Repo Structure
Use this shape unless there is a strong reason to change it:

```text
nirvana/
  apps/
    kiosk/
      src/
      public/
      tests/
      package.json
      vite.config.ts
  docs/
    drafts/
    api/
      kiosk_backend_contract.md
    deployment/
      ipad_kiosk.md
  .env.example
  AGENTS.md
  README.md
```

Prefer a small Vite app for the kiosk. A zero-build HTML app is acceptable for prototypes, but Vite is preferred once implementation starts because it gives better TypeScript, testing, asset handling, and local development while still producing static files.

## Environment Variables
Use public frontend environment variables only for non-secret configuration.

Example:
```text
VITE_SEARCH_WEBHOOK_URL=http://nirvana.local/webhook/search
VITE_PRINT_WEBHOOK_URL=http://nirvana.local/webhook/print
VITE_KIOSK_AUTH_HEADER=X-Nirvana-Kiosk-Key
```

Do not commit real auth tokens. If a kiosk auth token is needed in a frontend build, treat it as a shared local gate, not as a strong secret.

## iPad Deployment
MVP deployment can use Safari or an Add to Home Screen web app with Guided Access.

For reliable automatic recovery after reboot, use a supervised iPad with Single App Mode. The strongest long-term target is a tiny native iOS wrapper app using `WKWebView` that opens the local kiosk URL, then lock that wrapper app with Single App Mode.

## Related Docs
Read these before major architectural changes:
*   `docs/drafts/kiosk_frontend.md`
*   `docs/drafts/home_smart_center_tech_selection.md`
*   `docs/drafts/repo_architecture.md`
*   `PROMPT.md`
