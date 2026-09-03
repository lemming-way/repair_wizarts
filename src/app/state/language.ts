import { useGlobalState, getGlobal, setGlobal } from './global';

const context = require.context( 'locales/translations', false, /\.js$/ );
const translations = {};

context.keys().forEach( ( name ) => {
  const fn = name.substring( name.lastIndexOf( '/' ) + 1 );
  const lang = fn.substring( 0, fn.lastIndexOf( '.' ) );
  translations[ lang ] = context( name ).default;
} );

export type LanguageFn = ( key: string ) => string;

const getLanguageFunction = ( locale: string ): LanguageFn => {
  const lang = translations[locale] ? locale : locale.split('-')[0];
  if (!translations[lang]) return (key) => key;
  return (key) => {
    return translations[lang][key] || key;
  };
};

if (!getGlobal( 'locale' )) setGlobal( 'locale', 'ru' );
setGlobal( 'languageFn', getLanguageFunction( getGlobal( 'locale' ) ?? 'ru' ) );

export function setLanguage( locale: string ): void {
  setGlobal( 'locale', locale );
  setGlobal( 'languageFn', getLanguageFunction( locale ) );
}

export function useLanguage(): LanguageFn {
  return useGlobalState( 'languageFn' )!;
}

export function useCurrentLocale(): string {
  return useGlobalState( 'locale' )!;
}
