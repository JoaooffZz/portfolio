import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import { useReveal } from '../hooks/useReveal';
import { onAnchorClick } from '../hooks/useSmoothScroll';
import { LINKS } from '../content';
import { ArrowIcon, SplitWords } from './text';
import avatar from '../assets/avatar.jpg';
import './Footer.css';

/** Teresina keeps Fortaleza's offset (UTC−3, no DST). */
const TIME_ZONE = 'America/Fortaleza';

function LocalClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('en-GB', { timeZone: TIME_ZONE, hour12: false });
  return (
    <span className="footer-clock">
      <time>{time}</time> <span className="text-muted">GMT −3</span>
    </span>
  );
}

/** Drifts a little toward the pointer while hovered. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const { allowPointerFx } = useMotionPrefs();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });

  if (!allowPointerFx) return <span className="magnetic">{children}</span>;

  return (
    <motion.span
      ref={ref}
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * 0.22);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.32);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const f = t.footer;
  const [ref, state] = useReveal<HTMLDivElement>();

  const sitemap = [
    { href: '#top', label: t.stage.steps[0] },
    { href: '#work', label: t.nav.work },
    { href: '#oss', label: t.nav.oss },
    { href: '#stack', label: t.nav.stack },
  ];

  return (
    <footer className="site-footer" id="contact">
      <div className="page-container">
        <div className={`footer-cta ${state}`} ref={ref}>
          <h2 className="footer-title">
            <SplitWords text={f.title} />
          </h2>
          <div className={`footer-cta-side reveal ${state}`}>
            <div className="footer-person">
              <img src={avatar} alt="" width="56" height="56" loading="lazy" decoding="async" />
              <div>
                <strong>João Paulo Soares Martins</strong>
                <span className="text-muted">{f.role}</span>
              </div>
            </div>
            <p>{f.side}</p>
            <div className="footer-actions">
              <Magnetic>
                <a href={`mailto:${LINKS.email}`} className="button button-primary button-large">
                  {LINKS.email}
                  <ArrowIcon />
                </a>
              </Magnetic>
              <a href={LINKS.cv} className="button button-ghost button-large" target="_blank" rel="noopener noreferrer">
                {f.cv}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <span className="text-label text-muted">{f.localTime}</span>
            <LocalClock />
            <span>Teresina, PI — Brasil</span>
          </div>
          <nav className="footer-col" aria-label={f.sitemap}>
            <span className="text-label text-muted">{f.sitemap}</span>
            {sitemap.map((link) => (
              <a key={link.href} href={link.href} onClick={onAnchorClick} className="link-line">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="footer-col">
            <span className="text-label text-muted">{f.elsewhere}</span>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="link-line">
              GitHub
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="link-line">
              LinkedIn
            </a>
          </div>
          <div className="footer-col">
            <span className="text-label text-muted">{f.contact}</span>
            <a href={`mailto:${LINKS.email}`} className="link-line">
              {LINKS.email}
            </a>
            <a href={LINKS.cv} target="_blank" rel="noopener noreferrer" className="link-line">
              {f.cvLink}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} João Paulo Soares Martins</span>
          <span>{f.madeIn}</span>
          <a href="#top" onClick={onAnchorClick} className="footer-top">
            {f.top}
            <ArrowIcon direction="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
