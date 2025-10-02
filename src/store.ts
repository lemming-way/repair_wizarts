import { configureStore, combineReducers } from '@reduxjs/toolkit';

import notificationMiddleware from './notification-middleware';
import categorieSlice from './slices/cateories.slice';
import messagesReducer from './slices/messages.slice';
import notificationsReducer from './slices/notifications.slice';
import onlineReducer from './slices/online.slice';
import servicesSlice from './slices/services.slice';
import uiSlice from './slices/ui.slice';
import userReducer from './slices/user.slice';

const store = configureStore({
  reducer: combineReducers({
    user: userReducer,
    services: servicesSlice,
    online: onlineReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    ui: uiSlice,
    categories: categorieSlice,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
