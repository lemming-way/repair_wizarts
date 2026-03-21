import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import style from './remont.module.css';
import { useLanguage } from '../state/language';

import '../scss/remont.css';
import { useServices } from '../state/site-data';

function Remont() {
  const text = useLanguage();

  const { id } = useParams();
  const subcategoryId = isFinite(id) ? Number(id) : 0;
  const [ searchParams ] = useSearchParams();
  const search = searchParams.get('search');

  const { subcategories, services } = useServices();

  const selectedSubcategory = subcategories[subcategoryId];
  const serviceIds = selectedSubcategory?.services || [];
  const subcategoryServices = serviceIds.map( id => ({
    id,
    name: services[id].name
  }) );
  const currentServices = search ? subcategoryServices.filter( item => item.name === search ) : subcategoryServices;

  useEffect(() => {
    document.title = text('iPhone repair');  // todo: Изменить текст
  }, [text]);

  return (
    <section
      className={`container remont remont-container ${style.devices_block}`}
    >
      <h1>{search || selectedSubcategory?.name || ''}</h1>
      <p>{text('Select an iPhone model to find out the cost of repair.')  /* todo: Изменить текст */}</p>
      <Link
        to={'/client/requests/create/title'}
        className="header__button"
        style={{ padding: '15px 40px' }}
      >
        {text('Order on exchange')}
      </Link>

      <div className="remont__card__list" style={{ marginTop: 100 }}>
        {currentServices.length === 0
          ? text('Nothing found')
          : currentServices.map(service => (
              <div className="remont__card" key={service.id}>
                <Link
                  to={`/services/${service.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="remont__card__image">
                    <img
                      src={'/img/contractor-profile_img/phon.png'}
                      alt=""
                      style={{
                        width: '130px',
                        height: '170px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <p>{service.name}</p>
                </Link>
              </div>
            ))}
      </div>
    </section>
  );
}

export default Remont;
