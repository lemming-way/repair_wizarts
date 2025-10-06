import React from 'react';
import style from './Profile.module.css';

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

const ProfileSkeleton: React.FC = () => {
  return (
    <div className={`mini-main-2 df ${style.wrap_flex}`}>
      <form className="input-wrap-2">
        <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        <Line width="60%" height={20} style={{ marginBottom: 12 }} />
        <Line width="100%" height={100} style={{ marginTop: 12, borderRadius: 12 }} />
        <div style={{ marginTop: 16 }}>
          <Line width="160px" height={36} />
        </div>
      </form>

      <div className={`check-input-content ${style.wrap_check}`}>
        <Line width="40%" />
        <div style={{ height: 16 }} />
        <Line width="70%" />
        <div style={{ height: 16 }} />
        <Line width="50%" />
      </div>
    </div>
  );
};

export default ProfileSkeleton;
