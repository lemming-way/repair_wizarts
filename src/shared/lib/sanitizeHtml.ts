import DOMPurify from 'dompurify';

let hooksApplied = false;

if (!hooksApplied) {
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (typeof data.attrName === 'string' && data.attrName.startsWith('on')) {
      data.keepAttr = false;
      return;
    }

    if (data.attrName === 'style' && /javascript:/i.test(String(data.attrValue))) {
      data.keepAttr = false;
    }
  });

  hooksApplied = true;
}

const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

export default sanitizeHtml;
