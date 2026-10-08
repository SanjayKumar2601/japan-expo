# Frontend integration

The supplied frontend already has the correct service abstraction. The backend is intentionally REST-shaped so only `src/services/apiClient.ts` and the live branches in `src/services/googleSheets.ts` need to be switched.

Set this in the frontend `.env`:

```env
VITE_BACKEND_URL=http://localhost:8080/api
```

Then point the Axios client at `VITE_BACKEND_URL`.

The old Apps Script `?action=` query parameter is not used by this backend.
