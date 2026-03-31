/** @file Настройки и константы для сайта */

const CONFIG = {
	APP: {
		language: 'ru',
		currentCity: 169,  // Санкт-Петербург
		'map:location': {
			latitude: 59.9311,
			longitude: 30.3609,
		}
	},

	SITE: {
		keywords: '',
		title: 'Заголовок сайта',
		description: 'Описание сайта'
	},
	
	ORDERS: {
		initialLifetime: 604800
	},

	API: {
		url: 'https://ibronevik.ru/taxi/c/tutor/api/v1/',
		categoriesUrl: 'https://profiback.itest24.com/api/full-data',
		userDataStaleTime: 15 * 60000,
		ordersDataStaleTime: 2 * 60000,
		ordersDataRefetchTime: 2 * 60000,
		filesStaleTime: 30 * 60000
		// queryDefaultStaleTime,
		// queryDefaultRetry
	},

	YMAPS: {
		apiKey: '21efa402-871b-49e3-b794-8f53bbd5fc49'
	}
}

export default CONFIG;
