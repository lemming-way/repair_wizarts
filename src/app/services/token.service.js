// todo: Хранить токен в переменной. Записывать в storage только если установлена галка у юзера
// Бэку не надо!!!
// Функция для сохранения токена в localStorage
const setToken = (data) =>
  localStorage.setItem('userdata', JSON.stringify(data));

// Функция для получения токена из localStorage
const getToken = () => JSON.parse(localStorage.getItem('userdata'));

// Функция для обновления токена в localStorage
const updateToken = (data) =>
  localStorage.setItem('userdata', JSON.stringify(data));

// Функция для удаления токена из localStorage
const removeToken = () => localStorage.removeItem('userdata');

export { setToken, getToken, updateToken, removeToken };
