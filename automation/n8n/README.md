# n8n Workflows

Workflow exports in this folder are safe development examples. They must not contain credentials or environment-specific values.

The compose stack imports every workflow under `automation/n8n/workflows` before starting n8n.

Current endpoints:

*   `POST /webhook/search`
*   `POST /webhook/print`

`POST /webhook/search` normalizes the user's text into a coloring-page query and searches images through the local SearXNG service in Docker Compose. If SearXNG or upstream search engines are unavailable, it returns a valid response with an empty `images` array instead of leaking backend errors to the kiosk.

`POST /webhook/print` is still mocked.
