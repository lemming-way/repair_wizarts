import { useState} from "react";
import { useNavigate } from "react-router-dom";

import style from "./ProfileFeedbackMaster.module.css"
import ProfileSlider  from "./ProfileSlider";
import ModalAddComment from "../Chat/ModalAddComment";
import ModalDelete from "../Chat/ModalDelete";
import ProfileFeedbackMasterSkeleton from './ProfileFeedbackMasterSkeleton';

export default function ProfileFeedbackMaster() {

    const navigate = useNavigate();
    const [visibleModalDelete, setVisibleModalDelete] = useState(false)
    const [visibleModalAddComment, setVisibleModalAddComment] = useState(false)

    const isLoading = false; // placeholder for async state
    if (isLoading) {
        return <ProfileFeedbackMasterSkeleton />
    }

    return (
        <>
      <div className=''>
            
            {visibleModalDelete ? <ModalDelete setVisibleModalDelete={setVisibleModalDelete} /> : null}
            {visibleModalAddComment ? <ModalAddComment setVisibleModalAddComment={setVisibleModalAddComment} /> : null}
            
            {/* <Sidebar /> */}
            
            <div className="">

                <div className={style.content}>

                    {/* stars */}
                    <div>
                        <div className={style.stars_block}>
                            <h3 className="inter">4,6</h3>
                            <img src="/img/img-star.png" alt="Star" />
                            <img src="/img/img-star.png" alt="Star" />
                            <img src="/img/img-star.png" alt="Star" />
                            <img src="/img/img-star.png" alt="Star" />
                            <img src="/img/img-star.png" alt="Star" />
                        </div>

                        <div className="h4">
                            <h4 className="inter" style={{fontWeight: 500}}>На основании 11 оценок</h4>
                        </div>

                        <div className="main-line">
                            <div className="line-content df">
                                <div className="img-line" style={{whiteSpace: "nowrap"}}>
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
                                <div className="img-line" style={{whiteSpace: "nowrap"}}>
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
                                <div className="img-line" style={{whiteSpace: "nowrap"}}>
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
                                <div className="img-line" style={{whiteSpace: "nowrap"}}>
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
                                <div className="img-line" style={{whiteSpace: "nowrap"}}>
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
                    </div>

                    
                    <div>
                        <div className={style.buttons_row}>
                            <button className={style.button} onClick={()=>setVisibleModalAddComment(true)}>Оставить отзыв</button>
                            <button className={style.button_back} onClick={()=>navigate(-1)}>Назад</button>
                        </div>
                        
                        {/* comment */}
                        <div className={style.block_comments}>
                            <div className="portifoly-photo" >
                                <div className="portifoly-img df">
                                    <img style={{marginRight: 0}} src="/img/img-kiril.png" alt="Kiril" />
                                    <div>
                                        <h2 className="inter">Кирилл Воронов</h2>
                                        <p className="inter">26 августа</p>
                                    </div>
                                </div>

                                <div className={style.stars_block2}>
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />

                                    <h4 className="inter">Заказ выполнен на отлично.</h4>
                                </div>

                                <div className={`slider-main-content df ${style.comment_block}`}>
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
                                            <div onClick={()=>setVisibleModalAddComment(true)}>
                                                <img style={{width: "22px"}} src="/img/pencil.png" alt="" />
                                            </div>
                                            <div onClick={()=>setVisibleModalDelete(true)}>
                                                <img src="/img/icons/delete.png" alt="" />
                                            </div>
                                        </div>


                                    </div>

                                            {/*<div className="img__2 swiper-slide">*/}
                                            {/*    <img src="/img/img-iPhone.png" alt=""/>*/}
                                            {/*</div>*/}

                                    <ProfileSlider/>
                                </div>

                            </div>
                            {/* овтет */}
                            <div className={`portifoly-photo ${style.answer_comment}`}>
                                <div className="portifoly-img df" style={{marginTop: "0"}}>
                                    <img style={{marginRight: 0}} src="/img/img-kiril.png" alt="Kiril" />
                                    <div>
                                        <h2 className="inter">Кирилл Воронов</h2>
                                        <p className="inter">26 августа</p>
                                    </div>
                                </div>

                                <div className="slider-main-content df">
                                    <div className="content-portifoly">
                                        <h3 className="inter">Ответ</h3>
                                        <p className="inter">Прекрасно! до новых встреч</p>
                                    </div>
                                </div>

                            </div>
                            <div className="portifoly-photo">
                                <div className="portifoly-img df">
                                    <img style={{marginRight: 0}} src="/img/img-kiril.png" alt="Kiril" />
                                    <div>
                                        <h2 className="inter">Кирилл Воронов</h2>
                                        <p className="inter">26 августа</p>
                                    </div>
                                </div>

                                <div className={style.stars_block2}>
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />
                                    <img src="/img/img-small-star.png" alt="Star" />

                                    <h4 className="inter">Заказ выполнен на отлично.</h4>
                                </div>

                                <div className={`slider-main-content df ${style.comment_block}`}>
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
                                            <div onClick={()=>setVisibleModalAddComment(true)}>
                                                <img src="/img/pencil.png" alt="" />
                                            </div>
                                            <div onClick={()=>setVisibleModalDelete(true)}>
                                                <img src="/img/icons/delete.png" alt="" />
                                            </div>
                                        </div>



                                    </div>
                                    <ProfileSlider/>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        </>
    )
}