import { useGlobalState, getGlobal, setGlobal } from './global';

const context = require.context( '../locales/translations', false, /\.js$/ );
const translations = {};

context.keys().forEach( ( name ) => {
  const fn = name.substring( name.lastIndexOf( '/' ) + 1 );
  const lang = fn.substring( 0, fn.lastIndexOf( '.' ) );
  translations[ lang ] = context( name ).default;
} );

export type LanguageFn = ( key: string ) => string;

const getLanguageFunction = ( language: string ): LanguageFn => {
  return ( key ) => {
    return translations[ language ]?.[ key ] || key;
  };
};

setGlobal( 'languageFn', getLanguageFunction( getGlobal( 'language' ) ?? 'en' ) );

export function setLanguage( language: string ): void {
  setGlobal( 'language', language );
  setGlobal( 'languageFn', getLanguageFunction( language ) );
}

export function useLanguage(): LanguageFn {
  return useGlobalState( 'languageFn' )!;
}
