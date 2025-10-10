# Redux state inventory

## Slice → consumers overview

- **`user`** → App shell (`components/App.jsx`), navigation (`UI/Toolbar/Toolbar.jsx`, `components/Header.jsx`, `components/sidebar.jsx`), chat flows (`components/full-chat/fakeChat/frameMessages.tsx`, `components/full-chat/fakeChat/Kirill.tsx`, `components/Chat/profileNumber.jsx`), settings & wallet flows (`components/Settings/Profile.jsx`, `components/Settings/services.jsx`, `components/Settings/BalanceClient.jsx`, `components/Settings/FinanceClient.jsx`, `components/Settings/Photo.jsx`, `components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient.jsx`, `components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodHistoryClient.jsx`), orders (`components/Orders/MyOrder.jsx`, `components/Orders/Allorders.jsx`), applications (`components/Applications/applications.jsx`), reviews (`components/Reviews/ReviewsForm.jsx`), suggestion lists (`components/mysuggest.jsx`, `components/suggest.jsx`), profile pages (`components/full-height/ProfileFH.jsx`, `components/full-height/WalletFH.jsx`), and utility hooks (`hooks/useUserRating.js`).【F:src/components/App.jsx†L83-L215】【F:src/UI/Toolbar/Toolbar.jsx†L24-L171】【F:src/components/Header.jsx†L20-L115】【F:src/components/sidebar.jsx†L12-L124】【F:src/components/full-chat/fakeChat/frameMessages.tsx†L12-L183】【F:src/components/full-chat/fakeChat/Kirill.tsx†L557-L619】【F:src/components/Chat/profileNumber.jsx†L13-L200】【F:src/components/Settings/Profile.jsx†L40-L120】【F:src/components/Settings/services.jsx†L15-L198】【F:src/components/Settings/BalanceClient.jsx†L13-L198】【F:src/components/Settings/FinanceClient.jsx†L11-L131】【F:src/components/Settings/Photo.jsx†L9-L60】【F:src/components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodClient.jsx†L14-L200】【F:src/components/ChoiceOfReplenishmentMethod/ChoiceOfReplenishmentMethodHistoryClient.jsx†L7-L38】【F:src/components/Orders/MyOrder.jsx†L21-L200】【F:src/components/Orders/Allorders.jsx†L13-L124】【F:src/components/Applications/applications.jsx†L25-L200】【F:src/components/Reviews/ReviewsForm.jsx†L8-L48】【F:src/components/mysuggest.jsx†L20-L200】【F:src/components/suggest.jsx†L12-L120】【F:src/components/full-height/ProfileFH.jsx†L5-L120】【F:src/components/full-height/WalletFH.jsx†L5-L120】【F:src/hooks/useUserRating.js†L9-L79】
- **`services`** → Navigation surfaces such as the desktop dropdown (`components/dropdownService.jsx`), footer quick links (`components/Footer.tsx`), toolbar menus (`UI/Toolbar/components/ServiceDropdown/ServiceDropdown.tsx`, `UI/Toolbar/components/ServiceDropDownMobile/ServiceDropDownMobile.tsx`), and service detail pages (`components/Service/ServiceDetail.jsx`).【F:src/components/dropdownService.jsx†L8-L52】【F:src/components/Footer.tsx†L8-L51】【F:src/UI/Toolbar/components/ServiceDropdown/ServiceDropdown.tsx†L112-L194】【F:src/UI/Toolbar/components/ServiceDropDownMobile/ServiceDropDownMobile.tsx†L7-L48】【F:src/components/Service/ServiceDetail.jsx†L83-L220】
- **`categories`** → Toolbar mega menus and mobile dropdowns (`UI/Toolbar/components/ServiceDropdown/ServiceDropdown.tsx`, `UI/Toolbar/components/ServiceDropDownMobile/ServiceDropDownMobile.tsx`), landing pages (`components/remont.jsx`), service detail flows (`components/Service/ServiceDetail.jsx`), order filters (`components/Orders/FilterBlock.jsx`), settings forms (`components/Settings/Profile.jsx`, `components/Settings/services.jsx`), and high-level app gating (`components/App.jsx`).【F:src/UI/Toolbar/components/ServiceDropdown/ServiceDropdown.tsx†L112-L194】【F:src/UI/Toolbar/components/ServiceDropDownMobile/ServiceDropDownMobile.tsx†L7-L48】【F:src/components/remont.jsx†L9-L93】【F:src/components/Service/ServiceDetail.jsx†L83-L220】【F:src/components/Orders/FilterBlock.jsx†L16-L178】【F:src/components/Settings/Profile.jsx†L55-L120】【F:src/components/Settings/services.jsx†L15-L198】【F:src/components/App.jsx†L83-L215】
- **`online`** → Updated via WebSocket notifications and exposed through `selectOnline`; no UI layer currently consumes it directly.【F:src/services/notification.service.js†L18-L55】【F:src/slices/online.slice.js†L3-L19】
- **`unreadMessages` (React Query)** → Header badge counts and WebSocket updates (`components/Header.jsx`, `hooks/useUnreadMessagesQuery.ts`, `services/notification.service.js`).【F:src/components/Header.jsx†L1-L120】【F:src/hooks/useUnreadMessagesQuery.ts†L1-L68】【F:src/services/notification.service.js†L1-L90】
- **`notifications`** → Toast surface (`components/Notifications/Notifications.jsx`, `components/Notifications/Notification.jsx`) fed by the notification service middleware pipeline.【F:src/components/Notifications/Notifications.jsx†L8-L31】【F:src/components/Notifications/Notification.jsx†L7-L29】【F:src/services/notification.service.js†L18-L115】
- **`ui`** → Application routing guards and layout toggles (`components/App.jsx`, `components/ClientRoute.jsx`, `components/dropdownSetout.jsx`, `UI/Toolbar/Toolbar.jsx`, `components/Service/ServiceDetail.jsx`, `components/Header.jsx`, `components/Map/index.js`).【F:src/components/App.jsx†L83-L215】【F:src/components/ClientRoute.jsx†L9-L24】【F:src/components/dropdownSetout.jsx†L17-L98】【F:src/UI/Toolbar/Toolbar.jsx†L24-L171】【F:src/components/Service/ServiceDetail.jsx†L83-L220】【F:src/components/Header.jsx†L20-L125】【F:src/components/Map/index.js†L6-L120】

