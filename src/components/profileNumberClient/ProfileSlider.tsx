import { useState } from 'react';
import { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper-bundle.min.css';

interface ProfileSliderProps {
  images?: string[];
}

export default function MiniSlider({ images: propImages }: ProfileSliderProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string>('');

  const openModal = (imageSrc: string): void => {
    setModalImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const images = propImages || [
    '/img/img-iPhone.png',
    '/img/img-iPhone.png',
    '/img/img-iPhone.png',
  ];

  return (
    <>
      <div className="swiper">
        <div className="swiper-wrapper">
          <div className="swiper">
            <Swiper
              pagination={true}
              navigation={{
                nextEl: '.image-swiper-button-next',
                prevEl: '.image-swiper-button-prev',
              }}
              modules={[Navigation, Pagination]}
              className="swiperPhoneNumber"
            >
              <div className="swiper-button image-swiper-button-next">
                <img
                  className="image-swiper-button-next"
                  src="/img/sliderright.png"
                  alt="next"
                />
              </div>
              <div className="swiper-button image-swiper-button-prev">
                <img src="/img/sliderleft.png" alt="prev" />
              </div>

              <SwiperSlide className="swiperPhoneNumber__slide">
                <img
                  src="/img/img-iPhone.png"
                  alt="iPhone"
                  onClick={() => openModal('/img/img-iPhone.png')}
                  style={{ cursor: 'pointer' }}
                />
              </SwiperSlide>
              <SwiperSlide className="swiperPhoneNumber__slide">
                <img
                  src="/img/img-iPhone.png"
                  alt="iPhone"
                  onClick={() => openModal('/img/img-iPhone.png')}
                  style={{ cursor: 'pointer' }}
                />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <button className="closeBtn" onClick={closeModal}>
              &times;
            </button>

            <Swiper
              initialSlide={images.indexOf(modalImage)}
              pagination={true}
              navigation={true}
              modules={[Navigation, Pagination]}
              className="modalSwiper"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="modal-content-info">
                    <img src={image} alt={`Slide ${index + 1}`} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* @ts-expect-error styled-jsx */}
      <style jsx>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        @media screen and (max-width: 1000px) {
          .modalContent {
            height: 50% !important;
          }
          .modal img {
            width: 100% !important;
            height: auto !important;
          }
        }

        .modal-content-info {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
        }

        .modalContent {
          position: relative;
          padding: 20px;
          background: white;
          width: 60%;
          height: 80%;
          overflow: hidden;

          position: relative;
        }

        .modal img {
          width: auto;
          height: 80%;
        }

        .closeBtn {
          position: absolute;
          right: 10px;
          top: 0px;
          font-size: 30px;
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
        }

        .closeBtn:hover {
          color: red;
        }

        .modalSwiper {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </>
  );
}
