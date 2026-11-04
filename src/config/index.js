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
    // Гостевой режим комментариев отключён вместе с $blog_guest_testing
    // в script_templates/repair_api.php.
    allowGuestTesting: false,
    // "local" — статьи из public/articles (собираются из docs/**/*.zip),
    // "api"   — статьи из БД через script/template/repair_api.
    // Переопределяется переменной окружения REACT_APP_BLOG_SOURCE.
    source: 'local',
  },

  API: {
    url: 'https://ibronevik.ru/taxi/c/tutor/api/v1/',
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
