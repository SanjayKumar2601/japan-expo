# Realtime Expo Notifications

The local Spring Boot server now broadcasts POS events to every connected phone/tablet using Server-Sent Events (SSE).

## Endpoint

`GET /api/events`

The frontend connects automatically using the same laptop hostname as the POS frontend, so changing the phone hotspot does not require changing an IP in the frontend.

## Shared events

- `SALE_COMPLETED` — operator, order number, amount and payment method
- `PRODUCT_OUT_OF_STOCK` — product reached 0
- `PRODUCT_LOW_STOCK` — product reached the configured threshold (default 3)
- `PRODUCT_CREATED`
- `PRODUCT_UPDATED`
- `PRODUCT_DELETED`

Product/order changes are committed to SQLite before their SSE event is published.

## Low-stock threshold

Change this in `src/main/resources/application.yml`:

```yaml
app:
  low-stock-threshold: 3
```

## Expo behavior

Run the backend on the laptop at port `8080`. Each phone/tablet opens the POS from the laptop's LAN IP on port `5173`. Every connected device receives the same operational notifications and refreshes products/dashboard/orders/analytics when a shared event arrives.
