import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import style from './remont.module.css';
import { useLanguage } from '../state/language';

import '../scss/remont.css';
import { useOfferings } from '../state/site-data';

function Remont() {
  const text = useLanguage();

  const { id } = useParams();
  const subcategoryId = isFinite(id) ? Number(id) : 0;
  const [ searchParams ] = useSearchParams();
  const search = searchParams.get('search');

  const { subcategories, offerings } = useOfferings();

  const selectedSubcategory = subcategories[subcategoryId];
  const offeringIds = selectedSubcategory?.offerings || [];
  const subcategoryOfferings = offeringIds.map( id => ({
    id,
    name: offerings[id].name
  }) );
  const currentOfferings = search ? subcategoryOfferings.filter( item => item.name === search ) : subcategoryOfferings;

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
        to={'/client/requests/create/data'}
        className="header__button"
        style={{ padding: '15px 40px' }}
      >
        {text('Order on exchange')}
      </Link>

      <div className="remont__card__list" style={{ marginTop: 100 }}>
        {currentOfferings.length === 0
          ? text('Nothing found')
          : currentOfferings.map(offering => (
              <div className="remont__card" key={offering.id}>
                <Link
                  to={`/services/${offering.id}`}
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
                  <p>{offering.name}</p>
                </Link>
              </div>
            ))}
      </div>
    </section>
  );
}

export default Remont;
