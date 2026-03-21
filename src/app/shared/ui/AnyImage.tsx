import { useState, useEffect, CSSProperties } from 'react';
import { useFileById } from 'app/state/order';
import { useLanguage } from 'app/state/language';

const imagesMap = new WeakMap<object, string>();
let imagesCounter = 0;

export function getKeyFor(image: File | Blob | string | number | null): string {
  if (!image) return '';
  if (image instanceof Object) {
    if (!imagesMap.has(image)) {
      imagesMap.set(image, `item_${++imagesCounter}`);
    }
    return imagesMap.get(image)!;
  }
  return String(image);
}

type AnyImageProps = {
  src: File | Blob | string | number | null;
  alt?: string;
  className?: string;
  style?: CSSProperties;
};

export function AnyImage({ src, alt = '', className, style, ...props }: AnyImageProps) {
  const text = useLanguage();
  const [url, setUrl] = useState<string | null>(null);
  const { blob, isLoading } = useFileById('number' === typeof src ? src : null);
  const imgSrc = blob ?? src;

  useEffect(() => {
    if (imgSrc instanceof Blob) {
      const objectUrl = URL.createObjectURL(imgSrc)
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    else if ('string' === typeof imgSrc) {
      setUrl(imgSrc);
    }
    else {
      setUrl(null);
    }
  }, [imgSrc]);

  const placeholderStyle = { ...style, height: 120, background: '#eee' };
  
  if (isLoading) return <div style={placeholderStyle}>{text('Loading...')}</div>;
  else if (!url) return null;
  else return <img src={url} alt={alt} className={className} style={style} {...props} />;
};
