import { useState } from 'react';

// Импорт стилей Swiper
import 'swiper/swiper-bundle.min.css';

export default function SimpleImage() {
    // Состояние для управления модальным окном
    const [isModalOpen, setIsModalOpen] = useState(false);
    //~ const [modalImage, setModalImage] = useState("");

    // Массив картинок для слайдера в модальном окне
    const image =  '/img/sentence_img/iphone-x.png';

    // Функция для открытия модального окна
    const openModal = (imageSrc) => {
        //~ setModalImage(imageSrc); // Устанавливаем путь к картинке
        setIsModalOpen(true); // Открываем модальное окно
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    return (
        <>

            <img
                src="/img/sentence_img/iphone-x.png"
                alt="iPhone"
                onClick={() => openModal('/img/sentence_img/iphone-x.png')}
                style={{ cursor: 'pointer' }}
            />

            {/* Модальное окно с слайдером */}
            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                        <button className="closeBtn" onClick={closeModal}>
                            &times;
                        </button>

                        <div className='modal-content-info'>
                            <img src={image} alt='absent' />
                        </div>
                    </div>
                </div>
            )}

            {/* Добавим стили для модального окна */}
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
                }

                .modal img {
                    width: auto;
                    height: 80%;
                }

                .closeBtn {
                    top: 0px;
                    position: absolute;
                    right: 10px;
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
