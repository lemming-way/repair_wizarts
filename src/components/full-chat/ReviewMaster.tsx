import React, {useEffect, useState} from "react";
import '../scss/ReviewMaster.css'
import '../scss/swiper.css'


import {Link} from "react-router-dom";
import {Rating} from "react-simple-star-rating";


function App() {

    useEffect(() => {
        document.title = 'Чат';
    }, []);


    const [rating, setRating] = useState(0)

    // Catch Rating value
    const handleRating = (rate: number) => {
        setRating(rate)

        // other logic
    }
    // Optinal callback functions
    const onPointerEnter = () => console.log('Enter')
    const onPointerLeave = () => console.log('Leave')
    const onPointerMove = (value: number, index: number) => console.log(value, index)

    return (
        <section className="page_4">
            <div className="rew-mas mobile-rew-mas">
                <div className="reviews-master">
                    <div className="rew">
                        <div className="reviews-text font_abel mobile-reviews-text">
                            <h2 className="abel">Отзывы о мастере</h2>
                        </div>
                        <div className="big_text-mast df align font_robo mobile-big_text-mast">
                            <h2 className="roboto">5,0</h2>
                            <div className="star_img mobile-star_img">
                                <img src="./img/review_img/Star.png" alt="no photo"/>
                                <img src="./img/review_img/Star.png" alt="no photo"/>
                                <img src="./img/review_img/Star.png" alt="no photo"/>
                                <img src="./img/review_img/Star.png" alt="no photo"/>
                                <img src="./img/review_img/Star.png" alt="no photo"/>
                            </div>
                        </div>
                        <div className="mas font_robo mobile-mas">
                            <h3 className="roboto">на основании 1 оценки</h3>
                        </div>
                    </div>
                    <div className="rating df align mobile-rating">
                        <div className="grade-level mobile-grade-level">
                            <div className="level_master-2 df align">
                                <div className="level_img">
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                </div>
                                <div className="level_line-1">
                                    <div className="level_line-2"></div>
                                </div>
                                <div className="level_text-2 mobile-level_text-2">
                                    <p>1</p>
                                </div>
                            </div>

                            <div className="level_master-2 df align">
                                <div className="level_img">
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/star-3.png" alt="no photo"/>
                                </div>
                                <div className="level_line-1"></div>
                                <div className="level_text-2 mobile-level_text-2">
                                    <p>0</p>
                                </div>
                            </div>

                            <div className="level_master-2 df align">
                                <div className="level_img">
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                </div>
                                <div className="level_line-1"></div>
                                <div className="level_text-2 mobile-level_text-2">
                                    <p>0</p>
                                </div>
                            </div>

                            <div className="level_master-2 df align">
                                <div className="level_img">
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                </div>
                                <div className="level_line-1"></div>
                                <div className="level_text-2 mobile-level_text-2">
                                    <p>0</p>
                                </div>
                            </div>

                            <div className="level_master-2 df align">
                                <div className="level_img">
                                    <img src="./img/review_img/Star-2.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                    <img src="./img/review_img/Star-3.png" alt="no photo"/>
                                </div>
                                <div className="level_line-1">
                                    <div className="level_line-3"></div>
                                </div>
                                <div className="level_text-2 font_robo mobile-level_text-2">
                                    <p>0</p>
                                </div>
                            </div>

                            <div className='App' style={{paddingTop: "30px"}}>
                                <Rating
                                    onClick={handleRating}
                                    onPointerEnter={onPointerEnter}
                                    onPointerLeave={onPointerLeave}
                                    onPointerMove={onPointerMove}
                                    /* Available Props */
                                />
                            </div>
                        </div>
                        <div className="rating_info font_robo mobile-rating_info">
                            <div className="rating_text mobile-rating_text">
                                <p>
                                    Рейтинг — это среднее
                                    арифметическое оценок
                                    пользователей. Подробнее
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="reting_info-text font_abel">
                        <input type="text" className="review__input mobile-review__input" placeholder="В тексте не должно быть оскорблений и мата"/>
                    </div>

                    <div className="reting_info-button font_abel mobile-reting_info-button">
                        <Link to="/chat/16854163">Отправить</Link>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default App;
