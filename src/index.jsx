import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import {CustomProvider} from 'rsuite';
import 'rsuite/Dropdown/styles/index.css';

import { queryClient } from './app/state/queryClient';
import { QueryDevtools } from './app/dev/QueryDevtools';
import "./app/App.scss"

import App from './app';
import reportWebVitals from './reportWebVitals';
import { NotificationsProvider } from './app/state/notifications/NotificationsContext';

const isDevelopment = process.env.NODE_ENV === 'development';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <BrowserRouter>
          <CustomProvider theme="dark">
            {isDevelopment && <QueryDevtools />}
            <App />
          </CustomProvider>
        </BrowserRouter>
      </NotificationsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
