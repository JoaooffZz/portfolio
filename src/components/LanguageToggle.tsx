import { useLanguage } from '../hooks/useLanguage';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      className="lang-toggle-btn"
      onClick={toggleLanguage}
      aria-label="Alternar idioma / Toggle language"
      title={`Mudar para ${language === 'pt' ? 'English' : 'Português'}`}
    >
      <span className="lang-text">{language.toUpperCase()}</span>
    </button>
  );
}
