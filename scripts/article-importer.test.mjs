import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';

import { assertArticle, readArticleZip, readZipEntries } from './article-importer.mjs';

function zipLocalEntries(entries) {
  return Buffer.concat(
    entries.map(({ name, data, method = 0 }) => {
      const filename = Buffer.from(name);
      const source = Buffer.from(data);
      const compressed = method === 8 ? zlib.deflateRawSync(source) : source;
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(0, 6);
      header.writeUInt16LE(method, 8);
      header.writeUInt32LE(compressed.length, 18);
      header.writeUInt32LE(source.length, 22);
      header.writeUInt16LE(filename.length, 26);
      header.writeUInt16LE(0, 28);
      return Buffer.concat([header, filename, compressed]);
    }),
  );
}

const validArticle = {
  format_version: '1.3',
  title: 'Проверка',
  summary: 'Тестовая статья',
  topic: 'electronics',
  assets: [{ file: 'media/photo.png' }],
  blocks: [{ type: 'heading', text: 'Диагностика' }, { type: 'model_3d', file: 'media/model.glb' }],
};

test('reads stored and deflated ZIP local entries', () => {
  const entries = readZipEntries(
    zipLocalEntries([
      { name: 'article.json', data: '{"ok":true}' },
      { name: 'media/photo.png', data: 'image-bytes', method: 8 },
    ]),
  );
  assert.equal(entries.length, 2);
  assert.deepEqual(JSON.parse(entries[0].data.toString()), { ok: true });
  assert.equal(entries[1].data.toString(), 'image-bytes');
});

test('rejects empty, truncated, unsupported and data-descriptor ZIP entries', () => {
  assert.throws(() => readZipEntries(Buffer.alloc(0)), /contains no files/);
  assert.throws(() => readZipEntries(Buffer.from([0x50, 0x4b, 0x03])), /contains no files/);
  const unsupported = zipLocalEntries([{ name: 'x', data: 'x' }]);
  unsupported.writeUInt16LE(99, 8);
  assert.throws(() => readZipEntries(unsupported), /Unsupported ZIP compression method/);
  const descriptor = zipLocalEntries([{ name: 'x', data: 'x' }]);
  descriptor.writeUInt16LE(0x08, 6);
  assert.throws(() => readZipEntries(descriptor), /data descriptor/);
});

test('rejects traversal and absolute archive paths', () => {
  for (const name of ['../outside.txt', '/absolute.txt', 'C:\\outside.txt']) {
    assert.throws(() => readZipEntries(zipLocalEntries([{ name, data: 'x' }])), /Unsafe path/);
  }
});

test('validates v1.3 root structure, block types and referenced assets', () => {
  assertArticle(validArticle, 'valid.zip', new Set(['media/photo.png', 'media/model.glb']));
  assert.throws(
    () => assertArticle({ ...validArticle, format_version: '1.2' }, 'bad.zip', new Set()),
    /unsupported format_version/,
  );
  assert.throws(
    () => assertArticle({ ...validArticle, blocks: [{ type: 'unknown' }] }, 'bad.zip', new Set()),
    /unsupported block type/,
  );
  assert.throws(
    () => assertArticle({ ...validArticle, assets: [{ file: '../secret' }] }, 'bad.zip', new Set()),
    /invalid asset path/,
  );
  assert.throws(
    () => assertArticle(validArticle, 'bad.zip', new Set()),
    /asset file is missing/,
  );
  assert.throws(
    () => assertArticle({ ...validArticle, blocks: [] }, 'bad.zip', new Set()),
    /blocks must be a non-empty array/,
  );
});

test('imports a valid article ZIP and rejects missing article.json or media', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-article-'));
  try {
    const validPath = path.join(tempDir, 'sample.zip');
    fs.writeFileSync(
      validPath,
      zipLocalEntries([
        { name: 'article.json', data: JSON.stringify(validArticle), method: 8 },
        { name: 'media/photo.png', data: 'image-bytes' },
        { name: 'media/model.glb', data: 'model-bytes' },
      ]),
    );
    const imported = readArticleZip(validPath);
    assert.equal(imported.slug, 'sample');
    assert.equal(imported.article.title, 'Проверка');
    assert.equal(imported.mediaEntries.length, 2);

    const noJsonPath = path.join(tempDir, 'no-json.zip');
    fs.writeFileSync(noJsonPath, zipLocalEntries([{ name: 'media/a.png', data: 'x' }]));
    assert.throws(() => readArticleZip(noJsonPath), /article.json not found/);

    const noMediaPath = path.join(tempDir, 'no-media.zip');
    fs.writeFileSync(
      noMediaPath,
      zipLocalEntries([{ name: 'article.json', data: JSON.stringify(validArticle) }]),
    );
    assert.throws(() => readArticleZip(noMediaPath), /media[/] directory not found/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
