import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SUPPORTED_BLOCKS = new Set([
  'heading',
  'paragraph',
  'image',
  'gallery',
  'video',
  'list',
  'quote',
  'callout',
  'steps',
  'table',
  'code',
  'model_3d',
]);

const LOCAL_ZIP_MAGIC = 0x04034b50;

export function fail(message) {
  throw new Error(message);
}

/** Рекурсивно собирает ZIP-файлы из docs/. */
export function findZipFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...findZipFiles(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.zip')) result.push(absolute);
  }
  return result.sort();
}

/** Проверяет путь внутри архива и возвращает нормализованный относительный путь. */
export function safeEntryName(rawName) {
  const name = rawName.replace(/\\/g, '/');
  if (!name || name.startsWith('/') || /^[a-zA-Z]:/.test(name)) {
    fail(`Unsafe path in archive: ${rawName}`);
  }
  const normalized = path.posix.normalize(name);
  if (normalized === '.' || normalized.startsWith('../') || normalized.includes('/../')) {
    fail(`Unsafe path in archive: ${rawName}`);
  }
  return normalized;
}

/**
 * Разбирает ZIP по локальным заголовкам. Обычные архивы с central directory
 * тоже читаются: обход прекращается на сигнатуре PK\x01\x02 / PK\x05\x06.
 */
export function readZipEntries(buffer) {
  const entries = [];
  let offset = 0;

  while (offset + 4 <= buffer.length && buffer.readUInt32LE(offset) === LOCAL_ZIP_MAGIC) {
    if (offset + 30 > buffer.length) fail('Truncated ZIP local header.');

    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);

    if (nameLength === 0) fail('ZIP entry without a name.');

    const name = safeEntryName(
      buffer.subarray(offset + 30, offset + 30 + nameLength).toString('utf8'),
    );
    const dataStart = offset + 30 + nameLength + extraLength;

    if ((flags & 0x08) !== 0) {
      fail(`ZIP entry "${name}" uses a data descriptor, which is not supported.`);
    }
    if (dataStart + compressedSize > buffer.length) fail(`Truncated ZIP entry: ${name}`);

    const raw = buffer.subarray(dataStart, dataStart + compressedSize);
    let data;
    if (method === 0) data = raw;
    else if (method === 8) data = zlib.inflateRawSync(raw);
    else fail(`Unsupported ZIP compression method ${method} for "${name}".`);

    if (uncompressedSize !== 0 && data.length !== uncompressedSize) {
      fail(`ZIP size mismatch for "${name}".`);
    }

    entries.push({ name, data });
    offset = dataStart + compressedSize;
  }

  if (entries.length === 0) fail('ZIP archive contains no files.');
  return entries;
}

function isSafeRelativeFile(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const normalized = path.posix.normalize(value.replace(/\\/g, '/'));
  return !normalized.startsWith('/') && normalized !== '..' && !normalized.startsWith('../');
}

export function assertArticle(article, sourceName, mediaFiles) {
  if (!article || typeof article !== 'object')
    fail(`${sourceName}: article.json is not an object.`);
  if (article.format_version !== '1.3') {
    fail(`${sourceName}: unsupported format_version "${article.format_version}".`);
  }
  for (const field of ['title', 'summary', 'topic', 'assets', 'blocks']) {
    if (!(field in article)) fail(`${sourceName}: missing root field "${field}".`);
  }
  if (!Array.isArray(article.blocks) || article.blocks.length === 0) {
    fail(`${sourceName}: blocks must be a non-empty array.`);
  }
  if (!Array.isArray(article.assets)) fail(`${sourceName}: assets must be an array.`);

  for (const block of article.blocks) {
    if (!block || typeof block.type !== 'string') fail(`${sourceName}: block without type.`);
    if (!SUPPORTED_BLOCKS.has(block.type)) {
      fail(`${sourceName}: unsupported block type "${block.type}".`);
    }
  }

  for (const asset of article.assets) {
    if (!asset || !isSafeRelativeFile(asset.file)) {
      fail(`${sourceName}: invalid asset path.`);
    }
    if (!mediaFiles.has(asset.file)) fail(`${sourceName}: asset file is missing: ${asset.file}`);
  }

  if (article.cover) {
    if (!isSafeRelativeFile(article.cover.file)) fail(`${sourceName}: invalid cover path.`);
    if (!mediaFiles.has(article.cover.file)) {
      fail(`${sourceName}: cover file is missing: ${article.cover.file}`);
    }
  }
}

export function readArticleZip(zipPath) {
  const slug = path.basename(zipPath, path.extname(zipPath));
  const entries = readZipEntries(fs.readFileSync(zipPath));
  const jsonEntry = entries.find((entry) => entry.name === 'article.json');
  if (!jsonEntry) fail(`${zipPath}: article.json not found in the archive root.`);

  const mediaEntries = entries.filter((entry) => entry.name.startsWith('media/'));
  if (mediaEntries.length === 0) fail(`${zipPath}: media/ directory not found.`);

  const article = JSON.parse(jsonEntry.data.toString('utf8').replace(/^\uFEFF/, ''));
  assertArticle(article, zipPath, new Set(mediaEntries.map((entry) => entry.name)));

  return { slug, article, mediaEntries, zipPath };
}

export function buildCatalog(imported) {
  const generatedAt = new Date().toISOString();

  return {
    format_version: '1.3',
    generated_at: generatedAt,
    source: 'docs/**/*.zip',
    articles: imported.map(({ slug, article, sourceDate }, index) => ({
      id: index + 1,
      slug,
      format_version: article.format_version,
      title: article.title,
      summary: article.summary,
      topic: article.topic,
      cover: article.cover?.file ?? null,
      cover_url: article.cover ? `/articles/${slug}/${article.cover.file}` : null,
      base_path: `/articles/${slug}/`,
      author: {
        id: 0,
        name: 'Редакция Repair Wizards',
        avatar: '',
        role: 0,
      },
      created_at: sourceDate,
      updated_at: null,
      comments_count: 0,
      blocks_count: article.blocks.length,
    })),
  };
}

