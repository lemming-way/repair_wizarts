import CONFIG from './index';

const SERVER_PATH =
  process.env.REACT_APP_API_URL ||
  CONFIG.API?.url ||
  'https://ibronevik.ru/taxi/c/tutor/api/v1/';
const CLIENT_PATH = 'http://localhost:3000/';
const SERVER_WSPATH = 'ws://localhost:8000/';

export { SERVER_WSPATH, CLIENT_PATH };

export default SERVER_PATH;
