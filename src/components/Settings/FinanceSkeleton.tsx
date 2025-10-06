import React from 'react';
import style from './finance.module.css';

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

const FinanceSkeleton: React.FC = () => {
  return (
    <div className={style.main}>
      <Line width="40%" height={24} style={{ marginBottom: 16 }} />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={style.payment_block}>
          <Line width="30%" height={18} style={{ marginBottom: 8 }} />
          <div className={style.payment_block__row}>
            <Line width="48px" height={32} />
            <Line width="280px" height={40} />
          </div>
        </div>
      ))}

      <div>
        <Line width="260px" height={40} />
      </div>
    </div>
  );
};

export default FinanceSkeleton;
