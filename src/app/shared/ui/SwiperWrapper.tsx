import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import type { SwiperProps } from 'swiper/react';

// This file is lazy-loaded, so all Swiper imports will be code-split

interface SwiperWithModulesProps extends SwiperProps {
  children: React.ReactNode;
}

export const SwiperWithModules: React.FC<SwiperWithModulesProps> = ({ 
  children, 
  modules = [], 
  ...props 
}) => {
  return (
    <Swiper modules={[Navigation, Pagination, ...modules]} {...props}>
      {children}
    </Swiper>
  );
};

export { SwiperSlide };
