import { useMemo, useState, useRef } from 'react';

import { useLanguage } from 'app/state/language';
import { useGlobalState } from 'app/state/global';
import YMap, { YMapDefaultMarker } from './MapBase';
import { ContractorDetails } from './ContractorDetails';

function ContractorsMap({
  contractors,
  // selectedContractor, // Временно не используется внутри этого компонента
  selectContractor, // Функция из родителя для выбора мастера
}) {
  const text = useLanguage();
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
    <YMap location={mapDefaultLocation}>
      <YMapDefaultMarker
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
          <YMapDefaultMarker
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
    </YMap>
  );
}

export default ContractorsMap;
