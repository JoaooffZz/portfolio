/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CONTENT, type Content, type Language } from '../content';

export type { Language };

interface LanguageContextProps {
  language: Language;
  t: Content;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

function readInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('language');
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {
    // Storage can throw in private windows; fall through to the browser hint.
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
    try {
      localStorage.setItem('language', language);
    } catch {
      // Non-essential: the toggle still works for this visit.
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  return (
    <LanguageContext.Provider value={{ language, t: CONTENT[language], toggleLanguage }}>
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
