import allordersStyle from '../Allorders.module.css';
import masterStyle from '../MyOrdersMaster.module.css';

const skeletonLine = (width = '100%', height = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height, width }} />
);

export default function OrdersTableSkeleton({ variant = 'allorders' }) {
  const s = variant === 'myordersmaster' ? masterStyle : allordersStyle;

  if (variant === 'myordersmaster') {
    return (
      <div className={s.table_wrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>{skeletonLine('80px', 18)}</th>
              <th>{skeletonLine('70px', 18)}</th>
              <th>{skeletonLine('70px', 18)}</th>
              <th>{skeletonLine('70px', 18)}</th>
              <th>{skeletonLine('60px', 18)}</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td>{skeletonLine('180px')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: '#eee',
                        marginRight: 10,
                      }}
                    />
                    {skeletonLine('120px')}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        background: '#eee',
                        marginRight: 10,
                      }}
                    />
                    {skeletonLine('120px')}
                  </div>
                </td>
                <td>{skeletonLine('80px')}</td>
                <td>{skeletonLine('100px', 20)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={s.allorders}>
      <div className={s.heading_table}>
        <div className={`fsdfsaooo mobile-big_nav-text_1 ${s.heading_table_row}`}>
          <p className="inter">{skeletonLine('100px', 20)}</p>
          <div className={s.empty}></div>
          <p className="inter">{skeletonLine('80px', 20)}</p>
          <p className="inter">{skeletonLine('60px', 20)}</p>
        </div>
      </div>

      {[...Array(5)].map((_, i) => (
        <div key={i} className={`${s.row_order} ${i === 0 ? s.first_row : ''}`}>
          <div className={s.block_title}>
            <h3 className={s.heading}>{skeletonLine('220px')}</h3>
            <p className={s.text_navigation}>{skeletonLine('140px')}</p>
            <div className={s.row}>
              <p>{skeletonLine('90px')}</p>
              <p>{skeletonLine('120px')}</p>
            </div>
          </div>

          <div className={s.modile_col}>
            <div className={s.block_author}>
              <div style={{ position: 'relative' }}>
                <div className={s.dotted_wrap}>
                  <div style={{ width: 12, height: 12, background: '#eee', borderRadius: 6 }} />
                </div>
                <div
                  style={{ width: 100, height: 100, borderRadius: 50, background: '#eee' }}
                />
              </div>
              <div className={s.col}>
                <p>{skeletonLine('140px')}</p>
                <p>{skeletonLine('120px')}</p>
                <p>{skeletonLine('100px')}</p>
              </div>
            </div>

            <div className={s.block_price}>
              <p className={s.price}>{skeletonLine('80px', 24)}</p>
              <p className={s.status}>
                <div style={{ width: 25, height: 25, background: '#eee', borderRadius: 4, marginRight: 10 }} />
                {skeletonLine('90px', 18)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
