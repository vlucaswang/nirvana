# Kiosk Backend Contract

The kiosk talks to local n8n webhooks. The backend must return plain URLs, not Markdown links.

## POST `/webhook/search`

Request:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "raw_text": "I want a mermaid coloring page"
}
```

Response:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "query": "mermaid coloring page",
  "images": [
    {
      "id": "img_01",
      "title": "Mermaid coloring page",
      "source": "example.com",
      "thumbnail_url": "https://example.com/mermaid1-thumb.jpg",
      "full_url": "https://example.com/mermaid1.jpg",
      "print_url": "https://example.com/mermaid1-print.jpg",
      "content_type": "image/jpeg",
      "width": 1200,
      "height": 1600,
      "printable": true
    }
  ]
}
```

## POST `/webhook/print`

Request:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "image_id": "img_01",
  "print_url": "https://example.com/mermaid1-print.jpg"
}
```

Response:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "success",
  "message": "Sent to printer"
}
```

Error:
```json
{
  "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
  "status": "error",
  "message": "The printer is offline. Please try again later."
}
```
