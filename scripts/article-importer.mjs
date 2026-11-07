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
const CENTRAL_DIRECTORY_MAGIC = 0x02014b50;
const END_OF_CENTRAL_DIRECTORY_MAGIC = 0x06054b50;
const DATA_DESCRIPTOR_MAGIC = Buffer.from([0x50, 0x4b, 0x07, 0x08]);

const CRC32_TABLE = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC32_TABLE[index] = value >>> 0;
}

/** CRC32 в том же виде, в котором он хранится в ZIP. */
export function crc32(buffer) {
  let crc = 0xffffffff;
  for (let index = 0; index < buffer.length; index += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

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

function unpackEntry(raw, method, name) {
  if (method === 0) return raw;
  if (method === 8) return zlib.inflateRawSync(raw);
  fail(`Unsupported ZIP compression method ${method} for "${name}".`);
}

/** Читает запись с data descriptor (general purpose flag bit 3). */
function readDataDescriptorEntry(buffer, dataStart, name, method) {
  // Вариант с сигнатурой PK\x07\x08: crc32, compressed size, uncompressed size.
  let searchFrom = dataStart;
  while (searchFrom + 16 <= buffer.length) {
    const signatureOffset = buffer.indexOf(DATA_DESCRIPTOR_MAGIC, searchFrom);
    if (signatureOffset === -1) break;

    const descriptorCrc = buffer.readUInt32LE(signatureOffset + 4);
    const compressedSize = buffer.readUInt32LE(signatureOffset + 8);
    const uncompressedSize = buffer.readUInt32LE(signatureOffset + 12);
    if (signatureOffset - dataStart === compressedSize) {
      const raw = buffer.subarray(dataStart, signatureOffset);
      let data;
      try {
        data = unpackEntry(raw, method, name);
      } catch {
        // Сигнатура встретилась внутри сжатых данных — ищем следующую.
        searchFrom = signatureOffset + 4;
        continue;
      }
      if (data.length === uncompressedSize) {
        if (crc32(data) !== descriptorCrc) {
          fail(`ZIP CRC32 mismatch for "${name}".`);
        }
        return { data, nextOffset: signatureOffset + 16 };
      }
    }
    searchFrom = signatureOffset + 4;
  }

  // Вариант без сигнатуры: 12 байт (crc32, compressed size, uncompressed size)
  // находятся непосредственно перед следующим локальным/центральным заголовком.
  let crcMismatch = false;
  for (let nextHeader = dataStart + 12; nextHeader + 4 <= buffer.length; nextHeader += 1) {
    const signature = buffer.readUInt32LE(nextHeader);
    if (
      signature !== LOCAL_ZIP_MAGIC &&
      signature !== CENTRAL_DIRECTORY_MAGIC &&
      signature !== END_OF_CENTRAL_DIRECTORY_MAGIC
    ) {
      continue;
    }

    const descriptorOffset = nextHeader - 12;
    const descriptorCrc = buffer.readUInt32LE(descriptorOffset);
    const compressedSize = buffer.readUInt32LE(descriptorOffset + 4);
    const uncompressedSize = buffer.readUInt32LE(descriptorOffset + 8);
    if (dataStart + compressedSize !== descriptorOffset) continue;

    const raw = buffer.subarray(dataStart, descriptorOffset);
    let data;
    try {
      data = unpackEntry(raw, method, name);
    } catch {
      continue;
    }
    if (data.length !== uncompressedSize) continue;
    if (crc32(data) !== descriptorCrc) {
      crcMismatch = true;
      continue;
    }
    return { data, nextOffset: nextHeader };
  }

  if (crcMismatch) fail(`ZIP CRC32 mismatch for "${name}".`);
  fail(`ZIP entry "${name}" has an invalid data descriptor.`);
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

    let data;
    let nextOffset;

    if ((flags & 0x08) !== 0) {
      const entry = readDataDescriptorEntry(buffer, dataStart, name, method);
      data = entry.data;
      nextOffset = entry.nextOffset;
    } else {
      if (dataStart + compressedSize > buffer.length) fail(`Truncated ZIP entry: ${name}`);

      const raw = buffer.subarray(dataStart, dataStart + compressedSize);
      data = unpackEntry(raw, method, name);
      nextOffset = dataStart + compressedSize;
    }

    if (uncompressedSize !== 0 && data.length !== uncompressedSize) {
      fail(`ZIP size mismatch for "${name}".`);
    }

    entries.push({ name, data });
    offset = nextOffset;
  }

  if (entries.length === 0) fail('ZIP archive contains no files.');
  return entries;
}

function isSafeRelativeFile(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (value.includes('\\') || value.startsWith('/') || /^[a-zA-Z]:/.test(value)) return false;
  const normalized = path.posix.normalize(value);
  return normalized === value && normalized.startsWith('media/') &&
    !normalized.split('/').some((part) => part === '' || part === '.' || part === '..');
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireString(value, field, sourceName) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(sourceName + ': ' + field + ' must be a non-empty string.');
  }
}

