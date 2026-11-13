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
      // Keep the Dropbox ID in the feed catalog as well as in article.json.
      // The feed does not load the full article, so it cannot resolve this later.
      cover_url: article.cover
        ? (() => {
            const asset = article.assets.find((item) => item.file === article.cover.file);
            const dlId = Number(asset?.dl_id);
            return Number.isSafeInteger(dlId) && dlId > 0
              ? `dropbox:${dlId}`
              : `/articles/${slug}/${article.cover.file}`;
          })()
        : null,
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

