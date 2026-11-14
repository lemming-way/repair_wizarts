import {
  getBlocksPlainText,
  getYouTubeEmbedUrl,
  isSafeMediaUrl,
  resolveArticleMedia,
} from './articleContent';

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
      'https://ibronevik.itest24.com/taxi_dev2/c/tutor/api/v1/media/a.png',
    );
    expect(resolveArticleMedia('dropbox:12345')).toBe(
      'https://ibronevik.itest24.com/taxi_dev2/c/tutor/api/v1/dropbox/file/12345',
    );
    expect(resolveArticleMedia('dropbox:not-a-number')).toBe('');
    expect(resolveArticleMedia('javascript:alert(1)', '/articles/x/')).toBe('');
    expect(resolveArticleMedia('vbscript:msgbox(1)', '/articles/x/')).toBe('');
    expect(resolveArticleMedia('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
    expect(resolveArticleMedia('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(resolveArticleMedia('data:text/html;base64,AAAA')).toBe('');
  });

  it('allows only safe media URL schemes', () => {
    expect(isSafeMediaUrl('/articles/a/media/photo.jpg')).toBe(true);
    expect(isSafeMediaUrl('https://cdn.example.com/photo.jpg')).toBe(true);
    expect(isSafeMediaUrl('data:image/png;base64,AAAA')).toBe(true);
    expect(isSafeMediaUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeMediaUrl('vbscript:msgbox(1)')).toBe(false);
    expect(isSafeMediaUrl('data:text/html;base64,AAAA')).toBe(false);
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
