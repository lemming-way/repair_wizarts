import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './state/global';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import {CustomProvider} from 'rsuite';

// Global CSS frameworks should be imported here to ensure availability regardless of route lazy-loading
import 'bootstrap/dist/css/bootstrap.min.css';
import 'rsuite/Dropdown/styles/index.css';
import "./App.scss"

import App from './components/App';
import reportWebVitals from './reportWebVitals';
import store from './store'

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <CustomProvider theme="dark">
            <App />
          </CustomProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
