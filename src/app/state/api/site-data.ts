/**
 * Модуль api для работы со статическими данными сайта
 *
 * @summary
 * **Типы:**
 * CityData, LanguageData, SiteData, CategoryData
 *
 * **Получение данных:**
 * getSiteDataVersion, getSiteData, getCategories, getTaxaIdsByParents, getTaxaByIds
 */

import { get, getRawJSON, postNoAuth } from './request';

type SiteDataVersion = {
  'cache version'?: string;
}

export type CityData = {
  country?: string;
  zone?: string;
  ru?: string;
  en?: string;
  ar?: string;
  fr?: string;
  es?: string;
  json?: Record<string, unknown>
}

export type LanguageData = {
  native?: string;
  ru?: string;
  en?: string;
  ar?: string;
  fr?: string;
  es?: string;
  iso?: string;
}

export type SiteData = {
  version?: string;
  default_lang?: number;
  data?: {
    cities?: Record<string, CityData>;
    langs?: Record<string, LanguageData>;
  }
}

/**
 * Получает версию настроек сайта.
 * @returns Промис, который разрешается строкой с версией сайта.
 */
export async function getSiteDataVersion() {
  const result = await getRawJSON('?cv') as SiteDataVersion;
  return String( result?.['cache version'] || '' );
}

/**
 * Получает объект с настройками сайта.
 * @returns Промис, который разрешается с объектом SiteData или undefined, если данные не найдены.
 */
export async function getSiteData() {
  const payload = {
    json_like: { cities: true, langs: true }
  }
  const result = await get<SiteData>('data', payload);
  return result;
}

export type CategoryData = {
  id?: number;
  type?: 'category' | 'subcategory';
  parent?: number;
  name?: string;
}

type SpecializationsIds = {
  id: number;
  specializations: number[];
};

type ProductsIds = {
  id: number;
  products: number[];
};

type ChildrenIds<L extends 'specializations' | 'products'> = L extends 'specializations' ? SpecializationsIds : ProductsIds;

type Taxon = {
  id: number;
  parent: number;
  name: string;
};

/**
 * Получает список всех категорий и подкатегорий рубрикатора.
 * @returns Промис, который разрешается списком CategoryData.
 */
export async function getCategories() {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getCategories'
    }
  }
  const result = await postNoAuth<CategoryData[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Получает список ID специализаций или продуктов (услуг) для заданных родителей.
 * @param ids Список ID родителей.
 * @param level Уровень дерева, записи которого мы запрашиваем - специализации или продукты.
 * @returns Промис, который разрешается списком ID.
 */
export async function getTaxaIdsByParents<L extends 'specializations' | 'products'>(ids: number[], level: L) {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getTaxaIdsByParents',
      ids,
      level
    }
  }
  const result = await postNoAuth<ChildrenIds<L>[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Получает наименования специализаций или продуктов (услуг) по их ID.
 * @param ids Список ID специализаций или продуктов.
 * @param level Уровень дерева, записи которого мы запрашиваем - специализации или продукты.
 * @returns Промис, который разрешается списком Taxon.
 */
export async function getTaxaByIds(ids: number[], level: 'specializations' | 'products') {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getTaxaByIds',
      ids,
      level
    }
  }
  const result = await postNoAuth<Taxon[]>('script/template/repair_api', payload);
  return result;
}
