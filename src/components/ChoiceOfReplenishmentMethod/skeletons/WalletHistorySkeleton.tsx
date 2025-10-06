import React from 'react';
import styles from '../WalletHistoryClient.module.css';
import style from '../style.module.css';

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

const Row = () => (
  <div className={style.order_row_v2}>
    <Line width="140px" />
    <Line width="50%" />
    <Line width="120px" />
    <div>
      <Line width="120px" />
    </div>
  </div>
);

const WalletHistorySkeleton: React.FC = () => {
  return (
    <div className={styles.main_block_history}>
      <Line width="30%" height={32} />
      <div style={{ height: 12 }} />
      <Line width="240px" height={18} />

      <div className={styles.table_wrap}>
        <div style={{ marginTop: 20 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Row key={i} />
          ))}
        </div>
      </div>

      <div className={style.buttons}>
        <Line width="205px" height={40} />
      </div>
    </div>
  );
};

export default WalletHistorySkeleton;
