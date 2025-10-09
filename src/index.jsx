import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryProvider } from './app/providers/QueryProvider';
import { Provider } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import {CustomProvider} from 'rsuite';

import App from './components/App';
import 'rsuite/Dropdown/styles/index.css';
import "./App.scss"
import reportWebVitals from './reportWebVitals';
import store from './store'

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <Provider store={store}>
        <BrowserRouter>
          <CustomProvider theme="dark">
            <App />
          </CustomProvider>
        </BrowserRouter>
      </Provider>
    </QueryProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