function requireOptionalString(value, field, sourceName) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    fail(sourceName + ': ' + field + ' must be a string when provided.');
  }
}

function requireFile(file, field, sourceName, assets, usedFiles, expectedType) {
  if (!isSafeRelativeFile(file)) fail(sourceName + ': invalid file path at ' + field + '.');
  if (!assets.has(file)) fail(sourceName + ': ' + field + ' references an unregistered asset: ' + file);
  if (expectedType && assets.get(file).type !== expectedType) {
    fail(sourceName + ': ' + field + ' must reference an asset of type ' + expectedType + '.');
  }
  usedFiles.add(file);
}

function validateYouTubeUrl(value, sourceName, field) {
  requireString(value, field, sourceName);
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(sourceName + ': ' + field + ' must be a valid URL.');
  }
  if (url.protocol !== 'https:') fail(sourceName + ': ' + field + ' must use HTTPS.');
  const host = url.hostname.toLowerCase();
  const allowedHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);
  if (!allowedHosts.has(host)) fail(sourceName + ': unsupported video platform in ' + field + '.');
  const validPath = host === 'youtu.be'
    ? /^\/[A-Za-z0-9_-]{6,}$/.test(url.pathname)
    : /^\/(?:watch|shorts\/[A-Za-z0-9_-]{6,}|embed\/[A-Za-z0-9_-]{6,})$/.test(url.pathname);
  if (!validPath || (url.pathname === '/watch' && !/^[A-Za-z0-9_-]{6,}$/.test(url.searchParams.get('v') || ''))) {
    fail(sourceName + ': unsupported YouTube URL in ' + field + '.');
  }
}

function enumAssetType(value, sourceName, field) {
  if (!['image', 'model_3d'].includes(value)) {
    fail(sourceName + ': ' + field + '.type has an unsupported value "' + value + '".');
  }
}

