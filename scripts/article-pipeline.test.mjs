import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { crc32, readArticleZip } from './article-importer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGRESSION_DIR = path.join(ROOT, 'docs', 'regression', 'v1.3');
const ARTICLE_SLUGS = ['electric_kettle', 'smartphone', 'toilet_cistern'];
const EXPECTED_BLOCK_TYPES = [
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
];

function collectMediaReferences(article) {
  const references = [];

  for (const block of article.blocks || []) {
    if (['image', 'model_3d'].includes(block.type) && typeof block.file === 'string') {
      references.push(block.file);
    }
    if (block.type === 'gallery' && Array.isArray(block.images)) {
      for (const image of block.images) {
        if (typeof image?.file === 'string') references.push(image.file);
      }
    }
    if (block.type === 'steps' && Array.isArray(block.items)) {
      for (const step of block.items) {
        if (typeof step?.image === 'string') references.push(step.image);
      }
    }
  }

  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (!Array.isArray(value) && typeof value.file === 'string' && value.file.startsWith('media/')) {
      references.push(value.file);
    }
    for (const child of Object.values(value)) visit(child);
  };
  visit(article.technical_knowledge);

  return [...new Set(references)];
}

function createLocalZip(entries) {
  return Buffer.concat(
    entries.map(({ name, data }) => {
      const filename = Buffer.from(name);
      const source = Buffer.from(data);
      const header = Buffer.alloc(30);
      header.writeUInt32LE(0x04034b50, 0);
      header.writeUInt16LE(20, 4);
      header.writeUInt16LE(0, 6);
      header.writeUInt16LE(0, 8);
      header.writeUInt32LE(source.length, 18);
      header.writeUInt32LE(source.length, 22);
      header.writeUInt16LE(filename.length, 26);
      return Buffer.concat([header, filename, source]);
    }),
  );
}

function copyBuildScripts(targetRoot) {
  const scriptsDir = path.join(targetRoot, 'scripts');
  fs.mkdirSync(scriptsDir, { recursive: true });
  for (const name of ['article-importer.mjs', 'build-articles.mjs']) {
    fs.copyFileSync(path.join(ROOT, 'scripts', name), path.join(scriptsDir, name));
  }
}

function runBuild(targetRoot) {
  return spawnSync(
    process.execPath,
    [path.join(targetRoot, 'scripts', 'build-articles.mjs')],
    { cwd: targetRoot, encoding: 'utf8' },
  );
}

test('regression ZIP pack covers all 12 block types and all referenced media', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(REGRESSION_DIR, 'MANIFEST.json'), 'utf8'),
  );
  const allTypes = new Set();

  for (const slug of ARTICLE_SLUGS) {
    const zipPath = path.join(REGRESSION_DIR, slug + '.zip');
    const imported = readArticleZip(zipPath);
    const manifestArticle = manifest.articles.find((item) => item.slug === slug);

    assert.ok(manifestArticle, 'Missing manifest entry for ' + slug);
    assert.equal(imported.slug, slug);
    assert.equal(imported.article.blocks.length, manifestArticle.blocks);
    assert.equal(fs.statSync(zipPath).size, manifestArticle.zip_bytes);

    const actualZipCrc = crc32(fs.readFileSync(zipPath)).toString(16).padStart(8, '0');
    const manifestZip = manifest.files.find((item) => item.path.endsWith('/' + slug + '.zip'));
    assert.ok(manifestZip, 'Missing ZIP checksum for ' + slug);
    assert.equal(actualZipCrc, manifestZip.crc32);

    const mediaNames = new Set(imported.mediaEntries.map((entry) => entry.name));
    for (const asset of imported.article.assets) {
      assert.ok(mediaNames.has(asset.file), slug + ': missing asset ' + asset.file);
    }
    if (imported.article.cover?.file) {
      assert.ok(mediaNames.has(imported.article.cover.file), slug + ': missing cover');
    }
    for (const reference of collectMediaReferences(imported.article)) {
      assert.ok(mediaNames.has(reference), slug + ': unresolved media reference ' + reference);
    }

    for (const block of imported.article.blocks) allTypes.add(block.type);
  }

  assert.deepEqual([...allTypes].sort(), [...EXPECTED_BLOCK_TYPES].sort());
});

test('build script creates a catalog and preserves article JSON and media for all fixtures', (t) => {
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-article-build-'));
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  copyBuildScripts(targetRoot);
  const fixtureDir = path.join(targetRoot, 'docs', 'regression', 'v1.3');
  fs.mkdirSync(fixtureDir, { recursive: true });
  for (const slug of ARTICLE_SLUGS) {
    fs.copyFileSync(
      path.join(REGRESSION_DIR, slug + '.zip'),
      path.join(fixtureDir, slug + '.zip'),
    );
  }

  const result = runBuild(targetRoot);
  assert.equal(result.status, 0, result.stdout + '\n' + result.stderr);

  const outputRoot = path.join(targetRoot, 'public', 'articles');
  const catalog = JSON.parse(fs.readFileSync(path.join(outputRoot, 'catalog.json'), 'utf8'));
  assert.deepEqual(
    catalog.articles.map((article) => article.slug),
    [...ARTICLE_SLUGS].sort(),
  );

  for (const slug of ARTICLE_SLUGS) {
    const source = readArticleZip(path.join(REGRESSION_DIR, slug + '.zip'));
    const articleDir = path.join(outputRoot, slug);
    const generatedArticle = JSON.parse(
      fs.readFileSync(path.join(articleDir, 'article.json'), 'utf8'),
    );
    assert.deepEqual(generatedArticle, source.article);

    for (const entry of source.mediaEntries) {
      const relative = entry.name.slice('media/'.length);
      if (!relative || relative.endsWith('/')) continue;
      const generatedMedia = fs.readFileSync(path.join(articleDir, 'media', relative));
      assert.deepEqual(generatedMedia, entry.data, slug + ': media differs: ' + relative);
    }
  }
});

test('build script does not erase previous output when an article JSON is invalid', (t) => {
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rw-article-invalid-'));
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  copyBuildScripts(targetRoot);
  const fixtureDir = path.join(targetRoot, 'docs', 'regression');
  const outputDir = path.join(targetRoot, 'public', 'articles');
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'keep-me.txt'), 'previous build');
  fs.writeFileSync(
    path.join(fixtureDir, 'invalid.zip'),
    createLocalZip([
      { name: 'article.json', data: '{"format_version":' },
      { name: 'media/placeholder.txt', data: 'media' },
    ]),
  );

  const result = runBuild(targetRoot);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JSON|Unexpected end|Expected property name/);
  assert.equal(
    fs.readFileSync(path.join(outputDir, 'keep-me.txt'), 'utf8'),
    'previous build',
  );
});

test(
  'regression ZIP files are readable by standard unzip tools',
  { todo: 'Enable as a required check after confirming/rebuilding the regression archives.' },
  (t) => {
    for (const slug of ARTICLE_SLUGS) {
      const zipPath = path.join(REGRESSION_DIR, slug + '.zip');
      const result = spawnSync('unzip', ['-t', zipPath], { encoding: 'utf8' });
      if (result.error?.code === 'ENOENT') {
        t.skip('unzip is not installed in this environment');
        return;
      }
      assert.equal(result.status, 0, slug + '.zip:\n' + result.stdout + '\n' + result.stderr);
    }
  },
);
