import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import type { Language } from '../types';
import LogoIcon from './icons/LogoIcon';

interface LanguageSelectorProps {
  onSelectLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelectLanguage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen p-4 sm:p-6 bg-slate-50 relative">
      <main className="flex flex-col items-center justify-center flex-grow w-full">
        <div className="text-center mb-12">
          <LogoIcon className="h-20 w-20 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">Kaabharat Onboarding</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl w-full">
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => onSelectLanguage(lang)}
              className="group bg-white rounded-xl p-6 text-center transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1.5 border-2 border-transparent hover:border-blue-500"
              style={{ animation: 'fade-in-up 0.5s ease-out forwards', animationDelay: `${index * 40}ms` }}
              aria-label={`Select language: ${lang.name}`}
            >
              <p className="text-2xl font-semibold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">{lang.nativeName}</p>
              <p className="text-md text-slate-500">{lang.name}</p>
            </button>
          ))}
        </div>
      </main>
       <footer className="py-8 text-center text-slate-500/80">
            <p>Powered by Google Gemini</p>
        </footer>
    </div>
  );
};

export default LanguageSelector;