import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import bannerImg from '../assets/banner.png';
import { useLanguage } from '../hooks/useLanguage';
import './HeroBanner.css';

function Typewriter({ text, delay = 600, speed = 80 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [started, displayed, text, speed]);

  return (
    <span>
      {displayed}
      <span className="cursor">|</span>
    </span>
  );
}

export default function HeroBanner() {
  const { t, language } = useLanguage();

  return (
    <section className="hero-banner" id="hero">
      {/* Photo */}
      <div className="hero-photo-container">
        <img
          src={bannerImg}
          alt="João Paulo Soares Martins"
          className="hero-photo"
          loading="eager"
        />
      </div>

      {/* Typewriter */}
      <div className="hero-typewriter">
        <Typewriter key={language} text={t.hero.role} />
      </div>

      {/* Name */}
      <motion.div
        className="hero-name-block"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <div className="hero-separator" />
        <h1 className="hero-name">
          <span>João Paulo</span>
          <span>Soares Martins</span>
        </h1>
      </motion.div>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <span className="scroll-indicator-text">{t.hero.scroll}</span>
        <div className="scroll-indicator-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
