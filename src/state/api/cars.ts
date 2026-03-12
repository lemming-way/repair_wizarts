/**
 * Модуль api для работы с машинами
 *
 * @summary
 * **Типы:**
 * License, BookingLocationClass, CarData, CarCreationData, CarEditData
 *
 * **Получение данных:**
 * getCars, getUserCars, getDrivenCar
 *
 * **Изменение данных:**
 * createCar, updateCar, driveCar
 * 
 */
import { post } from './request';

// ==================== Типы данных ====================

/**
 * Тип для лицензии машины.
 */
export type License = {
  /** ID лицензии, может отсутствовать при операции редактирования */
  id?: string;
  /** Название лицензии на русском языке */
  ru?: string;
  /** Название лицензии на английском языке */
  en?: string;
  /** Название лицензии на арабском языке */
  ar?: string;
  /** Название лицензии на французском языке */
  fr?: string;
  /** Описание лицензии на русском языке */
  about_ru?: string;
  /** Описание лицензии на английском языке */
  about_en?: string;
  /** Описание лицензии на арабском языке */
  about_ar?: string;
  /** Описание лицензии на французском языке */
  about_fr?: string;
  /** Активная лицензия */
  active: 0 | 1 | "0" | "1";
  /** Массив классов дальности */
  b_l_c: BookingLocationClass[];
  /** Только для редактирования: если 1, то массив свойств точно будет равен b_l_c,
   * иначе свойства, ID которых отсутствуют в b_l_c, не изменяются */
  exact?: 0 | 1;
};

/**
 * Тип для класса дальности поездок в лицензии.
 */
export type BookingLocationClass = {
  /** тип дальности из data.booking_location_classes */
  location: string; // 
  /** ID объекта для этого типа дальности (страна, регион, город) */
  value: number | string; // 
  /** цена тарифа */
  tariff: number | string; // 
  /** ID валюты из data.currencies */
  currency: string; // 
};

/**
 * Структура данных, представляющая одну машину в API.
 */
export type CarData = {
  /** Идентификатор машины */
  c_id: string;
  /** Идентификатор модели машины из data.car_models */
  cm_id: string | null;
  /** Список идентификаторов пользователей, владеющих машиной */
  u_id: string[];
  /** Идентификатор пользователя за рулём */
  u_d_id: string | null;
  /** Число мест в машине */
  seats: number | null;
  /** Автомобильный номер */
  registration_plate: string;
  /** Идентификатор цвета машины из data.car_colors */
  color: string | null;
  /** Ссылка на фото */
  photo: string;
  /** Дополнительные данные */
  details: string | Record<string, unknown> | null;
  /** Идентификатор класса машины из data.car_classes */
  cc_id: string | null;
  /** Массив лицензий */
  licenses: License[] | null;
};

/**
 * Структура данных для создания машины.
 */
export type CarCreationData = {
  /** Идентификатор модели машины из data.car_models */
  cm_id?: number;
  /** Число мест в машине */
  seats?: number;
  /** Автомобильный номер (необходимо) */
  registration_plate: string;
  /** Идентификатор цвета машины из data.car_colors */
  color?: number;
  /** Фото машины, кодированное в base64 строку */
  photo?: string;
  /** Не используется в данном API: детальная информация о машине, если нет в справочнике */
  details?: Record<string, unknown>;
  /** Идентификатор класса машины из data.car_classes */
  cc_id?: number;
};

/**
 * Структура данных для редактирования машины.
 */
export type CarEditData = {
  /** Идентификатор модели машины */
  cm_id?: number;
  /** Число мест в машине */
  seats?: number;
  /** Автомобильный номер */
  registration_plate?: string;
  /** Идентификатор цвета машины */
  color?: number;
  /** Фото машины, кодированное в base64 строку */
  photo?: string;
  /** Не используется в данном API: детальная информация о машине, если нет в справочнике */
  details?: Record<string, unknown>;
  /** Идентификатор класса машины */
  cc_id?: number | string;
  /** Массив лицензий */
  licenses?: License[];
};


// ==================== Функции API ====================

/**
 * Получить информацию о машинах для указанных пользователей или о конкретных машинах.
 * Доступно только для авторизованного пользователя.
 * @param userIds Массив идентификаторов пользователей. Если не задан, то для всех пользователей
 * @param carIds Массив идентификаторов машин. Если не задан, то все машины.
 * @returns Промис, который разрешается со списком данных о машинах.
 */
export async function getCars(userIds?: number[], carIds?: number[]): Promise<CarData[]> {
  let url = userIds?.length ?  `user/${userIds}/car` : 'car';
  if (carIds?.length) url = `${url}/${carIds}`;
  const result = await post<{ car?: Record<string, CarData> }>(url);
  return result?.car && 'object' === typeof result.car ?
    Object.values(result.car) : [];
}

/**
 * Получить информацию о машинах авторизованного пользователя.
 * @returns Промис, который разрешается со списком данных о машинах.
 */
export async function getUserCars(): Promise<CarData[]> {
  const result = await post<{ car?: Record<string, CarData> }>(`user/authorized/car`);
  return result?.car && 'object' === typeof result.car ?
    Object.values(result.car) : [];
}

/**
 * Получить информацию о машине, которой управляет авторизованный пользователь.
 * @returns Промис, который разрешается с данными о машине или null, если машина не найдена.
 */
export async function getDrivenCar(): Promise<CarData | null> {
  const result = await post<{ car?: Record<string, CarData> }>(`user/authorized/car/driven`);
  const cars = result?.car && 'object' === typeof result.car ?
    Object.values(result.car) : [];
  return cars[0] ?? null;
}

/**
 * Создать новую машину для авторизованного пользователя. Доступно водителю с u_check_state=1 или null.
 * @param data Данные для создания машины.
 * @param userId Необязательный ID пользователя, для которого создается машина (только для администратора).
 * @returns Промис, который разрешается с ID созданной машины или null.
 */
export async function createCar(data: CarCreationData): Promise<string | null> {
  const result = await post<{ created_car?: { c_id: string; } }>(
    'car',
    { data: JSON.stringify(data) }
  );
  return result?.created_car?.c_id || null;
}

/**
 * Редактировать машину.
 * Доступно владельцу машины с u_check_state=1 или null.
 * @param carId ID машины для редактирования.
 * @param updates Обновленные данные машины.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateCar(carId: number, updates: CarEditData): Promise<void> {
  return post<void>(`car/${carId}`, { data: JSON.stringify(updates) });
}

/**
 * Выбрать машину для управления.
 * Только для водителя с u_check_state=2 и являющегося владельцем машины.
 * @param carId ID машины.
 * @returns Промис, который разрешается после успешного выбора.
 */
export async function driveCar(carId: number): Promise<void> {
  return post<void>(`car/${carId}/drive`);
}
