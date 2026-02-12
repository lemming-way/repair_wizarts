import React from 'react';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useLanguage } from '../../state/language';
import style from './ServiceDetail.module.scss';

function ContractorInfoModals({
  selectedContractor,
  showSmallModal,
  showBigModal,
  handleCloseModals,
  handleShowBigModal,
}) {
  const text = useLanguage();

  if (!selectedContractor.id) {
    return null;
  }

  return (
    <div style={{ display: 'flex', position: 'absolute' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 1,
          bottom: '0',
          left: '370px',
          display: 'flex',
          gap: '10px',
        }}
      >
        {showSmallModal && (
          <div className="info_contractor">
            <div
              className="info_contractor__close"
              onClick={handleCloseModals}
              style={{ cursor: 'pointer' }}
            >
              <img src="/img/close.svg" alt="" />
            </div>

            <div className="info_contractor__row1">
              <img src={selectedContractor.avatar || "/img/profile__image.png"} alt="" />
              <div className="info_contractor__about">
                <p>{selectedContractor.name}</p>
                <p>{selectedContractor.description}</p>
                {/*
                <div className="info_contractor__stars">
                  <Rating
                    size={18}
                    readonly
                    initialValue={selectedContractor.rating}
                    allowFraction
                    fillColor="#FFC107"
                    emptyColor="#E4E5E9"
                  />
                </div>
                */}
                <div className="info_contractor__row-links">
                  {/*
                  <Link to={`/client/feedback/${selectedContractor.id}`}>
                    {selectedContractor.reviews} {text('reviews received')}
                  </Link>
                  */}
                  <button
                    type="button"
                    className="info_contractor__row-link"
                    onClick={handleShowBigModal}
                  >
                    {text('Learn more')}
                  </button>
                </div>
              </div>
            </div>

            <p className="info_contractor__info">{selectedContractor.address}</p>
            <p className="info_contractor__info">{text('Open: from 9 to 21')}</p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Organization name')}
              </span>
              {selectedContractor.organizationName}
            </p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Experience')}
              </span>
              {selectedContractor.experience}
            </p>
            {/* Поле 'On the platform since' отсутствует в UserProfile
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('On the platform')}
              </span>
              {text('since')} {selectedContractor.onSiteSince}
            </p>
            */}
            {/* Поле 'Status' отсутствует в UserProfile
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Status')}
              </span>
              {text(selectedContractor.status)}
            </p>
            */}
            {/* Рейтинг закомментирован по запросу
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Rating')}
              </span>
              {selectedContractor.rating}
            </p>
            */}
            {/* Поле 'Orders completed' отсутствует в UserProfile
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Orders completed')}
              </span>
              {selectedContractor.ordersCompleted}
            </p>
            */}
            {/* Поле 'Orders delivered successfully' отсутствует в UserProfile
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Orders delivered successfully')}
              </span>
              {selectedContractor.successRate}
            </p>
            */}
            {/* Поле 'Repeat orders' отсутствует в UserProfile
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Repeat orders')}
              </span>
              {selectedContractor.repeatOrders}
            </p>
            */}
          </div>
        )}
        {showBigModal && (
          <div className="info_contractor_big">
            <div>
              <div
                className="info_contractor__close"
                onClick={handleCloseModals}
                style={{ cursor: 'pointer' }}
              >
                <img src="/img/close.svg" alt="" />
              </div>

              {/* Поля 'Category type', 'Category', 'Brands', 'Your activity', 'Main focus', 'About the organization' отсутствуют в UserProfile */}
              {/*
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Category type')}
                </span>
                {selectedContractor.categoryView}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Category')}
                </span>
                {selectedContractor.categories}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Brands')}
                </span>
                {selectedContractor.brands}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Your activity')}
                </span>
                {selectedContractor.activity}
              </p>

              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Main focus')}
                </span>
                {selectedContractor.mainFocus}
              </p>
              */}
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Business model')}
                </span>
                {text(selectedContractor.businessModel)}
              </p>
              {/*
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('About the organization:')}{' '}
                </span>
              </p>
              <p className="info_contractor_big__text">
                {selectedContractor.aboutOrg}
              </p>
              */}

              <div>
                <Swiper
                  slidesPerView={4}
                  spaceBetween={30}
                  navigation={true}
                  modules={[Navigation]}
                  className={style.swiper}
                  breakpoints={{
                    0: {
                      slidesPerView: 2,
                    },
                    800: {
                      slidesPerView: 2,
                    },
                    1124: {
                      slidesPerView: 3,
                    },
                  }}
                >
                  {/* Слайдер картинок тестовых цен удален todo: Сделать новый блок цен */}
                </Swiper>
              </div>
            </div>

            <div></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractorInfoModals;
