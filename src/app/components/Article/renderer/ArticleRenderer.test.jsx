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
    type: 'list',
    style: 'ordered',
    items: ['Отключить питание', 'Проверить отсутствие напряжения'],
  },
  {
    type: 'quote',
    text: 'Сначала безопасность, затем диагностика.',
    caption: 'Правило ремонта',
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
    type: 'model_3d',
    file: 'media/model.glb',
    caption: '3D-модель',
    alt: 'Модель',
    controls: { rotate: true, zoom: true, pan: false },
    camera: { azimuth: 35, elevation: 65 },
    scale: 1,
  },
];

describe('ArticleRenderer — Article Format 1.3', () => {
  it('renders all 12 supported block types in the supplied order', () => {
    const { container } = render(
      <ArticleRenderer blocks={blocks} mediaBaseUrl="/articles/demo/" />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Подготовка' })).toBeInTheDocument();
    expect(screen.getByText('Перед началом работы выключите устройство.')).toBeInTheDocument();
    expect(screen.getByAltText('Схема')).toHaveAttribute('src', '/articles/demo/media/cover.svg');
    expect(screen.getByText('Схема устройства')).toBeInTheDocument();

    expect(screen.getByText('Первый этап')).toBeInTheDocument();
    expect(screen.getByText('Второй этап')).toBeInTheDocument();
    expect(screen.getByTitle('Демонстрация')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );

    expect(screen.getByRole('list', { name: '' })).toBeInTheDocument();
    expect(screen.getByText('Отключить питание')).toBeInTheDocument();
    expect(screen.getByText('Сначала безопасность, затем диагностика.')).toBeInTheDocument();
    expect(screen.getByText('Правило ремонта')).toBeInTheDocument();

    expect(screen.getByText('Совет')).toBeInTheDocument();
    expect(screen.getByText('Проверьте комплект зарядки.')).toBeInTheDocument();
    expect(screen.getByText('Снять крышку')).toBeInTheDocument();
    expect(screen.getByText('Не повредите шлейф.')).toBeInTheDocument();

    expect(screen.getByRole('columnheader', { name: 'Точка' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'VBAT' })).toBeInTheDocument();
    expect(screen.getByText(/adb devices/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Копировать' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Показать 3D-модель/ })).toBeInTheDocument();

    const renderedBlockTypes = [
      '.heading',
      '.paragraph',
      '.figure',
      '.gallery',
      '.videoFigure',
      '.orderedList',
      '.quote',
      '.callout',
      '.steps',
      '.tableWrap',
      '.codeBlock',
      '.modelFigure',
    ];
    renderedBlockTypes.forEach((selector) => {
      expect(container.querySelector(selector)).not.toBeNull();
    });
  });

  it('renders ordered and unordered lists with their declared semantics', () => {
    render(
      <ArticleRenderer
        blocks={[
          { type: 'list', style: 'ordered', items: ['Первый', 'Второй'] },
          { type: 'list', style: 'unordered', items: ['А', 'Б'] },
        ]}
      />,
    );

    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('Первый').closest('ol')).not.toBeNull();
    expect(screen.getByText('А').closest('ul')).not.toBeNull();
  });

  it('renders numbered steps in their original order with optional fields', () => {
    render(<ArticleRenderer blocks={blocks} mediaBaseUrl="/articles/demo/" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Не повредите шлейф.')).toBeInTheDocument();
  });

  it('skips unknown blocks and technical_knowledge without hiding valid neighbors', () => {
    render(
      <ArticleRenderer
        blocks={[
          { type: 'paragraph', text: 'До неизвестного блока' },
          { type: 'unknown_block', text: 'Не показывать' },
          { type: 'technical_knowledge', text: 'Технические данные не являются блоком' },
          { type: 'paragraph', text: 'После неизвестного блока' },
        ]}
      />,
    );

    expect(screen.getByText('До неизвестного блока')).toBeInTheDocument();
    expect(screen.getByText('После неизвестного блока')).toBeInTheDocument();
    expect(screen.queryByText('Не показывать')).not.toBeInTheDocument();
    expect(screen.queryByText('Технические данные не являются блоком')).not.toBeInTheDocument();
  });

  it('treats article text as text and never creates elements from HTML-like input', () => {
    const payload = '<img src=x onerror=alert(1)> <script>alert(2)</script>';
    const { container } = render(
      <ArticleRenderer blocks={[{ type: 'paragraph', text: payload }]} />,
    );

    expect(screen.getByText(payload)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  it('does not embed unsupported or script-based video URLs', () => {
    const { container } = render(
      <ArticleRenderer
        blocks={[
          { type: 'video', url: 'https://vimeo.com/12345', caption: 'Внешнее видео' },
          { type: 'video', url: 'javascript:alert(1)', caption: 'Недопустимая ссылка' },
        ]}
      />,
    );

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Видео недоступно для встроенного просмотра.')).toBeInTheDocument();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('omits unsafe image and 3D media URLs without breaking adjacent text', () => {
    const { container } = render(
      <ArticleRenderer
        blocks={[
          { type: 'paragraph', text: 'Статья продолжает отображаться' },
          { type: 'image', file: 'javascript:alert(1)', alt: 'Опасное изображение' },
          { type: 'model_3d', file: 'javascript:alert(1)', alt: 'Опасная модель' },
        ]}
      />,
    );

    expect(screen.getByText('Статья продолжает отображаться')).toBeInTheDocument();
    expect(screen.queryByAltText('Опасное изображение')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Опасная модель')).not.toBeInTheDocument();
    expect(container.querySelector('model-viewer')).toBeNull();
  });

  it('clamps heading levels to the supported range', () => {
    render(
      <ArticleRenderer
        blocks={[
          { type: 'heading', level: 1, text: 'Слишком высокий уровень' },
          { type: 'heading', level: 8, text: 'Слишком низкий уровень' },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Слишком высокий уровень' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Слишком низкий уровень' })).toBeInTheDocument();
  });
});
