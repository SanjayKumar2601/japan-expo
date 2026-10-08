# Expo LAN frontend

This frontend is designed to run from the expo laptop so phones/tablets on the same Wi-Fi or phone hotspot can reach the local Spring Boot backend.

## Run

1. Start the Spring Boot backend on the laptop with `mvn spring-boot:run`.
2. Start this frontend with `npm install` and `npm run dev`.
3. Open the Vite URL from the laptop on each phone/tablet. The frontend derives the backend host from the page host and uses port `8080`.
4. If you deliberately use a different backend host/port, set `VITE_BACKEND_URL`.

## Admin

Product add/edit/delete requires the backend admin password. The default for the current backend is `root`. The password is kept only in the current browser session and sent as `X-Admin-Password` for admin product operations.

Product deletion is a backend soft-delete, preserving historical orders.

## Fresh start

The frontend has no demo product/order dependency. A new SQLite database can start empty. Add categories/products from the Products page after unlocking admin access.

## Hotspot switching

Because the backend URL defaults to `http(s)://<current-page-host>:8080/api`, moving the laptop from one phone hotspot to another does not require changing the frontend configuration. Devices must reconnect to the new hotspot and reopen/refresh the app if the laptop receives a new IP.
