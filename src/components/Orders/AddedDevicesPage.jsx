import Sidebar from "../sidebar";
import styles from "./AddedDevicesPage.module.css"
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import ModalConfirmMaster from "./ModalConfirmMaster";
import { useState } from "react";


function AddedDevicesPage() {

    const [visibleModalConfirmMaster, setVisibleModalConfirmMaster] = useState(false)

    return (
        <div className='main nal df'>
            {visibleModalConfirmMaster ? <ModalConfirmMaster setVisibleModalConfirmMaster={setVisibleModalConfirmMaster} /> : null}

            {/* <Sidebar /> */}
            <div className={styles.main_block}>
                <div className={styles.heading_row}>
                    <h1>Мое предложение (31025)</h1>
                    <Link to="" className={styles.button_back}>Назад</Link>
                </div>

                <div className={styles.block_order}>
                    <div className={styles.left}>
                        <div className={styles.left_row}>
                            <img
                                src="/img/profil_img/2.png"
                                width="120px"
                                height="120px"
                                style={{ borderRadius: "60px", objectFit: "cover" }}
                                alt=""
                            />
                            <div className={styles.block_info}>
                                <h2>Имя и фамилия с заявки инфа</h2>
                                <h3>Размещено 10 проектов</h3>
                                <h3>Нанято 100 %</h3>
                            </div>
                        </div>
                        <div className={styles.description}>
                            <p>Название устройства инфа со страници н1</p>
                            <p>клиент описывает свою проблему, страница н1</p>
                        </div>
                        <div className={styles.left_row_bottom}>
                            <p>Осталось 70 часа 45 минут </p>
                            <p className={styles.view}><img src="/img/icons/eye.png" alt="" />20 просмотрено</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <p>Желаемый бюджет <span className={styles.price}>1000 ₽</span></p>

                        <div className={styles.swiper}>
                        <Swiper
                            slidesPerView={4}
                            spaceBetween={30}
                            navigation={true}
                            className="myMiniSwiper"
                            modules={[Navigation]}
                            breakpoints={{
                                0: {
                                    slidesPerView: 1
                                },
                                800: {
                                    slidesPerView: 1
                                },
                                1124: {
                                    slidesPerView: 1
                                },
                            }}
                        >

                            {[1,2,3].map((_, index) =>
                                <SwiperSlide key={index}>
                                    <div className={styles.miniSlider}>
                                        <img src="/img/sentence_img/iphone-x.png" alt="" />
                                    </div>
                                </SwiperSlide>
                            )}
                        </Swiper>
                        </div>
                        
                        {/* <Swiper pagination={true} navigation={{
                                nextEl: ".image-swiper-button-next",
                                prevEl: ".image-swiper-button-prev",
                            }} modules={[Navigation, Pagination]} 
                            slidesPerView="auto" 
                            className={styles.swiper}>
                                <div className="swiper-button image-swiper-button-next">
                                    <img className="image-swiper-button-next" src="/img/sliderright.png" alt="asdfdsa" />
                                </div>
                                <div className="swiper-button image-swiper-button-prev">
                                    <img src="/img/sliderleft.png" alt="sdfdsa" />
                                </div>
                                {[1,2,3].map((v, i) => (
                                    <SwiperSlide  key={i}>
                                        <img src="/img/sentence_img/iphone-x.png" alt="" className="vpupi" />
                                    </SwiperSlide>
                                ))}
                            </Swiper> */}
                            <div className={styles.order_row}>
                                <div className={styles.order_button}>Сбор предложений</div>
                                <div>
                                    <img src="/img/pause.png" alt="" />
                                </div>
                                <div>
                                    <img src="/img/pencil.png" alt="" />
                                </div>
                                <div>
                                    <img src="/img/basket.png" alt="" />
                                </div>
                            </div>
                    </div>
                </div>
                
                <section>
                    <h2>4 Предложения</h2>
                    <p className={styles.heading}>Номер профиля (1023)</p>

                    <div className={styles.about_block}>
                        <div className={styles.about_row}>
                            <div className={styles.left_row}>
                                <img
                                    src="/img/profil_img/2.png"
                                    width="80px"
                                    height="80px"
                                    style={{ borderRadius: "60px", objectFit: "cover" }}
                                    alt=""
                                />
                                <div className={styles.block_info}>
                                    <p>Алексей Михеев</p>
                                    <p>Частный мастер/Сервис </p>
                                    <p className={styles.star_block}>
                                        <img src="/img/img-star.png" alt="" />
                                        <img src="/img/img-star.png" alt="" />
                                        <img src="/img/img-star.png" alt="" />
                                        <img src="/img/img-star.png" alt="" />
                                        <img src="/img/img-star.png" alt="" />
                                        23
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className={styles.about__description}><span>Город:</span>Санкт-Петербург</p>
                                <p className={styles.about__description}><span>Адрес:</span>Васильевсий 45</p>
                            </div>

                            <div>
                                <p className={styles.about__description}><span>На сайте:</span>с 2021 года</p>
                                <p className={styles.about__description}><span>Статус:</span><span className={styles.accent_color}>Онлайн</span></p>
                                <p className={styles.about__description}><span>Оценка:</span><span className={styles.accent_color}>5.00</span></p>
                            </div>
                        </div>

                        <div className={styles.row2}>
                            <p className={styles.flex_center}>
                                <img src="/img/img-small-star.png" alt="" />
                                <span className={styles.accent_color_gold}>4.3</span>
                                Продавец Новичок
                            </p>
                            <p><span className={styles.accent_color}>40 </span>заказов выполнено</p>
                            <p><span className={styles.accent_color}>40 </span>заказов выполнено</p>
                            <p><span className={styles.accent_color}>40 </span>отзывов получено</p>
                            <p><span className={styles.accent_color}>100% </span>заказов успешно сдано</p>
                            <p><span className={styles.accent_color}>40 </span>отзывов получено</p>
                            <p><span className={styles.accent_color}>54% </span>повторных заказов</p>
                        </div>
                    </div>

                    <div className={styles.about_block2}>
                        <table>
                            <tr>
                                <td className={styles.light_text}>Опыт:</td>
                                <td>5 лет</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Имя организации:</td>
                                <td>PRO Ремонт</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Вид категории:</td>
                                <td>Электроника</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Категория:</td>
                                <td>Ремонт телефонов, ремонт планшетов (Из списка)</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Бренды:</td>
                                <td>Iphone, ipad (Из списка)</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Ваша деятельность: </td>
                                <td>Занимаюсь ремонтом техники Apple</td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Основное направление: </td>
                                <td>Переклейка экранов </td>
                            </tr>
                            <tr>
                                <td className={styles.light_text}>Основной бизнес: </td>
                                <td>Мастерская </td>
                            </tr>
                        </table>
                        <div className={styles.col}>
                            <p className={styles.text_light}>О себе</p>
                            <p>Vestibulum placerat massa at massa ultricies scelerisque. Aenean dolor justo, aliquet vel convallis at, egestas ac purus. Aliquam condimentum urna sit amet posuere dapibus. Phasellus venenatis vulputate purus vel ultricies. Quisque a volutpat dolor, et interdum urna. Suspendisse interdum, nulla congue porta dapibus, risus leo eleifend nibh, id malesuada risus tortor sed odio. </p>
                        </div>
                    </div>


                    <div className={styles.text_block}>
                        <p>Vestibulum placerat massa at massa ultricies scelerisque. Aenean dolor justo, aliquet vel convallis at, egestas ac purus. Aliquam condimentum urna sit amet posuere dapibus. Phasellus venenatis vulputate purus vel ultricies. Quisque a volutpat dolor, et interdum urna. Suspendisse interdum, nulla congue porta dapibus, risus leo eleifend nibh, id malesuada risus tortor sed odio. </p>
                    </div>
               
                </section>

                <section className={styles.order_block}>
                    <h2>Что входит в предложение</h2>
                    <div className={styles.order_block__row}>
                        <p>Услуга</p>
                        <div style={{flex:1}} />
                        <p>Срок <br />4 часа</p>
                        <p>Цена <br />1500 ₽</p>
                    </div>
                    <div className={styles.line}></div>
                    <div className={styles.order_block__row2}>
                        <p>Итого:</p>
                        <p>4 часа</p>
                        <p>1500 ₽</p>
                    </div>

                </section>
                
                <div className={styles.buttons}>
                    <button className={styles.button} onClick={()=>setVisibleModalConfirmMaster(true)}>Выбрать мастера</button>
                    <button className={styles.button}>Отзывы о мастере</button>
                </div>

            </div>
        </div>
    )
}


export default AddedDevicesPage;
