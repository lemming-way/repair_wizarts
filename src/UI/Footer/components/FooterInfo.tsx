import React from 'react';

import { useLanguage } from '../../../state/language';

const FooterInfo = () => {
  const text = useLanguage();

  return (
    <div>
      <ul>
        <li>
          <a href="tel:+7(969)7148750">{text("Phone")}: +7 (969) 7148750</a>
        </li>
        <li>
          {text("Address")}: {text("City SPB Kakhovskogo 7")}
        </li>
        <li>
          ({text("Custom address note")})
        </li>
        <li>
          {text("We work daily")} 10:00 - 20:00,
        </li>
        <li>
          {text("No breaks or days off")}
        </li>
      </ul>
    </div>
  );
};

export default FooterInfo;
