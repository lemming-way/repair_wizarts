import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import CONFIG from 'config';
import { objectMapper } from 'app/shared/lib/objectMapper';
import { useGlobalState } from './global';
import { createBatchLoader } from './batch-query';
import { SiteData, getSiteData, getSiteDataVersion, getCategories, getTaxaIdsByParents, getTaxaByIds } from './api/site-data';

const SITE_DATA_LS_KEY = 'site_data';
const SITE_DATA_QUERY_KEY = 'site_data';
const SITE_DATA_FILTERED_QUERY_KEY = 'site_data_filtered';

/**
 * Пустой объект, используемый по умолчанию для предотвращения ошибок доступа к свойствам.
 */
const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);

async function fetchSiteData({ client }) {
  try {
    const cachedData = JSON.parse(localStorage.getItem(SITE_DATA_LS_KEY)!);  // не проверяем null, потому что внутри try
    if (cachedData.version) {
      const siteVersion = await getSiteDataVersion();
      if (siteVersion === cachedData.version) {
        return cachedData;
      }
    }
  }
  catch {}

  const data = await getSiteData();
  setTimeout(
    () => client.invalidateQueries({ queryKey: [ SITE_DATA_FILTERED_QUERY_KEY ], exact: false }),
    0
  );
  if (data && 'object' === typeof data && !Array.isArray(data)) {
    const partialData = {
      version: data.version || '',
      default_lang: data.default_lang || '',
      data: {
        cities: data.data?.cities || {},
        langs: data.data?.langs || {}
      }
    };
    localStorage.setItem(SITE_DATA_LS_KEY, JSON.stringify(partialData));
    return partialData;
  }
  else {
    localStorage.removeItem(SITE_DATA_LS_KEY);
    return {};
  }
}

export type CityData = {
  name: string;
  latitude?: number;
  longitude?: number;
};

function filterCities(siteData: SiteData, language: string, country: string) {
  if (!siteData) return {};
  const defaultLanguageId = Number(siteData.default_lang || 0);
  const defaultLanguage = String((defaultLanguageId && siteData.data?.langs?.[defaultLanguageId]?.iso) || 'en');
  const cities = {};
  if (siteData.data?.cities && 'object' === typeof siteData.data.cities && !Array.isArray(siteData.data.cities)) {
    Object.entries(siteData.data.cities).forEach(([ key, city ]) => {
      const cityName = city?.[language] || city?.[defaultLanguage];
      const cityCountry = city?.country;
      const coords = city?.json?.coordinates as any;  // обходим "бюрократию" Typescript
      const lat = Number(coords?.latitude);
      const lng = Number(coords?.longitude);
      if (cityCountry === country && cityName && 'string' === typeof cityName) {
        cities[ Number(key) ] = {
          name: cityName,
          latitude: Number.isFinite(lat) ? lat : undefined,
          longitude: Number.isFinite(lng) ? lng : undefined,
        };
      }
    });
  }
  return cities;
}

function useSiteData() {
  return useQuery<SiteData>({
    queryKey: [ SITE_DATA_QUERY_KEY ],
    queryFn: fetchSiteData,
    staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
  });
}

export function useCities(country: string = 'ru') {
  const queryClient = useQueryClient();
  const language = useGlobalState('language');
  const primary = useSiteData();
  const queryResult = useQuery({
    queryKey: [ SITE_DATA_FILTERED_QUERY_KEY, 'cities', country, language ],
    queryFn: async () => {
      const siteData = queryClient.getQueryData<SiteData>([ SITE_DATA_QUERY_KEY ]);
      return siteData ? filterCities(siteData, language, country) : {};
    },
    enabled: !!primary.data,
    staleTime: Infinity
  });
  return objectMapper(queryResult, { data: null, cities(target) { return (target.data || EMPTY_OBJECT) as Record<number, CityData>; } });
}

export type Categories = Record<number, {
  name: string;
  subcategories: number[];
}>;

export type Subcategories = Record<number, {
  name: string;
  parent: number;
  specializations: number[];
}>;

export type Specializations = Record<number, {
  name?: string;
  parent?: number;
  products: number[];
}>;

export type Products = Record<number, {
  name?: string;
  parent?: number;
}>;

export type ProductsResult = {
  categories: Readonly<Categories>;
  subcategories: Readonly<Subcategories>;
  specializations: Readonly<Specializations>;
  products: Readonly<Products>;
  isLoading: boolean,
  isFetching: boolean,
  isError: boolean,
  error: unknown,
  isSuccess: boolean
};

