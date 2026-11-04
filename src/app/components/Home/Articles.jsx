import { Link } from 'react-router-dom';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { useBlogArticles } from '../../hooks/useBlog';
import { useLanguage } from '../../state/language';
import BlogArticleCard from '../Article/BlogArticleCard';
import styles from '../../styles/home/HomeSections.module.scss';
import '../../styles/legacy/swiper.css';

function Articles() {
  const text = useLanguage();
  const { data: articles = [], isLoading, isError } = useBlogArticles();

  if (isLoading || isError || articles.length === 0) return null;

  return (
    <section className={`blog ${styles.section}`}>
      <div className="container ircontainer">
        <h2 className={styles.title}>{text('Articles')}</h2>
        <div className="blog__card__list">
          <Swiper
            slidesPerView={4}
            spaceBetween={30}
            navigation
            modules={[Navigation]}
            className={`mySwiper ${styles.slider} ${styles.articleSlider}`}
            breakpoints={{
              0: { slidesPerView: 1 },
              775: { slidesPerView: 2 },
              1099: { slidesPerView: 3 },
              1585: { slidesPerView: 4 },
            }}
          >
            {articles.slice(0, 8).map((article) => (
              <SwiperSlide className="swiper-slier" key={article.id}>
                <BlogArticleCard article={article} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className={styles.footer}>
          <Link className={styles.allButton} to="/articles">
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Articles;
