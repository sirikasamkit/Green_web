import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations } from '../locales/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('green_web_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      localStorage.setItem('green_web_lang', langCode);
    }
  };

  const currentLanguage = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  /**
   * Helper function to retrieve nested translation string
   * e.g. t('nav.analyzer') or t('hero.title1')
   */
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');

    let current = translations[language];
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English, then Thai
        let fb = translations['en'];
        for (const k of keys) {
          if (fb && fb[k] !== undefined) fb = fb[k];
          else fb = undefined;
        }
        return fb !== undefined ? fb : fallback || path;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguage,
        availableLanguages: LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
