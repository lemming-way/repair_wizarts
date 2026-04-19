import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import 'app/scss/remont.css';
import style from './ServicesPage/ServicesPage.module.css';
import { useLanguage } from 'app/state/language';
import { useProducts } from 'app/state/site-data';

function ServicesPage() {
  const text = useLanguage();

  const { id } = useParams();
  const subcategoryId = isFinite(id) ? Number(id) : 0;
  const [ searchParams ] = useSearchParams();
  const search = searchParams.get('search');

  const { subcategories, products } = useProducts();

  const selectedSubcategory = subcategories[subcategoryId];
  const productIds = selectedSubcategory?.products || [];
  const subcategoryProducts = productIds.map( id => ({
    id,
    name: products[id].name
  }) );
  const currentProducts = search ? subcategoryProducts.filter( item => item.name === search ) : subcategoryProducts;

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
        {currentProducts.length === 0
          ? text('Nothing found')
          : currentProducts.map(product => (
              <div className="remont__card" key={product.id}>
                <Link
                  to={`/services/${product.id}`}
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
                  <p>{product.name}</p>
                </Link>
              </div>
            ))}
      </div>
    </section>
  );
}

export default ServicesPage;
