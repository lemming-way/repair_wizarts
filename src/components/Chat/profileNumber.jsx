import { useEffect, useState } from "react";
import '../../scss/profileNumber.css'
import '../../scss/swiper.css'
import { useSelector } from "react-redux";
import { selectUser } from "../../slices/user.slice";
import { getFeedback } from "../../services/feedback.service";
import ModalDelete from "./ModalDelete";
import style from "./profileNumber.module.css"
import ModalAddCommentMini from "./ModalAddCommentMini";
import ProfileSlider  from "../profileNumberClient/ProfileSlider";

function App() {
    const user = useSelector(selectUser)
    const [feedback, setFeedback] = useState([])

    // const onSubmit = (id) => () => {
    //     return replyToFeedback({
    //         id,
    //         master_response: reply
    //     }).then(() => {
    //         getFeedback(user.master[0].username).then(setFeedback)
    //     })
    // }

    // const formatDate = (date) => {
    //     const _date = new Date(date)
    //     return `${_date.getDate()}.${_date.getMonth() + 1}.${_date.getFullYear()}`
    // }
    
    // const feedbackByValue = useMemo(() => feedback
    //     .reduce((state, value) => (
    //         (state[value.rating - 1]++, state)
    //     ), [0, 0, 0, 0, 0]), [feedback])

    useEffect(() => {
        if (user.master) {
            getFeedback(user.master[0].username).then(setFeedback)
        }
    }, [user.master])

    useEffect(() => {
        document.title = 'Отзывы';
    }, []);

    const [visibleModalDelete, setVisibleModalDelete] = useState(false)
    const [visibleModalAddComment, setVisibleModalAddComment] = useState(false)

    return (
        <>
            
            {visibleModalDelete ? <ModalDelete setVisibleModalDelete={setVisibleModalDelete} /> : null}
            {visibleModalAddComment ? <ModalAddCommentMini setVisibleModalAddComment={setVisibleModalAddComment} /> : null}
            
                <div className="mini-text">
                    <h1>Номер профиля</h1>
                    {/* <Link className="roboto" to="#">
                        Запросить отзыв
                    </Link> */}

                </div>

                <div className="content-box">
                    <div className={style.stars_row}>
                        <h3 className="inter">4,6</h3>
                        <img src="/img/img-star.png" alt="Star" />
                        <img src="/img/img-star.png" alt="Star" />
                        <img src="/img/img-star.png" alt="Star" />
                        <img src="/img/img-star.png" alt="Star" />
                        <img src="/img/img-star.png" alt="Star" />

                    </div>

                    <div className="h4">
                        <h4 className="inter">На основании 11 оценок</h4>
                    </div>

                    <div className="main-line">
                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                            </div>

                            <div className="big-line">
                                <div className="small-line"></div>
                            </div>

                            <div>
                                <p className="inter">10</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">0</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                                <div className="small-line-2"></div>
                            </div>

                            <div>
                                <p className="inter">1</p>
                            </div>
                        </div>
                    </div>

                    <div className="portifoly-photo">
                        <div className="portifoly-img df">
                            <img src="/img/img-kiril.png" alt="Kiril" />
                            <div>
                                <h2 className="inter">Кирилл Воронов</h2>
                                <p className="inter">26 августа</p>
                            </div>
                        </div>

                        <div className={style.stars_row}>
                            <img src="/img/img-small-star.png" alt="Star" />
                            <img src="/img/img-small-star.png" alt="Star" />
                            <img src="/img/img-small-star.png" alt="Star" />
                            <img src="/img/img-small-star.png" alt="Star" />
                            <img src="/img/img-small-star.png" alt="Star" />

                            <p>Заказ выполнен на отлично.</p>
                        </div>

                        <div className={style.comment_body}>
                            <div className="content-portifoly">
                                <h3 className="inter">Комментарий</h3>

                                <p className="inter">Donec non justo elit. Praesent nec auctor tellus. Donec quam orci, tincidunt nec diam
                                    at, mollis commodo libero. Nulla a ante aliquam augue mattis dapibus eget eu ipsum.
                                    Integer fringilla vitae orci at laoreet. Quisque a justo augue. Proin a facilisis
                                    ante. Cras at nibh ultricies magna aliquet rutrum eget in lectus. Nullam sed ornare
                                    arcu. Curabitur bibendum ultrices sapien, eget viverra velit lobortis vel. Vivamus
                                    eu auctor elit.</p>

                                <div className="comment_buttons">
                                    <div className="likes_block">
                                        <div className="like_block">
                                            <img src="/img/icons/like.png" alt="" />
                                            <span>5</span>
                                        </div>
                                        <div className="like_block__line"></div>
                                        <div className="dislike_block">
                                            <img src="/img/icons/dislike.png" alt="" />
                                            <span>-2</span>
                                        </div>
                                    </div>
                                    {/* <div onClick={()=>setVisibleModalAddComment(true)}>
                                        <img src="/img/pencil.png" alt="" />
                                    </div>
                                    <div onClick={()=>setVisibleModalDelete(true)}>
                                        <img src="/img/icons/delete.png" alt="" />
                                    </div> */}
                                </div>

                            </div>

                            <ProfileSlider />
                        </div>
                        <div style={{display: "flex", justifyContent:"center"}}>
                                    <button className={style.button} onClick={()=>setVisibleModalAddComment(true)}>Оставить ответ</button>
                            </div>
                    </div>
                </div>

{/* 
            <div className="block-info-5">
                <div className="block-info-content-5 df">
                    <h1 className="roboto">Номер профиля {user.id}</h1>
                </div>

                <div className="content-box">
                    <div className="main-line">
                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">{feedbackByValue[4]}</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">{feedbackByValue[3]}</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">{feedbackByValue[2]}</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">{feedbackByValue[1]}</p>
                            </div>
                        </div>

                        <div className="line-content df">
                            <div className="img-line">
                                <img src="/img/img-small-star.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                                <img src="/img/img-small-star-white.png" alt="Star" />
                            </div>

                            <div className="big-line">
                            </div>

                            <div>
                                <p className="inter">{feedbackByValue[0]}</p>
                            </div>
                        </div>
                    </div>

                    {feedback.map((v) => (
                        <div className="portifoly-photo" key={v.id}>
                            <div className="portifoly-img df">
                                <img
                                    src={SERVER_PATH + v.client_avatar}
                                    width="66px"
                                    height="66px"
                                    style={{ borderRadius: "33px", objectFit: "cover" }}
                                    alt="Kiril"
                                />
                                <div>
                                    <h2 className="inter">{v.client_name} {v.client_lastname}</h2>
                                    <p className="inter">{formatDate(v.created_at)}</p>
                                </div>
                            </div>

                            <div className="star-portifoly df">
                                <Rating
                                    initialValue={user.master[0].rating}
                                    size="20"
                                    readonly
                                />
                            </div>

                            <div className="slider-main-content df">
                                <div className="content-portifoly">
                                    <h3 className="inter">Комментарий</h3>
                                    <p className="inter">{v.description}</p>
                                    <button
                                        className={cx({ "active-comment-button": !v.master_response })}
                                        onClick={() => !v.master_response && setReplyOpen(true)}
                                    >
                                        Оставить отзыв
                                    </button>
                                    <Popup
                                        open={isReplyOpen}
                                        onClose={() => setReplyOpen(false)}
                                        className="feedback-reply-modal"
                                    >
                                        <h2 className="feedback-reply-modal__title">
                                            Ответ на отзыв
                                        </h2>
                                        <textarea
                                            className="feedback-reply-modal__textarea"
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Оставьте ответ на отзыв"
                                        />
                                        <button
                                            className="feedback-reply-modal__button"
                                            onClick={onSubmit(v.id)}
                                        >
                                            Отправить
                                        </button>
                                    </Popup>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </>
    )
}


export default App;
