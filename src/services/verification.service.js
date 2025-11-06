import appFetch from '../utilities/appFetch';
// Функция для отправки кода на email
//~ const sendEmailCodeTest = () => {
  //~ // Имитация запроса для отправки email кода
  //~ return new Promise((resolve) => {
    //~ setTimeout(() => {
      //~ resolve({
        //~ result: 'Success!',
        //~ message: 'Email code sent successfully!',
      //~ });
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Функция для проверки email кода
//~ const sendEmailVerificationCodeTest = (code) => {
  //~ // Имитация запроса для проверки email кода
  //~ return new Promise((resolve) => {
    //~ setTimeout(() => {
      //~ resolve({
        //~ result: 'Success!',
        //~ user_id: 6,
        //~ email_verified: true,
      //~ });
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Функция для отправки кода на телефон
//~ const sendPhoneCodeTest = () => {
  //~ // Имитация запроса для отправки телефонного кода
  //~ return new Promise((resolve) => {
    //~ setTimeout(() => {
      //~ resolve({
        //~ result: 'Success!',
        //~ message: 'Phone code sent successfully!',
      //~ });
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

// Функция для проверки телефонного кода
//~ const sendPhoneVerificationCodeTest = (code) => {
  //~ // Имитация запроса для проверки телефонного кода
  //~ return new Promise((resolve) => {
    //~ setTimeout(() => {
      //~ resolve({
        //~ result: 'Success!',
        //~ user_id: 6,
        //~ phone_verified: true,
      //~ });
    //~ }, 500); // Имитация задержки сети
  //~ });
//~ };

const sendEmailCode = (email) =>
  appFetch('/auth/', {
    body: {
      type: 'e-mail_code',
      login: email,
    },
  });

const sendEmailVerificationCode = (email, code) => {
  const trimmedCode = typeof code === 'string' ? code.trim() : '';

  if (!trimmedCode) {
    return Promise.reject(new Error('Verification code is required'));
  }

  return appFetch('/auth/', {
    body: {
      type: 'e-mail_code',
      login: email,
      password: trimmedCode,
    },
  });
};

const sendPhoneCode = (phone) =>
  appFetch('/auth/', {
    body: {
      type: 'phone_code',
      login: phone,
    },
  });

const sendPhoneVerificationCode = (phone, code) => {
  const trimmedCode = typeof code === 'string' ? code.trim() : '';

  if (!trimmedCode) {
    return Promise.reject(new Error('Verification code is required'));
  }

  return appFetch('/auth/', {
    body: {
      type: 'phone_code',
      login: phone,
      password: trimmedCode,
    },
  });
};

export {
  sendEmailCode,
  sendEmailVerificationCode,
  sendPhoneCode,
  sendPhoneVerificationCode,
};
