import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { onAnchorClick } from '../hooks/useSmoothScroll';
import './Header.css';

/** Hover swaps the label for a copy rolling up from below. */
function RollText({ children }: { children: string }) {
  return (
    <span className="roll-text">
      <span className="roll-text-inner" data-text={children}>
        {children}
      </span>
    </span>
  );
}

export function HexMark() {
  return (
    <svg className="hex-mark" viewBox="0 0 32 32" aria-hidden="true">
      <polygon points="16,2 28.1,9 28.1,23 16,30 3.9,23 3.9,9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <polygon points="16,10 21.2,13 21.2,19 16,22 10.8,19 10.8,13" className="hex-mark-core" />
    </svg>
  );
}

export default function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > 8;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  const links = [
    { href: '#work', label: t.nav.work },
    { href: '#oss', label: t.nav.oss },
    { href: '#stack', label: t.nav.stack },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="page-container site-header-inner">
        <a className="site-header-brand" href="#top" onClick={onAnchorClick} aria-label="João Paulo Soares Martins">
          <HexMark />
          <span className="site-header-name">João Paulo</span>
        </a>

        <nav className="site-header-nav" aria-label={language === 'pt' ? 'Principal' : 'Primary'}>
          {links.map((link) => (
            <a key={link.href} className="site-header-link" href={link.href} onClick={onAnchorClick}>
              <RollText>{link.label}</RollText>
            </a>
          ))}
        </nav>

        <div className="site-header-actions">
          <button type="button" className="lang-switch" onClick={toggleLanguage} aria-label={t.meta.langLabel}>
            <span className={language === 'pt' ? 'is-on' : ''}>PT</span>
            <span aria-hidden="true">/</span>
            <span className={language === 'en' ? 'is-on' : ''}>EN</span>
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-label={t.meta.themeLabel}
            className="theme-switch"
            onClick={toggleTheme}
          >
            <span className="theme-switch-track" aria-hidden="true">
              <span className="theme-switch-knob" />
            </span>
          </button>
        </div>
      </div>
      <motion.span className="site-header-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    </header>
  );
}
