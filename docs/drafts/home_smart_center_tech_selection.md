# Design Document: Home Smart Center Tech Selection

## 1. Goal
Select a local-only backend integration center for an iPad kiosk that accepts voice commands, runs private automation, returns interactive results, and performs actions such as printing.

The user already has a Home Assistant instance. Any additional building block must run locally on the home network. Cloud services are not part of the default architecture.

The first workflow is:

1. Receive a transcribed request from the kiosk.
2. Interpret intent with a local LLM or deterministic router.
3. Search for printable coloring page images.
4. Return structured image results to the kiosk.
5. Receive the selected image.
6. Download, normalize, and send it to a designated printer.
7. Return success or error status to the kiosk.

## 2. Recommendation
Use **n8n as the local workflow orchestrator** for the kiosk's search and print pipeline. Home Assistant is not required for the first coloring-page workflow.

n8n is the best MVP fit for the backend workflow because it has a visual workflow editor, first-class webhook support, HTTP/API nodes, code nodes for custom transformation, self-hosting support, and growing AI workflow support. It is strong enough to orchestrate local LLM calls, image validation, file conversion, and print dispatch without building a custom backend first.

Keep the **kiosk frontend as a dedicated web app** for the first workflow. A Home Assistant dashboard is viable for home controls, status panels, and simple command buttons, but the coloring-page journey needs a custom interaction: microphone capture, processing states, dynamic image grid, enlarge/select behavior, print progress, and session reset. That interaction is cleaner and safer as a purpose-built frontend that calls local services.

## 3. Selection Criteria
*   **Self-hostable:** Must run on local hardware such as a mini PC, NAS, or Raspberry Pi-class machine.
*   **Webhook API:** Must expose stable HTTP endpoints for the kiosk.
*   **Visual operations:** Should be understandable and editable without rebuilding code.
*   **Custom code escape hatch:** Must allow JavaScript, Python, shell, or HTTP calls when workflow nodes are insufficient.
*   **Local LLM compatibility:** Should call Ollama, OpenAI-compatible local endpoints, LM Studio, or a small custom router service.
*   **Printer integration:** Must support local IPP/IPPS, CUPS, LPR/LPD, or raw port printing.
*   **Observability:** Must expose execution history and logs for debugging failed searches or print jobs.
*   **Maintainability:** Should be easy to back up, update, and recover.
*   **Local-only operation:** Must be deployable without cloud workflow hosting or cloud LLM dependency.

## 4. Frontend Choice: Dedicated Kiosk App vs Home Assistant Dashboard

### Dedicated Kiosk Frontend
**Fit:** Best for the first coloring-page workflow.

Strengths:
*   Full control over the user journey: large microphone button, listening animation, image gallery, enlarge/preview, print button, and post-print result screen.
*   Easier to make child-friendly and session-oriented.
*   Does not require exposing Home Assistant admin UI or dashboard editing behavior on the iPad.
*   Can call n8n, Home Assistant, and local printer workflows through narrow local APIs.
*   Can be tested like a normal web app and installed to iPad Home Screen.

Tradeoffs:
*   More custom frontend code to own.
*   Needs its own authentication or shared local network trust model.
*   Home Assistant entities and controls need explicit API integration rather than automatic dashboard cards.

Best role in this project:
*   Primary user interface for open-ended voice requests and interactive search/print workflows.

### Home Assistant Dashboard
**Fit:** Best for smart home control panels and status dashboards.

Strengths:
*   Already available because there is an existing Home Assistant instance.
*   Excellent for lights, switches, media, climate, sensors, cameras, scenes, and simple scripts.
*   Dashboard views and cards are configurable without creating a full frontend app.
*   Home Assistant Assist, sentence triggers, scripts, and automations can handle local smart-home commands.

Tradeoffs:
*   Dynamic search results and print selection are not a natural fit for standard dashboard cards.
*   A polished microphone-to-gallery-to-print flow likely needs custom cards or embedded web content anyway.
*   Dashboard navigation, sidebars, editing affordances, login/session behavior, and card constraints add kiosk friction on iPad.
*   Home Assistant should not become the place where image download, conversion, queueing, and printer-driver details live.

Best role in this project:
*   Secondary/admin interface for smart-home controls, kiosk health, workflow status, and manual retry actions.

### Frontend Decision
Use a **dedicated kiosk web app** for the iPad interface, and expose selected Home Assistant functions through local APIs or n8n workflows when needed.

Use a **Home Assistant dashboard** for:
*   Household control panels.
*   Operational status of the kiosk, printer, and backend services.
*   Admin-only manual actions such as retrying a failed print job.
*   Future fixed-command smart-home screens.

