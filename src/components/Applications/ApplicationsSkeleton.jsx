import React from 'react';
import style from './applications.module.css';
import NavApplication from './NavApplication';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function ApplicationsSkeleton() {
  return (
    <>
      <div className="mini-text">
        <h1>{skeletonLine('220px', 28)}</h1>
      </div>
      {/* Навигация */}
      <NavApplication />

      {/* Пустое состояние */}
      <div className={style.empty_orders} style={{ paddingTop: 40 }}>
        <img src="/img/robot.png" alt="" style={{ opacity: 0.2 }} />
        <p className={style.heading}>{skeletonLine('280px', 24)}</p>
        <p style={{ width: '60%' }}>{skeletonLine('100%', 16)}</p>
      </div>

      {/* Карточки заявок (скелетоны) */}
      <div className={style.orders}>
        {[...Array(3)].map((_, i) => (
          <details key={i} className={style.details} open>
            <summary className={style.summary}>
              <div className={style.summary_row}>
                {skeletonLine('140px', 18)}
                {skeletonLine('100px', 18)}
              </div>
              <div className={style.summary_row}>
                {skeletonLine('220px', 18)}
                <p>
                  {skeletonLine('40px', 16)}{' '}
                  <span className={style.price} style={{ display: 'inline-block' }}>
                    {skeletonLine('60px', 20)}
                  </span>
                </p>
              </div>
              <div className={style.summary_row}>
                <div className={style.status} style={{ background: '#e5e5e5', color: 'transparent' }}>
                  ...
                </div>
                <div className={style.flex_empty}></div>
                <div className={style.miniSwiperWrap}>
                  <div className="miniSlider" style={{ background: '#f3f3f3', height: 120, borderRadius: 8 }} />
                </div>
                <div>
                  <img className={style.arrow} src="/img/bot.png" alt="" style={{ opacity: 0.2 }} />
                </div>
              </div>
            </summary>
            <div className={style.details_body}>
              <p className={style.name_heading}>{skeletonLine('160px', 18)}</p>
              <p className={style.text}>{skeletonLine('80%', 16)}</p>

              {/* Чат-инпут */}
              <div className={style.chat_wrap}>
                <input className={style.input_chat} disabled value="" placeholder="" />
                <img className={style.skrepka} src="/img/screpka.png" alt="" style={{ opacity: 0.2 }} />
                <img className={style.smile} src="/img/smile.png" alt="" style={{ opacity: 0.2 }} />
              </div>

              <div className={style.buttons_row}>
                <div className={style.buttons}>
                  <div className={style.button} style={{ background: '#eee', color: 'transparent' }}>...</div>
                  <div className={style.button_back} style={{ background: '#fff', borderColor: '#eee', color: 'transparent' }}>...</div>
                </div>
                <div className={style.timing_row}>
                  {skeletonLine('100px', 18)}
                  <select className={style.select} disabled>
                    <option>{' '}</option>
                  </select>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
