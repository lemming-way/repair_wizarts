import { useQuery, useQueryClient } from '@tanstack/react-query';

import CONFIG from '../constants';
import { useGlobalState } from './global';
import { SiteData, getSiteData, getSiteDataVersion, getServices } from './api/site-data';

const SITE_DATA_LS_KEY = 'site_data';
const SITE_DATA_QUERY_KEY = 'site_data';
const SITE_DATA_FILTERED_QUERY_KEY = 'site_data_filtered';
const SERVICES_LS_KEY = 'services';
const SERVICES_QUERY_KEY = 'services';

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
  client.invalidateQueries({ queryKey: [ SITE_DATA_FILTERED_QUERY_KEY ], exact: false });
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

function filterCities(siteData: SiteData, language: string, country: string) {
  if (!siteData) return {};
  const defaultLanguageId = Number(siteData.default_lang || 0);
  const defaultLanguage = String((defaultLanguageId && siteData.data?.langs?.[defaultLanguageId]?.iso) || 'en');
  const cities = {};
  if (siteData.data?.cities && 'object' === typeof siteData.data.cities && !Array.isArray(siteData.data.cities)) {
    Object.entries(siteData.data.cities).forEach(([ key, city ]) => {
      const cityName = city?.[language] || city?.[defaultLanguage];
      const cityCountry = city?.country;
      if (cityCountry === country && cityName && 'string' === typeof cityName) {
        cities[ Number(key) ] = cityName;
      }
    });
  }
  return cities;
}

const EMPTY_OBJECT = Object.freeze({});

export function useCities(country: string = 'ru') {
  const queryClient = useQueryClient();
  const language = useGlobalState('language');
  const queryResult = useQuery({
    queryKey: [ SITE_DATA_FILTERED_QUERY_KEY, 'cities', country ],
    queryFn: async () => {
      const siteData = await queryClient.fetchQuery<SiteData>({
        queryKey: [ SITE_DATA_QUERY_KEY ],
        queryFn: fetchSiteData,
        staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
      });
      return filterCities(siteData, language, country);
    },
    staleTime: Infinity
  });
  const { data, ...ret } = queryResult;
  const cities: Record<number, string> = data || EMPTY_OBJECT;
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
  services: number[];
}>;

export type Services = Record<number, {
  name: string;
  parent: number;
}>;

export type ServicesData = {
  categories: Categories;
  subcategories: Subcategories;
  services: Services;
};

async function fetchServices() {
  try {
    const cachedServices = JSON.parse(localStorage.getItem(SERVICES_LS_KEY) ?? 'null');
    if (cachedServices && cachedServices.categories && cachedServices.subcategories && cachedServices.services) {
      return cachedServices;
    }
  }
  catch (e) {}

  const data = await getServices();
  const servicesData = {
    categories: {},
    subcategories: {},
    services: {}
  };
  if (data && Array.isArray(data)) {
    for (const section of data) {
      const secId = Number(section?.id);
      const name = String(section?.name || '');
      const subsections = section?.subsections;
      if (Number.isFinite(secId) && secId > 0 && name && Array.isArray(subsections)) {
        servicesData.categories[secId] = {
          name,
          subcategories: []
        };
        for (const subsection of subsections) {
          const subId = Number(subsection?.id);
          const name = String(subsection?.name || '');
          const services = subsection?.services;
          if (Number.isFinite(subId) && subId > 0 && !servicesData.subcategories[subId] && name && Array.isArray(services)) {
            servicesData.categories[secId].subcategories.push(subId);
            servicesData.subcategories[subId] = {
              name,
              parent: secId,
              services: []
            };
            for (const service of services) {
              const srvId = Number(service?.id);
              const name = String(service?.name || '');
              if (Number.isFinite(srvId) && srvId > 0 && !servicesData.services[srvId] && name) {
                servicesData.subcategories[subId].services.push(srvId);
                servicesData.services[srvId] = {
                  name,
                  parent: subId
                };
              }
            }
          }
        }
      }
    }
    localStorage.setItem(SERVICES_LS_KEY, JSON.stringify(servicesData));
  }
  else {
    localStorage.removeItem(SERVICES_LS_KEY);
  }
  return servicesData;
}

const emptyServicesData = { categories: {}, subcategories: {}, services: {} };

export function useServices() {
  const queryResult = useQuery({
    queryKey: [ SERVICES_QUERY_KEY ],
    queryFn: fetchServices,
    staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
  });
  const { data, ...ret } = queryResult;
  const servicesData: ServicesData = data || emptyServicesData;
  return {
    ...ret,
    ...servicesData
  }
}
