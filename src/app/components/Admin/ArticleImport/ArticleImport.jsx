import { useEffect, useRef, useState } from 'react';

import { post } from '../../../state/api/request';
import ArticleRenderer from '../../Article/renderer/ArticleRenderer';
import styles from './ArticleImport.module.css';

const API_PATH = 'script/template/repair_api';
const SETTINGS_KEY = 'repair-wizards.article-import.settings.v1';
const MODE_OPTIONS = [
  { value: 'upsert', label: 'Добавлять новые и обновлять существующие' },
  { value: 'insert_only', label: 'Добавлять только новые' },
  { value: 'update_only', label: 'Обновлять только существующие' },
];

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { mode: MODE_OPTIONS.some((item) => item.value === saved.mode) ? saved.mode : 'upsert' };
  } catch {
    return { mode: 'upsert' };
  }
}

function makePreview(article, previewAssets) {
  const urls = {};
  (previewAssets || []).forEach((asset) => {
    const binary = atob(asset.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    urls[asset.file] = URL.createObjectURL(new Blob([bytes], { type: asset.mime }));
  });
  const copy = JSON.parse(JSON.stringify(article));
  const mapFile = (file) => urls[file] || '';
  if (copy.cover?.file) copy.cover.file = mapFile(copy.cover.file);
  copy.blocks = copy.blocks.map((block) => {
    if (block.type === 'image' || block.type === 'model_3d') return { ...block, file: mapFile(block.file) };
    if (block.type === 'gallery') return { ...block, images: block.images.map((image) => ({ ...image, file: mapFile(image.file) })) };
    if (block.type === 'steps') return { ...block, items: block.items.map((step) => ({ ...step, image: step.image ? mapFile(step.image) : undefined })) };
    return block;
  });
  delete copy.media_base_url;
  return { article: copy, urls: Object.values(urls) };
}

async function validateArchive(file) {
  const body = new FormData();
  body.append('is_var', '1');
  body.append('s_t_data', JSON.stringify({ action: 'validateBlogImport' }));
  body.append('archive', file, file.name);
  return post(API_PATH, body);
}

async function importArchive(token, mode) {
  return post(API_PATH, { is_var: 1, s_t_data: { action: 'importBlogPost', token, mode } });
}

export default function ArticleImport() {
  const [mode, setMode] = useState(() => readSettings().mode);
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const objectUrls = useRef([]);
  const folderInput = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ mode })); } catch { /* Storage may be disabled. */ }
  }, [mode]);

  useEffect(() => {
    folderInput.current?.setAttribute('webkitdirectory', '');
    folderInput.current?.setAttribute('directory', '');
  }, []);

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const clearPreviewUrls = () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current = [];
  };

  const onFolderChange = (event) => {
    const selected = Array.from(event.target.files || [])
      .filter((file) => file.name.toLowerCase().endsWith('.zip'))
      .sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name));
    clearPreviewUrls();
    setFiles(selected);
    setResults([]);
    setActiveIndex(0);
    setProgress('');
  };

  const validateAll = async () => {
    if (!files.length || busy) return;
    clearPreviewUrls();
    setResults([]);
    setBusy(true);
    const validated = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setProgress('Проверка ' + (index + 1) + ' из ' + files.length + ': ' + file.name);
      try {
        const response = await validateArchive(file);
        const preview = makePreview(response.article, response.preview_assets);
        objectUrls.current.push(...preview.urls);
        validated.push({
          filename: file.webkitRelativePath || file.name,
          token: response.token,
          article: response.article,
          previewArticle: preview.article,
          warnings: response.warnings || [],
          error: '',
          imported: null,
        });
      } catch (requestError) {
        validated.push({
          filename: file.webkitRelativePath || file.name,
          token: '',
          article: null,
          previewArticle: null,
          warnings: [],
          error: requestError instanceof Error ? requestError.message : String(requestError),
          imported: null,
        });
      }
      setResults([...validated]);
    }
    setBusy(false);
    setProgress('Проверка завершена.');
  };

  const importAll = async () => {
    const ready = results.filter((item) => item.token && !item.error && !item.imported);
    if (!ready.length || busy) return;
    if (!window.confirm('Импортировать ' + ready.length + ' проверенных статей? Все записи будут сохранены как черновики.')) return;
    setBusy(true);
    const updated = [...results];
    let completed = 0;
    for (let index = 0; index < updated.length; index += 1) {
      const item = updated[index];
      if (!item.token || item.error || item.imported) continue;
      setProgress('Импорт ' + (completed + 1) + ' из ' + ready.length + ': ' + item.article.title);
      try {
        updated[index] = { ...item, imported: await importArchive(item.token, mode) };
      } catch (requestError) {
        updated[index] = { ...item, error: requestError instanceof Error ? requestError.message : String(requestError) };
      }
      completed += 1;
      setResults([...updated]);
    }
    setBusy(false);
    setProgress('Импорт завершён.');
  };

  const validCount = results.filter((item) => item.token && !item.error).length;
  const readyCount = results.filter((item) => item.token && !item.error && !item.imported).length;
  const active = results[activeIndex];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Администрирование</p>
        <h1>Импорт статей</h1>
        <p>Выберите папку с ZIP-архивами. Каждый архив должен содержать article.json и каталог media/.</p>
      </header>

      <section className={styles.panel}>
        <div className={styles.field}>
          <label htmlFor="article-import-folder">Папка с архивами</label>
          <input ref={folderInput} id="article-import-folder" type="file" multiple accept=".zip,application/zip" onChange={onFolderChange} />
          <small>Найдено ZIP-архивов: {files.length}. Файлы не сохраняются в браузере.</small>
        </div>
        <div className={styles.field}>
          <label htmlFor="article-import-mode">Режим импорта</label>
          <select id="article-import-mode" value={mode} onChange={(event) => setMode(event.target.value)}>
            {MODE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <small>Настройка режима сохраняется в localStorage этого браузера.</small>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={validateAll} disabled={!files.length || busy}>Проверить архивы</button>
          <button type="button" onClick={importAll} disabled={!readyCount || busy}>Подтвердить импорт ({readyCount})</button>
        </div>
        {progress && <p className={styles.progress} role="status">{progress}</p>}
      </section>

      {results.length > 0 && (
        <section className={styles.results}>
          <div className={styles.resultList}>
            <h2>Результаты проверки</h2>
            <p>Успешно проверено: {validCount} из {results.length}</p>
            {results.map((item, index) => (
              <button type="button" key={item.filename}
                className={styles.resultItem + (activeIndex === index ? ' ' + styles.active : '')}
                onClick={() => setActiveIndex(index)}>
                <span>{item.article?.title || item.filename}</span>
                <small>{item.imported?.action || (item.error ? 'Ошибка' : item.token ? 'Готово к импорту' : 'Не проверен')}</small>
              </button>
            ))}
          </div>
          {active && (
            <div className={styles.preview}>
              {active.error ? (
                <div className={styles.errorCard}>
                  <h2>Ошибка</h2><p>{active.filename}</p><p>{active.error}</p>
                </div>
              ) : (
                <>
                  <div className={styles.previewHeader}>
                    <p className={styles.eyebrow}>Предварительный просмотр</p>
                    <h2>{active.article.title}</h2>
                    <p>{active.article.summary}</p>
                    <small>Формат {active.article.format_version} · {active.article.blocks.length} блоков · тема: {active.article.topic.name}</small>
                    {active.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}
                    {active.imported && <p className={styles.success}>Результат: {active.imported.action}; ID: {active.imported.id || '—'}; статус: {active.imported.status || 'без изменений'}</p>}
                  </div>
                  <ArticleRenderer blocks={active.previewArticle.blocks} mediaBaseUrl="" className={styles.articleRenderer} />
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