function validateBlock(block, index, sourceName, assets, usedFiles) {
  const at = 'blocks[' + index + ']';
  if (!isRecord(block) || typeof block.type !== 'string') {
    fail(sourceName + ': ' + at + ' must be an object with a type.');
  }
  const text = (field) => requireString(block[field], at + '.' + field, sourceName);
  const optionalText = (field) => requireOptionalString(block[field], at + '.' + field, sourceName);
  const enumValue = (value, allowed, field) => {
    if (!allowed.includes(value)) fail(sourceName + ': ' + at + '.' + field + ' has an unsupported value.');
  };

  switch (block.type) {
    case 'heading':
      if (!Number.isInteger(block.level) || block.level < 2 || block.level > 4) {
        fail(sourceName + ': ' + at + '.level must be an integer from 2 to 4.');
      }
      text('text');
      break;
    case 'paragraph':
      text('text');
      break;
    case 'image':
      requireFile(block.file, at + '.file', sourceName, assets, usedFiles, 'image');
      text('alt');
      optionalText('caption');
      break;
    case 'gallery':
      if (!Array.isArray(block.images) || block.images.length < 2) {
        fail(sourceName + ': ' + at + '.images must contain at least two images.');
      }
      block.images.forEach((image, imageIndex) => {
        const imageAt = at + '.images[' + imageIndex + ']';
        if (!isRecord(image)) fail(sourceName + ': ' + imageAt + ' must be an object.');
        requireFile(image.file, imageAt + '.file', sourceName, assets, usedFiles, 'image');
        requireString(image.alt, imageAt + '.alt', sourceName);
        requireOptionalString(image.caption, imageAt + '.caption', sourceName);
      });
      break;
    case 'video':
      validateYouTubeUrl(block.url, sourceName, at + '.url');
      optionalText('caption');
      break;
    case 'list':
      enumValue(block.style, ['ordered', 'unordered'], 'style');
      if (!Array.isArray(block.items) || block.items.length === 0 ||
          block.items.some((item) => typeof item !== 'string' || item.trim() === '')) {
        fail(sourceName + ': ' + at + '.items must be a non-empty array of strings.');
      }
      break;
    case 'quote':
      text('text');
      optionalText('caption');
      break;
    case 'callout':
      enumValue(block.style, ['info', 'warning', 'danger', 'tip'], 'style');
      text('text');
      optionalText('title');
      break;
    case 'steps':
      if (!Array.isArray(block.items) || block.items.length === 0) {
        fail(sourceName + ': ' + at + '.items must be a non-empty array.');
      }
      block.items.forEach((step, stepIndex) => {
        const stepAt = at + '.items[' + stepIndex + ']';
        if (!isRecord(step)) fail(sourceName + ': ' + stepAt + ' must be an object.');
        requireString(step.title, stepAt + '.title', sourceName);
        requireString(step.text, stepAt + '.text', sourceName);
        requireOptionalString(step.warning, stepAt + '.warning', sourceName);
        if (step.image !== undefined && step.image !== null && step.image !== '') {
          requireFile(step.image, stepAt + '.image', sourceName, assets, usedFiles, 'image');
        }
      });
      break;
    case 'table':
      if (!Array.isArray(block.headers) || block.headers.length === 0 ||
          block.headers.some((header) => typeof header !== 'string' || header.trim() === '')) {
        fail(sourceName + ': ' + at + '.headers must be a non-empty array of strings.');
      }
      if (!Array.isArray(block.rows)) fail(sourceName + ': ' + at + '.rows must be an array.');
      block.rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row) || row.length !== block.headers.length ||
            row.some((cell) => typeof cell !== 'string')) {
          fail(sourceName + ': ' + at + '.rows[' + rowIndex + '] must contain ' + block.headers.length + ' string cells.');
        }
      });
      break;
    case 'code':
      text('language');
      text('text');
      break;
    case 'model_3d':
      requireFile(block.file, at + '.file', sourceName, assets, usedFiles, 'model_3d');
      if (!['glb', 'gltf'].includes(assets.get(block.file).format.toLowerCase())) {
        fail(sourceName + ': ' + at + '.file must reference a GLB or glTF model.');
      }
      text('alt');
      optionalText('caption');
      if (block.controls !== undefined) {
        if (!isRecord(block.controls) ||
            ['rotate', 'zoom', 'pan'].some((key) => block.controls[key] !== undefined && typeof block.controls[key] !== 'boolean')) {
          fail(sourceName + ': ' + at + '.controls must contain boolean options.');
        }
      }
      if (block.camera !== undefined) {
        if (!isRecord(block.camera) ||
            ['azimuth', 'elevation'].some((key) => block.camera[key] !== undefined && !Number.isFinite(block.camera[key]))) {
          fail(sourceName + ': ' + at + '.camera must contain finite numeric angles.');
        }
      }
      if (block.scale !== undefined && (!Number.isFinite(block.scale) || block.scale <= 0)) {
        fail(sourceName + ': ' + at + '.scale must be a positive number.');
      }
      break;
    default:
      fail(sourceName + ': unsupported block type "' + block.type + '".');
  }
}

