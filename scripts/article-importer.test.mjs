import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import zlib from 'node:zlib';

import { assertArticle, buildCatalog, crc32, readArticleZip, readZipEntries } from './article-importer.mjs';

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

function zipDataDescriptorEntry({ name = 'x', data = 'x', method = 8, signature = true, crc }) {
  const filename = Buffer.from(name);
  const source = Buffer.from(data);
  const compressed = method === 8 ? zlib.deflateRawSync(source) : source;
  const checksum = crc === undefined ? crc32(source) : crc;
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x08, 6);
  header.writeUInt16LE(method, 8);
  header.writeUInt16LE(filename.length, 26);

  const descriptor = Buffer.alloc(signature ? 16 : 12);
  let offset = 0;
  if (signature) {
    descriptor.writeUInt32LE(0x08074b50, 0);
    offset = 4;
  }
  descriptor.writeUInt32LE(checksum >>> 0, offset);
  descriptor.writeUInt32LE(compressed.length, offset + 4);
  descriptor.writeUInt32LE(source.length, offset + 8);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  return Buffer.concat([header, filename, compressed, descriptor, eocd]);
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

test('rejects empty, truncated and unsupported ZIP entries', () => {
  assert.throws(() => readZipEntries(Buffer.alloc(0)), /contains no files/);
  assert.throws(() => readZipEntries(Buffer.from([0x50, 0x4b, 0x03])), /contains no files/);
  const unsupported = zipLocalEntries([{ name: 'x', data: 'x' }]);
  unsupported.writeUInt16LE(99, 8);
  assert.throws(() => readZipEntries(unsupported), /Unsupported ZIP compression method/);
});

test('reads ZIP entries with signed and unsigned data descriptors', () => {
  for (const method of [0, 8]) {
    for (const signature of [true, false]) {
      const entries = readZipEntries(
        zipDataDescriptorEntry({ name: 'article.json', data: '{"ok":true}', method, signature }),
      );
      assert.equal(entries.length, 1);
      assert.equal(entries[0].name, 'article.json');
      assert.equal(entries[0].data.toString(), '{"ok":true}');
    }
  }
});


test('ignores a local-header signature embedded in unsigned-descriptor file data', () => {
  const payload = Buffer.concat([
    Buffer.from('prefix-data-'),
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from('-not-a-real-header-suffix'),
  ]);
  const entries = readZipEntries(
    zipDataDescriptorEntry({
      name: 'embedded-signature.bin',
      data: payload.toString('latin1'),
      method: 0,
      signature: false,
    }),
  );
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].data, payload);
});

test('supports empty files with signed and unsigned data descriptors', () => {
  for (const signature of [true, false]) {
    const entries = readZipEntries(
      zipDataDescriptorEntry({ name: 'empty.txt', data: '', method: 0, signature }),
    );
    assert.equal(entries.length, 1);
    assert.equal(entries[0].data.length, 0);
  }
});

test('rejects a data descriptor with a wrong CRC32', () => {
  for (const signature of [true, false]) {
    assert.throws(
      () =>
        readZipEntries(
          zipDataDescriptorEntry({
            name: 'broken.txt',
            data: 'payload',
            signature,
            crc: 0x12345678,
          }),
        ),
      /CRC32 mismatch/,
    );
  }
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

test('parses the repository regression archives', () => {
  for (const slug of ['smartphone', 'electric_kettle', 'toilet_cistern']) {
    const archivePath = path.join(process.cwd(), 'docs', 'regression', 'v1.3', `${slug}.zip`);
    const imported = readArticleZip(archivePath);
    assert.equal(imported.slug, slug);
    assert.ok(imported.article.blocks.length > 0);
    assert.ok(imported.mediaEntries.length > 0);
  }
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


test('builds feed cover URL from the matching Dropbox asset ID', () => {
  const catalog = buildCatalog([
    {
      slug: 'sample',
      sourceDate: '2026-11-13T00:00:00.000Z',
      article: {
        ...validArticle,
        cover: { file: 'media/photo.png' },
        assets: [{ file: 'media/photo.png', type: 'image', dl_id: 73142 }],
      },
    },
  ]);
  assert.equal(catalog.articles[0].cover_url, 'dropbox:73142');
});
