import React, { useMemo } from 'react';
import ReactDom from 'react-dom';
import { useQuery } from '@tanstack/react-query';

import { useUIState } from '../../state/ui/UIStateContext';

// --- НАЧАЛО: ИСПРАВЛЕННЫЙ КОМПОНЕНТ MAP ---
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
    masters,
    // selectedMaster, // Больше не нужен внутри этого компонента
    selectMaster, // Функция из родителя для выбора мастера
  } = props;
  const YMaps = useQuery( { queryKey: [ 'YMaps' ], queryFn: queryYMaps, placeholderData: null } ).data;
  const ui = useUIState();

  const mapDefaultLocation = useMemo( () => {
    return {
      center: [ ui.location.longitude, ui.location.latitude ],
      zoom: 10
    };
  }, [ ui.location.latitude, ui.location.longitude ] );

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
          title='Вы здесь'
          color='red'
        />
      {/* Перебираем мастеров и создаем для каждого метку */}
      {masters?.map((v) => (
        <YMaps.YMapDefaultMarker
          key={v.id}
          coordinates={[v.longitude, v.latitude]}
          iconName='auto-parts'
          size='normal'
          color='red'
          // --- ИЗМЕНЕНИЕ: Передаем весь объект мастера в функцию selectMaster ---
          onClick={() => selectMaster(v)}
        />
      ))}
      </YMaps.YMap>
      :
      'Яндекс карты не загрузились'
    }
    </div>
  );
}
// --- КОНЕЦ: ИСПРАВЛЕННЫЙ КОМПОНЕНТ MAP ---

export default Map;
