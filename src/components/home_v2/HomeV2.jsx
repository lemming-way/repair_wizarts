import React, { useState } from 'react';

import styles from './HomeV2.module.css';

// Импорт SVG-иконок
import arrowRightIcon from './icons/arrow-right.svg';
import checkCircleIcon from './icons/check-circle.svg';
import chevronRightIcon from './icons/chevron-right.svg';
import clipboardIcon from './icons/clipboard.svg';
import clockIcon from './icons/clock.svg';
import closeIcon from './icons/close.svg';
import creditCardIcon from './icons/credit-card.svg';
import facebookIcon from './icons/facebook.svg';
import instagramIcon from './icons/instagram.svg';
import phoneIcon from './icons/phone.svg';
import mailIcon from './icons/mail.svg';
import mapPinIcon from './icons/map-pin.svg';
import menuIcon from './icons/menu.svg';
import messageIcon from './icons/message.svg';
import searchIcon from './icons/search.svg';
import shieldIcon from './icons/shield.svg';
import starEmptyIcon from './icons/star-empty.svg';
import starIcon from './icons/star.svg';
import thumbsUpIcon from './icons/thumbs-up.svg';
import twitterIcon from './icons/twitter.svg';
import userCheckIcon from './icons/user-check.svg';
import usersIcon from './icons/users.svg';

// @deleteme: временно выключил предупреждения, надо убрать
/* eslint-disable jsx-a11y/anchor-is-valid */

