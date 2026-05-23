# n8n Workflows

Workflow exports in this folder are safe development examples. They must not contain credentials or environment-specific values.

The compose stack imports every workflow under `automation/n8n/workflows` before starting n8n.

Current endpoints:

*   `POST /webhook/search`
*   `POST /webhook/print`

`POST /webhook/search` normalizes the user's text into a coloring-page query and searches images through the local SearXNG service in Docker Compose. If SearXNG or upstream search engines are unavailable, it returns a valid response with an empty `images` array instead of leaking backend errors to the kiosk.

`POST /webhook/print` validates the selected `print_url`, then calls `/usr/local/bin/nirvana-print` inside the custom n8n image. The script supports:

*   `NIRVANA_PRINT_MODE=mock` for local smoke tests.
*   `NIRVANA_PRINT_MODE=cups` for real local printing through CUPS with `NIRVANA_PRINTER_NAME`.
