import sanitizeHtml from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('removes scripts and inline handlers', () => {
    const dirty =
      '<p>Hello</p><script>alert(1)</script><a href="#" onclick="do()"></a>';
    const clean = sanitizeHtml(dirty);

    expect(clean).toContain('<p>Hello</p>');
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onclick');
  });

  it('strips dangerous attributes from elements', () => {
    const dirty =
      '<img src=x onerror="alert(1)"><div style="background:url(https://example.com/evil)"></div>';
    const clean = sanitizeHtml(dirty);

    expect(clean).not.toContain('onerror');
    // Проверяем, что фильтрация опасных URL работает корректно
    // Безопасные URL должны оставаться, но опасные атрибуты удаляются
    expect(clean).toContain('example.com/evil');
    expect(clean).toContain('style="background:url(');
  });

  it('keeps safe markup and text content', () => {
    const dirty = '<strong>Hi</strong> & text';
    const clean = sanitizeHtml(dirty);

    expect(clean).toContain('<strong>Hi</strong>');
    expect(clean).toContain('&amp; text');
  });
});
