import { useGlobalState, getGlobal, setGlobal } from './global';
import translations from '../locales/translations.json';

export type LanguageFn = ( key: string ) => string;

const getLanguageFunction = ( language: string ): LanguageFn => {
  return ( key ) => {
    return translations[ language ][ key ] || key;
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
