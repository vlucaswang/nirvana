# Nirvana

Nirvana is a local-only home command center monorepo.

The first workflow lets a user ask for a coloring page, browse image results, select one, and send it to a local n8n print workflow.

## Layout

*   `apps/kiosk`: Vite + TypeScript kiosk web app.
*   `automation`: local n8n, printer, LLM, and deployment assets.
*   `docs/api`: shared webhook contracts.

## Local Development

```sh
cd apps/kiosk
npm install
npm run dev
```

## Full Stack Compose

```sh
automation/scripts/test_compose_stack.sh
```

For a manual run:

```sh
docker compose -f automation/deploy/docker-compose.yml up --build
```

## Project Guidance

Read `AGENTS.md` before making architectural changes.
