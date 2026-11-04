import { render, screen } from '@testing-library/react';

import ArticleRenderer from './ArticleRenderer';

class IntersectionObserverStub {
  observe() {}

  unobserve() {}

  disconnect() {}
}

beforeAll(() => {
  window.IntersectionObserver = window.IntersectionObserver || IntersectionObserverStub;
});

const blocks = [
  { type: 'heading', level: 2, text: 'Подготовка' },
  { type: 'paragraph', text: 'Перед началом работы выключите устройство.' },
  {
    type: 'image',
    file: 'media/cover.svg',
    caption: 'Схема устройства',
    alt: 'Схема',
  },
  {
    type: 'callout',
    style: 'tip',
    title: 'Совет',
    text: 'Проверьте комплект зарядки.',
  },
  {
    type: 'steps',
    items: [
      { title: 'Снять крышку', text: 'Аккуратно снимите крышку.' },
      {
        title: 'Отключить аккумулятор',
        text: 'Отсоедините разъём.',
        warning: 'Не повредите шлейф.',
      },
    ],
  },
  {
    type: 'table',
    headers: ['Точка', 'Значение'],
    rows: [['VBAT', '3.7–4.2 V']],
  },
  { type: 'code', language: 'bash', text: 'adb devices\nadb reboot' },
  {
    type: 'gallery',
    images: [
      { file: 'media/cover.svg', caption: 'Первый этап', alt: 'Первый' },
      { file: 'media/cover.svg', caption: 'Второй этап', alt: 'Второй' },
    ],
  },
  {
    type: 'video',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    caption: 'Демонстрация',
  },
  {
    type: 'model_3d',
    file: 'media/model.glb',
    caption: '3D-модель',
    alt: 'Модель',
    controls: { rotate: true, zoom: true, pan: false },
    camera: { azimuth: 35, elevation: 65 },
    scale: 1,
  },
];

describe('ArticleRenderer', () => {
  it('renders all supported blocks in order', () => {
    render(<ArticleRenderer blocks={blocks} mediaBaseUrl="/articles/demo/" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Подготовка' })).toBeInTheDocument();
    expect(screen.getByText('Перед началом работы выключите устройство.')).toBeInTheDocument();
    expect(screen.getByAltText('Схема')).toHaveAttribute('src', '/articles/demo/media/cover.svg');
    expect(screen.getByText('Схема устройства')).toBeInTheDocument();

    expect(screen.getByText('Совет')).toBeInTheDocument();
    expect(screen.getByText('Проверьте комплект зарядки.')).toBeInTheDocument();
    expect(screen.getByText('Снять крышку')).toBeInTheDocument();
    expect(screen.getByText('Не повредите шлейф.')).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: 'Точка' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'VBAT' })).toBeInTheDocument();
    expect(screen.getByText(/adb devices/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument();

    expect(screen.getByText('Первый этап')).toBeInTheDocument();
    expect(screen.getByText('Второй этап')).toBeInTheDocument();
    expect(screen.getByTitle('Демонстрация')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );

    expect(screen.getByRole('button', { name: /Показать 3D-модель/ })).toBeInTheDocument();
  });

  it('renders numbered steps', () => {
    render(<ArticleRenderer blocks={blocks} mediaBaseUrl="/articles/demo/" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('skips unknown blocks and does not render technical knowledge', () => {
    render(
      <ArticleRenderer
        blocks={[
          { type: 'unknown' },
          { type: 'paragraph', text: 'Видимый текст' },
          { type: 'technical_knowledge', text: 'Скрыто' },
        ]}
      />,
    );

    expect(screen.getByText('Видимый текст')).toBeInTheDocument();
    expect(screen.queryByText('Скрыто')).not.toBeInTheDocument();
  });
});
