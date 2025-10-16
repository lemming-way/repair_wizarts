import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { QueryProvider } from './app/providers/QueryProvider';
import {CustomProvider} from 'rsuite';

import 'rsuite/Dropdown/styles/index.css';
import "./App.scss"
import reportWebVitals from './reportWebVitals';
import { UIStateProvider } from './state/ui/UIStateContext';
import { NotificationsProvider } from './state/notifications/NotificationsContext';
import App from './components/App';
import store from './store';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <UIStateProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <CustomProvider theme="dark">
                <App />
              </CustomProvider>
            </BrowserRouter>
          </NotificationsProvider>
        </UIStateProvider>
      </QueryProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