## Data sources and entry points

### `user`
- **Data origin:** `fetchUser` wraps `getUser()` and stores the payload plus fetch status in Redux.【F:src/slices/user.slice.js†L6-L44】 The service calls the `user/authorized` API and exposes helpers for profile updates, password changes, and local mode flags.【F:src/services/user.service.js†L1-L205】【F:src/services/user.service.js†L206-L306】
- **Entry points & side effects:**
  - `App` dispatches `fetchUser` when the route changes and when the status is idle with a token, setting loading/authorization flags and opening notification sockets on success.【F:src/components/App.jsx†L153-L215】
  - Login flows (`components/Registration/Login.jsx`, `components/Registration/AuthLogin.jsx`, `features/LoginPage/LoginPage.tsx`) dispatch `fetchUser` after credentials succeed and navigate to the home route; they also persist "keep me logged in" flags.【F:src/components/Registration/Login.jsx†L159-L175】【F:src/components/Registration/AuthLogin.jsx†L161-L191】【F:src/features/LoginPage/LoginPage.tsx†L88-L105】
  - Logout in the dropdown wipes user state via `wipeUser` and clears authorization, also removing tokens and local mode flags.【F:src/components/dropdownSetout.jsx†L17-L33】
  - Visibility tracking in `App` pushes `updateUser` mutations to the backend to flip `isOnline` flags on visibility changes or unload, so the slice indirectly triggers persistence side effects.【F:src/components/App.jsx†L93-L139】
- **Derived local data:** `setUserMode`/`getUserMode` persist the master/client toggle in `localStorage`, mirrored into the `ui` slice and read during boot.【F:src/services/user.service.js†L207-L248】【F:src/components/App.jsx†L141-L151】

### `services`
- **Data origin:** `fetchServices` currently resolves mock data via `getServiceRepairsTestData`, seeding a services catalog shape in Redux.【F:src/slices/services.slice.js†L1-L44】【F:src/services/service.service.js†L1-L206】
- **Entry points & side effects:** `App` dispatches `fetchServices` whenever the user status transitions from idle, ensuring navigation menus have data even for anonymous visitors.【F:src/components/App.jsx†L195-L215】 No local caching beyond the slice state.

