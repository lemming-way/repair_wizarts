import React from 'react';

const line = (w = '100%', h = 16) => (
  <div style={{ background: '#eee', borderRadius: 8, height: h, width: w }} />
);

export default function SwiperSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: '#f3f3f3', height, borderRadius: 12 }} />
      <div className="swiper-button image-swiper-button-next" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
        {line('36px', 36)}
      </div>
      <div className="swiper-button image-swiper-button-prev" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}>
        {line('36px', 36)}
      </div>
    </div>
  );
}
