import React from 'react';
import { Link } from 'react-router-dom';
import { Rating } from 'react-simple-star-rating';

import { ImageSwiper } from 'app/shared/ui';
import { useLanguage } from 'app/state/language';
import { BusinessModel } from 'app/state/user'
import style from './CreateDirect.module.scss';

function ContractorInfoModals({
  selectedContractor,
  categories,
  subcategories,
  products,
  showSmallModal,
  showBigModal,
  handleCloseModals,
  handleShowBigModal,
}) {
  const text = useLanguage();

  if (!selectedContractor.id) {
    return null;
  }

  const contractorProducts = Object.keys(selectedContractor.services || {}).map(id => products[id]).filter(Boolean);
  const contractorSubcategories = [...new Set(contractorProducts.map(p => subcategories[p.parent]).filter(Boolean))];
  const contractorCategories = [...new Set(contractorSubcategories.map(s => categories[s.parent]).filter(Boolean))];

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
              <img src="/img/close.svg" alt={text("Close")} />
            </div>

            <div className="info_contractor__row1">
              <img className={style.avatarImg} src={selectedContractor.avatar || "/img/user_avatar.png"} alt="" />
              <div className="info_contractor__about">
                <p>{selectedContractor.fullname}</p>
                <p>{text(selectedContractor.businessModel)}</p>
                <div className="info_contractor__stars">
                  <Rating
                    size={18}
                    readonly
                    initialValue={4.2/* selectedContractor.rating  todo: Добавить загрузку рейтинга */}
                    allowFraction
                    fillColor="#FFC107"
                    emptyColor="#E4E5E9"
                  />
                </div>
                <div className="info_contractor__row-links">
                  <Link to={`/client/feedback/${selectedContractor.id}`}>
                    {11/* selectedContractor.reviews  todo: Добавить загрузку отзывов*/} {text('reviews received')}
                  </Link>
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

            <p className="info_contractor__info">
              <span className="info_contractor__text-about-light">
                {text('Address')}
              </span>
              {selectedContractor.address}
            </p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Organization name')}
              </span>
              {(selectedContractor.businessModel === BusinessModel.ServiceCenter && selectedContractor.organizationName) || text('No organization')}
            </p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Experience')}
              </span>
              {selectedContractor.experience} {text('year(s)')}
            </p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('On the platform')}
              </span>
              {text('since')} {selectedContractor.registrationDate.getFullYear()}
            </p>
            <p className="info_contractor__text-about">
              <span className="info_contractor__text-about-light">
                {text('Status')}
              </span>
              {text(selectedContractor.isOnline ? 'Online' : 'Offline')}
            </p>
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Orders completed')}
              </span>
              {22/* selectedContractor.ordersCompleted  todo: Добавить реальную статистику */}
            </p>
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Orders delivered successfully')}
              </span>
              {18/* selectedContractor.successRate  todo: Добавить реальную статистику */}
            </p>
            <p className="info_contractor__text-about--accent">
              <span className="info_contractor__text-about-light">
                {text('Repeat orders')}
              </span>
              {2/* selectedContractor.repeatOrders  todo: Добавить реальную статистику */}
            </p>
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

              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Category type')}
                </span>
                {contractorCategories.map(item => item.name).join(', ')}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Category')}
                </span>
                {contractorSubcategories.map(item => item.name).join(', ')}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Offerings')}
                </span>
                {contractorProducts.map(item => item.name).join(', ')}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text('Business model')}
                </span>
                {text(selectedContractor.businessModel)}
              </p>
              <p className="info_contractor_big__text-about">
                <span className="info_contractor_big__text-about-light">
                  {text(selectedContractor.businessModel === BusinessModel.ServiceCenter ? 'About the organization' : 'About me')}:
                </span>
              </p>
              <p className="info_contractor_big__text">
                {selectedContractor.description || text('No description')}
              </p>

              <div>
                <ImageSwiper
                  className={style.swiper}
                  navigation={true}
                  images={selectedContractor.photos}
                />
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
