import React from "react";
import { Link } from "react-router-dom";

import { useLanguage } from '../state/language';
import { useServicesQuery } from '../hooks/useServicesQuery';

function App() {
  const { services } = useServicesQuery();
  const serviceTypes = Array.isArray((services as any)?.service_types)  // todo: здесь какая-то путаница, надо разобраться
    ? (services as any).service_types
    : Array.isArray(services)
    ? (services as any)
    : [];
  const text = useLanguage();

  return (
    <footer id="footer">
      <div className="container">
        <ul>
          <li>
            <a href="tel:+79697148750">{text('Phone')}: +7 (969) 7148750</a>
          </li>
          <li>
            <a href="#">{text("Address")}: г. СПБ. Каховского 7</a>
          </li>
          <li>
            <a href="#">{text('Write your own address')}</a>
          </li>
          <li>
            <a href="#">{text('Open daily 10:00 - 20:00,')}</a>
          </li>
          <li>
            <a href="#">{text('without breaks and days off')}</a>
          </li>
        </ul>
        <div className="contfff">
          <ul>
            {serviceTypes.map((v) => (
              <li key={v.id}>
                <Link to={`/devices/${v.id}`}>{v.name}</Link>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <Link to="/articles">{text('Articles')}</Link>
            </li>
            <li>
              <Link to="/reviews">{text('Reviews')}</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default App;
