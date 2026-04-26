import DOMPurify from 'dompurify'
import React, { useEffect, useState, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

import styles from './Article.module.css'
import ArticleComments from './ArticleComments'
import SERVER_PATH from '../../../config/SERVER_PATH'
import backgroundImg from '../../img/article.png'
import calendarIcon from '../../img/calendar.png'
import groupIcon from '../../img/group.png'
// todo: Добавить реальные вызовы API для статей
// import {
//     getArticle,
//     getArticles
// } from '../../services/article.service'
import { useLanguage } from '../../state/language'
import { useUser } from '../../state/user'

// Фиктивные данные для статьи
const mockArticleData = (id) => ({
    id: id,
    title: `Заголовок тестовой статьи ${id}`,
    views: Math.floor(Math.random() * 1000) + 100,
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    text: "<p>Это содержимое тестовой статьи. Здесь может быть любой <b>HTML</b> контент. <br/> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>",
    cover_image: null, // или фиктивный путь, если нужно
    likes: Math.floor(Math.random() * 50)
});

const mockArticlesData = Array.from({ length: 8 }).map((_, i) => mockArticleData(i + 1));

const Article = (props) => {
    const text = useLanguage()
    const { id } = useParams()
    const [articles, setArticles] = useState([])
    const [data, setData] = useState({
        title: "Заголовок статьи", // Заголовок статьи
        views: 123,                // Количество просмотров
        created_at: "2023-10-05T00:00:00Z", // Дата создания статьи (в формате ISO)
        text: "<p>Содержимое статьи в формате HTML.</p>" // Содержимое статьи в HTML
    });

    const [headerStyle, setHeaderStyle] = useState({ background: `url("${backgroundImg}")` })
    const { user } = useUser()

    useEffect(() => {
        // todo: Заменить на реальный вызов getArticle(id)
        Promise.resolve(mockArticleData(id)).then((articleData) => {
            if (articleData.cover_image) {
                const path = SERVER_PATH + articleData.cover_image
                setHeaderStyle({ background: `center / cover no-repeat url("${path}")` })
                setData(articleData)
                return
            }
            setData(articleData)
            setHeaderStyle({ background: `url("${backgroundImg}")` })
        })
        // todo: Заменить на реальный вызов getArticles()
        Promise.resolve(mockArticlesData).then(setArticles)
    }, [id]) // Зависимость [id] сохранена для обновления при смене статьи

    const filterText = (v) => v.replace(/<[^>]*>/g, '');

    const getImage = (path) =>
        path ? SERVER_PATH + path : backgroundImg

    const formatDate = (date) => {
        const _date = new Date(date)
        return `${_date.getDate()}.${_date.getMonth()+1}.${_date.getFullYear()}`
    }

    const [offsetContent, setOffsetContent] = useState(true)

    return (
        <div className={styles.container}>
            <div className={styles.header} style={headerStyle}>
                <div className={styles.headerContainer}>
                    <h2 className={styles.headerTitle}>{data.title}</h2>
                    <div className={styles.headerInfo}>
                        <span className={styles.headerViews}>
                            <img className={styles.headerIcon} src={groupIcon}  alt='no icon'/>
                            {data.views}
                        </span>
                        <span className={styles.headerDate}>
                            <img className={styles.headerIcon} src={calendarIcon} alt='no icon' />
                            {formatDate(data.created_at)}
                        </span>
                    </div>
                </div>
            </div>
            {/* красный меню блок  справа */}
            <ul className={styles.aside_menu}>
                <li>Электроника</li>
                <div className={styles.aside__line}></div>
                <li>Ремонт телефонов</li>
                <div className={styles.aside__line}></div>
                <li className={styles.aside__active_item}>
                    <img src="/img/arrowleft-white.png" alt="" />
                    Ремонт Iphone
                </li>
            </ul>

            <div className={styles.body}>
                <div
                    data-testid="article-body"
                    className={`${styles.bodyContent} ${offsetContent? styles.offset_content : ""}`}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                            Array(100).fill(data.text).join('') || '',
                            {
                                USE_PROFILES: { html: true },
                            },
                        ),
                    }}
                >
                </div>
                {offsetContent ? 
                    <div className={styles.gradient}></div>
                : null}
                
            </div>
            <div className={styles.buttons_row}>
                {offsetContent ? 
                    <div className={styles.bodyActions}>
                        <span className={styles.bodyButton} onClick={()=> setOffsetContent(false)}>{text('Read more')}</span>
                    </div>
                : null}
                <div className={styles.bodyActions}>
                    <Link to={user.id ? "/client/requests/create/data" : "/register/client"} className={styles.bodyButton}>Оформить ремонт</Link>
                </div>
            </div>
            <ArticleComments
                articleId={id}
                likes={data.likes}
            />
            <div className={styles.articles}>
                <Suspense fallback={<div className="swiper-loading" />}>
                    <Swiper
                        slidesPerView={4}
                        spaceBetween={30}
                        navigation={true}
                        modules={[Navigation]}
                        className="mySwiper"
                        breakpoints={{
                            0: {
                                slidesPerView: 2
                            },
                            775: {
                                slidesPerView: 2
                            },
                            1099: {
                                slidesPerView: 3
                            },
                            1585: {
                                slidesPerView: 4
                            },
                        }}
                    >
                        {articles.map((v) => (
                            <SwiperSlide className="swiper-slier" key={v.id}>
                                <Link
                                    to={"/articles/" + v.id}
                                    className={styles.articlesLink}
                                    onClick={() => document.documentElement.scrollTop = 0}
                                >
                                    <div className="blog__card">
                                        <img
                                            className="blog-card__picture"
                                            src={getImage(v.cover_image)}
                                            alt=""
                                        />
                                        <div className="blog__card__content">
                                            <h4 className={styles.articlesTitle}>{v.title}</h4>
                                            <p className={styles.articlesContent}>{filterText(v.text)}</p>
                                            <span className={styles.articlesDate}>{formatDate(v.created_at)}</span>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Suspense>
            </div>
        </div>
    )
}

export default Article
