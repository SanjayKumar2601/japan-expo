# Expo Sales Backend — Local LAN POS

Spring Boot + SQLite backend for the Expo Sales Tracker.

## Architecture

The expo laptop is the server. Phones/tablets connect to the same Wi-Fi or phone hotspot:

`Phones / tablets -> LAN -> Spring Boot :8080 -> SQLite`

The laptop does **not** need internet access for the POS itself.

## Requirements

- Java 21+
- Maven 3.9+
- Windows/macOS/Linux

## Run

```bash
mvn spring-boot:run
```

The server listens on **all network interfaces**:

```text
0.0.0.0:8080
```

Local laptop access:

```text
http://localhost:8080/api/health
```

From another device, use the laptop's current LAN IP:

```text
http://<LAPTOP-IP>:8080/api/health
```

When you switch the laptop from your hotspot to your partner's hotspot, its IP may change. The frontend should derive the backend host from the page/server address rather than hard-code the hotspot IP.

## Database

SQLite is stored at:

```text
data/expo-sales.db
```

The database is persistent. Stopping/restarting Spring Boot does **not** reset it.

There is **no demo/seed data**. A fresh database starts with:

- 0 categories
- 0 products
- 0 orders

Create your real catalog through the frontend/API.

## SQLite LAN tuning

The backend enables:

- WAL journal mode
- foreign keys
- busy timeout
- NORMAL synchronous mode

This is appropriate for a small POS with a few LAN clients.

## Order safety

Checkout is transactional. Product stock is checked before the order is committed, and stock changes are committed together with the order.

Duplicate product lines are aggregated before stock validation.

Offline retries can provide `clientOrderId`; the backend will return the already-created order instead of creating a duplicate.

## APIs

```text
GET    /api/health
GET    /api/categories
POST   /api/categories
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
GET    /api/orders
POST   /api/orders
GET    /api/dashboard
GET    /api/analytics
GET    /api/settings
PATCH  /api/settings
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

## Windows firewall

If another device cannot connect, Windows Firewall is likely blocking port 8080. Allow inbound TCP 8080 on the private network profile.

## Production-ish expo checklist

1. Start the laptop.
2. Connect it to the current hotspot/Wi-Fi.
3. Start Spring Boot.
4. Find the laptop's LAN IPv4 address.
5. Open the frontend from that laptop-hosted address on the phones/tablets.
6. Verify `/api/health` from a second device before sales start.
7. Back up `data/expo-sales.db` at the end of the day.


## Product management (admin)

Product creation, editing, and deletion are protected by the admin password. The default password is `root` as requested. It is configured in `src/main/resources/application.yml` under `app.admin-password`; you can change it before the expo.

Send the password in the `X-Admin-Password` request header:

```text
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
X-Admin-Password: root
```

Deletion is a **soft delete**: the product is marked inactive and disappears from the active product list, but historical order records remain intact. An inactive product cannot be sold.

A wrong or missing password returns HTTP 401.
