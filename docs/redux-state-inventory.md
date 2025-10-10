# State management inventory (post-Redux)

## React Query data sources
- **User profile** — `useUserQuery` hydrates the authenticated user and exposes loading status for layout gating. Mutations invalidate the shared `userKeys.all` query to keep consumers fresh.【F:src/hooks/useUserQuery.ts†L1-L96】【F:src/components/App.jsx†L66-L118】
- **Categories & services catalog** — `useCategoriesQuery`/`useServicesQuery` load cached menu data that powers the toolbar, service detail pages, and filtering surfaces.【F:src/hooks/useCategoriesQuery.ts†L1-L65】【F:src/hooks/useServicesQuery.ts†L1-L54】【F:src/UI/Toolbar/Toolbar.jsx†L23-L120】【F:src/components/Service/ServiceDetail.jsx†L15-L211】
- **Unread messages** — `useUnreadMessagesQuery` feeds header/chat badges; WebSocket pushes call `queryClient.setQueryData` or invalidate the key to stay in sync.【F:src/hooks/useUnreadMessagesQuery.ts†L1-L68】【F:src/services/notification.service.js†L31-L72】【F:src/components/Header.jsx†L10-L99】

## Client state containers
- **UI state context** — `UIStateProvider` replaces the former `ui` slice, tracking `isAuthorized`, `isMaster`, `isLoading`, and persisted location. Actions sync with `localStorage` via service helpers so toolbar/header/layouts receive consistent values across refreshes.【F:src/state/ui/UIStateContext.tsx†L5-L102】【F:src/components/App.jsx†L126-L182】【F:src/components/dropdownSetout.jsx†L1-L76】【F:src/components/dropdownCountry.jsx†L1-L40】
- **Notifications context** — Maintains the latest toast list (capped at three) and current online roster, exposing `connect`/`disconnect` hooks for the app shell and convenience helpers for the toast components.【F:src/state/notifications/NotificationsContext.tsx†L1-L79】【F:src/components/Notifications/Notifications.jsx†L1-L37】【F:src/components/Notifications/Notification.jsx†L1-L32】

## WebSocket bridge
`notification.service.js` now accepts context handlers instead of Redux dispatchers. It keeps a single WebSocket alive, forwards presence updates to `NotificationsContext`, and pipes toast-worthy events to the UI while continuing to hydrate the unread message query cache. Auto-reconnect timers are cleared on disconnect to avoid leaking intervals.【F:src/services/notification.service.js†L1-L162】

## Server vs client overview
- **Server-backed via React Query:** user profile, categories, services, unread chat counts, plus any feature hooks layered on top of these queries.
- **Client-only:** UI context state (auth mode, loader, geo) and ephemeral notifications managed by `NotificationsContext`. Components continue to own bespoke view-local state via React hooks.
