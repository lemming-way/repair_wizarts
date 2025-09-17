import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getArticles } from "../../services/article.service"
// import backgroundImg from '../../img/article.png'
import styles from './Article.module.css'


const Articles = () => {
    // тестовые данные
    const [articles, setArticles] = useState([])

    const filterText = (v) => v.replace(/<[^>]*>/g, '');

    // const getImage = (path) =>
    //     path ? SERVER_PATH + path : backgroundImg

    const formatDate = (date) => {
        const _date = new Date(date)
        return `${_date.getDate()}.${_date.getMonth()+1}.${_date.getFullYear()}`
    }

    useEffect(() => {
        getArticles()
            .then(setArticles)
            .catch((err) => {
                console.log("Ошибка запроса:", err);
            });
    }, [articles])

    const [isOpenAsideMenu, setOpenAsideMenu] = useState(false)

    return (
        <div className={styles.articlesPage} style={{position: "relative"}}>

            
            <div className={styles.wrap_row__dotted_button}>
                <div className={styles.dotted_button} onClick={()=>setOpenAsideMenu(prev => !prev)}>
                    <div />
                    <div />
                    <div />
                </div>

                { isOpenAsideMenu && (
                    // красный блок-меню
                    <ul className={styles.aside_menu_v3}>
                        <li>Электроника</li>
                        <div className={styles.aside__line}></div>
                        <li>Ремонт телефонов</li>
                        <div className={styles.aside__line}></div>
                        <li className={styles.aside__active_item}>
                            <img src="/img/arrowleft-white.png" alt="" />
                            Ремонт Iphone
                        </li>
                    </ul>
                )}
            </div>



            {/* красный меню блок  справа */}
            <ul className={styles.aside_menu_v2}>
                <li>Электроника</li>
                <div className={styles.aside__line}></div>
                <li>Ремонт телефонов</li>
                <div className={styles.aside__line}></div>
                <li className={styles.aside__active_item}>
                    <img src="/img/arrowleft-white.png" alt="" />
                    Ремонт Iphone
                </li>
            </ul>

            {articles && articles.map((v) => (
                <Link to={"/articles/" + v.id} className={styles.articlesLink} key={v.id}>
                    <div className={styles.card_wrap}>
                        <img
                            className="blog-card__picture"
                            // src={getImage(v.cover_image)}
                            src={v.cover_image}
                            alt=""
                        />
                        <div className={styles.card_content}>
                            <h4 className={styles.articlesTitle}>{v.title}</h4>
                            <p className={styles.articlesContent}>{filterText(v.text)}</p>
                            <div className={styles.row}>
                                <span className={styles.articlesDate}>{formatDate(v.created_at)}</span>
                                <span className={styles.articlesViews}><img src="/img/icons/eye.png" alt="" />{v.view}</span>
                                <div className={styles.likes_block}>
                                    <div className={styles.like_block}>
                                        <img src="/img/icons/like.png" alt="" />
                                        <span>5</span>
                                    </div>
                                    <div className={styles.dislike_block}>
                                        <img src="/img/icons/dislike.png" alt="" />
                                        <span>-2</span>
                                    </div>
                                </div>
                            </div>
                            </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default Articles
