import React from 'react';

// import {useService} from "../../../../../hooks/useService";
// import {getCounters} from "../../../../../services/index.service";
import styles from './HeroSectionCounters.module.scss';
import { useLanguage } from '../../../../../state/language';

const HeroSectionCounters = () => {
  // const counters = useService(getCounters, {});
  const text = useLanguage();
  // Кружочки вставила через свойство background,
  // т.к. нежелательно создавать пустые элементы,
  // можно вставить через свойство background или псевделементы ::before, ::after.
  // Почему не через тег img ? Потому что это не контентная картинка, а украшение страницы

  return (
    <div className={styles.heroSectionCounters}>
      {/*На данный момент сервер не работает, поэтому закомментировала данные из сервера*/}
      <div className={styles.heroSectionCounters_item}>{text("Number of users on the site")}:
        100
        {/*{counters.data.masters}*/}
      </div>
      <div className={styles.heroSectionCounters_item}>{text("Orders completed on the site")}: 
        300
        {/*{counters.data.submissions}*/}
      </div>
      <div className={styles.heroSectionCounters_item}>
        {text("Requests completed on the site")}: 300
      </div>
      <div className={styles.heroSectionCounters_item}>
        200 {text("New tasks this month")}
      </div>
    </div>
  );
};

export default HeroSectionCounters;
