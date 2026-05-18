# Design Document: Repository Architecture

## 1. Recommendation
Use this repository as the **kiosk app repo**. Put n8n workflows, local deployment, printer configuration, and backend operations in a separate **home automation repo**.

This keeps the iPad user interface clean and testable, while the local automation stack can evolve independently around n8n, CUPS/IPP, local LLMs, and environment-specific configuration.

## 2. Repository Split

### Repo 1: `nirvana`
Purpose: iPad kiosk frontend.

Owns:
*   Kiosk web app source code.
*   UI state machine and interaction logic.
*   API client for local n8n webhooks.
*   Frontend tests and browser checks.
*   Public API contract documentation.
*   iPad deployment notes.

Does not own:
*   n8n workflow exports.
*   Printer setup.
*   Local LLM runtime.
*   LAN hostnames, secrets, or home-specific infrastructure.

Suggested structure:

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
  README.md
```

For the frontend stack, prefer a small Vite app. A zero-build HTML app is possible, but Vite gives better local development, TypeScript, linting, testing, and asset handling while still producing a static app that can be hosted locally.

### Repo 2: `nirvana-local-automation`
Purpose: Local-only backend and home automation operations.

Owns:
*   n8n Docker Compose or local deployment config.
*   n8n workflow exports.
*   Local LLM configuration.
*   Printer/CUPS/IPP setup notes.
*   Image download/cache/print conversion scripts, if needed.
*   Local reverse proxy or LAN-only routing.
*   Backup and restore instructions.

Suggested structure:

```text
nirvana-local-automation/
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
    runbook.md
    backup_restore.md
  .env.example
  README.md
```

## 3. Shared Boundary
The repos should share only stable contracts, not implementation details.

Shared contract:
*   `POST /webhook/search`
*   `POST /webhook/print`
*   Request/response JSON schemas.
*   Error codes and user-safe messages.
*   Auth header name and expected behavior.

Do not share:
*   n8n internal node IDs.
*   printer IP addresses.
*   local tokens.
*   Home Assistant tokens.
*   local file paths.

The kiosk repo can keep a copy of the public contract under `docs/api/`. The automation repo should treat that contract as the interface it must satisfy.

## 4. Environment Configuration

Kiosk repo `.env.example`:

```text
VITE_SEARCH_WEBHOOK_URL=http://nirvana.local/webhook/search
VITE_PRINT_WEBHOOK_URL=http://nirvana.local/webhook/print
VITE_KIOSK_AUTH_HEADER=X-Nirvana-Kiosk-Key
VITE_KIOSK_AUTH_TOKEN=replace-me
```

Automation repo `.env.example`:

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
3. Export/update n8n workflows in the automation repo.
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

## 7. When to Merge Repos
Keep everything in one repo only if:
*   One person maintains the entire system.
*   There is no sensitive local configuration.
*   Workflow exports are treated like app code.
*   Deployment is simple enough that frontend and backend changes always ship together.

For this project, separate repos are cleaner because the kiosk is product code and n8n/printer/LLM setup is local operations code.