Do not use a Home Assistant dashboard as the first implementation of the coloring-page search UI unless the goal changes to a much simpler interface with fixed buttons and no rich gallery interaction.

## 5. Backend Options

### n8n
**Fit:** Best overall MVP choice.

Strengths:
*   Webhook node can receive kiosk requests and return workflow output as an API response.
*   Visual node graph is useful for experimenting with search, LLM routing, filtering, and print actions.
*   HTTP Request and Code nodes cover most integration gaps.
*   Self-hosted deployment is well documented.
*   Good execution history for debugging.

Tradeoffs:
*   n8n uses a fair-code style license rather than a simple permissive open-source license.
*   Complex workflows can become hard to maintain unless naming and sub-workflows are disciplined.
*   Direct printer control can use CUPS/IPP first, with a small local print service added later only if needed.

Best role in this project:
*   Primary orchestrator for kiosk webhooks, LLM intent routing, image search, filtering, cache coordination, and print job dispatch.

### Node-RED
**Fit:** Strong alternative for home/IoT-heavy automation.

Strengths:
*   Lightweight, mature, and designed for event-driven flows.
*   Excellent fit for IoT, MQTT, local devices, and hardware integrations.
*   Large community node ecosystem.

Tradeoffs:
*   Less polished for business-style workflow observability than n8n.
*   LLM/image-search workflows are possible but usually feel more manual.
*   Error handling and larger multi-step workflows can get harder to reason about.

Best role in this project:
*   Use if the main product becomes device automation and kiosk commands are mostly smart-home actions.

### Activepieces
**Fit:** Good no-code automation alternative.

Strengths:
*   Self-hostable with a modern automation UI.
*   Permissive community edition positioning.
*   Strong focus on AI automation and integrations.

Tradeoffs:
*   Smaller ecosystem and operational track record than n8n.
*   Some integrations and advanced features may require checking edition boundaries.

Best role in this project:
*   Consider if n8n licensing or UX becomes a blocker.

### Windmill
**Fit:** Best for a developer-first backend.

Strengths:
*   Strong self-hosted workflow engine with scripts, flows, apps, queues, and Git-friendly development.
*   Supports TypeScript, Python, Go, Bash, and SQL.
*   Better fit when workflows should be treated like software projects.

Tradeoffs:
*   More developer-centric than family/admin-friendly.
*   Less approachable as a home automation control panel.

Best role in this project:
*   Use if reliability, versioned code, and custom services become more important than visual no-code editing.

### Home Assistant
**Fit:** Existing smart home system of record and local device layer, not the primary image-search workflow engine.

Strengths:
*   Excellent local-first smart home platform.
*   Strong device integrations, automations, scenes, dashboards, and Assist voice ecosystem.
*   Webhook and sentence triggers can connect external commands into automations.
*   Already installed, which reduces operational complexity for smart-home functions.

Tradeoffs:
*   Not ideal for arbitrary image search, result ranking, print-prep pipelines, or general API orchestration.
*   Complex multi-step data workflows are easier in n8n, Node-RED, or custom code.

Best role in this project:
*   Keep as the authoritative local smart-home control layer. Let n8n call Home Assistant services for device actions.

## 6. Proposed Architecture

```text
iPad Kiosk Web App
  | POST /webhook/search
  v
n8n Search Workflow
  | normalize transcript
  | classify intent with local LLM
  | search web/image provider
  | filter and cache image metadata
  v
Structured image response

iPad Kiosk Web App
  | POST /webhook/print
  v
n8n Print Workflow
  | validate selected image_id
  | fetch cached image or print_url
  | normalize to printable format
  | call local printer through CUPS/IPP
  v
Print status response
```

Recommended local services:
*   **n8n:** Workflow orchestrator and webhook API.
*   **Ollama or LM Studio:** Local LLM endpoint for intent parsing.
*   **Brother DCP-L3560CDW:** Local network printer using IPP/IPPS, CUPS, LPR/LPD, or raw port printing.
*   **File cache:** Local folder or lightweight object store for downloaded images and generated print-ready files.
*   **Home Assistant:** Optional existing local smart-home layer for device state, scenes, and automations.

All services should bind to the LAN or a private host network only. External access should be omitted for the MVP.

## 7. MVP Workflow Design

