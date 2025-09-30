import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import Article from './Article';
import * as articleService from '../../services/article.service';
import uiReducer from '../../slices/ui.slice';

jest.mock('../../services/article.service');
jest.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));
jest.mock('swiper', () => ({
  Navigation: {},
}));

const mockStore = configureStore({
  reducer: {
    ui: uiReducer,
  },
});

const mockArticleData = {
  id: 1,
  title: 'Test Article',
  views: 100,
  created_at: '2023-10-05T00:00:00Z',
  text: '<p>Safe content</p><script>alert("XSS")</script><img src="x" onerror="alert(\'XSS\')" />',
  likes: 5,
};

describe('Article Component - HTML Sanitization', () => {
  beforeEach(() => {
    articleService.getArticle.mockResolvedValue(mockArticleData);
    articleService.getArticles.mockResolvedValue([]);
    articleService.getArticleComments = jest.fn().mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders sanitized HTML content', async () => {
    const { container } = render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Article />
        </BrowserRouter>
      </Provider>
    );

    const bodyContent = container.querySelector('[class*="bodyContent"]');
    expect(bodyContent).toBeInTheDocument();
    expect(bodyContent?.innerHTML).toContain('Содержимое статьи в формате HTML');
  });

  it('removes script tags from rendered content', async () => {
    const { container } = render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Article />
        </BrowserRouter>
      </Provider>
    );

    const scripts = container.querySelectorAll('script');
    expect(scripts.length).toBe(0);
  });

  it('removes dangerous inline event handlers from rendered content', async () => {
    const { container } = render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Article />
        </BrowserRouter>
      </Provider>
    );

    const bodyContent = container.querySelector('[class*="bodyContent"]');
    const elementsWithOnError = bodyContent?.querySelectorAll('[onerror]');
    const elementsWithOnClick = bodyContent?.querySelectorAll('[onclick]');
    const elementsWithOnLoad = bodyContent?.querySelectorAll('[onload]');

    expect(elementsWithOnError?.length || 0).toBe(0);
    expect(elementsWithOnClick?.length || 0).toBe(0);
    expect(elementsWithOnLoad?.length || 0).toBe(0);
  });

  it('preserves safe HTML elements', async () => {
    const { container } = render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <Article />
        </BrowserRouter>
      </Provider>
    );

    const bodyContent = container.querySelector('[class*="bodyContent"]');
    const paragraphs = bodyContent?.querySelectorAll('p');

    expect(paragraphs && paragraphs.length > 0).toBe(true);
  });
});
