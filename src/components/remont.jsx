import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectServices } from '../slices/services.slice';
import SERVER_PATH from '../constants/SERVER_PATH';
import style from './remont.module.css';

import '../scss/remont.css';

function Remont() {
  const id = 1;

  const { sectionId, subsectionId } = useParams();
  const [currentServices, setCurrentServices] = useState([]);
  console.log(sectionId, subsectionId);
  const { categories } = useSelector((state) => state.categories);
  useEffect(() => {
    document.title = 'Ремонт iPhone';
    getData();
  }, []);
  useEffect(() => {
    const searchParam = new URLSearchParams(window.location.search).get(
      'search',
    );
    if (searchParam) {
      setCurrentServices(
        currentServices.filter((item) => item.name === searchParam),
      );
    }
  }, [currentServices.length]);
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
  const selectedService = categories.find((item) => item.id == sectionId);
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
