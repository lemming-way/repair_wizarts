import React, { useMemo, useState, useRef } from 'react';
import ReactDom from 'react-dom';
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from 'app/state/language';
import { useGlobalState } from 'app/state/global';
import { ContractorDetails } from './ContractorDetails';

function queryYMaps() {
  if (window.ymaps3) {
    const ymaps3 = window.ymaps3;
    ymaps3.import.registerCdn( 'https://cdn.jsdelivr.net/npm/{package}', '@yandex/ymaps3-default-ui-theme@latest' );

    return Promise.all([
      ymaps3.import('@yandex/ymaps3-reactify'),
      ymaps3.import( '@yandex/ymaps3-controls@0.0.1' ),
      ymaps3.import('@yandex/ymaps3-default-ui-theme'),
      ymaps3.ready
    ]).then( results => {
        const reactify = results[0].reactify.bindTo( React, ReactDom );
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapControls, YMapScaleControl } = reactify.module( ymaps3 );
        const { YMapZoomControl, YMapGeolocationControl } = reactify.module( results[1] );
        const { YMapDefaultMarker } = reactify.module( results[2] );
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

function Map(props) {
  const {
    contractors,
    // selectedContractor, // Временно не используется внутри этого компонента
    selectContractor, // Функция из родителя для выбора мастера
  } = props;
  const text = useLanguage();
  const { data: YMaps } = useQuery({
    queryKey: [ 'YMaps' ],
    queryFn: queryYMaps,
    placeholderData: null
  });
  const mapLocation = useGlobalState( 'map:location' );

  const [hoveredContractor, setHoveredContractor] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // useMemo для стабилизации ссылки
  const mapDefaultLocation = useMemo( () => {
    return {
      center: [ mapLocation.longitude, mapLocation.latitude ],
      zoom: 10
    };
  }, [ mapLocation.latitude, mapLocation.longitude ] );

  // todo: это временный блок для назначения фиктивных координат пользователям
  // позже его нужно будет удалить
  const contractorsFiction = useMemo( () => {
    return contractors?.map( contractor => {
      const longitude = mapDefaultLocation.center[0] + Math.round( 10000 * ( Math.random() * 0.3 - 0.15 ) ) / 10000;
      const latitude = mapDefaultLocation.center[1] + Math.round( 10000 * ( Math.random() * 0.3 - 0.15 ) ) / 10000;

      return {
        ...contractor,
        coordinates: { latitude, longitude }
      };
    } );
  }, [ contractors, mapDefaultLocation ] );

  const handleMouseEnter = id => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
    setHoveredContractor(id);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredContractor(null);
    }, 300); // небольшая задержка перед скрытием
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
    { YMaps ?
      <YMaps.YMap location={mapDefaultLocation}>
        <YMaps.YMapDefaultSchemeLayer />
        <YMaps.YMapDefaultFeaturesLayer />

        <YMaps.YMapDefaultMarker
          coordinates={mapDefaultLocation.center}
          iconName='fallback'
          size='normal'
          title={text('You are here')}
          color='red'
        />
        {/* Перебираем мастеров и создаем для каждого метку */}
        {contractorsFiction
          ?.filter(v => !!v.coordinates)
          .map((v) => (
            <YMaps.YMapDefaultMarker
              key={`${v.id} ${v.coordinates.longitude} ${v.coordinates.latitude}`}
              coordinates={[v.coordinates.longitude, v.coordinates.latitude]}
              iconName='auto_parts'
              size='small'
              color='green'
              popup={{
                content: () => <ContractorDetails contractor={v} />,
                position: 'bottom',
                offset: 16,
                show: hoveredContractor === v.id
              }}
              onMouseEnter={() => handleMouseEnter(v.id)}
              onMouseLeave={handleMouseLeave}
              onClick={() => selectContractor(v)}
            />
        ))}
      </YMaps.YMap>
      :
      text('Yandex maps not loaded')
    }
    </div>
  );
}

export default Map;
