import pageStyle from '../Orders.module.css';
import rowStyle from '../OrderRow.module.css';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function OrdersListSkeleton() {
  return (
    <>
      <div className={pageStyle.order_row} style={{ marginBottom: 20 }}>
        <div>
          <h1 className={pageStyle.heading}>{skeletonLine('220px', 28)}</h1>
          <div className="df" style={{ paddingBottom: 0 }}>
            <div className="two-input" style={{ gap: 12 }}>
              {skeletonLine('160px', 36)}
              {skeletonLine('140px', 36)}
            </div>
          </div>
        </div>
      </div>

      {[...Array(3)].map((_, i) => (
        <div key={i} className={rowStyle.order_row}>
          <div className={rowStyle.left}>
            <div className={rowStyle.profile}>
              <div className={rowStyle.avatar} style={{ background: '#eee' }} />
              <div className={rowStyle.profile__col}>
                <div className={rowStyle.name} style={{ background: '#eee', height: 20, width: 140 }} />
                {skeletonLine('180px')}
                {skeletonLine('140px')}
              </div>
            </div>
            {skeletonLine('80%')}
            {skeletonLine('60%')}
          </div>
          <div className={rowStyle.right}>
            <div>
              <span className={rowStyle.price} style={{ background: '#eee', height: 24, width: 80, display: 'inline-block' }} />
            </div>
            <div className={rowStyle.swiper} style={{ background: '#f3f3f3', height: 120, borderRadius: 8 }} />
            <div className={rowStyle.button} style={{ background: '#eee', color: 'transparent' }}>...</div>
          </div>
        </div>
      ))}
    </>
  );
}
