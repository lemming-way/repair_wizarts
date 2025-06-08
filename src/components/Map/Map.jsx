import { withYMaps } from 'react-yandex-maps';
import { useSelector } from 'react-redux';
import { Map as YandexMap, SearchControl, Placemark } from 'react-yandex-maps';
import { selectUI } from '../../slices/ui.slice';

// --- НАЧАЛО: ИСПРАВЛЕННЫЙ КОМПОНЕНТ MAP ---
const Map = (props) => {
  const {
    masters,
    // selectedMaster, // Больше не нужен внутри этого компонента
    selectMaster, // Функция из родителя для выбора мастера
  } = props;
  const ui = useSelector(selectUI);

  return (
    <YandexMap
      state={{
        center: [ui.location.latitude, ui.location.longitude],
        zoom: 10,
      }}
      options={{
        suppressMapOpenBlock: true,
      }}
      height="500px"
      width="100%"
    >
      <SearchControl options={{ fitMaxWidth: true, maxWidth: '660px' }} />
      Метка: Москва (или текущее местоположение пользователя)
      <Placemark
        geometry={[ui.location.latitude, ui.location.longitude]}
        options={{
          iconColor: '#ff0000',
          preset: 'islands#redDotIcon',
        }}
        properties={{
          hintContent: 'Вы здесь',
        }}
      />
      {/* Перебираем мастеров и создаем для каждого метку */}
      {masters?.map((v) => (
        <Placemark
          key={v.id}
          geometry={[v.latitude, v.longitude]}
          // --- ИЗМЕНЕНИЕ: Передаем весь объект мастера в функцию selectMaster ---
          onClick={() => selectMaster(v)}
          options={{
            // Просто стилизуем метку, без балуна
            preset: 'islands#blueRepairShopIcon',
          }}
        />
      ))}
    </YandexMap>
  );
};
// --- КОНЕЦ: ИСПРАВЛЕННЫЙ КОМПОНЕНТ MAP ---

// Оборачиваем компонент в HOC от Яндекс.Карт, но уже не запрашиваем templateLayoutFactory
export default withYMaps(Map, true);
