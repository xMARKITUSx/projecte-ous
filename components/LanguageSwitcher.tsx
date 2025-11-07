// components/LanguageSwitcher.tsx
'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'ca' : 'es');
  };

  return (
    <button
      onClick={toggleLanguage}
      // AÑADIMOS LAS CLASES DE TRANSICIÓN Y EFECTO ACTIVO
      className="mt-4 flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 active:scale-95 transition-transform"
    >
      <span>🌍</span>
      {language === 'es' ? 'Català' : 'Español'}
    </button>
  );
}