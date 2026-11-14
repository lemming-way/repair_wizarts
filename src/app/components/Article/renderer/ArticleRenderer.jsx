import { useEffect, useId, useRef, useState } from 'react';

import { AnyImage } from '../../../shared/ui/AnyMedia';
import {
  getYouTubeEmbedUrl,
  isSafeMediaUrl,
  resolveArticleMedia,
} from '../../../shared/lib/articleContent';
import styles from './ArticleRenderer.module.css';
import { useFileById } from '../../../state/uploaded';

const MODEL_VIEWER_SCRIPT =
  'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';

let modelViewerLoader = null;

function loadModelViewer() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No browser environment.'));
  if (window.customElements?.get('model-viewer')) return Promise.resolve();

  if (!modelViewerLoader) {
    modelViewerLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Model viewer failed to load.')));
        return;
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = MODEL_VIEWER_SCRIPT;
      script.async = true;
      script.addEventListener('load', () => resolve());
      script.addEventListener('error', () => {
        modelViewerLoader = null;
        reject(new Error('Model viewer failed to load.'));
      });
      document.head.appendChild(script);
    });
  }

  return modelViewerLoader;
}

function Lightbox({ src, dlId, alt, caption, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={onClose}>
      <button type="button" className={styles.lightboxClose} onClick={onClose} aria-label="Закрыть">
        ×
      </button>
      <figure className={styles.lightboxFigure} onClick={(event) => event.stopPropagation()}>
        {dlId ? (
          <AnyImage src={dlId} className={styles.lightboxImage} alt={alt || caption || ''} />
        ) : (
          <img className={styles.lightboxImage} src={src} alt={alt || caption || ''} />
        )}
        {caption && <figcaption className={styles.lightboxCaption}>{caption}</figcaption>}
      </figure>
    </div>
  );
}

function getAssetId(file, assets) {
  if (!file || !Array.isArray(assets)) return null;
  const asset = assets.find((item) => item?.file === file && Number(item?.dl_id) > 0);
  return asset ? Number(asset.dl_id) : null;
}

function safeImageSrc(file, baseUrl) {
  const src = resolveArticleMedia(file, baseUrl);
  return isSafeMediaUrl(src) ? src : '';
}

function ArticleImage({ file, alt, className, mediaBaseUrl, assets }) {
  const dlId = getAssetId(file, assets);
  if (dlId) return <AnyImage src={dlId} alt={alt || ''} className={className} />;
  const src = safeImageSrc(file, mediaBaseUrl);
  return src ? <img className={className} src={src} alt={alt || ''} loading="lazy" /> : null;
}

function ParagraphBlock({ block }) {
  return <p className={styles.paragraph}>{block.text}</p>;
}

function HeadingBlock({ block }) {
  const level = Math.min(4, Math.max(2, Number(block.level) || 2));
  const Tag = `h${level}`;
  return <Tag className={styles.heading}>{block.text}</Tag>;
}

function ImageBlock({ block, mediaBaseUrl, assets }) {
  const [open, setOpen] = useState(false);
  const dlId = getAssetId(block.file, assets);
  const src = dlId ? null : safeImageSrc(block.file, mediaBaseUrl);
  if (!dlId && !src) return null;

  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.imageButton}
        onClick={() => setOpen(true)}
        aria-label={block.alt ? `Увеличить: ${block.alt}` : 'Увеличить изображение'}
      >
        <ArticleImage
          file={block.file}
          alt={block.alt || block.caption || ''}
          className={styles.image}
          mediaBaseUrl={mediaBaseUrl}
          assets={assets}
        />
      </button>
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
      {open && (
        <Lightbox
          src={src}
          dlId={dlId}
          alt={block.alt}
          caption={block.caption}
          onClose={() => setOpen(false)}
        />
      )}
    </figure>
  );
}

