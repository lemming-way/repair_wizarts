import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import CONFIG from '../constants';
import { useGlobalState } from './global';
import { SiteData, getSiteData, getSiteDataVersion } from './api/site-data';

const SITE_DATA_LS_KEY = 'site_data';
const SITE_DATA_QUERY_KEY = 'site_data';

async function fetchSiteData() {
  const cachedData = JSON.parse(localStorage.getItem(SITE_DATA_LS_KEY) ?? 'null');
  if (cachedData) {
    const siteVersion = await getSiteDataVersion();
    if (siteVersion === cachedData.version) {
      return cachedData;
    }
  }

  const data = await getSiteData();
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

function useSiteData() {
  return useQuery<SiteData>({
    queryKey: [ SITE_DATA_QUERY_KEY ],
    queryFn: fetchSiteData,
    staleTime: CONFIG.API.siteDataStaleTime || Infinity
  });
}

export function useCities(country: string = 'ru'): Record<number, string> {
  const siteData = useSiteData().data;
  const language = useGlobalState('language');
  return useMemo(() => {
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
  }, [ siteData, language, country ]);
}
