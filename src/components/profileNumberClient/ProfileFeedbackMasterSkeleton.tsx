import React from 'react';
import style from './ProfileFeedbackMaster.module.css';

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

const ProfileFeedbackMasterSkeleton: React.FC = () => {
  return (
    <div className={style.main_block_feedback}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Line width="100px" height={100} style={{ borderRadius: 100 }} />
        <div>
          <Line width="200px" />
          <div style={{ height: 8 }} />
          <Line width="160px" />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
        <Line width="120px" height={36} />
        <Line width="120px" height={36} />
        <Line width="120px" height={36} />
      </div>

      <div style={{ marginTop: 24 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Line width="60%" />
            <div style={{ height: 8 }} />
            <Line width="40%" />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
        <Line width="205px" height={40} />
        <Line width="205px" height={40} />
      </div>
    </div>
  );
};

export default ProfileFeedbackMasterSkeleton;
