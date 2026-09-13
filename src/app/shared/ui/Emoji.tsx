import { lazy as reactLazy, Suspense, useCallback } from 'react';

import { useCurrentLocale, useLanguage } from 'app/state/language';
import './Emoji.css';

const pickerTranslations = import.meta.webpackContext('@emoji-mart/data/i18n', {
  recursive: false,
  regExp: /\.json$/,
  mode: 'lazy-once'
});
const pickerLangs = {};

const datasets = import.meta.webpackContext('locales/emoji', {
  recursive: false,
  regExp: /\.json$/,
  mode: 'lazy'
});
const dataLangs = {};
for (const name of datasets.keys()) {
  const lang = name.match(/([^/\\]+)\.json$/)?.[1];
  if (lang) {
    let promise = null as Promise<any> | null;
    dataLangs[lang] = () => {
      if (!promise) promise = datasets(name);
      return promise;
    }
  }
}

// todo: Проверить смену языков в динамике
const LazyEmojiPicker = reactLazy(async () => {
  const [pickerModule] = await Promise.all([
    import('@emoji-mart/react'),
    ...pickerTranslations.keys().map(async (name) => {
      const lang = name.match(/([^/\\]+)\.json$/)?.[1];
      if (lang) {
        const translation = await pickerTranslations(name);
        pickerLangs[lang] = translation;
      }
    })
  ]);
  const Picker = pickerModule.default;

  return {
    default: ({locale, ...props}) => {
      let pickerLocale = locale;
      if (!pickerLangs[pickerLocale]) [pickerLocale] = locale.split('-');
      if (!pickerLangs[pickerLocale]) pickerLocale = 'en';
      const pickerLang = pickerLangs[pickerLocale];

      let dataLocale = locale;
      if (!dataLangs[dataLocale]) [dataLocale] = locale.split('-');
      if (!dataLangs[dataLocale]) dataLocale = 'en';
      const data = dataLangs[dataLocale];

      return <Picker {...props} data={data} i18n={pickerLang} />;
    }
  }
});

const EmojiPickerPlaceholder = () => {
  const text = useLanguage();
  return (
    <div className='emoji-picker-placeholder'>
      {text('Loading Emojis...')}
    </div>
  );
};

export function Emoji(
  { onSelect } : { onSelect: (emoji: string) => void }
) {
  const handleClick = useCallback((emoji) => {
    return onSelect?.(emoji.native);
  }, [onSelect]);

  const locale = useCurrentLocale();

  return (
    <Suspense fallback={<EmojiPickerPlaceholder />}>
      <LazyEmojiPicker
        onEmojiSelect={handleClick}
        locale={locale}
        emojiButtonSize='32'
        emojiSize='20'
        perLine='8'
        previewPosition='none'
        theme='light'
      />
    </Suspense>
  );
}
