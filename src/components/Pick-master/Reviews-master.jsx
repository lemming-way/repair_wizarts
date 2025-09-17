import React, { useState, useEffect, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import { Link, useParams } from "react-router-dom";
import './pick-master.css'
import Popup from "reactjs-popup";
import './reviews-master.css'
import { Rating } from "react-simple-star-rating";
import { getFeedback, createFeedback } from "../../services/feedback.service";
import SERVER_PATH from "../../constants/SERVER_PATH";
import 'swiper/css'

function Sidebar() {
    const { username } = useParams()

    const fileInputRef = useRef(null)

    const [picture, setPicture] = useState("")
    const [feedback, setFeedback] = useState([])

    const feedbackByValue = useMemo(() => feedback
        .reduce((state, value) => (
            (state[value.rating - 1]++, state)
        ), [0, 0, 0, 0, 0]), [feedback])

    const feedbackMean = useMemo(() => feedback
        .reduce((state, value) => state + value.rating, 0) / feedback.length || 0,
    [feedback])

    useEffect(() => {
        document.title = 'Оставить отзыв';
    }, []);

    const [rating, setRating] = useState(0)
    const [fbtext, setfbtext] = useState("")

    useEffect(() => {
        getFeedback(username).then(setFeedback)
    }, [username])

    const handleRating = (rate) => {
        setRating(rate)
    }
    const onPointerEnter = () => { }
    const onPointerLeave = () => { }
    const onPointerMove = (value, index) => { }

    const formatDate = (date) => {
        const _date = new Date(date)
        return `${_date.getDate()}.${_date.getMonth() + 1}.${_date.getFullYear()}`
    }

    const onSubmit = (e) => {
        e.preventDefault()
        
        return createFeedback({
            data: {
                master_username: username,
                rating,
                description: fbtext
            },
            files: fileInputRef.current.files
        })
    }

    return (
        <>
            <section className="page_3">
                <div className="hun mobile-hun">
                    <div className="master_button font_abel df mobile-master_button">
                        <div className="btnasfd mobile-btnasfd">
                            <Popup
                                trigger={<p>Оставить отзыв</p>}
                                modal
                                nested
                            >
                                {close => (
                                    <div className="modal-content" style={{ width: "600px" }}>
                                        <span onClick={close}><img className="close" src="./img/img-delete.png" alt="" /></span>
                                        <div className="containerPopUp">
                                            <h3 className="modelrewtitle inter">
                                                Оценка и комментарии
                                            </h3>
                                            <Rating
                                                onClick={handleRating}
                                                onPointerEnter={onPointerEnter}
                                                onPointerLeave={onPointerLeave}
                                                onPointerMove={onPointerMove}
                                                initialValue={rating}
                                            />
                                            <textarea
                                                className="modelrewinput inter weqrqew"
                                                placeholder="В тексте не должно быть оскорблений и мата."
                                                value={fbtext}
                                                onChange={(e) => setfbtext(e.target.value)}
                                            />
                                            <div>
                                                <label>
                                                    <input
                                                        style={{ display: "none" }}
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/png, image/jpeg"
                                                        multiple
                                                    />
                                                    <button style={{ marginTop: "10px", pointerEvents: "none" }} className="model-rewbtn_6PopUp inter">
                                                        Загрузить фото
                                                    </button>
                                                </label>
                                            </div>
                                            <div className="popUpBtnffeee">
                                                <button className="model-rewbtn_6PopUp inter" onClick={(e) => { onSubmit(e); close(e) }}>Отправить</button>
                                                <button className="model-rewbtn_6PopUpBack inter " onClick={close}>Назад</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Popup>
                        </div>
                        <div className="but mobile-but">
                            <Link to="/client/chat">Назад</Link>
                        </div>
                    </div>
                </div>
                <div className="client df mobile-client jsbfa">
                    <div className="master font_inter mobile-master">
                        <div className="fasdfXY">
                            <div className="stars_master">
                                <div className="master_information df align">
                                    <div className="master_information-text">
                                        <h2>{feedbackMean}</h2>
                                    </div>
                                </div>
                                <h3>На основании {feedback.length} отзывов</h3>
                            </div>
                            <div className="grade-level">
                                <div className="level_master df align">
                                    <div className="level_img">
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                    </div>
                                    <div className="level_line-1 mobile-level_line-1">
                                    </div>
                                    <div className="level_text">
                                        <p>{feedbackByValue[4]}</p>
                                    </div>
                                </div>

                                <div className="level_master df align">
                                    <div className="level_img">
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                    </div>
                                    <div className="level_line-1 mobile-level_line-1"></div>
                                    <div className="level_text">
                                        <p>{feedbackByValue[3]}</p>
                                    </div>
                                </div>

                                <div className="level_master df align">
                                    <div className="level_img">
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                    </div>
                                    <div className="level_line-1 mobile-level_line-1"></div>
                                    <div className="level_text">
                                        <p>{feedbackByValue[2]}</p>
                                    </div>
                                </div>

                                <div className="level_master df align">
                                    <div className="level_img">
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                    </div>
                                    <div className="level_line-1 mobile-level_line-1"></div>
                                    <div className="level_text">
                                        <p>{feedbackByValue[1]}</p>
                                    </div>
                                </div>

                                <div className="level_master df align">
                                    <div className="level_img">
                                        <img src="/img/master-profile_img/Stars.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                        <img src="/img/master-profile_img/empty_star.png" alt="no photo" />
                                    </div>
                                    <div className="level_line-1 mobile-level_line-1">
                                    </div>
                                    <div className="level_text">
                                        <p>{feedbackByValue[0]}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="nav-prof mobile-nav-prof">
                        <div className="info_prof-kiril font_inter">
                            {feedback.map((v) => (
                                <React.Fragment key={v.id}>
                                    <div className="prof-kiril df">
                                        <div className="prof-img">
                                            <img
                                                src={SERVER_PATH + v.client_avatar}
                                                alt=""
                                            />
                                        </div>

                                        <div className="prof-text">
                                            <h2>{v.client_name} {v.client_lastname}</h2>
                                            <h3>{formatDate(v.created_at)}</h3>
                                        </div>
                                    </div>
                                    <div className="prof_stars df align">
                                        <Rating
                                            readonly
                                            initialValue={v.rating}
                                            size="32"
                                        />
                                    </div>
                                    <div className="client-comment">
                                        <div className="client-comment__content">
                                            <div className="comment_text">
                                                <h2>Комментарий</h2>
                                            </div>
                                            <div className="long_text mobile-long_text">
                                                <p>{v.description}</p>
                                            </div>
                                        </div>
                                        <div className="client-comment-image">
                                            <Swiper
                                                className="client-comment-image__swiper"
                                                modules={[Navigation]}
                                                navigation={{
                                                    nextEl: ".image-swiper-button-next",
                                                    prevEl: ".image-swiper-button-prev",
                                                }}
                                            >
                                                <div className="swiper-button image-swiper-button-next">
                                                    <img className="image-swiper-button-next" src="/img/sliderright.png" alt="" />
                                                </div>
                                                <div className="swiper-button image-swiper-button-prev">
                                                    <img src="/img/sliderleft.png" alt="" />
                                                </div>
                                                {v.pictures.map((v) => (
                                                    <SwiperSlide className="client-comment-image__swipe">
                                                        <img
                                                            className="client-comment-image__img"
                                                            src={SERVER_PATH + v}
                                                            onClick={() => setPicture(SERVER_PATH + v)}
                                                        />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                            <Popup
                                                open={picture !== ""}
                                                onClose={() => setPicture("")}
                                                className="contact-master__modal"
                                            >
                                                <img src={picture} className="contact-master-modal__picture" />
                                            </Popup>
                                        </div>
                                    </div>
                                    {v.master_response && (
                                        <div className="comment-reply">
                                            <div className="comment-reply__header">
                                                <div className="comment-reply-avatar">
                                                    <img
                                                        className="comment-reply-avatar__image"
                                                        alt="master avatar"
                                                        src={SERVER_PATH + v.master_avatar}
                                                    />
                                                </div>
                                                <div className="comment-reply-info">
                                                    <h2 className="comment-reply-info__name">{v.master_name} {v.master_lastname}</h2>
                                                    <div className="comment-reply-info__date">{formatDate(v.created_at)}</div>
                                                </div>
                                            </div>
                                            <div className="comment-reply__content">
                                                <h4 className="comment-reply-title">Ответ</h4>
                                                <p className="comment-reply-text">{v.master_response}</p>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}


export default Sidebar;