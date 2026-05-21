# Local Automation

This folder contains local-only backend assets for Nirvana.

The MVP Docker Compose stack runs:

*   `n8n`: local workflow orchestrator with a real search webhook and mocked print webhook.
*   `searxng`: local metasearch service used by the search webhook.
*   `kiosk`: built static kiosk app served by nginx, with `/webhook/*` proxied to n8n.

No live credentials, local state, printer IPs, or n8n data directories should be committed.

## Run

```sh
docker compose -f automation/deploy/docker-compose.yml up --build
```

Open:

*   Kiosk: `http://localhost:5173`
*   n8n: `http://localhost:5678`
*   SearXNG: `http://localhost:8080`

## Test

```sh
automation/scripts/test_compose_stack.sh
```

The script builds and starts the stack, verifies the kiosk server responds, verifies the search and mocked print webhooks through the kiosk proxy, then tears the stack down.

## Stop

```sh
docker compose -f automation/deploy/docker-compose.yml down
```

For a real home-network deployment runbook, see `../docs/deployment/real_environment.md`.
