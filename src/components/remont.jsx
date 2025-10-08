import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import style from './remont.module.css';

import '../scss/remont.css';

function Remont() {
  const { sectionId, subsectionId } = useParams();
  const normalizedSectionId = sectionId ? String(sectionId) : '';
  const [currentServices, setCurrentServices] = useState([]);
  console.log(sectionId, subsectionId);
  const { categories } = useSelector((state) => state.categories);

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

    document.title = 'Ремонт iPhone';
    getData();
  }, [sectionId]);
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
      <p>Выберите модель iPhone, чтобы узнать стоимость ремонта.</p>
      <Link
        to={'/client/requests/create/title'}
        className="header__button"
        style={{ padding: '15px 40px' }}
      >
        Заказать на бирже
      </Link>

      <div className="remont__card__list" style={{ marginTop: 100 }}>
        {currentServices.length === 0
          ? 'Ничего не найдено'
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
