import style from '../serviceDetail.module.scss';
import '../../../scss/detail.scss';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function ServiceDetailSkeleton() {
  return (
    <>
      <section className={`main__info container detail-container ${style.container_service}`}>
        <div className="main__info__content">
          <h1>{skeletonLine('320px', 28)}</h1>
          <div className="df align-center" style={{ gap: 8 }}>
            <div className="paugfheotw" style={{ background: '#eee', width: 24, height: 24, borderRadius: 4 }} />
            <div className="searchaproblemEnter" style={{ background: '#eee', height: 36, borderRadius: 8, flex: 1 }} />
          </div>

          <div className={`main__info__image ${style.iphone_mobile}`}>
            <div className={style.iphone_mobile__img} style={{ background: '#f3f3f3', height: 260, borderRadius: 12 }} />
            <p>{skeletonLine('80%', 16)}</p>
          </div>

          <div className={`order__cards__to__scrolls ${style.orders_list}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`first__s__card ${style.order_row}`}>
                <div className="main__info__content__card" style={{ width: '100%' }}>
                  <div className="main__card__first">
                    {skeletonLine('60%')}
                  </div>
                  <div style={{ flex: 1 }} />
                  <div className="main__card__price">
                    {skeletonLine('60px', 20)}
                  </div>
                  <div className="main__card__second">
                    {skeletonLine('120px', 16)}
                    {skeletonLine('100px', 32)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`main__info__image ${style.iphone_desktop}`}>
          <div style={{ width: '540px', height: '570px', background: '#f3f3f3', borderRadius: 12 }} />
          <p>{skeletonLine('80%', 16)}</p>
        </div>
      </section>

      <section className="detail__price">
        <div className="container detail-price-container">
          <div className={style.swiper_price} style={{ background: '#f3f3f3', height: 140, borderRadius: 8 }} />
        </div>
      </section>
    </>
  );
}
