import { BlogComment } from 'app/state/api/blog';
import {
  buildCommentTree,
  countUnicodeChars,
  getArticleCover,
  getArticleExcerpt,
  getInitials,
  resolveMediaUrl,
  stripHtml,
} from './blog';

const comment = (id: number, parentId: number | null = null): BlogComment => ({
  id,
  article_id: 10,
  parent_id: parentId,
  author: { id: 1, name: 'Иван', avatar: '', role: 1 },
  text: `Комментарий ${id}`,
  created_at: '2026-11-03T10:00:00Z',
  updated_at: null,
  deleted: false,
  can_edit: false,
  can_delete: false,
});

describe('blog helpers', () => {
  it('strips html and script/style content', () => {
    expect(stripHtml('<p>Привет</p><script>alert(1)</script><style>.a{}</style>')).toBe('Привет');
  });

  it('builds a comment tree and keeps orphan comments at root', () => {
    const tree = buildCommentTree([
      comment(1),
      comment(2, 1),
      comment(3, 2),
      comment(4),
      comment(5, 999),
    ]);

    expect(tree).toHaveLength(3);
    expect(tree[0].id).toBe(1);
    expect(tree[0].children[0].id).toBe(2);
    expect(tree[0].children[0].children[0].id).toBe(3);
    expect(tree[1].id).toBe(4);
    expect(tree[2].id).toBe(5);
  });

  it('sorts roots and children by id', () => {
    const tree = buildCommentTree([comment(3), comment(1), comment(2, 3), comment(4, 3)]);

    expect(tree.map((node) => node.id)).toEqual([1, 3]);
    expect(tree[1].children.map((node) => node.id)).toEqual([2, 4]);
  });

  it('extracts a safe cover from article html', () => {
    expect(getArticleCover('<p>text</p><img class="x" src="https://example.com/a.png" />')).toBe(
      'https://example.com/a.png',
    );
    expect(getArticleCover('<img src="/media/a.png">')).toBe('/media/a.png');
    expect(getArticleCover('<img src="javascript:alert(1)">')).toBeNull();
    expect(getArticleCover('<p>no image</p>')).toBeNull();
  });

  it('limits excerpts by unicode characters', () => {
    expect(getArticleExcerpt('<p>Привет мир</p>', 6)).toBe('Привет…');
    expect(getArticleExcerpt('<p>Коротко</p>', 20)).toBe('Коротко');
  });

  it('counts unicode characters', () => {
    expect(countUnicodeChars('Привет')).toBe(6);
    expect(countUnicodeChars('😀😀')).toBe(2);
  });

  it('builds initials', () => {
    expect(getInitials('Михаил Васильев')).toBe('МВ');
    expect(getInitials('Иван')).toBe('ИВ');
    expect(getInitials('')).toBe('?');
  });

  it('resolves relative media urls through the server path', () => {
    expect(resolveMediaUrl('files/avatar.png')).toBe(
      'https://ibronevik.ru/taxi/c/tutor/api/v1/files/avatar.png',
    );
    expect(resolveMediaUrl('/files/avatar.png')).toBe(
      'https://ibronevik.ru/taxi/c/tutor/api/v1/files/avatar.png',
    );
    expect(resolveMediaUrl('dropbox:209')).toBe(
      'https://ibronevik.ru/taxi/c/tutor/api/v1/dropbox/file/209',
    );
    expect(resolveMediaUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
    expect(resolveMediaUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(resolveMediaUrl('')).toBe('');
  });
});
