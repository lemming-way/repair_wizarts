import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/user.slice';
import servicesSlice from './slices/services.slice';
import uiSlice from './slices/ui.slice';
import onlineReducer from './slices/online.slice';
import messagesReducer from './slices/messages.slice';
import notificationsReducer from './slices/notifications.slice';
import notificationMiddleware from './notification-middleware';
import categorieSlice from './slices/cateories.slice';

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
