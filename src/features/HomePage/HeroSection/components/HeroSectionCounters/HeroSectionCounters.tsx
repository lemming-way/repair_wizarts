import React from 'react';
// import {useService} from "../../../../../hooks/useService";
// import {getCounters} from "../../../../../services/index.service";
import styles from './HeroSectionCounters.module.scss';

const HeroSectionCounters = () => {
  // const counters = useService(getCounters, {});

  // Кружочки вставила через свойство background,
  // т.к. нежелательно создавать пустые элементы,
  // можно вставить через свойство background или псевделементы ::before, ::after.
  // Почему не через тег img ? Потому что это не контентная картинка, а украшение страницы

  return (
    <div className={styles.heroSectionCounters}>
      {/*На данный момент сервер не работает, поэтому закомментировала данные из сервера*/}
      <div className={styles.heroSectionCounters_item}>Количество участников на сайте:
        100
        {/*{counters.data.masters}*/}
      </div>
      <div className={styles.heroSectionCounters_item}>Выполнено заказов на сайте:
        300
        {/*{counters.data.submissions}*/}
      </div>
      <div className={styles.heroSectionCounters_item}>
        Выполнено заявок на сайте: 300
      </div>
      <div className={styles.heroSectionCounters_item}>
        200 новых заданий за месяц
      </div>
    </div>
  );
};

export default HeroSectionCounters;