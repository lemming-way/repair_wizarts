import React from 'react';
import ReactDom from 'react-dom';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from 'app/state/language';

function queryYMaps() {
  if (window.ymaps3) {
    const ymaps3 = window.ymaps3;
    ymaps3.import.registerCdn( 'https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest' );

    return Promise.all([
      ymaps3.import('@yandex/ymaps3-reactify'),
      ymaps3.import('@yandex/ymaps3-default-ui-theme'),
      ymaps3.ready
    ]).then( results => {
        const reactify = results[0].reactify.bindTo( React, ReactDom );
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapControls, YMapScaleControl } = reactify.module( ymaps3 );
        const { YMapZoomControl, YMapGeolocationControl, YMapDefaultMarker } = reactify.module( results[1] );
        return {
          YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapControls, YMapScaleControl,
          YMapZoomControl, YMapGeolocationControl,
          YMapDefaultMarker
        };
      } );
  }
  else {
    return Promise.reject();
  }
}

function useYMaps() {
  const { data: YMaps } = useQuery({
    queryKey: [ 'YMaps' ],
    queryFn: queryYMaps,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ['data'],
    placeholderData: null
  });
  return YMaps;
}

function YMap({
  location,
  children
}) {
  const YMaps = useYMaps();
  const text = useLanguage();
  return (
    <div style={{ width: '100%', height: '500px' }}>
    { YMaps ?
      <YMaps.YMap location={location}>
        <YMaps.YMapDefaultSchemeLayer />
        <YMaps.YMapDefaultFeaturesLayer />
        {children}
      </YMaps.YMap>
      :
      text('Yandex maps not loaded')
    }
    </div>
  );
}

const exportNames = [ 'YMapFeature', 'YMapControls', 'YMapDefaultMarker' ];
const exports = {};
for (const name of exportNames) {
  exports[name] = ({children, ...props}) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const YMaps = useYMaps();
    const Component = YMaps?.[name];
    return Component ?
      <Component {...props}>
        {children}
      </Component>
      : null;
  }
}

export const YMapFeature = exports.YMapFeature;
export const YMapControls = exports.YMapControls;
export const YMapDefaultMarker = exports.YMapDefaultMarker;

export default YMap;
