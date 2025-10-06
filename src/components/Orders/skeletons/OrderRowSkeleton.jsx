import style from '../OrderRow.module.css';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function OrderRowSkeleton() {
  return (
    <div className={style.order_row}>
      <div className={style.left}>
        <div className={style.profile}>
          <div className={style.avatar} style={{ background: '#eee' }} />
          <div className={style.profile__col}>
            <div className={style.name} style={{ background: '#eee', height: 20, width: 140 }} />
            {skeletonLine('180px')}
            {skeletonLine('140px')}
          </div>
        </div>
        {skeletonLine('80%')}
        {skeletonLine('60%')}
      </div>
      <div className={style.right}>
        <div>
          <span className={style.price} style={{ background: '#eee', height: 24, width: 80, display: 'inline-block' }} />
        </div>
        <div className={style.swiper} style={{ background: '#f3f3f3', height: 120, borderRadius: 8 }} />
        <div className={style.button} style={{ background: '#eee', color: 'transparent' }}>...</div>
      </div>
    </div>
  );
}
