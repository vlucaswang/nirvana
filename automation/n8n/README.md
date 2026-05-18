# n8n Workflows

Workflow exports in this folder are safe development examples. They must not contain credentials or environment-specific values.

The compose stack imports every workflow under `automation/n8n/workflows` before starting n8n.

Current mocked endpoints:

*   `POST /webhook/search`
*   `POST /webhook/print`
