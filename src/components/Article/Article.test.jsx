import { configureStore } from '@reduxjs/toolkit';
import { render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

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

jest.mock('../../shared/ui/SwiperWrapper', () => ({
  SwiperWithModules: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('./ArticleComments', () => {
  return function ArticleComments() {
    return <div data-testid="article-comments">Comments</div>;
  };
});

// Suppress React Router future flag warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('React Router Future Flag Warning')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

const mockStore = configureStore({
  reducer: {
    ui: uiReducer,
  },
  preloadedState: {
    ui: {
      isAuthorized: false,
    },
  },
});

const mockArticleData = {
  id: 1,
  title: 'Test Article',
  views: 100,
  created_at: '2023-10-05T00:00:00Z',
  text: '<p>Содержимое статьи в формате HTML.</p><script>alert("XSS")</script><img src="x" onerror="alert(\'XSS\')" />',
  likes: 5,
};

const renderWithRouter = (component, initialEntries = ['/articles/1']) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

const renderArticle = () => renderWithRouter(<Article />);

describe('Article Component - HTML Sanitization', () => {
  beforeEach(() => {
    articleService.getArticle.mockResolvedValue(mockArticleData);
    articleService.getArticles.mockResolvedValue([]);
    articleService.getArticleComments.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders sanitized HTML content', async () => {
    renderArticle();

    const bodyContent = await screen.findByTestId('article-body');
    expect(bodyContent).toHaveTextContent('Содержимое статьи в формате HTML.');
  });

  it('removes unsafe markup from rendered content', async () => {
    renderArticle();

    const bodyContent = await screen.findByTestId('article-body');
    const scripts = within(bodyContent).queryByText((_, element) => element.tagName.toLowerCase() === 'script');
    const inlineImages = within(bodyContent).getAllByRole('img');

    expect(scripts).not.toBeInTheDocument();
    inlineImages.forEach((img) => {
      expect(img).not.toHaveAttribute('onerror');
    });
  });

  it('preserves safe HTML elements', async () => {
    renderArticle();

    const paragraphs = await screen.findAllByText('Содержимое статьи в формате HTML.', { selector: 'p' });
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('renders article header with title and metadata', async () => {
    renderArticle();

    expect(await screen.findByRole('heading', { level: 2, name: 'Test Article' })).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText('5.10.2023')).toBeInTheDocument();
  });

  it('renders article comments section', async () => {
    renderArticle();

    expect(await screen.findByTestId('article-comments')).toBeInTheDocument();
  });

});
