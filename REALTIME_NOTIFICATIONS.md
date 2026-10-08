# Realtime Notifications

The POS opens an SSE connection to `/api/events` through the laptop backend when the app shell loads.

Notifications are:

- stored locally on each device for the bell/history UI
- shown as a live toast when received
- received by every connected POS device on the same LAN
- followed by React Query refreshes for products, categories, dashboard, analytics and orders

The backend URL is derived from the current browser hostname by default, so moving the laptop from one phone hotspot to another does not require a frontend IP change.
