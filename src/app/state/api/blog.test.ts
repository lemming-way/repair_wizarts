import type { BlogArticle } from './blog';
import { normalizeBlogArticleContent, parseArticleContent } from './blog';

const baseArticle: BlogArticle = {
  id: 7,
  topic_id: 1,
  topic_name: 'Ремонт',
  title: 'Статья',
  excerpt: 'Старое описание',
  cover_url: null,
  author: { id: 1, name: 'Автор', avatar: '', role: 1 },
  created_at: '2026-11-04T10:00:00Z',
  updated_at: null,
  comments_count: 0,
};

describe('API article JSON normalization', () => {
  it('uses the Dropbox ID for a feed cover when its asset is registered at article level', () => {
    const content = JSON.stringify({
      format_version: '1.3',
      cover: { file: 'media/cover.svg' },
      blocks: [{ type: 'paragraph', text: 'Текст' }],
    });

    const article = normalizeBlogArticleContent({
      ...baseArticle,
      content,
      assets: [{ file: 'media/cover.svg', type: 'image', dl_id: 73142 }],
    });

    expect(article.cover_url).toBe('dropbox:73142');
  });

  it('returns null for legacy HTML content', () => {
    expect(parseArticleContent('<p>Текст</p>')).toBeNull();
  });

  it('extracts blocks, summary and media base from JSON content', () => {
    const content = JSON.stringify({
      format_version: '1.3',
      summary: 'Описание из JSON',
      media_base_url: 'https://cdn.example.com/blog/7/',
      cover: { file: 'media/cover.svg' },
      blocks: [{ type: 'paragraph', text: 'Текст статьи' }],
      assets: [],
      technical_knowledge: { schema_version: '1.0' },
    });

    const article = normalizeBlogArticleContent({ ...baseArticle, content });

    expect(article.excerpt).toBe('Описание из JSON');
    expect(article.cover_url).toBe('https://cdn.example.com/blog/7/media/cover.svg');
    expect(article.media_base_url).toBe('https://cdn.example.com/blog/7/');
    expect(article.format_version).toBe('1.3');
    expect(article.blocks).toEqual([{ type: 'paragraph', text: 'Текст статьи' }]);
    expect(article.technical_knowledge).toEqual({ schema_version: '1.0' });
  });

  it('builds excerpt and media base when JSON has no summary or media_base_url', () => {
    const content = JSON.stringify({
      format_version: '1.3',
      cover: { file: 'media/cover.svg' },
      blocks: [
        { type: 'heading', text: 'Заголовок' },
        { type: 'paragraph', text: 'Текст для описания' },
      ],
    });

    const article = normalizeBlogArticleContent({ ...baseArticle, content });

    expect(article.excerpt).toContain('Текст для описания');
    expect(article.cover_url).toContain('/media/cover.svg');
    expect(article.media_base_url?.endsWith('/')).toBe(true);
  });
});
