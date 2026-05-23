# Brother DCP-L3560CDW

The compose stack includes a real print workflow that can submit jobs through local CUPS.

For smoke tests, Compose defaults to:

```text
NIRVANA_PRINT_MODE=mock
```

For real printing, configure the Brother DCP-L3560CDW in CUPS and run the stack with:

```text
NIRVANA_PRINT_MODE=cups
NIRVANA_PRINTER_NAME=<cups-printer-name>
CUPS_SERVER=host.docker.internal:631
```

The custom n8n image installs CUPS client tools and the print workflow calls `lp` inside the n8n container.

`CUPS_SERVER` must point to a CUPS server reachable from the n8n container. If CUPS runs on the Docker host, `host.docker.internal:631` is the intended value; the Compose file maps that hostname to the host gateway for Linux Docker.

Before enabling real mode, verify the printer name from a shell where CUPS is configured:

```sh
lpstat -p
lp -d <cups-printer-name> /path/to/test-image.jpg
```

Do not commit real printer IP addresses or live CUPS configuration.
