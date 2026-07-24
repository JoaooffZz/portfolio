import { useEffect, useRef } from 'react';
import { animate, steps } from 'animejs';
import { motion, useTransform } from 'framer-motion';
import bannerImg from '../assets/banner.png';
import { useLanguage } from '../hooks/useLanguage';
import { useTilt } from '../hooks/useTilt';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import { RevealText, DrawLine } from './RevealText';
import { HeroCanvas } from './hero3d/HeroCanvas';
import './HeroBanner.css';

/**
 * Typewriter driven by a single anime.js tween over a plain object, writing
 * straight to `textContent`.
 *
 * The obvious React version (setState per character) re-renders the component
 * once per glyph and schedules a fresh timeout each time. Stepping one numeric
 * value and slicing the string keeps the growing-width behaviour a real
 * typewriter needs — an opacity-based per-char reveal would occupy the full
 * width from the first frame and strand the caret at the far right — while
 * costing zero renders.
 */
function Typewriter({ text, delay = 600, speed = 80 }: { text: string; delay?: number; speed?: number }) {
  const outRef = useRef<HTMLSpanElement>(null);
  const { prefersReduced } = useMotionPrefs();

  useEffect(() => {
    const node = outRef.current;
    if (!node) return;

    if (prefersReduced) {
      node.textContent = text;
      return;
    }

    node.textContent = '';
    const cursor = { i: 0 };

    const animation = animate(cursor, {
      i: text.length,
      duration: text.length * speed,
      delay,
      ease: steps(text.length),
      onUpdate: () => {
        node.textContent = text.slice(0, Math.round(cursor.i));
      },
    });

    return () => {
      animation.revert();
      node.textContent = '';
    };
  }, [text, delay, speed, prefersReduced]);

  return (
    <span>
      {/* aria-hidden: the visible text is written imperatively, so the label on
          the wrapper below is what assistive tech should read. */}
      <span ref={outRef} aria-hidden="true" />
      <span className="cursor" aria-hidden="true">|</span>
    </span>
  );
}

/**
 * The photo card. Still the hero's anchor on mobile, on reduced-motion, and
 * wherever WebGL is unavailable — HeroCanvas renders it as its fallback.
 */
function PhotoCard() {
  // baseRotate preserves the 2deg neubrutalist skew the CSS gives the photo at
  // rest; the tilt springs deviate from that angle rather than resetting it.
  const tilt = useTilt({
    max: 10,
    shadowDistance: 8,
    shadowTravel: 7,
    shadowColor: 'var(--color-border)',
    hoverScale: 1.03,
    perspective: 1000,
    baseRotate: 2,
  });

  const photoX = useTransform(tilt.nx, [-0.5, 0.5], [-16, 16]);
  const photoY = useTransform(tilt.ny, [-0.5, 0.5], [-12, 12]);

  return (
    <motion.div
      className={`hero-photo-container ${tilt.disabled ? '' : 'hero-photo-container--tilt'}`}
      style={tilt.disabled ? undefined : tilt.style}
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={tilt.onPointerEnter}
      onPointerLeave={tilt.onPointerLeave}
    >
      <motion.img
        src={bannerImg}
        alt="João Paulo Soares Martins"
        className="hero-photo"
        loading="eager"
        /* Drifts *with* the lean while the frame drifts against it —
           opposing directions widen the apparent gap between the two planes. */
        style={tilt.disabled ? undefined : { x: photoX, y: photoY, scale: 1.1 }}
      />
    </motion.div>
  );
}

export default function HeroBanner() {
  const { t, language } = useLanguage();

  return (
    <section className="hero-banner" id="hero">
      {/* Visual anchor: 3D laptop on capable desktops, photo card otherwise. */}
      <HeroCanvas fallback={<PhotoCard />} />

      {/* Typewriter */}
      <div className="hero-typewriter" aria-label={t.hero.role}>
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
        <DrawLine className="hero-separator" height={4} delay={380} duration={800} />
        <h1 className="hero-name">
          <RevealText as="span" delay={500} staggerMs={28}>
            João Paulo
          </RevealText>
          <RevealText as="span" delay={800} staggerMs={28}>
            Soares Martins
          </RevealText>
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
