#!/usr/bin/env node
/**
 * Импорт статей из ZIP-архивов docs/ в статический каталог public/articles.
 *
 * Архивы регрессионного набора v1.3 записаны без central directory, поэтому
 * используем чтение по локальным заголовкам (PK\x03\x04). Поддерживаются
 * методы store (0) и deflate (8), чтобы скрипт работал и с обычными ZIP.
 *
 * Результат:
 *   public/articles/catalog.json          — метаданные каталога
 *   public/articles/<slug>/article.json   — полный JSON статьи
 *   public/articles/<slug>/media/*        — изображения и 3D-модели
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUTPUT_DIR = path.join(ROOT, 'public', 'articles');

import { buildCatalog, fail, findZipFiles, readArticleZip } from './article-importer.mjs';

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.warn('[articles] docs directory not found, skipping.');
    return;
  }

  const zipFiles = findZipFiles(DOCS_DIR);
  if (zipFiles.length === 0) {
    console.warn('[articles] no ZIP files found in docs/, skipping.');
    return;
  }

  const imported = zipFiles.map((zipPath) => {
    const stat = fs.statSync(zipPath);
    return { ...readArticleZip(zipPath), sourceDate: stat.mtime.toISOString() };
  });

  imported.sort((a, b) => a.slug.localeCompare(b.slug));

  const registeredSlugs = new Set();
  for (const { slug } of imported) {
    if (registeredSlugs.has(slug)) fail(`Duplicate article slug: ${slug}`);
    registeredSlugs.add(slug);
  }

  const outputRoot = path.resolve(OUTPUT_DIR);
  if (!outputRoot.startsWith(path.resolve(ROOT, 'public') + path.sep)) {
    fail(`Refusing to clean an unexpected output directory: ${outputRoot}`);
  }
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(outputRoot, { recursive: true });

  for (const { slug, article, mediaEntries } of imported) {
    const articleDir = path.join(outputRoot, slug);

    for (const entry of mediaEntries) {
      const relative = entry.name.slice('media/'.length);
      if (!relative || relative.endsWith('/')) continue;
      const target = path.join(articleDir, 'media', relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, entry.data);
    }

    fs.writeFileSync(
      path.join(articleDir, 'article.json'),
      `${JSON.stringify(article, null, 2)}\n`,
      'utf8',
    );
  }

  const catalog = buildCatalog(imported);
  fs.writeFileSync(
    path.join(outputRoot, 'catalog.json'),
    `${JSON.stringify(catalog, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `[articles] imported ${imported.length} article(s) from docs/: ` +
      imported.map(({ slug }) => slug).join(', '),
  );
  console.log(`[articles] output: ${toPosix(path.relative(ROOT, outputRoot))}`);
}

try {
  main();
} catch (error) {
  console.error(`[articles] ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
