import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { YMaps } from 'react-yandex-maps';
import {CustomProvider} from 'rsuite';
import 'rsuite/Dropdown/styles/index.css';
import "./App.scss"

import store from './store'

const YandexQuery = {
  apikey: "b1a6a3a4-eaea-49cc-89b9-37462eba3d12",
  lang: "ru_RU"
}

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <YMaps query={YandexQuery}>
    <Provider store={store}>
      <BrowserRouter>
          <CustomProvider theme="dark">
            <App />
          </CustomProvider>
      </BrowserRouter>
    </Provider>
  </YMaps>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
