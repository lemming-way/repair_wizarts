import type { ReactElement } from 'react';

const regExps = {
  pre: /^```([\s\S]+?)\n```\n?/m,
  para: /([^\n]*)(?:\n|$)/,
  code: /`([^`\r\n]+)`/,
  bold: /\*\*(.+?)\*\*(?!\*)/,
  bold2: /__(.+?)__(?!_)/,
  strike: /~~(.+?)~~(?!~)/,
  it:  /\*([^*\r\n]+)\*/,
  it2:  /_([^_\r\n]+)_/
};

export function formatMarkdown(text: string) {
  return formatMarkdownRecursive(text, [ 'pre', 'para', 'code', 'bold', 'bold2', 'strike', 'it', 'it2' ]);
}

function formatMarkdownRecursive(text: string, rules: string[]): ReactElement {
  if (rules[0] === 'pre') {
    const match = regExps.pre.exec(text);
    if (match) {
      const before = text.substring(0, match.index);
      const after = text.substring(match.index + match[0].length);
      return (
        <>
          {before && formatMarkdownRecursive(before, ['para', 'code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          <pre>
            {match[1]}
          </pre>
          {after && formatMarkdownRecursive(after, ['pre', 'para', 'code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
        </>
      );
    }
    else rules.shift();
  }

  if (rules[0] === 'para') {
    const match = regExps.para.exec(text);
    if (match) {
      const after = text.substring(match.index + match[0].length);
      return (
        <>
          <p>
            {match[1] && formatMarkdownRecursive(match[1], ['code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          </p>
          {after && formatMarkdownRecursive(after, ['para', 'code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
        </>
      );
    }
    else rules.shift();
  }

  const re = new RegExp(rules.map(rule => regExps[rule].source).join('|'));
  const match = re.exec(text);
  if (match) {
    const before = text.substring(0, match.index);
    const after = text.substring(match.index + match[0].length);
    const matchedIndex = match.findIndex((m, i) => !!m && !!i);
    const matched = rules[ matchedIndex - 1 ];
    switch(matched) {
      case 'code': return (
          <>
            {before}
            <code>{match[matchedIndex]}</code>
            {after && formatMarkdownRecursive(after, ['code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          </>
        );
      case 'bold':
      case 'bold2': return (
          <>
            {before}
            <strong>{formatMarkdownRecursive(match[matchedIndex], ['code', 'strike', 'it', 'it2'])}</strong>
            {after && formatMarkdownRecursive(after, ['code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          </>
        );
      case 'strike': return (
          <>
            {before}
            <del>{formatMarkdownRecursive(match[matchedIndex], ['code', 'bold', 'bold2', 'it', 'it2'])}</del>
            {after && formatMarkdownRecursive(after, ['code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          </>
        );
      case 'it':
      case 'it2': return (
          <>
            {before}
            <em>{formatMarkdownRecursive(match[matchedIndex], ['code', 'bold', 'bold2', 'strike'])}</em>
            {after && formatMarkdownRecursive(after, ['code', 'bold', 'bold2', 'strike', 'it', 'it2'])}
          </>
        );
    }
  }

  return <>{text}</>;
}
