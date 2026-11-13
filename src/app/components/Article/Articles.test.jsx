import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Articles from './Articles';

jest.mock('../../hooks/useBlog', () => ({
  useBlogArticles: () => ({
    data: [
      {
        id: 1,
        topic_name: 'Ремонт бытовой техники',
        title: 'Чайник не включается',
        excerpt: 'Проверка чайника',
        cover_url: null,
        author: { id: 0, name: 'Редакция', avatar: '', role: 0 },
        created_at: '2026-11-04T10:00:00Z',
        updated_at: null,
        comments_count: 0,
      },
      {
        id: 3,
        topic_name: 'Ремонт другой техники',
        title: 'Статья без автора',
        excerpt: 'Проверка отсутствующего автора',
        cover_url: null,
        author: null,
        created_at: '2026-11-04T10:00:00Z',
        updated_at: null,
        comments_count: 0,
      },
      {
        id: 2,
        topic_name: 'Ремонт смартфонов',
        title: 'Смартфон не заряжается',
        excerpt: 'Проверка смартфона',
        cover_url: null,
        author: { id: 3, name: 'Мастер', avatar: '', role: 2 },
        created_at: '2026-11-04T10:00:00Z',
        updated_at: null,
        comments_count: 0,
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

describe('Articles catalog', () => {
  it('opens the mobile filters panel and closes it after selecting a filter', async () => {
    render(
      <MemoryRouter>
        <Articles />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: /^Фильтры/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(screen.getByRole('button', { name: /Ремонт смартфонов/ }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters articles by author together with category', async () => {
    render(
      <MemoryRouter>
        <Articles />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: /Мастер/ }));

    expect(screen.queryByRole('heading', { name: 'Чайник не включается' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();
    expect(screen.getByText('Автор:')).toBeInTheDocument();

    // Click "Все авторы" to reset author filter (since category was never set)
    await userEvent.click(screen.getByRole('button', { name: /Все авторы/ }));
    // Wait for filter panel to close
    const toggle = screen.getByRole('button', { name: /^Фильтры/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    expect(
      await screen.findByRole('heading', { name: 'Чайник не включается' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();
  });

  it('filters by author when an article has no author metadata', async () => {
    render(
      <MemoryRouter>
        <Articles />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Статья без автора' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Мастер/ }));

    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Статья без автора' })).not.toBeInTheDocument();
  });

  it('filters articles by category and resets the filter', async () => {
    render(
      <MemoryRouter>
        <Articles />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Чайник не включается' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Ремонт смартфонов/ }));

    expect(screen.queryByRole('heading', { name: 'Чайник не включается' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();
    expect(screen.getByText('Категория:')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Сбросить' }));

    expect(screen.getByRole('heading', { name: 'Чайник не включается' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Смартфон не заряжается' })).toBeInTheDocument();
  });
});
