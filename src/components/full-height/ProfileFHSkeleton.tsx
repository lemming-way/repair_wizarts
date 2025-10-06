import React from 'react';
import style from './ProfileFH.module.css';

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

const ProfileFHSkeleton: React.FC = () => {
  return (
    <div className="mini-main-2 df">
      <form className="input-wrap-2" style={{ width: '100%', maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Line width="80px" height={80} style={{ borderRadius: 80 }} />
          <div style={{ flex: 1 }}>
            <Line width="40%" height={20} style={{ marginBottom: 8 }} />
            <Line width="30%" height={16} />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Line width="60%" height={20} style={{ marginBottom: 12 }} />
          <Line width="60%" height={20} style={{ marginBottom: 12 }} />
          <Line width="60%" height={20} style={{ marginBottom: 12 }} />
          <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        </div>

        <div style={{ marginTop: 16 }}>
          <Line width="100%" height={100} style={{ borderRadius: 12 }} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Line width="100px" height={32} />
            <Line width="100px" height={32} />
            <Line width="100px" height={32} />
          </div>
        </div>
      </form>

      <div className={style.error_block} style={{ width: 320 }}>
        <Line width="50%" />
        <div style={{ height: 12 }} />
        <Line width="80%" />
        <div style={{ height: 12 }} />
        <Line width="60%" />
      </div>
    </div>
  );
};

export default ProfileFHSkeleton;