function GalleryBlock({ block, mediaBaseUrl, assets }) {
  const trackRef = useRef(null);
  const [openImage, setOpenImage] = useState(null);
  const images = Array.isArray(block.images)
    ? block.images
        .map((image) => ({
          ...image,
          dlId: getAssetId(image.file, assets),
          src: safeImageSrc(image.file, mediaBaseUrl),
        }))
        .filter((image) => image.dlId || image.src)
    : [];

  if (images.length === 0) return null;

  const scrollBy = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(240, track.clientWidth * 0.7),
      behavior: 'smooth',
    });
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryControls}>
        <button
          type="button"
          className={styles.galleryArrow}
          onClick={() => scrollBy(-1)}
          aria-label="Предыдущее изображение"
        >
          ←
        </button>
        <button
          type="button"
          className={styles.galleryArrow}
          onClick={() => scrollBy(1)}
          aria-label="Следующее изображение"
        >
          →
        </button>
      </div>
      <div className={styles.galleryTrack} ref={trackRef}>
        {images.map((image, index) => (
          <figure className={styles.galleryItem} key={`${image.file}-${index}`}>
            <button
              type="button"
              className={styles.imageButton}
              onClick={() => setOpenImage(image)}
              aria-label={image.alt ? `Увеличить: ${image.alt}` : 'Увеличить изображение'}
            >
              <ArticleImage
                file={image.file}
                alt={image.alt || image.caption || ''}
                className={styles.galleryImage}
                mediaBaseUrl={mediaBaseUrl}
                assets={assets}
              />
            </button>
            {image.caption && <figcaption className={styles.caption}>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {openImage && (
        <Lightbox
          src={openImage.src}
          dlId={openImage.dlId}
          alt={openImage.alt}
          caption={openImage.caption}
          onClose={() => setOpenImage(null)}
        />
      )}
    </div>
  );
}

function VideoBlock({ block }) {
  const embedUrl = getYouTubeEmbedUrl(block.url);
  const externalUrl = isSafeMediaUrl(block.url || '') ? block.url : '';

  if (!embedUrl) {
    return (
      <div className={styles.videoFallback}>
        <p>Видео недоступно для встроенного просмотра.</p>
        {externalUrl && (
          <a href={externalUrl} target="_blank" rel="noreferrer noopener">
            Открыть видео на внешнем сайте
          </a>
        )}
        {block.caption && <p className={styles.caption}>{block.caption}</p>}
      </div>
    );
  }

  return (
    <figure className={styles.videoFigure}>
      <div className={styles.videoFrame}>
        <iframe
          src={embedUrl}
          title={block.caption || 'Видео YouTube'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
    </figure>
  );
}

function ListBlock({ block }) {
  const items = Array.isArray(block.items) ? block.items : [];
  const ordered = block.style === 'ordered';
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <Tag className={ordered ? styles.orderedList : styles.list}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </Tag>
  );
}

function QuoteBlock({ block }) {
  return (
    <blockquote className={styles.quote}>
      <p>{block.text}</p>
      {block.caption && <cite className={styles.quoteCaption}>{block.caption}</cite>}
    </blockquote>
  );
}

const CALLOUT_META = {
  info: { label: 'Информация', icon: 'i' },
  tip: { label: 'Совет', icon: '✓' },
  warning: { label: 'Внимание', icon: '!' },
  danger: { label: 'Опасно', icon: '!' },
};

function CalloutBlock({ block, tone: forcedTone }) {
  const tone = forcedTone || block.style || 'info';
  const meta = CALLOUT_META[tone] || CALLOUT_META.info;

  return (
    <aside className={`${styles.callout} ${styles[`callout_${tone}`] || styles.callout_info}`}>
      <span className={styles.calloutIcon} aria-hidden="true">
        {meta.icon}
      </span>
      <div className={styles.calloutBody}>
        <p className={styles.calloutTitle}>{block.title || meta.label}</p>
        {block.text && <p className={styles.calloutText}>{block.text}</p>}
      </div>
    </aside>
  );
}

function StepsBlock({ block, mediaBaseUrl, assets }) {
  const items = Array.isArray(block.items) ? block.items : [];

  return (
    <ol className={styles.steps}>
      {items.map((item, index) => {
        const imageSrc = safeImageSrc(item.image, mediaBaseUrl);
        const imageDlId = getAssetId(item.image, assets);
        return (
          <li className={styles.step} key={index}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div className={styles.stepBody}>
              <p className={styles.stepTitle}>{item.title}</p>
              {item.text && <p className={styles.stepText}>{item.text}</p>}
              {(imageDlId || imageSrc) && (
                <ArticleImage
                  file={item.image}
                  alt={item.title || ''}
                  className={styles.stepImage}
                  mediaBaseUrl={mediaBaseUrl}
                  assets={assets}
                />
              )}
              {item.warning && (
                <p className={styles.stepWarning}>
                  <span aria-hidden="true">⚠</span>
                  {item.warning}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TableBlock({ block }) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];

  if (headers.length === 0 && rows.length === 0) return null;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {(Array.isArray(row) ? row : []).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const codeId = useId();
  const code = typeof block.text === 'string' ? block.text : '';

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLanguage}>{block.language || 'text'}</span>
        <button type="button" className={styles.codeCopy} onClick={copy}>
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre className={styles.codePre}>
        <code id={codeId}>{code}</code>
      </pre>
    </div>
  );
}

function Model3DBlock({ block, mediaBaseUrl, assets }) {
  const dlId = getAssetId(block.file, assets);
  const { blob } = useFileById(dlId);
  const [blobUrl, setBlobUrl] = useState('');
  useEffect(() => {
    if (!blob) {
      setBlobUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  const src = dlId ? blobUrl : resolveArticleMedia(block.file, mediaBaseUrl);
  const figureRef = useRef(null);
  const viewerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle');
  const controls = block.controls || {};
  const camera = block.camera || {};
  const scale = Number(block.scale) || 1;
  const canControl = Boolean(controls.rotate || controls.zoom || controls.pan);

  useEffect(() => {
    const node = figureRef.current;
    if (!node || !src) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [src]);

  useEffect(() => {
    if (!visible) return undefined;
    const viewer = viewerRef.current;
    if (!viewer || !src || !isSafeMediaUrl(src)) {
      setStatus('error');
      return undefined;
    }

    let active = true;
    const onLoad = () => active && setStatus('ready');
    const onError = () => active && setStatus('error');
    setStatus('loading');

    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);

    loadModelViewer()
      .then(() => {
        if (active && viewer.loaded) setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [visible, src]);

  if (!src || !isSafeMediaUrl(src)) return null;

  const cameraOrbit =
    Number.isFinite(Number(camera.azimuth)) || Number.isFinite(Number(camera.elevation))
      ? `${Number(camera.azimuth) || 0}deg ${Number(camera.elevation) || 75}deg auto`
      : undefined;

  return (
    <figure className={styles.modelFigure} ref={figureRef}>
      <div className={styles.modelViewport}>
        {!visible && (
          <button
            type="button"
            className={styles.modelPlaceholder}
            onClick={() => setVisible(true)}
          >
            <span className={styles.modelPlaceholderBadge} aria-hidden="true">
              3D
            </span>
            <span>Показать 3D-модель</span>
          </button>
        )}
        {status === 'loading' && <p className={styles.modelStatus}>Загружаем 3D-модель…</p>}
        {status === 'error' && (
          <div className={styles.modelStatus}>
            <p>Не удалось показать 3D-модель.</p>
            <a href={src} target="_blank" rel="noreferrer noopener">
              Открыть файл модели
            </a>
          </div>
        )}
        {visible && (
          <model-viewer
            ref={viewerRef}
            className={styles.modelViewer}
            src={src}
            alt={block.alt || block.caption || '3D-модель'}
            loading="lazy"
            reveal="auto"
            camera-controls={canControl ? '' : undefined}
            disable-pan={controls.pan ? undefined : ''}
            disable-zoom={controls.zoom === false ? '' : undefined}
            camera-orbit={cameraOrbit}
            scale={`${scale} ${scale} ${scale}`}
            shadow-intensity="1"
            touch-action="pan-y"
            style={status === 'error' ? { display: 'none' } : undefined}
          />
        )}
      </div>
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
    </figure>
  );
}

const BLOCK_COMPONENTS = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  video: VideoBlock,
  list: ListBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  warning: (props) => <CalloutBlock {...props} tone="warning" />,
  tip: (props) => <CalloutBlock {...props} tone="tip" />,
  danger: (props) => <CalloutBlock {...props} tone="danger" />,
  info: (props) => <CalloutBlock {...props} tone="info" />,
  steps: StepsBlock,
  table: TableBlock,
  code: CodeBlock,
  model_3d: Model3DBlock,
};

/**
 * Единый рендерер статей Article Format 1.3.
 * Используется и для локального каталога, и для статей из БД.
 */
export default function ArticleRenderer({ blocks, mediaBaseUrl, assets, className }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className={`${styles.renderer} ${className || ''}`}>
      {blocks.map((block, index) => {
        if (!block || typeof block.type !== 'string') return null;
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) return null;

        return <Component block={block} key={index} mediaBaseUrl={mediaBaseUrl} assets={assets} />;
      })}
    </div>
  );
}