async function fetchCategories() {
  const data = await getCategories();
  const categoriesData = {
    categories: {},
    subcategories: {}
  };
  if (data && Array.isArray(data)) {
    for (const item of data) {
      const id = Number(item?.id ?? 0);
      const name = String(item?.name || '');
      const parent = Number(item?.parent ?? 0);
      const type = String(item?.type || '');
      if (type === 'category') {
        if (categoriesData.categories[id]) {
          categoriesData.categories[id].name = name;
        }
        else {
          categoriesData.categories[id] = {
            name,
            subcategories: []
          }
        }
      }
      else if (type === 'subcategory') {
        categoriesData.subcategories[id] = { name, parent };
        if (categoriesData.categories[parent]) {
          categoriesData.categories[parent].subcategories.push(id);
        }
        else {
          categoriesData.categories[parent] = {
            name: '',
            subcategories: [id]
          }
        }
      }
    }
  }
  return categoriesData;
}

const [ ,useSpecializationsIds ] = createBatchLoader({
  fetchFn: (ids: number[]) => getTaxaIdsByParents(ids, 'specializations'),
  createQueryKey: (userId, subId) => [ 'specializations', subId ],
  extractKeys: (queryKey) => [ null, Number(queryKey[1]) ],
  staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity,
  dataKey: 'subcategories',
  userAgnostic: true
});

const [ ,useSpecializations ] = createBatchLoader({
  fetchFn: (ids: number[]) => getTaxaByIds(ids, 'specializations'),
  createQueryKey: (userId, specId) => [ 'specialization', specId ],
  extractKeys: (queryKey) => [ null, Number(queryKey[1]) ],
  staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity,
  dataKey: 'specializations',
  userAgnostic: true
});

const [ ,useProductsIds ] = createBatchLoader({
  fetchFn: (ids: number[]) => getTaxaIdsByParents(ids, 'products'),
  createQueryKey: (userId, specId) => [ 'products', specId ],
  extractKeys: (queryKey) => [ null, Number(queryKey[1]) ],
  staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity,
  dataKey: 'specializations',
  userAgnostic: true
});

const [ ,useProductsData ] = createBatchLoader({
  fetchFn: (ids: number[]) => getTaxaByIds(ids, 'products'),
  createQueryKey: (userId, prodId) => [ 'product', prodId ],
  extractKeys: (queryKey) => [ null, Number(queryKey[1]) ],
  staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity,
  dataKey: 'products',
  userAgnostic: true
});

type UseProductsInstance = {
  isFullyLoaded: boolean;
  wantIds: {
    specializations: Set<number>;         // Подкатегории, для которых нам нужны списки специализаций
    specializationsData: Set<number>;     // Специализации, для которых нам нужны название и родитель
    products: Set<number>;                // Специализации, для которых нам нужны списки продуктов
    productsData: Set<number>;            // Продукты, для которых нам нужны название и родитель
  }
};

/**
 * Получить классификатор услуг в виде объекта ProductsResult с автоматической динамической загрузкой
 */