### Search Workflow
Input:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "raw_text": "I want a mermaid coloring page"
}
```

Steps:
1. Validate `request_id` and `raw_text`.
2. Use a local LLM or deterministic rule to extract:
```json
{
  "intent": "image_search",
  "subject": "mermaid",
  "style": "coloring page",
  "safe_search": true
}
```
3. Query an image source.
4. Filter for printable image types, reasonable dimensions, and safe content.
5. Cache result metadata keyed by `request_id`.
6. Return the structured image contract defined in `kiosk_frontend.md`.

### Print Workflow
Input:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "image_id": "img_01",
  "print_url": "https://example.com/mermaid1-print.jpg"
}
```

Steps:
1. Validate that `image_id` belongs to the original `request_id`.
2. Download from cached metadata or `print_url`.
3. Convert to a print-safe PDF, PostScript, PCL, or raster format.
4. Submit to the Brother printer through local IPP/CUPS or another enabled local print protocol.
5. Return `{ "status": "success" }` or a user-safe error message.

## 8. Home Assistant Integration Pattern
Use Home Assistant for smart-home capabilities through stable local interfaces:

*   Home Assistant scripts for named actions such as `script.kiosk_bedtime_scene`.
*   Service calls for device actions such as lights, media players, climate, and switches.
*   Automation webhook triggers for simple one-way events from n8n.
*   Sentence triggers or Assist pipelines for Home Assistant-native voice commands.

For the kiosk workflow, n8n should translate broad user intent into either:

*   A search/print workflow handled by n8n and the local Brother printer.
*   A smart-home action delegated to Home Assistant.
*   A clarification response returned to the kiosk.

## 9. Brother Printer Integration
The Brother DCP-L3560CDW supports local network printing protocols, including IPP/IPPS, LPR/LPD, raw Port 9100, AirPrint, Mopria, and Linux CUPS support. This means a separate print microservice is not required for the MVP.

Preferred local printing approaches:
*   **CUPS from the n8n host:** Configure the Brother printer once in CUPS, then let n8n call `lp` or `lpr` through an Execute Command step.
*   **IPP/IPPS client from n8n:** Use a command-line IPP tool or a small script inside the n8n environment to submit a PDF/PostScript/PCL job to the printer's IPP endpoint.
*   **Raw Port 9100:** Only use this if the workflow generates printer-ready PCL/PostScript data. Do not send arbitrary JPEG or HTML directly to Port 9100.

Avoid treating the printer's normal HTTP/HTTPS web interface as a print API. That interface is for management/configuration. IPP happens over HTTP transport, but it is a printing protocol with a specific request format, not a simple `POST image_url` endpoint.

A small print service can still be added later if direct CUPS/IPP from n8n becomes hard to operate, but it is not part of the initial architecture.

## 10. Security Notes
*   Keep webhook endpoints on the home LAN or behind authentication.
*   Use header auth or JWT auth for kiosk-to-backend calls.
*   Do not expose n8n publicly unless it is behind HTTPS, authentication, rate limiting, and regular updates.
*   Avoid sending child voice transcripts or image selections to cloud LLMs by default.
*   Maintain an allowlist for printer names and local endpoints.
*   Log technical details server-side, but return short child-friendly messages to the kiosk.
*   Create a restricted Home Assistant user or long-lived access token with only the minimum capabilities required for kiosk-triggered actions.
*   Prefer local image providers, cached allowlists, or explicitly approved search APIs. If internet image search is used, keep the LLM and orchestration local and log the external boundary clearly.

## 11. Decision
Start with:

*   **Dedicated kiosk web app** as the iPad frontend.
*   **n8n** as the local workflow orchestrator for kiosk webhooks.
*   **Ollama or LM Studio** for local LLM intent extraction.
*   **Brother DCP-L3560CDW** as a direct local IPP/CUPS printer target.
*   **Existing Home Assistant only when smart-home actions are added.**

Revisit the selection if:

*   Workflows become too code-heavy, in which case Windmill may be better.
*   Device automation becomes the primary use case, in which case Home Assistant plus Node-RED may be better.
*   n8n licensing or edition boundaries become a concern, in which case Activepieces should be tested.
*   The kiosk UI narrows to fixed smart-home controls, in which case a Home Assistant dashboard may be enough.

## 12. References Checked
*   n8n official docs: self-hosting, webhooks, and workflow response behavior.
*   Brother DCP-L3560CDW official specifications: IPP/IPPS, LPR/LPD, raw Port 9100, AirPrint, Mopria, CUPS, PCL6, PDF 1.7, and BR-Script3/PostScript support.
*   Node-RED official site: low-code event-driven application programming.
*   Activepieces official docs and project materials: self-hosted automation positioning.
*   Windmill official docs: self-hosted workflow engine and developer platform.
*   Home Assistant official docs: dashboards, custom cards, automation webhooks, sentence triggers, and Assist pipelines.
