# Real Environment Deployment

This is the deployment path for running Nirvana on a local home network.

The current production-like target is one always-on local Docker host that runs:

*   `kiosk`: the iPad web frontend served by nginx.
*   `n8n`: the local workflow orchestrator.
*   n8n workflow data in a local Docker volume.

The iPad opens the kiosk URL from the local network. The kiosk calls `/webhook/search` and `/webhook/print`; nginx proxies those requests to n8n inside Docker Compose.

## Current State

The repo can already:

*   run the full local stack with Docker Compose
*   import mock n8n search and print workflows
*   smoke test the kiosk and webhook proxy
*   build and publish multi-platform kiosk images for `linux/amd64` and `linux/arm64`

The repo does not yet contain a real search workflow or real printer workflow. The current n8n workflows are safe mocks.

## Hardware Target

Use a local machine that stays on:

*   Mac mini, Linux mini PC, NAS, or Raspberry Pi 5
*   Docker Engine with Compose
*   LAN access to the Brother DCP-L3560CDW
*   LAN access from the iPad

Use Ethernet for the host where possible. Give the host a stable DHCP reservation, for example:

```text
nirvana.local
```

Do not commit real printer IP addresses, n8n credentials, CUPS config, or `.env` files with local secrets.

## First Real Deploy

From the Docker host:

```sh
git clone https://github.com/vlucaswang/nirvana.git
cd nirvana
docker compose -f automation/deploy/docker-compose.yml up --build -d
```

Open these from a computer on the same LAN:

```text
http://<docker-host>:5173
http://<docker-host>:5678
```

Run the smoke test from the repo:

```sh
automation/scripts/test_compose_stack.sh
```

The smoke test validates the kiosk, n8n import, search webhook, print webhook, and kiosk-to-n8n proxy.

## iPad Setup

Open the kiosk URL on the iPad:

```text
http://<docker-host>:5173
```

For the MVP, use Safari or Add to Home Screen plus Guided Access.

For reliable recovery after reboot, use a supervised iPad with Single App Mode. The long-term robust option is a tiny native iOS wrapper app that opens the kiosk URL in `WKWebView`, then locking that wrapper with Single App Mode.

See `docs/deployment/ipad_kiosk.md`.

## Release Image Deployment

The release pipeline publishes the kiosk image to DockerHub when semantic-release creates a new release.

The image is published for:

```text
linux/amd64
linux/arm64
```

This is useful when the local Docker host should pull a released image instead of building locally. The Compose file currently builds the kiosk from source; switching it to a released image is a later hardening step.

See `docs/deployment/github_actions.md`.

## Real Workflow Work Remaining

Before this is useful as the real home workflow, replace the mock n8n workflows with local production workflows:

1. Search workflow
   *   Accept `POST /webhook/search`.
   *   Normalize the user's request.
   *   Use a local LLM/router where needed.
   *   Return structured image objects matching `docs/api/kiosk_backend_contract.md`.

2. Print workflow
   *   Accept `POST /webhook/print`.
   *   Validate the selected image.
   *   Print through local IPP/CUPS or another local protocol supported by the Brother DCP-L3560CDW.
   *   Return a user-safe success or error message.

3. Printer setup
   *   Configure printer access on the Docker host.
   *   Keep printer IP and CUPS details out of git.
   *   Confirm command-line printing works before wiring it into n8n.

4. Persistence and backup
   *   Keep the n8n Docker volume persistent.
   *   Export safe workflow definitions into `automation/n8n/workflows`.
   *   Keep credentials and local runtime state outside the repo.

## Operational Commands

Start:

```sh
docker compose -f automation/deploy/docker-compose.yml up -d
```

Start and rebuild:

```sh
docker compose -f automation/deploy/docker-compose.yml up --build -d
```

View logs:

```sh
docker compose -f automation/deploy/docker-compose.yml logs -f
```

Stop:

```sh
docker compose -f automation/deploy/docker-compose.yml down
```

Reset local n8n data:

```sh
docker compose -f automation/deploy/docker-compose.yml down --volumes
```

Only reset volumes in development or when intentionally wiping local n8n state.

