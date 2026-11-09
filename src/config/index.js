/** @file Настройки и константы для сайта */

const CONFIG = {
  APP: {
    language: 'ru',
    currentCity: 169, // Санкт-Петербург
    'map:location': {
      latitude: 59.9311,
      longitude: 30.3609,
    },
  },

  SITE: {
    keywords: '',
    title: 'Заголовок сайта',
    description: 'Описание сайта',
  },

  ORDERS: {
    initialLifetime: 604800,
  },

  BLOG: {
    // Боевой режим: статьи и комментарии обслуживаются PHP API / MySQL.
    // REACT_APP_BLOG_SOURCE может переопределить это значение на этапе сборки.
    source: 'api',
  },

  API: {
    url: process.env.REACT_APP_API_URL || 'https://ibronevik.itest24.com/taxi_dev2/c/tutor/api/v1/',
    userDataStaleTime: 15 * 60000,
    filesStaleTime: 30 * 60000,
    ordersListRefetchTime: 2 * 60000,
    ordersDataRefetchTime: 5 * 60000,
    chatsDataRefetchTime: 5 * 60000,
    chatMessagesRefetchTime: 10000,
    // queryDefaultStaleTime,
    // queryDefaultRetry
  },

  YMAPS: {
    apiKey: '21efa402-871b-49e3-b794-8f53bbd5fc49',
  },
};

export default CONFIG;
