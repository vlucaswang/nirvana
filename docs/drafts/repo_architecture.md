# Design Document: Repository Architecture

## 1. Recommendation
Use this repository as a **single local command center monorepo**. Keep the kiosk app and backend/local automation assets in separate top-level folders.

This keeps the iPad user interface clean and testable, while n8n, CUPS/IPP, local LLM, and deployment files can evolve beside it without creating a second repo.

## 2. Top-Level Split

### `apps/kiosk`
Purpose: iPad kiosk frontend.

Owns:
*   Kiosk web app source code.
*   UI state machine and interaction logic.
*   API client for local n8n webhooks.
*   Frontend tests and browser checks.

Does not own:
*   n8n workflow exports.
*   Printer setup.
*   Local LLM runtime.
*   LAN hostnames, secrets, or home-specific infrastructure.

### `automation`
Purpose: Local-only backend and home automation operations.

Owns:
*   n8n Docker Compose or local deployment examples.
*   n8n workflow exports.
*   Local LLM configuration docs and prompts.
*   Printer/CUPS/IPP setup notes.
*   Image download/cache/print conversion scripts, if needed.
*   Local reverse proxy or LAN-only routing examples.
*   Backup and restore instructions.

Does not own:
*   frontend UI source code.
*   browser tests for the kiosk app.
*   real credentials, live tokens, or unredacted local service state.

Suggested repository structure:

```text
nirvana/
  apps/
    kiosk/
      src/
      public/
      tests/
      package.json
      vite.config.ts
  automation/
    n8n/
      workflows/
        kiosk_search.json
        kiosk_print.json
      credentials.example.md
      README.md
    printer/
      brother-dcp-l3560cdw.md
      test-print.md
    llm/
      ollama.md
      prompts/
        intent_router.md
    deploy/
      docker-compose.yml
      caddy/
        Caddyfile.example
    scripts/
      print_file.sh
      validate_image.sh
  docs/
    drafts/
    api/
      kiosk_backend_contract.md
    deployment/
      ipad_kiosk.md
    runbook.md
    backup_restore.md
  .env.example
  README.md
```

For the frontend stack, prefer a small Vite app. A zero-build HTML app is possible, but Vite gives better local development, TypeScript, linting, testing, and asset handling while still producing a static app that can be hosted locally.

## 3. Internal Boundary
The frontend and automation folders should share only stable contracts, not implementation details.

Shared contract:
*   `POST /webhook/search`
*   `POST /webhook/print`
*   Request/response JSON schemas.
*   Error codes and user-safe messages.
*   Auth header name and expected behavior.

Do not share:
*   n8n internal node IDs.
*   real printer IP addresses.
*   local tokens or credentials.
*   Home Assistant tokens.
*   local file paths.

Keep the public contract under `docs/api/`. The kiosk app should code against that contract. The n8n workflows under `automation/` should satisfy that contract.

## 4. Environment Configuration

Root `.env.example` may include frontend-safe examples:

```text
VITE_SEARCH_WEBHOOK_URL=http://nirvana.local/webhook/search
VITE_PRINT_WEBHOOK_URL=http://nirvana.local/webhook/print
VITE_KIOSK_AUTH_HEADER=X-Nirvana-Kiosk-Key
```

Automation examples should live under `automation/`:

```text
N8N_HOST=nirvana.local
N8N_PORT=5678
KIOSK_AUTH_TOKEN=replace-me
PRINTER_NAME=Brother_DCP_L3560CDW
PRINTER_URI=ipp://brother-dcp-l3560cdw.local/ipp/print
OLLAMA_BASE_URL=http://ollama.local:11434
```

Real `.env` files must stay untracked.

## 5. Development Flow

1. Define or update the API contract in the kiosk repo.
2. Implement the kiosk UI against mocked API responses.
3. Export/update n8n workflows under `automation/n8n/workflows/`.
4. Test the contract from both sides with sample payloads.
5. Deploy the static kiosk app to a local web server.
6. Point the iPad web app at the local n8n webhook host.

## 6. Deployment Shape

```text
iPad Safari / Home Screen Web App
  |
  | LAN HTTPS or LAN HTTP
  v
Local web server hosting kiosk static assets
  |
  | POST search / print
  v
n8n on local host
  |
  | local LLM call
  v
Ollama / LM Studio
  |
  | local print job
  v
Brother DCP-L3560CDW
```

For the MVP, the local web server can be the same machine that runs n8n. Keep this as deployment convenience, not as repo coupling.

## 7. Monorepo Rules
*   Keep frontend code in `apps/kiosk`.
*   Keep local automation assets in `automation`.
*   Keep shared contracts in `docs/api`.
*   Commit generated n8n workflow exports only after removing credentials and environment-specific values.
*   Do not commit live n8n data directories, database files, CUPS state, downloaded images, or local cache files.
*   Use `.env.example` files for placeholders and keep real `.env` files untracked.
