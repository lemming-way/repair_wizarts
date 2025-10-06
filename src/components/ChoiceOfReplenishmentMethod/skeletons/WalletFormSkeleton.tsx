import React from 'react';
import style from '../style.module.css';
import '../../..//scss/ChoiceOfReplenishmentMethod.css';

type LineProps = { width?: string; height?: number; style?: React.CSSProperties };
const Line: React.FC<LineProps> = ({ width = '100%', height = 16, style: s }) => (
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

export const WalletFormSkeleton: React.FC = () => {
  return (
    <div className={style.main_block}>
      <div className="middle-block-1" style={{ width: '100%', maxWidth: 820 }}>
        <Line width="40%" height={32} style={{ marginBottom: 12 }} />
        <Line width="30%" height={22} style={{ marginBottom: 16 }} />

        <Line width="25%" height={16} style={{ marginBottom: 8 }} />
        <div className={style.price_row} style={{ gap: 16, marginBottom: 8 }}>
          <Line width="200px" height={40} />
          <Line width="220px" height={14} />
        </div>
        <Line width="50%" height={14} style={{ marginBottom: 24 }} />

        <div style={{ marginBottom: 16 }}>
          <div className={style.payment_row}>
            <Line width="20px" height={20} />
            <Line width="48px" height={32} />
            <Line width="220px" height={18} />
          </div>
          <div className={style.payment_row}>
            <Line width="20px" height={20} />
            <Line width="48px" height={32} />
            <Line width="140px" height={18} />
          </div>
        </div>

        <div className={style.buttons}>
          <Line width="205px" height={40} />
          <Line width="205px" height={40} />
        </div>
      </div>
    </div>
  );
};

export default WalletFormSkeleton;
