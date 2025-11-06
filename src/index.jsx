import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import {CustomProvider} from 'rsuite';

import { queryClient } from './app/queryClient';
import 'rsuite/Dropdown/styles/index.css';
import "./App.scss"

import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { NotificationsProvider } from './state/notifications/NotificationsContext';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <BrowserRouter>
          <CustomProvider theme="dark">
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
