import { configureStore, combineReducers } from '@reduxjs/toolkit';

import notificationMiddleware from './notification-middleware';
import notificationsReducer from './slices/notifications.slice';
import onlineReducer from './slices/online.slice';
import uiSlice from './slices/ui.slice';

const store = configureStore({
  reducer: combineReducers({
    online: onlineReducer,
    notifications: notificationsReducer,
    ui: uiSlice,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
