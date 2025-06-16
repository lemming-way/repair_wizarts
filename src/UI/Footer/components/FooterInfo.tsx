import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const FooterInfo = () => {
  const { t } = useLanguage();

  return (
    <div>
      <ul>
        <li>
          <a href="tel:+7(969)7148750">{t("Phone")}: +7 (969) 7148750</a>
        </li>
        <li>
          {t("Address")}: {t("City SPB Kakhovskogo 7")}
        </li>
        <li>
          ({t("Custom address note")})
        </li>
        <li>
          {t("We work daily")} 10:00 - 20:00,
        </li>
        <li>
          {t("No breaks or days off")}
        </li>
      </ul>
    </div>
  );
};

export default FooterInfo;