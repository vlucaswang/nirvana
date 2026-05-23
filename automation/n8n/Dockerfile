FROM n8nio/n8n:1.96.0

USER root

RUN apk add --no-cache cups-client

COPY bin/nirvana-print /usr/local/bin/nirvana-print
RUN chmod 0755 /usr/local/bin/nirvana-print

USER node