export function useProducts() {
  const queryClient = useQueryClient();

  const { current: instance } = useRef({} as UseProductsInstance);
  if (!instance.wantIds) {
    instance.isFullyLoaded = true;
    instance.wantIds = {
      specializations: new Set(),
      specializationsData: new Set(),
      products: new Set(),
      productsData: new Set()
    }
  };

  const [specializationsBySubcategory, setSpecializationsBySubcategory] = useState<number[]>([]);
  const [specializations, setSpecializations] = useState<number[]>([]);
  const [productsBySpecialization, setProductsBySpecialization] = useState<number[]>([]);
  const [products, setProducts] = useState<number[]>([]);

  // Этот эффект будет срабатывать на каждый рендер, зависимости не нужны
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Доступ к свойствам может происходить не только в основном рендере, но и в эффектах
    // Поэтому заворачиваем наш эффект в setTimeout, чтобы он гарантированно выполнился после всех других эффектов
    const timer = setTimeout(() => {
      // Проверяем, какие данные читал компонент во время рендера
      // Если запросы изменились по сравнению с сохранёнными в useState, то обновляем стейт
      // Тем самым перезапускаем хуки useQueries с новыми запросами
      let specializationsBySubcategoryChanged = specializationsBySubcategory.length !== instance.wantIds.specializations.size;
      if (!specializationsBySubcategoryChanged) {
        for (const id of specializationsBySubcategory) {
          if (!instance.wantIds.specializations.has(id)) {
            specializationsBySubcategoryChanged = true;
            break;
          }
        }
      }
      if (specializationsBySubcategoryChanged) {
        setSpecializationsBySubcategory([...instance.wantIds.specializations]);
      }

      let specializationsChanged = specializations.length !== instance.wantIds.specializationsData.size;
      if (!specializationsChanged) {
        for (const id of specializations) {
          if (!instance.wantIds.specializationsData.has(id)) {
            specializationsChanged = true;
            break;
          }
        }
      }
      if (specializationsChanged) {
        setSpecializations([...instance.wantIds.specializationsData]);
      }

      let productsBySpecializationChanged = productsBySpecialization.length !== instance.wantIds.products.size;
      if (!productsBySpecializationChanged) {
        for (const id of productsBySpecialization) {
          if (!instance.wantIds.products.has(id)) {
            productsBySpecializationChanged = true;
            break;
          }
        }
      }
      if (productsBySpecializationChanged) {
        setProductsBySpecialization([...instance.wantIds.products]);
      }

      let productsChanged = products.length !== instance.wantIds.productsData.size;
      if (!productsChanged) {
        for (const id of products) {
          if (!instance.wantIds.productsData.has(id)) {
            productsChanged = true;
            break;
          }
        }
      }
      if (productsChanged) {
        setProducts([...instance.wantIds.productsData]);
      }

      instance.isFullyLoaded = true;
      instance.wantIds = {
        specializations: new Set(),
        specializationsData: new Set(),
        products: new Set(),
        productsData: new Set()
      };
    }, 0);
    return () => clearTimeout(timer);
  });

  const categoriesResult = useQuery({
    queryKey: [ 'categories' ],
    queryFn: fetchCategories,
    staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
  });

  // Получаем данные из categoriesResult через getOwnPropertyDescriptor, чтобы не создать подписку на данные раньше времени
  const categoriesResultData = Object.getOwnPropertyDescriptor(categoriesResult, 'data')?.value;

  const specializationsIdsResult = useSpecializationsIds(specializationsBySubcategory);
  const specializationsResult = useSpecializations(specializations);
  const productsIdsResult = useProductsIds(productsBySpecialization);
  const productsResult = useProductsData(products);

  // Мемоизируем прокси. Это даст ссылочную стабильность, когда данные не меняются
  const subcategoriesProxy = useMemo(() => {
    // Существование списка specializationsBySubcategory означает, что компонент уже запросил данные
    // Поэтому здесь смело обращаемся к specializationsIdsResult.subcategories с получением подписки от TanStack
    const specializationsIdsMap =
      specializationsBySubcategory.length ?
      new Map((specializationsIdsResult.subcategories ?? []).map(item => [item.id, item])) :
      new Map();

    // Прокси для подкатегорий. Здесь нельзя указать categoriesResult.data.subcategories в качестве целевого объекта,
    // потому что Query сразу создаст для него подписку. А мы хотим оформлять подписку по требованию.
    return new Proxy<Subcategories>({}, {
      get(target, prop) {
        if (Number(prop) > 0) {                                        // только номерные свойства
          if (target[prop]) return target[prop];                       // если объект уже был создан, сразу возвращаем его
          const result = categoriesResult.data?.subcategories[prop];   // только если такая подкатегория есть в загруженных данных
          if (result) {
            const id = Number(prop);
            const subcat = {                                           // копируем значение из загруженных данных
              parent: result.parent,
              name: result.name,
              // список ID специализаций загружается отдельно
              get specializations() {
                // запоминаем, что компонент запрашивает этот ID
                instance.wantIds.specializations.add(id);
                // ищем нужный ID в результатах запроса useSpecializationsIds
                if (specializationsIdsMap.has(id)) return specializationsIdsMap.get(id).specializations;
                // если его нет в результатах запроса, пробуем взять прямо из кэша
                else {
                  const result = queryClient.getQueryState<{specializations: number[];}>(['specializations', id]);
                  if (result?.status !== 'success') instance.isFullyLoaded = false;
                  return result?.data?.specializations || EMPTY_ARRAY;
                }
              }
            };
            // кэшируем созданные объекты в целевом (первоначально пустом) объекте, это нужно для постоянства ссылок.
            target[prop] = subcat;
            return subcat;
          }
        }
        return;
      },
      // Другие хуки на всякий случай
      set() { return false; },
      deleteProperty() { return false; },
      defineProperty() { return false; },
      has(target, prop) {
        return Reflect.has(categoriesResult.data?.subcategories || target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(categoriesResult.data?.subcategories || target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (Reflect.has(categoriesResult.data?.subcategories || target, prop)) return {
          enumerable: true,
          configurable: true,
          writable: false,
          value: this.get!(target, prop, target)
        };
        return;
      }
    });
  // categoriesResult.data проверяется через categoriesResultData, а instance вообще не меняется, но линтер этого не понимает
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesResultData, specializationsBySubcategory, specializationsIdsResult, queryClient]);

  // Мемоизируем прокси. Это даст ссылочную стабильность, когда данные не меняются
  const specializationsProxy = useMemo(() => {
    // Существование списка specializations означает, что компонент уже запросил данные
    // Поэтому здесь смело обращаемся к specializationsResult.specializations с получением подписки от TanStack
    const specializationsMap =
      specializations.length ?
      new Map((specializationsResult.specializations ?? []).map(item => [item.id, item])) :
      new Map();
    // Существование списка productsBySpecialization означает, что компонент уже запросил данные
    // Поэтому здесь смело обращаемся к productsIdsResult.specializations с получением подписки от TanStack
    const productsIdsMap =
      productsBySpecialization.length ?
      new Map((productsIdsResult.specializations ?? []).map(item => [item.id, item])) :
      new Map();

    // Прокси для специализаций.
    return new Proxy<Specializations>({}, {
      get(target, prop) {
        if (Number(prop) > 0) {                                        // только номерные свойства
          if (target[prop]) return target[prop];                       // если объект уже был создан, сразу возвращаем его
          const id = Number(prop);
          const spec = {
            get parent(){
              // запоминаем, что компонент запрашивает этот ID
              instance.wantIds.specializationsData.add(id);
              // ищем нужный ID в результатах запроса useSpecializations
              if (specializationsMap.has(id)) return specializationsMap.get(id).parent;
              // если его нет в результатах запроса, пробуем взять прямо из кэша
              else {
                const result = queryClient.getQueryState<{parent: number}>(['specialization', id]);
                if (result?.status !== 'success') instance.isFullyLoaded = false;
                return result?.data?.parent;
              }
            },
            get name(){
              // запоминаем, что компонент запрашивает этот ID
              instance.wantIds.specializationsData.add(id);
              // ищем нужный ID в результатах запроса useSpecializations
              if (specializationsMap.has(id)) return specializationsMap.get(id).name;
              // если его нет в результатах запроса, пробуем взять прямо из кэша
              else {
                const result = queryClient.getQueryState<{name: string}>(['specialization', id]);
                if (result?.status !== 'success') instance.isFullyLoaded = false;
                return result?.data?.name;
              }
            },
            // список ID специализаций загружается отдельно
            get products() {
              // запоминаем, что компонент запрашивает этот ID
              instance.wantIds.products.add(id);
              // ищем нужный ID в результатах запроса useSpecializationsIds
              if (productsIdsMap.has(id)) return productsIdsMap.get(id).products;
              // если его нет в результатах запроса, пробуем взять прямо из кэша
              else {
                const result = queryClient.getQueryState<{products: number[];}>(['products', id]);
                if (result?.status !== 'success') instance.isFullyLoaded = false;
                return result?.data?.products || EMPTY_ARRAY;
              }
            }
          };
          // кэшируем созданные объекты в целевом (первоначально пустом) объекте, это нужно для постоянства ссылок.
          target[prop] = spec;
          return spec;
        }
        return;
      },
      // Другие хуки на всякий случай
      set() { return false; },
      deleteProperty() { return false; },
      defineProperty() { return false; }
      // Здесь мы не знаем список всех возможных ID заранее, поэтому хуки для has, ownKeys и getOwnPropertyDescriptor
      // не реализованы
    });
  // instance не меняется, но линтер этого не понимает
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specializations, productsBySpecialization, specializationsResult, productsIdsResult, queryClient]);

  // Мемоизируем прокси. Это даст ссылочную стабильность, когда данные не меняются
  const productsProxy = useMemo(() => {
    // Существование списка products означает, что компонент уже запросил данные
    // Поэтому здесь смело обращаемся к productsResult.products с получением подписки от TanStack
    const productsMap =
      products.length ?
      new Map((productsResult.products ?? []).map(item => [item.id, item])) :
      new Map();

    // Прокси для продуктов.
    return new Proxy<Products>({}, {
      get(target, prop) {
        if (Number(prop) > 0) {                                        // только номерные свойства
          if (target[prop]) return target[prop];                       // если объект уже был создан, сразу возвращаем его
          const id = Number(prop);
          const prod = {
            get parent(){
              // запоминаем, что компонент запрашивает этот ID
              instance.wantIds.productsData.add(id);
              // ищем нужный ID в результатах запроса useProductsData
              if (productsMap.has(id)) return productsMap.get(id).parent;
              // если его нет в результатах запроса, пробуем взять прямо из кэша
              else {
                const result = queryClient.getQueryState<{parent: number}>(['product', id]);
                if (result?.status !== 'success') instance.isFullyLoaded = false;
                return result?.data?.parent;
              }
            },
            get name(){
              // запоминаем, что компонент запрашивает этот ID
              instance.wantIds.productsData.add(id);
              // ищем нужный ID в результатах запроса useProductsData
              if (productsMap.has(id)) return productsMap.get(id).name;
              // если его нет в результатах запроса, пробуем взять прямо из кэша
              else {
                const result = queryClient.getQueryState<{name: string}>(['product', id]);
                if (result?.status !== 'success') instance.isFullyLoaded = false;
                return result?.data?.name;
              }
            },
          };
          // кэшируем созданные объекты в целевом (первоначально пустом) объекте, это нужно для постоянства ссылок.
          target[prop] = prod;
          return prod;
        }
        return;
      },
      // Другие хуки на всякий случай
      set() { return false; },
      deleteProperty() { return false; },
      defineProperty() { return false; }
      // Здесь мы не знаем список всех возможных ID заранее, поэтому хуки для has, ownKeys и getOwnPropertyDescriptor
      // не реализованы
    });
  // instance не меняется, но линтер этого не понимает
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, productsResult, queryClient]);

  // Собираем выходной объект из кусочков данных и состояний
  const ret = {
    // Для категорий используем геттер для доступа по требованию, чтобы Query не создавал подписку без необходимости.
    // Этот объект данных всегда загружается целиком, поэтому дополнительные преобразования не требуются.
    get categories() { return categoriesResult.data?.categories || EMPTY_OBJECT as Categories; },
    subcategories: subcategoriesProxy,
    specializations: specializationsProxy,
    products: productsProxy,
    // Геттеры с отложенным доступом к состоянию запросов
    get isLoading() {
      return (
        categoriesResult.isLoading ||
        specializationsIdsResult.isLoading ||
        productsIdsResult.isLoading ||
        productsResult.isLoading
      );
    },
    get isFetching() {
      return (
        categoriesResult.isFetching ||
        specializationsIdsResult.isFetching ||
        productsIdsResult.isFetching ||
        productsResult.isFetching
      );
    },
    get isError() {
      return (
        categoriesResult.isError ||
        specializationsIdsResult.isError ||
        productsIdsResult.isError ||
        productsResult.isError
      );
    },
    get error() {
      return (
        categoriesResult.error ??
        specializationsIdsResult.error ??
        productsIdsResult.error ??
        productsResult.error
      );
    },
    get isSuccess() {
      return (
        categoriesResult.isSuccess &&
        specializationsIdsResult.isSuccess &&
        productsIdsResult.isSuccess &&
        productsResult.isSuccess
      );
    },
    // При первом рендере списки ID для загрузки ещё не обновились, поэтому isSuccess может возвращать неправильный результат
    // Можно вызвать функцию getActualSuccess в любой момент рендера, чтобы узнать, все ли запрошенные на данный момент ID
    // действительно загрузились.
    getActualSuccess: useCallback(() => {
      return (
        instance.isFullyLoaded &&
        categoriesResult.isSuccess &&
        specializationsIdsResult.isSuccess &&
        productsIdsResult.isSuccess &&
        productsResult.isSuccess
      );
    // instance не меняется, но линтер этого не понимает
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoriesResult, specializationsIdsResult, productsIdsResult, productsResult])
  } as ProductsResult;

  return ret;
}