### `categories`
- **Data origin:** Populated exclusively through `setCategories`, which hydrates data either from `localStorage` (`sections`) or from a `https://profiback.itest24.com/api/full-data` fetch that is then cached back to `localStorage` for reuse.【F:src/components/App.jsx†L158-L193】
- **Entry points & side effects:** The `App` bootstrap effect populates categories on initial load and caches them; clearing `localStorage` forces a refetch. Consumers rely on nested subsections/services arrays and expect trimming to five entries per submenu to keep menus manageable.【F:src/components/App.jsx†L158-L193】

### `online`
- **Data origin:** Driven purely by WebSocket push notifications; `notificationMiddleware` responds to `notifications/connect` by opening a socket that dispatches `updateOnline` payloads whenever the backend notifies the client list.【F:src/notification-middleware.js†L1-L16】【F:src/services/notification.service.js†L18-L115】 No client-only mutations exist.
- **Entry points & side effects:** `App` starts the connection after successful user fetch and would disconnect on logout if the commented dispatch were restored.【F:src/components/App.jsx†L195-L215】 There is no local caching; data resets on reload.

### `unreadMessages` (React Query)
- **Data origin:** `useUnreadMessagesQuery` wraps `getUserUnreadMessages` and caches results under `messageKeys.unread`, with access gated by tokens.【F:src/hooks/useUnreadMessagesQuery.ts†L1-L68】
- **Entry points & side effects:**
  - Header badges consume the hook and react to count changes, invalidated after chat mutations.【F:src/components/Header.jsx†L1-L120】【F:src/components/suggest.jsx†L1-L260】
  - WebSocket pushes update the React Query cache directly, keeping badge counts in sync without Redux actions.【F:src/services/notification.service.js†L1-L115】

### `notifications`
- **Data origin:** Entirely client-side. WebSocket events enqueue notifications via `pushNotification`, while the toast component dispatches `removeNotification` when users dismiss items.【F:src/services/notification.service.js†L18-L115】【F:src/components/Notifications/Notification.jsx†L17-L29】 The reducer keeps only the three most recent messages to avoid overflow.【F:src/slices/notifications.slice.js†L12-L29】
- **Entry points & side effects:** The middleware opens/closes sockets based on `notifications/connect|disconnect` actions, but otherwise the slice has no external effects.【F:src/notification-middleware.js†L1-L16】

### `ui`
- **Data origin:** Pure client state seeded with defaults; persisted fields (location, master mode) are mirrored into `localStorage` via service helpers when actions fire.【F:src/slices/ui.slice.js†L1-L45】【F:src/services/location.service.js†L1-L21】
- **Entry points & side effects:**
  - `App` restores `isMaster` and `location` from storage on mount, toggles `isLoading`, and flips `isAuthorized` after user fetch success.【F:src/components/App.jsx†L141-L215】
  - `dropdownSetout` toggles master mode (persisting to storage) and triggers logout state resets.【F:src/components/dropdownSetout.jsx†L17-L33】
  - `dropdownCountry` persists city selection when a location is chosen.【F:src/components/dropdownCountry.jsx†L14-L38】
  - Routing guards rely on `isLoading`/`isAuthorized` in `ClientRoute` and (commented) `MasterRoute` to determine access.【F:src/components/ClientRoute.jsx†L9-L24】【F:src/components/MasterRoute.jsx†L1-L20】

### `online` / `messages` / `notifications` middleware interplay
- `notificationMiddleware` listens for the connect/disconnect actions and manages a single WebSocket instance; on each message it dispatches to the relevant slice, optionally playing an audio cue for user-facing events.【F:src/notification-middleware.js†L1-L16】【F:src/services/notification.service.js†L18-L115】 Local timers poll online status every 30 seconds to keep the `online` slice fresh.【F:src/services/notification.service.js†L58-L69】 Unread message payloads now hydrate the React Query cache directly via `queryClient`, while Redux temporarily continues to host `online` presence until a dedicated query observer is introduced for socket streams.【F:src/services/notification.service.js†L1-L90】【F:src/store.ts†L1-L20】

## Notes on server vs client data

- Server-backed data sources: `user`, `services` (mocked fetch), `categories` (remote + cached), `unreadMessages` (React Query + WebSocket cache updates), `online` (WebSocket stream).
- Client-only slices: `notifications` and `ui` (with localStorage synchronization), plus any transient state maintained in components.

