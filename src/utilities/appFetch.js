import SERVER_PATH from '../constants/SERVER_PATH';
import { getToken, removeToken, setToken } from '../services/token.service';
import { getKeepUserAuthorized } from '../services/user.service';

export const BASE_URL = SERVER_PATH;

let refreshing = false;
let refreshQueue = [];

const processRefreshQueue = (result) =>
  refreshQueue.forEach((cb) => cb(result));

// const filterHeaders = (obj) => {
//   if (obj['Content-Type'] === 'multipart/form-data') {
//     delete obj['Content-Type'];
//     return obj;
//   }
//   if (obj['Content-Type']) {
//     return obj;
//   }

//   //   obj['Content-Type'] = 'application/json';
//   return obj;
// };

const refreshAccessToken = async () => {
  if (refreshing) {
    return new Promise((res) => {
      refreshQueue.push((result) => res(result));
    });
  }

  try {
    refreshing = true;

    const token = getToken();
    const response = await fetch(BASE_URL + 'user/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token?.refresh_token,
      }),
    });

    if (!response.ok) {
      removeToken();
      processRefreshQueue(false);
      return false;
    }

    const { access_token } = await response.json();
    setToken({ access_token, refresh_token: token?.refresh_token });
    processRefreshQueue(true);
    return true;
  } catch (err) {
    removeToken();
    processRefreshQueue(false);
  } finally {
    refreshing = false;
    refreshQueue = [];
  }
};

const appFetch = async (location, init = {}) => {
  try {
    const token = getToken();
    const response = await fetch(BASE_URL + location, {
      method: init.method || 'POST',
      // credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(init.method === 'GET'
        ? {}
        : {
            body: new URLSearchParams({
              ...(token ? { token: token?.token, u_hash: token?.hash } : {}),
              ...init.body,
            }).toString(),
          }),
    });
    console.log(response);
    const data = await response.json();
    if (response.ok) {
      return data;
    }
    if (response.status === 401 && token && getKeepUserAuthorized()) {
      const refresh = await refreshAccessToken();

      if (refresh) {
        return appFetch(location, init);
      }

      return Promise.reject({
        message: 'Невозможно авторизоваться',
        status: 401,
      });
    }

    return Promise.reject({
      message: data.detail,
      status: response.status,
    });
  } catch (err) {
    console.log(err);
    return Promise.reject({
      message: 'Невозможно выполнить запрос',
      status: 500,
    });
  }
};

export default appFetch;