export function assertArticle(article, sourceName, mediaFiles) {
  if (!isRecord(article)) fail(sourceName + ': article.json is not an object.');
  if (!['1.2', '1.3'].includes(article.format_version)) {
    fail(sourceName + ': unsupported format_version "' + article.format_version + '".');
  }
  for (const field of ['title', 'summary']) requireString(article[field], field, sourceName);
  if (!isRecord(article.topic)) fail(sourceName + ': topic must be an object.');
  requireString(article.topic.name, 'topic.name', sourceName);
  if (!Array.isArray(article.topic.path) || article.topic.path.length === 0 ||
      article.topic.path.some((part) => typeof part !== 'string' || part.trim() === '')) {
    fail(sourceName + ': topic.path must be a non-empty array of strings.');
  }
  if (!Array.isArray(article.blocks) || article.blocks.length === 0 || article.blocks.length > 200) {
    fail(sourceName + ': blocks must be a non-empty array with at most 200 items.');
  }
  if (!Array.isArray(article.assets)) fail(sourceName + ': assets must be an array.');

  const availableFiles = mediaFiles instanceof Map
    ? mediaFiles
    : new Map([...mediaFiles].map((name) => [name, null]));
  const assets = new Map();
  for (const [index, asset] of article.assets.entries()) {
    const at = 'assets[' + index + ']';
    if (!isRecord(asset)) fail(sourceName + ': ' + at + ' must be an object.');
    if (!isSafeRelativeFile(asset.file)) fail(sourceName + ': invalid asset path at ' + at + '.file.');
    if (assets.has(asset.file)) fail(sourceName + ': duplicate asset path: ' + asset.file);
    requireString(asset.type, at + '.type', sourceName);
    enumAssetType(asset.type, sourceName, at);
    requireString(asset.format, at + '.format', sourceName);
    const extension = path.posix.extname(asset.file).slice(1).toLowerCase();
    const format = asset.format.toLowerCase();
    const allowedFormats = asset.type === 'image'
      ? ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']
      : ['glb', 'gltf'];
    const compatibleExtensions = format === 'jpg' ? ['jpg', 'jpeg'] : [format];
    if (!allowedFormats.includes(format) || !compatibleExtensions.includes(extension)) {
      fail(sourceName + ': asset type/format/extension mismatch at ' + at + '.');
    }
    if (!Number.isSafeInteger(asset.size_bytes) || asset.size_bytes < 0) {
      fail(sourceName + ': ' + at + '.size_bytes must be a non-negative integer.');
    }
    if (!availableFiles.has(asset.file)) fail(sourceName + ': asset file is missing: ' + asset.file);
    const fileData = availableFiles.get(asset.file);
    if (fileData && fileData.length !== asset.size_bytes) {
      fail(sourceName + ': asset size mismatch for ' + asset.file + ': expected ' + asset.size_bytes + ', got ' + fileData.length + '.');
    }
    assets.set(asset.file, asset);
  }

  if (availableFiles instanceof Map) {
    for (const file of availableFiles.keys()) {
      if (!assets.has(file)) fail(sourceName + ': unregistered file in media/: ' + file);
    }
  }

  const usedFiles = new Set();
  if (article.cover !== undefined && article.cover !== null) {
    if (!isRecord(article.cover)) fail(sourceName + ': cover must be an object.');
    requireFile(article.cover.file, 'cover.file', sourceName, assets, usedFiles, 'image');
    requireString(article.cover.alt, 'cover.alt', sourceName);
  }

  article.blocks.forEach((block, index) => validateBlock(block, index, sourceName, assets, usedFiles));

  if (article.format_version === '1.3' && article.technical_knowledge !== undefined) {
    if (!isRecord(article.technical_knowledge)) {
      fail(sourceName + ': technical_knowledge must be an object when provided.');
    }
    const visit = (value) => {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (isRecord(value)) {
        if (Array.isArray(value.media_refs)) {
          value.media_refs.forEach((media, index) => {
            if (!isRecord(media)) fail(sourceName + ': invalid technical_knowledge media_refs entry.');
            requireFile(media.file, 'technical_knowledge.media_refs[' + index + '].file', sourceName, assets, usedFiles);
          });
        }
        Object.values(value).forEach(visit);
      }
    };
    visit(article.technical_knowledge);
  }

  for (const file of assets.keys()) {
    if (!usedFiles.has(file)) fail(sourceName + ': unused asset: ' + file);
  }
}

export function readArticleZip(zipPath) {
  const slug = path.basename(zipPath, path.extname(zipPath));
  const entries = readZipEntries(fs.readFileSync(zipPath));
  const jsonEntry = entries.find((entry) => entry.name === 'article.json');
  if (!jsonEntry) fail(`${zipPath}: article.json not found in the archive root.`);

  const mediaEntries = entries.filter((entry) => entry.name.startsWith('media/') && !entry.name.endsWith('/'));
  if (mediaEntries.length === 0) fail(`${zipPath}: media/ directory not found.`);

  const article = JSON.parse(jsonEntry.data.toString('utf8').replace(/^\uFEFF/, ''));
  assertArticle(article, zipPath, new Map(mediaEntries.map((entry) => [entry.name, entry.data])));

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

