import { useQuery, useQueryClient } from '@tanstack/react-query';

import CONFIG from 'config';
import { useGlobalState } from './global';
import { SiteData, getSiteData, getSiteDataVersion, getServices } from './api/site-data';

const SITE_DATA_LS_KEY = 'site_data';
const SITE_DATA_QUERY_KEY = 'site_data';
const SITE_DATA_FILTERED_QUERY_KEY = 'site_data_filtered';
const OFFERINGS_LS_KEY = 'products';
const OFFERINGS_QUERY_KEY = 'products';

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

const EMPTY_OBJECT = Object.freeze({});

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
  const { data, ...ret } = queryResult;
  const cities: Record<number, CityData> = data || EMPTY_OBJECT;
  return {
    ...ret,
    cities
  }
}

export type Categories = Record<number, {
  name: string;
  subcategories: number[];
}>;

export type Subcategories = Record<number, {
  name: string;
  parent: number;
  products: number[];
}>;

export type Products = Record<number, {
  name: string;
  parent: number;
}>;

export type ProductsData = {
  categories: Categories;
  subcategories: Subcategories;
  products: Products;
};

async function fetchProducts() {
  try {
    const cachedProducts = JSON.parse(localStorage.getItem(OFFERINGS_LS_KEY) ?? 'null');
    if (cachedProducts && cachedProducts.categories && cachedProducts.subcategories && cachedProducts.products) {
      return cachedProducts;
    }
  }
  catch (e) {}

  const data = await getServices();
  const productsData = {
    categories: {},
    subcategories: {},
    products: {}
  };
  if (data && Array.isArray(data)) {
    for (const section of data) {
      const secId = Number(section?.id);
      const name = String(section?.name || '');
      const subsections = section?.subsections;
      if (Number.isInteger(secId) && secId > 0 && name && Array.isArray(subsections)) {
        productsData.categories[secId] = {
          name,
          subcategories: []
        };
        for (const subsection of subsections) {
          const subId = Number(subsection?.id);
          const name = String(subsection?.name || '');
          const products = subsection?.services;
          if (Number.isInteger(subId) && subId > 0 && !productsData.subcategories[subId] && name && Array.isArray(products)) {
            productsData.categories[secId].subcategories.push(subId);
            productsData.subcategories[subId] = {
              name,
              parent: secId,
              products: []
            };
            for (const product of products) {
              const prodId = Number(product?.id);
              const name = String(product?.name || '');
              if (Number.isInteger(prodId) && prodId > 0 && !productsData.products[prodId] && name) {
                productsData.subcategories[subId].products.push(prodId);
                productsData.products[prodId] = {
                  name,
                  parent: subId
                };
              }
            }
          }
        }
      }
    }
    localStorage.setItem(OFFERINGS_LS_KEY, JSON.stringify(productsData));
  }
  else {
    localStorage.removeItem(OFFERINGS_LS_KEY);
  }
  return productsData;
}

const emptyProductsData = { categories: {}, subcategories: {}, products: {} };

export function useProducts() {
  const queryResult = useQuery({
    queryKey: [ OFFERINGS_QUERY_KEY ],
    queryFn: fetchProducts,
    staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
  });
  const { data, ...ret } = queryResult;
  const productsData: ProductsData = data || emptyProductsData;
  return {
    ...ret,
    ...productsData
  }
}
