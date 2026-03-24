import type {
  CSSProperties,
  ReactElement,
  HTMLAttributes,
  ImgHTMLAttributes,
  AudioHTMLAttributes,
  VideoHTMLAttributes,
  IframeHTMLAttributes,
} from 'react';
import { useState, useEffect } from 'react';
import { useFileById } from 'app/state/order';
import { useLanguage } from 'app/state/language';

const imagesMap = new WeakMap<object, string>();
let imagesCounter = 0;

function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

export function getKeyFor(image: File | Blob | string | number | null): string {
  if (!image) return '';
  if (image instanceof Object) {
    if (!imagesMap.has(image)) {
      imagesMap.set(image, `item_${++imagesCounter}`);
    }
    return imagesMap.get(image)!;
  }
  if (typeof image === 'string') {
    if (image.length > 100) {
      return simpleHash(image);
    }
    return image;
  }
  return String(image);
}

type AnyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: File | Blob | string | number | null;

  // Стили для плейсхолдеров
  placeholderStyle?: CSSProperties;

  // Элементы для состояний
  loadingElement?: ReactElement;
  errorElement?: ReactElement;
};

type MediaType = 'image' | 'audio' | 'video' | 'other';

type AnyMediaProps = HTMLAttributes<HTMLElement> & {
  src: File | Blob | string | number | null;
  mediaType?: MediaType;

  // Специфичные пропсы для разных типов
  imageProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;
  audioProps?: Omit<AudioHTMLAttributes<HTMLAudioElement>, 'src'>;
  videoProps?: Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'>;
  iframeProps?: Omit<IframeHTMLAttributes<HTMLIFrameElement>, 'src'>;

  // Стили для плейсхолдеров
  placeholderStyle?: CSSProperties;

  // Элементы для состояний
  loadingElement?: ReactElement;
  errorElement?: ReactElement;
};

export function AnyMedia({
  src,
  mediaType: forcedMediaType,
  imageProps,
  audioProps,
  videoProps,
  iframeProps,
  placeholderStyle,
  loadingElement,
  errorElement,
  className,
  style,
  ...props
}: AnyMediaProps) {
  const text = useLanguage();
  const [url, setUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);
  const [isHeadersLoading, setIsHeadersLoading] = useState<boolean>(false);
  const [headerError, setHeaderError] = useState<string>('');

  const { blob, isLoading: isFileLoading, error: fileError } = useFileById('number' === typeof src ? src : null);
  const imgSrc = blob ?? src;
  const isLoading = isHeadersLoading || isFileLoading;

  useEffect(() => {
    setHeaderError('');
    if (imgSrc instanceof Blob) {
      if (forcedMediaType) {
        setMediaType(forcedMediaType);
      }
      else {
        const mtype =
          imgSrc.type.startsWith('image/') ? 'image' :
          imgSrc.type.startsWith('audio/') ? 'audio' :
          imgSrc.type.startsWith('video/') ? 'video' :
          'other';
        setMediaType(mtype);
      }
      const objectUrl = URL.createObjectURL(imgSrc)
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    else if ('string' === typeof imgSrc) {
      if (forcedMediaType) {
        setMediaType(forcedMediaType);
        setUrl(imgSrc);
      }
      else {
        const ac = new AbortController();
        setIsHeadersLoading(true);
        fetch(imgSrc, { method: 'HEAD', signal: ac.signal })
          .then(response => {
            const mimeType = response?.headers.get('Content-Type');
            const mtype =
              mimeType?.startsWith('image/') ? 'image' :
              mimeType?.startsWith('audio/') ? 'audio' :
              mimeType?.startsWith('video/') ? 'video' :
              'other';
            setMediaType(mtype);
            setUrl(imgSrc);
            setIsHeadersLoading(false);
          })
          .catch (err => {
            setIsHeadersLoading(false);
            if (err.name === 'AbortError') return;
            setHeaderError(String(err.message ?? err));
          });
        return () => ac.abort();
      }
    }
    else {
      setUrl(null);
      setMediaType(null);
    }
  }, [imgSrc, forcedMediaType]);

  // Состояния загрузки/ошибки
  if (isLoading) {
    return loadingElement ??
      <div style={placeholderStyle ?? { height: 120, background: '#eee', ...style }}>
        {text('Loading...')}
      </div>;
  }

  if (headerError || fileError) {
    return errorElement ??
      <div style={placeholderStyle ?? { height: 120, background: '#eee', ...style }}>
        {`${text('Error:')} ${text(headerError || fileError?.message || 'Image loading error')}`}
      </div>;
  }

  if (!url || !mediaType) return null;

  switch (mediaType) {
     case 'image':
      const imageStyle = {...style, ...imageProps?.style};
      return <img src={url} alt='' className={className} {...props} {...imageProps} style={imageStyle} />;
    case 'audio':
      const audioStyle = {...style, ...audioProps?.style};
      return <audio src={url} controls className={className} {...props} {...audioProps} style={audioStyle} />;
    case 'video':
      const videoStyle = {...style, ...videoProps?.style};
      return <video src={url} controls className={className} {...props} {...videoProps} style={videoStyle} />;
    case 'other':
      const iframeStyle = {...style, ...iframeProps?.style};
      return <iframe src={url} title='Document' className={className} {...props} {...iframeProps} style={iframeStyle} />;
    default:
      return null;
  }
};

export function AnyImage({
  src,
  className,
  style,
  placeholderStyle,
  loadingElement,
  errorElement,
  ...props }: AnyImageProps) {
  return <AnyMedia
    src={src}
    mediaType='image'
    className={className}
    style={style}
    placeholderStyle={placeholderStyle}
    loadingElement={loadingElement}
    errorElement={errorElement}
    imageProps={props}
  />;
}
