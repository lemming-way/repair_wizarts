import { getBlocksPlainText, getYouTubeEmbedUrl, resolveArticleMedia } from './articleContent';

describe('article content helpers', () => {
  it('builds YouTube embed urls for supported link formats', () => {
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );
    expect(getYouTubeEmbedUrl('https://youtu.be/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );
    expect(getYouTubeEmbedUrl('https://www.youtube.com/shorts/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );
    expect(getYouTubeEmbedUrl('https://www.youtube.com/embed/aqz-KE-bpKQ')).toBe(
      'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    );
  });

  it('rejects unsupported video links', () => {
    expect(getYouTubeEmbedUrl('https://vimeo.com/12345')).toBeNull();
    // eslint-disable-next-line no-script-url
    expect(getYouTubeEmbedUrl('javascript:alert(1)')).toBeNull();
    expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=bad')).toBeNull();
    expect(getYouTubeEmbedUrl(undefined)).toBeNull();
  });

  it('resolves local and remote media paths', () => {
    expect(resolveArticleMedia('media/cover.svg', '/articles/smartphone/')).toBe(
      '/articles/smartphone/media/cover.svg',
    );
    expect(resolveArticleMedia('media/cover.svg', 'https://cdn.example.com/blog/2/')).toBe(
      'https://cdn.example.com/blog/2/media/cover.svg',
    );
    expect(resolveArticleMedia('https://cdn.example.com/a.png', '/articles/x/')).toBe(
      'https://cdn.example.com/a.png',
    );
    expect(resolveArticleMedia('media/a.png')).toBe(
      'https://ibronevik.ru/taxi/c/tutor/api/v1/media/a.png',
    );
  });

  it('collects plain text from all display blocks', () => {
    const text = getBlocksPlainText([
      { type: 'heading', text: 'Заголовок' },
      { type: 'paragraph', text: 'Абзац' },
      {
        type: 'steps',
        items: [{ title: 'Шаг', text: 'Описание шага' }],
      },
      { type: 'table', headers: ['А'], rows: [['Б']] },
      { type: 'code', text: 'adb devices' },
    ]);

    expect(text).toContain('Заголовок');
    expect(text).toContain('Абзац');
    expect(text).toContain('Описание шага');
    expect(text).toContain('Б');
    expect(text).toContain('adb devices');
  });
});
