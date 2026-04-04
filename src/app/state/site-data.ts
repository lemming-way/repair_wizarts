import { useQuery, useQueryClient } from '@tanstack/react-query';

import CONFIG from 'config';
import { useGlobalState } from './global';
import { SiteData, getSiteData, getSiteDataVersion, getServices } from './api/site-data';

const SITE_DATA_LS_KEY = 'site_data';
const SITE_DATA_QUERY_KEY = 'site_data';
const SITE_DATA_FILTERED_QUERY_KEY = 'site_data_filtered';
const OFFERINGS_LS_KEY = 'offerings';
const OFFERINGS_QUERY_KEY = 'offerings';

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
  offerings: number[];
}>;

export type Offerings = Record<number, {
  name: string;
  parent: number;
}>;

export type OfferingsData = {
  categories: Categories;
  subcategories: Subcategories;
  offerings: Offerings;
};

async function fetchOfferings() {
  try {
    const cachedOfferings = JSON.parse(localStorage.getItem(OFFERINGS_LS_KEY) ?? 'null');
    if (cachedOfferings && cachedOfferings.categories && cachedOfferings.subcategories && cachedOfferings.offerings) {
      return cachedOfferings;
    }
  }
  catch (e) {}

  const data = await getServices();
  const offeringsData = {
    categories: {},
    subcategories: {},
    offerings: {}
  };
  if (data && Array.isArray(data)) {
    for (const section of data) {
      const secId = Number(section?.id);
      const name = String(section?.name || '');
      const subsections = section?.subsections;
      if (Number.isFinite(secId) && secId > 0 && name && Array.isArray(subsections)) {
        offeringsData.categories[secId] = {
          name,
          subcategories: []
        };
        for (const subsection of subsections) {
          const subId = Number(subsection?.id);
          const name = String(subsection?.name || '');
          const offerings = subsection?.services;
          if (Number.isFinite(subId) && subId > 0 && !offeringsData.subcategories[subId] && name && Array.isArray(offerings)) {
            offeringsData.categories[secId].subcategories.push(subId);
            offeringsData.subcategories[subId] = {
              name,
              parent: secId,
              offerings: []
            };
            for (const offering of offerings) {
              const srvId = Number(offering?.id);
              const name = String(offering?.name || '');
              if (Number.isFinite(srvId) && srvId > 0 && !offeringsData.offerings[srvId] && name) {
                offeringsData.subcategories[subId].offerings.push(srvId);
                offeringsData.offerings[srvId] = {
                  name,
                  parent: subId
                };
              }
            }
          }
        }
      }
    }
    localStorage.setItem(OFFERINGS_LS_KEY, JSON.stringify(offeringsData));
  }
  else {
    localStorage.removeItem(OFFERINGS_LS_KEY);
  }
  return offeringsData;
}

const emptyOfferingsData = { categories: {}, subcategories: {}, offerings: {} };

export function useOfferings() {
  const queryResult = useQuery({
    queryKey: [ OFFERINGS_QUERY_KEY ],
    queryFn: fetchOfferings,
    staleTime: CONFIG.API?.siteDataStaleTime ?? Infinity
  });
  const { data, ...ret } = queryResult;
  const offeringsData: OfferingsData = data || emptyOfferingsData;
  return {
    ...ret,
    ...offeringsData
  }
}
