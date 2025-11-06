// contexts/LanguageContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import es from '@/locales/es.json';
import ca from '@/locales/ca.json';

// Definimos los tipos para nuestro contexto
type Language = 'es' | 'ca';
type Translations = typeof es; // Asumimos que ambos diccionarios tienen las mismas claves

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations) => string;
}

// Creamos el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Creamos el "Proveedor" que envolverá nuestra aplicación
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const translations = useMemo(() => (language === 'es' ? es : ca), [language]);

  const t = (key: keyof Translations): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Creamos un "Hook" personalizado para usar fácilmente el contexto en otros componentes
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};