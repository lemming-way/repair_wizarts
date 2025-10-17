import appFetch from '../utilities/appFetch';

const login = async (username, password) => {
  const { auth_hash } = await appFetch('/auth/', {
    body: {
      login: username,
      password,
      type: 'phone',
    },
  });
  return appFetch('/token/', { body: { auth_hash } });
};

const registerAsClient = (payload) =>
  appFetch('/register', {
    body: { ...payload, st: true, u_role: 1 },
  });

const registerAsMaster = (payload) =>
  appFetch('/register', {
    body: { ...payload, st: true, u_role: 2 },
  });

const addMaster = async (payload) =>
  appFetch('user/add-master', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// Тестовая версия метода login с передачей данных прямо в теле
//~ const loginTest = () => {
  //~ const username = 'testuser';
  //~ const password = 'password123';

  //~ return new Promise((resolve) => {
    //~ // Имитация успешного ответа от сервера
    //~ setTimeout(() => {
      //~ const mockResponse = {
        //~ access_token: 'mockAccessToken123',
        //~ refresh_token: 'mockRefreshToken123',
      //~ };
      //~ // Сохранение токена с помощью setToken
      //~ setToken(mockResponse);
      //~ resolve(mockResponse);
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Тестовая версия метода registerAsClient с передачей данных прямо в теле
//~ const registerAsClientTest = () => {
  //~ const payload = {
    //~ name: 'Test Client',
    //~ email: 'testclient@example.com',
    //~ phone: '+1234567890',
  //~ };

  //~ return new Promise((resolve) => {
    //~ // Имитация успешного ответа от сервера
    //~ setTimeout(() => {
      //~ const mockResponse = {
        //~ result: 'Success!',
        //~ user_id: 6,
      //~ };
      //~ resolve(mockResponse);
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Тестовая версия метода registerAsMaster с передачей данных прямо в теле
//~ const registerAsMasterTest = () => {
  //~ const payload = {
    //~ name: 'Test Master',
    //~ email: 'testmaster@example.com',
    //~ phone: '+1987654321',
    //~ role: 'Master',
  //~ };

  //~ return new Promise((resolve) => {
    //~ // Имитация успешного ответа от сервера
    //~ setTimeout(() => {
      //~ const mockResponse = {
        //~ result: 'Success!',
        //~ user_id: 6,
      //~ };
      //~ resolve(mockResponse);
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Тестовая версия метода addMaster с передачей данных прямо в теле
//~ const addMasterTest = () => {
  //~ const payload = {
    //~ user_id: 6,
    //~ role: 'Master',
  //~ };

  //~ return new Promise((resolve) => {
    //~ // Имитация успешного ответа от сервера
    //~ setTimeout(() => {
      //~ const mockResponse = {
        //~ result: 'Success!',
      //~ };
      //~ resolve(mockResponse);
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

//~ export { loginTest, registerAsClientTest, registerAsMasterTest, addMasterTest };

export { login, registerAsClient, registerAsMaster, addMaster };
