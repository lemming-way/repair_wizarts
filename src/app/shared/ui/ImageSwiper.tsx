import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import type { SwiperProps, SwiperRef } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import { AnyImage, getKeyFor } from './AnyMedia';
import style from './ImageSwiper.module.css'

interface ImageSwiperProps extends SwiperProps {
  withNavigation?: boolean;
  withPagination?: boolean;
  images?: Array<File | Blob | string | number>;
  onDelete?: (image: File | Blob | string | number) => void;
};

export function ImageSwiper({
  navigation = true,
  pagination = false,
  images = [],
  onDelete,
  modules = [],
  ...props
}: ImageSwiperProps) {
  const [swiper, setSwiper] = useState<SwiperRef['swiper']|null>(null);
  const swiperObserver = useRef<ResizeObserver|null>(null);
  if (!!navigation && !modules.includes(Navigation)) modules.push(Navigation);
  if (!!pagination && !modules.includes(Pagination)) modules.push(Pagination);

  // Нужно для корректного обновления свайпера
  useEffect(() => {
    const observer = new ResizeObserver(() => swiper?.update());
    swiperObserver.current = observer;
    return () => observer.disconnect();
  }, [ swiper ]);

  if (!images.length) return null;
  return (
     <Swiper
      slidesPerView="auto"
      spaceBetween={20}
      navigation={navigation}
      pagination={pagination}
      modules={modules}
      className="mySwiper"
      {...props}
      onSwiper={setSwiper}
    >
      {images.map((image, index) => (
        // todo: стиль SwiperSlide добавлен инлайн из-за конфликта с другими стилями. Нужно навести порядок и перенести в модуль
        <SwiperSlide key={getKeyFor(image)} style={{width: 'max-content'}}>
          <div className={style.swiper_slide} ref={el => el && swiperObserver.current?.observe(el)}>
            <AnyImage
              src={image}
              alt={`image-${index}` /* todo: Придумать способ передавать более осмысленные alt-тексты */}
              className={style.swiper_image}
            />
            {(!!onDelete &&
              <button className={style.image_delete_btn} onClick={() => onDelete!(image)}>
                &times;
              </button>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
