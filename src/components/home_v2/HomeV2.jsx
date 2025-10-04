import React, { useState } from 'react';

import styles from './HomeV2.module.css';

// Import SVG icons
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
import { useLanguage } from '../../state/language';

// @deleteme: temporarily disabled warnings, remove later
/* eslint-disable jsx-a11y/anchor-is-valid */

function HomeV2() {
  const text = useLanguage();
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
              {/* Ensure the menuIcon variable is defined/imported */}
              <img src={menuIcon || '/placeholder.svg'} alt={text('Menu')} />
              <span className={styles['sr-only']}>{text('Open menu')}</span>
            </button>
            <a href="/" className={styles.logo}>
              {text('ReklamaPro')}
            </a>
          </div>
          <nav className={styles['desktop-nav']}>
            <a href="#" className={styles['nav-link']}>
              {text('How it works')}
            </a>
            <a href="#" className={styles['nav-link']}>
              {text('Categories')}
            </a>
            <a href="#" className={styles['nav-link']}>
              {text('Contractor catalog')}
            </a>
            <a href="#" className={styles['nav-link']}>
              {text('For performers')}
            </a>
            <a href="#" className={styles['nav-link']}>
              {text('For customers')}
            </a>
            <a href="#" className={styles['nav-link']}>
              {text('About us')}
            </a>
          </nav>
          <div className={styles['header-right']}>
            <button className={styles['search-button']}>
              {/* Ensure the searchIcon variable is defined/imported */}
              <img src={searchIcon || '/placeholder.svg'} alt={text('Search')} />
              <span className={styles['sr-only']}>{text('Search')}</span>
            </button>
            <div className={styles['auth-buttons']}>
              <button
                className={`${styles.button} ${styles['button-outline']}`}
              >
                {text('Sign in')}
              </button>
              <button
                className={`${styles.button} ${styles['button-primary']}`}
              >
                {text('Sign up')}
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
                {text('ReklamaPro')}
              </a>
              <button
                className={styles['close-button']}
                onClick={() => setMobileMenuOpen(false)}
              >
                {/* Ensure the closeIcon variable is defined/imported */}
                <img src={closeIcon || '/placeholder.svg'} alt={text('Close')} />
                <span className={styles['sr-only']}>{text('Close menu')}</span>{' '}
                {/* Added for accessibility */}
              </button>
            </div>
            <nav className={styles['mobile-nav']}>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('How it works')}
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('Categories')}
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('Contractor catalog')}
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('For performers')}
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('For customers')}
              </a>
              <a href="#" className={styles['mobile-nav-link']}>
                {text('About us')}
              </a>
            </nav>
            <div className={styles['mobile-auth-buttons']}>
              <button
                className={`${styles.button} ${styles['button-outline']} ${styles['full-width']}`}
              >
                {text('Sign in')}
              </button>
              <button
                className={`${styles.button} ${styles['button-primary']} ${styles['full-width']}`}
              >
                {text('Sign up')}
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
                  {text('Connecting clients with advertising service providers')}
                </h1>
                <p className={styles['hero-description']}>
                  {text('Create an order for signage, brochures, or other advertising materials and receive offers from vetted contractors.')}
                </p>
                <div className={styles['hero-buttons']}>
                  <button
                    className={`${styles.button} ${styles['button-primary']}`}
                  >
                    {text('Post an order')}
                    {/* Ensure the chevronRightIcon variable is defined/imported */}
                    <img
                      src={chevronRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true" // Added for accessibility
                    />
                  </button>
                  <button
                    className={`${styles.button} ${styles['button-outline']}`}
                  >
                    {text('Find a contractor')}
                  </button>
                </div>
              </div>
              <div className={styles['hero-form-container']}>
                {/* Prefer using the <form> tag for forms */}
                <form
                  className={styles['hero-form']}
                  onSubmit={(e) => e.preventDefault()}
                >
                  {' '}
                  {/* Added onSubmit */}
                  <h3 className={styles['form-title']}>
                    {text('Quick contractor search')}
                  </h3>
                  <div className={styles['form-group']}>
                    <label htmlFor="category" className={styles['form-label']}>
                      {text('Service category')}
                    </label>
                    <select id="category" className={styles['form-select']}>
                      <option value="">{text('Select a category')}</option>
                      <option value="signage">{text('Outdoor advertising')}</option>
                      <option value="print">{text('Printing')}</option>
                      <option value="digital">{text('Digital advertising')}</option>
                      <option value="design">{text('Design')}</option>
                    </select>
                  </div>
                  <div className={styles['form-group']}>
                    <label htmlFor="location" className={styles['form-label']}>
                      {text('City')}
                    </label>
                    <input
                      id="location"
                      className={styles['form-input']}
                      placeholder={text('Enter city')}
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label
                      htmlFor="description"
                      className={styles['form-label']}
                    >
                      {text('Order description')}
                    </label>
                    <textarea
                      id="description"
                      className={styles['form-textarea']}
                      placeholder={text('Describe your order...')}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className={`${styles.button} ${styles['button-primary']} ${styles['full-width']}`}
                  >
                    {' '}
                    {/* Added type="submit" */}
                    {text('Find contractors')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['how-it-works-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>{text('How it works')}</h2>
              <p className={styles['section-description']}>
                {text('A simple process for clients and advertising contractors')}
              </p>
            </div>
            <div className={styles['steps-grid']}>
            {/* Step 1 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={clipboardIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  {text('1. Create an order')}
                </h3>
                <p className={styles['step-description']}>
                  {text('Describe your project, specify requirements and budget')}
                </p>
              </div>
            {/* Step 2 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={searchIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  {text('2. Receive proposals')}
                </h3>
                <p className={styles['step-description']}>
                  {text('Contractors respond with their services and pricing')}
                </p>
              </div>
            {/* Step 3 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={userCheckIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  {text('3. Choose a contractor')}
                </h3>
                <p className={styles['step-description']}>
                  {text('Compare offers or pick directly from the catalog')}
                </p>
              </div>
            {/* Step 4 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={messageIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  {text('4. Discuss the details')}
                </h3>
                <p className={styles['step-description']}>
                  {text('Agree on all project details with the contractor')}
                </p>
              </div>
            {/* Step 5 */}
              <div className={styles.step}>
                <div className={styles['step-icon']}>
                  <img
                    src={checkCircleIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['step-title']}>
                  {text('5. Finalize the deal')}
                </h3>
                <p className={styles['step-description']}>
                  {text('Close the deal through the platform with quality assurance')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['categories-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>
                {text('Service categories')}
              </h2>
              <p className={styles['section-description']}>
                {text('Find contractors for any advertising task')}
              </p>
            </div>
            <div className={styles['categories-grid']}>
              {/* Category card 1 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Outdoor advertising')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Signage, banners, light boxes')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400" // Keep placeholder images for categories
                    alt={text('Outdoor advertising')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Category card 2 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Printing')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Brochures, business cards, catalogs')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={text('Printing')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Category card 3 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Promotional merchandise')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Branded items and gifts')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={text('Promotional merchandise')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Category card 4 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Design')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Design of layouts and brand identity')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={text('Design')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Category card 5 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Large-format printing')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Posters, prints, wall murals')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={text('Large-format printing')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
                    <img
                      src={arrowRightIcon || '/placeholder.svg'}
                      alt=""
                      className={styles['icon-right']}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
              {/* Category card 6 */}
              <div className={styles['category-card']}>
                <div className={styles['category-header']}>
                  <h3 className={styles['category-title']}>
                    {text('Digital advertising')}
                  </h3>
                  <p className={styles['category-subtitle']}>
                    {text('Banners, animations, video ads')}
                  </p>
                </div>
                <div className={styles['category-content']}>
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={text('Digital advertising')}
                    className={styles['category-image']}
                  />
                </div>
                <div className={styles['category-footer']}>
                  <button
                    className={`${styles.button} ${styles['button-text']}`}
                  >
                    {text('Find a contractor')}
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
                {text('Show all categories')}
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
                {text('Popular contractors')}
              </h2>
              <p className={styles['section-description']}>
                {text('Choose a vetted contractor from our catalog')}
              </p>
            </div>
            <div className={styles['providers-grid']}>
              {/* Contractor card 1 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    {/* Avatar: use div or img */}
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label={text('Avatar PrintMaster')}
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>
                        {text('PrintMaster')}
                      </h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label={text('Rating: 5 of 5')}
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
                    <span className={styles.tag}>{text('Printing')}</span>
                    <span className={styles.tag}>{text('Business cards')}</span>
                    <span className={styles.tag}>{text('Brochures')}</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    {text('Full-cycle print shop with modern equipment.')}
                    {text('We complete orders of any complexity quickly.')}
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>
                    {text('Moscow')}
                  </span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    {text('Offer an order')}
                  </button>
                </div>
              </div>
              {/* Contractor card 2 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label={text('Avatar ReklamaPlus')}
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>
                        {text('ReklamaPlus')}
                      </h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label={text('Rating: 4 of 5')}
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
                        {/* Empty star */}
                        <span className={styles['rating-count']}>(94)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['provider-tags']}>
                    <span className={styles.tag}>{text('Outdoor advertising')}</span>
                    <span className={styles.tag}>{text('Signage')}</span>
                    <span className={styles.tag}>{text('Installation')}</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    {text('Production and installation of outdoor advertising of any complexity.')}
                    {text('In-house production with quality guarantee.')}
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>
                    {text('Saint Petersburg')}
                  </span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    {text('Offer an order')}
                  </button>
                </div>
              </div>
              {/* Contractor card 3 */}
              <div className={styles['provider-card']}>
                <div className={styles['provider-header']}>
                  <div className={styles['provider-info']}>
                    <div
                      className={styles['provider-avatar']}
                      role="img"
                      aria-label={text('Avatar DesignPro')}
                    ></div>
                    <div>
                      <h3 className={styles['provider-name']}>
                        {text('DesignPro')}
                      </h3>
                      <div
                        className={styles['provider-rating']}
                        aria-label={text('Rating: 5 of 5')}
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
                    <span className={styles.tag}>{text('Design')}</span>
                    <span className={styles.tag}>{text('Branding')}</span>
                    <span className={styles.tag}>{text('Logotypes')}</span>
                  </div>
                </div>
                <div className={styles['provider-content']}>
                  <p className={styles['provider-description']}>
                    {text('Creative design studio. We develop brand identity, logos, and advertising layouts.')}
                  </p>
                </div>
                <div className={styles['provider-footer']}>
                  <span className={styles['provider-location']}>
                    {text('Remote')}
                  </span>
                  <button
                    className={`${styles.button} ${styles['button-outline']} ${styles['button-sm']}`}
                  >
                    {text('Offer an order')}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles['section-footer']}>
              <button
                className={`${styles.button} ${styles['button-primary']}`}
              >
                {text('Browse contractor catalog')}
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
                {text('Platform advantages')}
              </h2>
              <p className={styles['section-description']}>
                {text('Why clients and contractors choose our platform')}
              </p>
            </div>
            <div className={styles['benefits-grid']}>
              {/* Benefit 1 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={checkCircleIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('Verified contractors')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Every contractor is vetted and has client ratings')}
                </p>
              </div>
              {/* Benefit 2 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={creditCardIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('Secure payments')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Pay through the platform with fraud protection')}
                </p>
              </div>
              {/* Benefit 3 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={clockIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('Time savings')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Quickly find contractors and receive proposals')}
                </p>
              </div>
              {/* Benefit 4 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={shieldIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('Quality assurance')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Quality control and dispute resolution support')}
                </p>
              </div>
              {/* Benefit 5 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={usersIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('Wide contractor selection')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Thousands of contractors across Russia for any advertising task')}
                </p>
              </div>
              {/* Benefit 6 */}
              <div className={styles.benefit}>
                <div className={styles['benefit-icon']}>
                  <img
                    src={thumbsUpIcon || '/placeholder.svg'}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <h3 className={styles['benefit-title']}>
                  {text('User-friendly interface')}
                </h3>
                <p className={styles['benefit-description']}>
                  {text('Easy order placement and contractor selection process')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles['testimonials-section']}>
          <div className={styles.container}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>
                {text('Client testimonials')}
              </h2>
              <p className={styles['section-description']}>
                {text('What clients and contractors say about us')}
              </p>
            </div>
            <div className={styles['testimonials-grid']}>
              {/* Testimonial 1 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label={text('Rating: 5 of 5')}
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
                    {text('Testimonial highlight signage order')}
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label={text('Avatar Alexey Petrov')}
                    ></div>
                    <div>
                      <p className={styles['author-name']}>
                        {text('Alexey Petrov')}
                      </p>
                      <p className={styles['author-role']}>
                        {text('Store owner')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Testimonial 2 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label={text('Rating: 5 of 5')}
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
                    {text('Testimonial happy contractor printing')}
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label={text('Avatar Maria Ivanova')}
                    ></div>
                    <div>
                      <p className={styles['author-name']}>
                        {text('Maria Ivanova')}
                      </p>
                      <p className={styles['author-role']}>
                        {text('PrintMaster typography representative')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Testimonial 3 */}
              <div className={styles['testimonial-card']}>
                <div className={styles['testimonial-header']}>
                  <div
                    className={styles['testimonial-rating']}
                    aria-label={text('Rating: 4 of 5')}
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
                    {/* Empty star */}
                  </div>
                </div>
                <div className={styles['testimonial-content']}>
                  <p className={styles['testimonial-text']}>
                    {text('Testimonial exhibition brochures success')}
                  </p>
                </div>
                <div className={styles['testimonial-footer']}>
                  <div className={styles['testimonial-author']}>
                    <div
                      className={styles['author-avatar']}
                      role="img"
                      aria-label={text('Avatar Sergey Nikolaev')}
                    ></div>
                    <div>
                      <p className={styles['author-name']}>
                        {text('Sergey Nikolaev')}
                      </p>
                      <p className={styles['author-role']}>
                        {text('Marketing specialist, TechnoProm LLC')}
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
                {text('Ready to start working with top contractors?')}
              </h2>
              <p className={styles['cta-description']}>
                {text('Post an order right now and receive offers from vetted contractors')}
              </p>
              <div className={styles['cta-buttons']}>
                <button
                  className={`${styles.button} ${styles['button-primary']} ${styles['button-lg']}`}
                >
                  {text('Post an order')}
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
                  {text('Find a contractor')}
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
                <h3 className={styles['footer-logo']}>{text('ReklamaPro')}</h3>
                <p className={styles['footer-description']}>
                  {text('A platform connecting clients and providers of advertising production services across Russia.')}
                </p>
              <div className={styles['social-links']}>
                <a href="#" className={styles['social-link']}>
                  <img
                    src={facebookIcon || '/placeholder.svg'}
                    alt="Facebook" // alt must remain meaningful
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
              <h3 className={styles['footer-title']}>
                {text('For customers')}
              </h3>
              <ul className={styles['footer-menu']}>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('How to post an order')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('How to choose a contractor')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Safe deal')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Reviews and ratings')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Frequently asked questions')}
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles['footer-links']}>
              <h3 className={styles['footer-title']}>
                {text('For performers')}
              </h3>
              <ul className={styles['footer-menu']}>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('How to become a contractor')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Platform commission')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Work rules')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Promoting services')}
                  </a>
                </li>
                <li>
                  <a href="#" className={styles['footer-link']}>
                    {text('Payouts')}
                  </a>
                </li>
              </ul>
            </div>
            <div className={styles['footer-contact']}>
              <h3 className={styles['footer-title']}>
                {text('Contacts')}
              </h3>
              <ul className={styles['contact-list']}>
                <li className={styles['contact-item']}>
                  <img
                    src={phoneIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>{text('Phone placeholder 1')}</span>
                </li>
                <li className={styles['contact-item']}>
                  <img
                    src={mailIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>{text('Email placeholder 1')}</span>
                </li>
                <li className={styles['contact-item']}>
                  <img
                    src={mapPinIcon || '/placeholder.svg'}
                    alt=""
                    className={styles['contact-icon']}
                    aria-hidden="true"
                  />
                  <span>{text('Address placeholder 1')}</span>
                </li>
              </ul>
              <div className={styles.newsletter}>
                <h4 className={styles['newsletter-title']}>
                  {text('Subscribe to updates')}
                </h4>
                <form
                  className={styles['newsletter-form']}
                  onSubmit={(e) => e.preventDefault()}
                >
                  {' '}
                  {/* Added onSubmit */}
                  <input
                    type="email"
                    placeholder={text('Your email')}
                    className={styles['newsletter-input']}
                    aria-label={text('Email for newsletter subscription')} // Added for accessibility
                  />
                  <button
                    type="submit"
                    className={`${styles.button} ${styles['button-primary']}`}
                  >
                    {text('Subscribe')}
                  </button>{' '}
                  {/* Added type="submit" */}
                </form>
              </div>
            </div>
          </div>
          <div className={styles['footer-bottom']}>
            <p className={styles.copyright}>
              {text('© 2023 ReklamaPro. All rights reserved.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomeV2;