function HomeV2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles['header-container']}`}>
          <div className={styles['header-left']}>
            <button
              className={styles['menu-button']}
              onClick={() => setMobileMenuOpen(true)}
            >
              {/* Убедитесь, что переменная menuIcon определена/импортирована */}
              <img src={menuIcon || '/placeholder.svg'} alt="Меню" />
              <span className={styles['sr-only']}>Открыть меню</span>
            </button>
            <a href="/" className={styles.logo}>
              РекламаПро
            </a>
          </div>
          <nav className={styles['desktop-nav']}>
            <a href="#" className={styles['nav-link']}>
              Как это работает
            </a>
            <a href="#" className={styles['nav-link']}>
              Категории
            </a>
            <a href="#" className={styles['nav-link']}>
              Каталог исполнителей
            </a>
            <a href="#" className={styles['nav-link']}>
              Для исполнителей
            </a>
            <a href="#" className={styles['nav-link']}>
              Для заказчиков
            </a>
            <a href="#" className={styles['nav-link']}>
              О нас
            </a>
          </nav>
          <div className={styles['header-right']}>
            <button className={styles['search-button']}>
              {/* Убедитесь, что переменная searchIcon определена/импортирована */}
              <img src={searchIcon || '/placeholder.svg'} alt="Поиск" />
              <span className={styles['sr-only']}>Поиск</span>
            </button>
            <div className={styles['auth-buttons']}>
              <button
                className={`${styles.button} ${styles['button-outline']}`}
              >
                Войти
              </button>
              <button
                className={`${styles.button} ${styles['button-primary']}`}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className={styles['mobile-menu']}>
          <div className={styles['mobile-menu-container']}>
            <div className={styles['mobile-menu-header']}>
              <a href="/" className={styles.logo}>
                РекламаПро
              </a>
              <button
                className={styles['close-button']}
                onClick={() => setMobileMenuOpen(false)}
              >
                {/* Убедитесь, что переменная closeIcon определена/импортирована */}
                <img src={closeIcon || '/placeholder.svg'} alt="Закрыть" />
                <span className={styles['sr-only']}>Закрыть меню</span>{' '}
                {/* Добавлено для доступности */}
              </button>
            </div>
            <nav className={styles['mobile-nav']}>
              <a href="#" className={styles['mobile-nav-link']}>
                Как это работает
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                Категории
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                Каталог исполнителей
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                Для исполнителей
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                Для заказчиков
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                О нас
              </a>
            </nav>
            <div className={styles['mobile-auth-buttons']}>
              <button
                className={`${styles.button} ${styles['button-outline']} ${styles['full-width']}`}
              >
                Войти
              </button>
              <button
                className={`${styles.button} ${styles['button-primary']} ${styles['full-width']}`}
              >
                Регистрация
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        <section className={styles['hero-section']}>
          <div className={styles.container}>
            <div className={styles['hero-grid']}>
              <div className={styles['hero-content']}>
                <h1 className={styles['hero-title']}>
                  Объединяем заказчиков и исполнителей рекламных услуг
                </h1>
                <p className={styles['hero-description']}>
                  Создайте заказ на производство вывески, рекламных буклетов или
                  других рекламных материалов и получите предложения от
                  проверенных исполнителей.
                </p>
                <div className={styles['hero-buttons']}>
                  <button
                    className={`${styles.button} ${styles['button-primary']}`}
                  >
                    Разместить заказ
                    {/* Убедитесь, что переменная chevronRightIcon определена/импортирована */}
                    <img
                      src={chevronRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true" // Добавлено для доступности
                    />
                  </button>
                  <button
                    className={`${styles.button} ${styles['button-outline']}`}
                  >
                    Найти исполнителя
                  </button>
                </div>
              </div>
              <div className={styles['hero-form-container']}>
                {/* Для форм лучше использовать тег <form> */}
                <form
                  className={styles['hero-form']}
                  onSubmit={(e) => e.preventDefault()}
                >
                  {' '}
                  {/* Добавлен onSubmit */}
                  <h3 className={styles['form-title']}>
                    Быстрый поиск исполнителя
                  </h3>
                  <div className={styles['form-group']}>
                    <label htmlFor="category" className={styles['form-label']}>
                      Категория услуги
                    </label>
                    <select id="category" className={styles['form-select']}>
                      <option value="">Выберите категорию</option>
                      <option value="signage">Наружная реклама</option>
                      <option value="print">Полиграфия</option>
                      <option value="digital">Цифровая реклама</option>
                      <option value="design">Дизайн</option>
                    </select>
                  </div>
                  <div className={styles['form-group']}>
                    <label htmlFor="location" className={styles['form-label']}>
                      Город
                    </label>
                    <input
                      id="location"
                      className={styles['form-input']}
                      placeholder="Введите город"
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label
                      htmlFor="description"
                      className={styles['form-label']}
                    >
                      Описание заказа
                    </label>
                    <textarea
                      id="description"
                      className={styles['form-textarea']}
                      placeholder="Опишите ваш заказ..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={`${styles.button} ${styles['button-primary']} ${styles['full-width']}`}
                  >
                    {' '}
                    {/* Добавлен type="submit" */}
                    Найти исполнителей
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['how-it-works-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>Как это работает</h2>
              <p className={styles['section-description']}>
                Простой процесс для заказчиков и исполнителей рекламных услуг
              </p>
            </div>
            <div className={styles['steps-grid']}>
              {/* Шаг 1 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={clipboardIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>1. Создайте заказ</h3>
                <p className={styles['step-description']}>
                  Опишите ваш проект, укажите требования и бюджет
                </p>
              </div>
              {/* Шаг 2 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={searchIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  2. Получите предложения
                </h3>
                <p className={styles['step-description']}>
                  Исполнители откликаются и предлагают свои услуги и цены
                </p>
              </div>
              {/* Шаг 3 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={userCheckIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  3. Выберите исполнителя
                </h3>
                <p className={styles['step-description']}>
                  Сравните предложения или выберите из каталога
                </p>
              </div>
              {/* Шаг 4 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={messageIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>4. Обсудите детали</h3>
                <p className={styles['step-description']}>
                  Согласуйте все детали проекта с исполнителем
                </p>
              </div>
              {/* Шаг 5 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={checkCircleIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>5. Завершите сделку</h3>
                <p className={styles['step-description']}>
                  Заключите сделку через платформу с гарантией качества
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['categories-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>Категории услуг</h2>
              <p className={styles['section-description']}>
                Найдите исполнителей для любых рекламных задач
              </p>
            </div>
            <div className={styles['categories-grid']}>
              {/* Карточка категории 1 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>Наружная реклама</h3>
                  <p className={styles['category-subtitle']}>
                    Вывески, баннеры, световые короба
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400" // Оставляем плейсхолдеры для картинок категорий
                    alt="Наружная реклама"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Карточка категории 2 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>Полиграфия</h3>
                  <p className={styles['category-subtitle']}>
                    Буклеты, визитки, каталоги
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Полиграфия"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Карточка категории 3 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    Сувенирная продукция
                  </h3>
                  <p className={styles['category-subtitle']}>
                    Брендированные товары и подарки
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Сувенирная продукция"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Карточка категории 4 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>Дизайн</h3>
                  <p className={styles['category-subtitle']}>
                    Разработка макетов и фирменного стиля
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Дизайн"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Карточка категории 5 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    Широкоформатная печать
                  </h3>
                  <p className={styles['category-subtitle']}>
                    Плакаты, постеры, фотообои
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Широкоформатная печать"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Карточка категории 6 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>Цифровая реклама</h3>
                  <p className={styles['category-subtitle']}>
                    Баннеры, анимация, видеоролики
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Цифровая реклама"
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    Найти исполнителя
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className={styles['section-footer']}>
              <button
                className={`${styles.button} ${styles['button-outline']}`}
              >
                Показать все категории
                <img
                  src={arrowRightIcon || '/placeholder.svg'}
                  alt=""
                  className={styles['icon-right']}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </section>

        <section className={styles['featured-providers-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>
                Популярные исполнители
              </h2>
              <p className={styles['section-description']}>
                Выберите проверенного исполнителя из нашего каталога
              </p>
            </div>
            <div className={styles['providers-grid']}>
              {/* Карточка исполнителя 1 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    {/* Аватар: используем div или img */}
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label="Аватар ПринтМастер"
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>ПринтМастер</h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label="Рейтинг: 5 из 5"
                      >
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <span className={styles['rating-count']}>(128)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['provider-tags']}>
                    <span className={styles.tag}>Полиграфия</span>
                    <span className={styles.tag}>Визитки</span>
                    <span className={styles.tag}>Буклеты</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    Типография полного цикла с современным оборудованием.
                    Выполняем заказы любой сложности в кратчайшие сроки.
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>Москва</span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    Предложить заказ
                  </button>
                </div>
              </div>
              {/* Карточка исполнителя 2 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label="Аватар РекламаПлюс"
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>РекламаПлюс</h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label="Рейтинг: 4 из 5"
                      >
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starEmptyIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />{' '}
                        {/* Пустая звезда */}
                        <span className={styles['rating-count']}>(94)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['provider-tags']}>
                    <span className={styles.tag}>Наружная реклама</span>
                    <span className={styles.tag}>Вывески</span>
                    <span className={styles.tag}>Монтаж</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    Производство и монтаж наружной рекламы любой сложности.
                    Собственное производство, гарантия качества.
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>
                    Санкт-Петербург
                  </span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    Предложить заказ
                  </button>
                </div>
              </div>
              {/* Карточка исполнителя 3 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label="Аватар ДизайнПро"
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>ДизайнПро</h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label="Рейтинг: 5 из 5"
                      >
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <img
                          src={starIcon || '/placeholder.svg'}
                          alt=""
                          className={styles['star-icon']}
                          aria-hidden="true"
                        />
                        <span className={styles['rating-count']}>(156)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['provider-tags']}>
                    <span className={styles.tag}>Дизайн</span>
                    <span className={styles.tag}>Брендинг</span>
                    <span className={styles.tag}>Логотипы</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    Креативная студия дизайна. Разработка фирменного стиля,
                    логотипов, макетов для рекламных материалов.
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>Удаленно</span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    Предложить заказ
                  </button>
                </div>
              </div>
            </div>
            <div className={styles['section-footer']}>
              <button
                className={`${styles.button} ${styles['button-primary']}`}
              >
                Перейти в каталог исполнителей
                <img
                  src={arrowRightIcon || '/placeholder.svg'}
                  alt=""
                  className={styles['icon-right']}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </section>

        <section className={styles['benefits-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>
                Преимущества платформы
              </h2>
              <p className={styles['section-description']}>
                Почему заказчики и исполнители выбирают нашу платформу
              </p>
            </div>
            <div className={styles['benefits-grid']}>
              {/* Преимущество 1 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={checkCircleIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  Проверенные исполнители
                </h3>
                <p className={styles['benefit-description']}>
                  Все исполнители проходят проверку и имеют рейтинг от клиентов
                </p>
              </div>
              {/* Преимущество 2 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={creditCardIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>Безопасные платежи</h3>
                <p className={styles['benefit-description']}>
                  Оплата через платформу с защитой от мошенничества
                </p>
              </div>
              {/* Преимущество 3 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={clockIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>Экономия времени</h3>
                <p className={styles['benefit-description']}>
                  Быстрый поиск исполнителей и получение предложений
                </p>
              </div>
              {/* Преимущество 4 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={shieldIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>Гарантия качества</h3>
                <p className={styles['benefit-description']}>
                  Контроль качества выполнения заказа и разрешение споров
                </p>
              </div>
              {/* Преимущество 5 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={usersIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  Большой выбор исполнителей
                </h3>
                <p className={styles['benefit-description']}>
                  Тысячи исполнителей со всей России для любых рекламных задач
                </p>
              </div>
              {/* Преимущество 6 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={thumbsUpIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>Удобный интерфейс</h3>
                <p className={styles['benefit-description']}>
                  Простой процесс размещения заказа и выбора исполнителя
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['testimonials-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>Отзывы клиентов</h2>
              <p className={styles['section-description']}>
                Что говорят о нас заказчики и исполнители
              </p>
            </div>
            <div className={styles['testimonials-grid']}>
              {/* Отзыв 1 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label="Рейтинг: 5 из 5"
                  >
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className={styles['testimonial-content']}>
                  <p className={styles['testimonial-text']}>
                    "Отличная платформа! Быстро нашел исполнителя для
                    изготовления вывески для своего магазина. Качество работы
                    превзошло ожидания."
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label="Аватар Алексей Петров"
                    ></div>
                    <div>
                      <p className={styles['author-name']}>Алексей Петров</p>
                      <p className={styles['author-role']}>Владелец магазина</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Отзыв 2 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label="Рейтинг: 5 из 5"
                  >
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className={styles['testimonial-content']}>
                  <p className={styles['testimonial-text']}>
                    "Как исполнитель, я очень доволен платформой. Регулярно
                    получаю заказы на полиграфию, удобный интерфейс и быстрые
                    выплаты."
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label="Аватар Мария Иванова"
                    ></div>
                    <div>
                      <p className={styles['author-name']}>Мария Иванова</p>
                      <p className={styles['author-role']}>
                        Типография "ПринтМастер"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Отзыв 3 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label="Рейтинг: 4 из 5"
                  >
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />
                    <img
                      src={starEmptyIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['star-icon']}
                      aria-hidden="true"
                    />{' '}
                    {/* Пустая звезда */}
                  </div>
                </div>
                <div className={styles['testimonial-content']}>
                  <p className={styles['testimonial-text']}>
                    "Заказывали рекламные буклеты для выставки. Получили
                    несколько предложений и выбрали оптимальное по цене и
                    качеству. Рекомендую!"
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label="Аватар Сергей Николаев"
                    ></div>
                    <div>
                      <p className={styles['author-name']}>Сергей Николаев</p>
                      <p className={styles['author-role']}>
                        Маркетолог, ООО "ТехноПром"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['cta-section']}>
          <div className={styles.container}>
            <div className={styles['cta-content']}>
              <h2 className={styles['cta-title']}>
                Готовы начать работу с лучшими исполнителями?
              </h2>
              <p className={styles['cta-description']}>
                Разместите заказ прямо сейчас и получите предложения от
                проверенных исполнителей
              </p>
              <div className={styles['cta-buttons']}>
                <button
                  className={`${styles.button} ${styles['button-primary']} ${styles['button-lg']}`}
                >
                  Разместить заказ
                  <img
                    src={chevronRightIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['icon-right']}
                    aria-hidden="true"
                  />
                </button>
                <button
                  className={`${styles.button} ${styles['button-outline']} ${styles['button-lg']}`}
                >
                  Найти исполнителя
                  <img
                    src={chevronRightIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['icon-right']}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles['footer-grid']}>
            <div className={styles['footer-company']}>
              <h3 className={styles['footer-logo']}>РекламаПро</h3>
              <p className={styles['footer-description']}>
                Платформа, объединяющая заказчиков и исполнителей
                рекламно-производственных услуг по всей России.
              </p>
              <div className={styles['social-links']}>
                <a href="#" className={styles['social-link']}>
                  <img
                    src={facebookIcon || '/placeholder.svg'}
                    alt="Facebook" // alt должен быть осмысленным
                  />
                  <span className={styles['sr-only']}>Facebook</span>
                </a>
                <a href="#" className={styles['social-link']}>
                  <img src={twitterIcon || '/placeholder.svg'} alt="Twitter" />
                  <span className={styles['sr-only']}>Twitter</span>
                </a>
                <a href="#" className={styles['social-link']}>
                  <img
                    src={instagramIcon || '/placeholder.svg'}
                    alt="Instagram"
                  />
                  <span className={styles['sr-only']}>Instagram</span>
                </a>
              </div>
            </div>
            <div className={styles['footer-links']}>
              <h3 className={styles['footer-title']}>Для заказчиков</h3>
              <ul className={styles['footer-menu']}>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Как разместить заказ
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Как выбрать исполнителя
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Безопасная сделка
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Отзывы и рейтинги
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Часто задаваемые вопросы
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles['footer-links']}>
              <h3 className={styles['footer-title']}>Для исполнителей</h3>
              <ul className={styles['footer-menu']}>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Как стать исполнителем
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Комиссия платформы
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Правила работы
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Продвижение услуг
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    Выплаты
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles['footer-contact']}>
              <h3 className={styles['footer-title']}>Контакты</h3>
              <ul className={styles['contact-list']}>
                <li className={styles['contact-item']}>
                  <img
                    src={phoneIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>8 (800) 123-45-67</span>
                </li>
                <li className={styles['contact-item']}>
                  <img
                    src={mailIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>info@reklamapro.ru</span>
                </li>
                <li className={styles['contact-item']}>
                  <img
                    src={mapPinIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>г. Москва, ул. Примерная, д. 123</span>
                </li>
              </ul>
              <div className={styles.newsletter}>
                <h4 className={styles['newsletter-title']}>
                  Подпишитесь на новости
                </h4>
                <form
                  className={styles['newsletter-form']}
                  onSubmit={(e) => e.preventDefault()}
                >
                  {' '}
                  {/* Добавлен onSubmit */}
                  <input
                    type="email"
                    placeholder="Ваш email"
                    className={styles['newsletter-input']}
                    aria-label="Email для подписки на новости" // Добавлено для доступности
                  />
                  <button
                    type="submit"
                    className={`${styles.button} ${styles['button-primary']}`}
                  >
                    Подписаться
                  </button>{' '}
                  {/* Добавлен type="submit" */}
                </form>
              </div>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <p className={styles.copyright}>
              © 2023 РекламаПро. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomeV2;
