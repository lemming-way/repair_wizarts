import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import style from './remont.module.css';
import { useLanguage } from '../state/language';

import '../scss/remont.css';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';

function Remont() {
  const text = useLanguage();
  const { sectionId, subsectionId } = useParams();
  const normalizedSectionId = sectionId ? String(sectionId) : '';
  const [currentServices, setCurrentServices] = useState([]);
  console.log(sectionId, subsectionId);
  const { categories } = useCategoriesQuery();

  useEffect(() => {
    const getData = async () => {
      try {
        const subsectionResponse = await fetch(
          `https://profiback.itest24.com/api/subsections/?section_id=${sectionId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${'123'}`,
            },
          },
        );
        const subsections = await subsectionResponse.json();
        console.log(subsections);
        setCurrentServices(subsections);
      } catch (error) {
        console.error(error);
      }
    };

    document.title = text('iPhone repair');
    getData();
  }, [sectionId, text]);
  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get(
      'search',
    );
    if (searchParam) {
      setCurrentServices(
        currentServices.filter((item) => item.name === searchParam),
      );
    }
  }, [currentServices]);
  const selectedService = categories.find(
    (item) => String(item.id) === normalizedSectionId,
  );
  const searchParam = new URLSearchParams(window.location.search).get('search');
  return (
    <section
      className={`container remont remont-container ${style.devices_block}`}
    >
      <h1>{searchParam ? searchParam : selectedService?.name}</h1>
      <p>{text('Select an iPhone model to find out the cost of repair.')}</p>
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
          : currentServices.map((dev) => (
              <div className="remont__card" key={dev.id}>
                <Link
                  to={`/services/${sectionId}/${subsectionId}/${dev.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="remont__card__image">
                    <img
                      src={'/img/master-profile_img/phon.png'}
                      alt=""
                      style={{
                        width: '130px',
                        height: '170px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <p>{dev?.name}</p>
                </Link>
              </div>
            ))}
      </div>
    </section>
  );
}

export default Remont;
