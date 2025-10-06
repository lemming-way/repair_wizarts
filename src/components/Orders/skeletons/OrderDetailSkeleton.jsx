import styles from '../MyOrder.module.css';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function OrderDetailSkeleton() {
  return (
    <div className={styles.main_block}>
      <div className={styles.heading_row}>
        <h1>{skeletonLine('200px', 28)}</h1>
        <button className={styles.button_back}>{skeletonLine('120px', 40)}</button>
      </div>

      <div className={styles.block_order}>
        <div className={styles.left}>
          <div className={styles.left_row}>
            <div
              style={{ width: 120, height: 120, borderRadius: 60, background: '#eee' }}
            />
            <div className={styles.block_info}>
              <h2>{skeletonLine('160px', 22)}</h2>
              <h3>{skeletonLine('140px')}</h3>
              <h3>{skeletonLine('120px')}</h3>
            </div>
          </div>

          <div className={styles.description}>
            <p>{skeletonLine('80%')}</p>
            <p>{skeletonLine('60%')}</p>
          </div>

          <div className={styles.left_row_bottom}>
            <p>{skeletonLine('100px')}</p>
            <p className={styles.view}>
              <div style={{ width: 20, height: 20, background: '#eee', borderRadius: 10 }} />
              {skeletonLine('80px')}
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <p>
            <span className={styles.price}>{skeletonLine('80px', 24)}</span>
          </p>

          <div className={styles.swiper}>
            <div style={{ background: '#f3f3f3', height: 180, borderRadius: 8 }} />
          </div>

          <div className={styles.order_row}>
            <div className={styles.order_button}>{skeletonLine('150px', 32)}</div>
            <div className={styles.buttons_icon}>
              <div>
                <div style={{ width: 30, height: 30, background: '#eee', borderRadius: 6 }} />
              </div>
              <div>
                <div style={{ width: 30, height: 30, background: '#eee', borderRadius: 6 }} />
              </div>
              <div>
                <div style={{ width: 30, height: 30, background: '#eee', borderRadius: 6 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2>{skeletonLine('220px')}</h2>
        <p className={styles.heading}>{skeletonLine('180px')}</p>
        <div className={styles.about_block}>
          <div className={styles.about_row}>
            <div className={styles.left_row}>
              <div
                style={{ width: 80, height: 80, borderRadius: 40, background: '#eee' }}
              />
              <div className={styles.block_info}>
                <p>{skeletonLine('160px')}</p>
                <p>{skeletonLine('120px')}</p>
                <p className={styles.star_block}>
                  <div style={{ width: 100, height: 20, background: '#eee', borderRadius: 4 }} />
                </p>
              </div>
            </div>

            <div>
              <p className={styles.about__description}>{skeletonLine('200px')}</p>
              <p className={styles.about__description}>{skeletonLine('250px')}</p>
            </div>

            <div>
              <p className={styles.about__description}>{skeletonLine('200px')}</p>
              <p className={styles.about__description}>{skeletonLine('180px')}</p>
              <p className={styles.about__description}>{skeletonLine('120px')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
