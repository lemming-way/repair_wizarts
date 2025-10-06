import React from 'react';
import style from './Balance.module.css';

const Line = ({ width = '100%', height = 16, style: s = {} }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 8,
      background: 'linear-gradient(90deg, #f0f0f0 0%, #e6e6e6 50%, #f0f0f0 100%)',
      ...s,
    }}
  />
);

const BalanceSkeleton: React.FC = () => {
  return (
    <div className={style.main}>
      <Line width="30%" height={24} style={{ marginBottom: 16 }} />

      <div className={style.wrap_row1}>
        <Line width="140px" height={28} />
        <div style={{ flex: 1 }} />
        <div className={style.buttons_row}>
          <Line width="205px" height={40} />
          <Line width="205px" height={40} />
        </div>
      </div>

      <div className={style.wrap_row2}>
        <Line width="200px" height={40} />
        <Line width="200px" height={40} />
        <Line width="220px" height={40} />
      </div>

      <div className={style.wrap_row3}>
        <Line width="120px" />
        <Line width="40%" />
        <Line width="120px" />
        <Line width="120px" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={style.order_row_v2}>
          <Line width="160px" />
          <Line width="50%" />
          <Line width="120px" />
          <div>
            <Line width="120px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BalanceSkeleton;
