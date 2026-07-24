import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useMagnetic } from '../hooks/useTilt';
import './Technologies.css';

import flutterIcon from '../assets/Flutter_logo.svg';
import dartIcon from '../assets/dart.svg';
import hiveIcon from '../assets/hive.svg';
import sqliteIcon from '../assets/sqlite-icon.svg';
import firebaseIcon from '../assets/firebase-icon.svg';
import goIcon from '../assets/go.svg';
import rabbitmqIcon from '../assets/rabbitmq.svg';
import postgresqlIcon from '../assets/postgresql.svg';
import mysqlIcon from '../assets/MySQL.svg';
import supabaseIcon from '../assets/supabase.svg';
import dockerIcon from '../assets/docker-engine.svg';
import gcpIcon from '../assets/google-cloud-platform.svg';
import awsIcon from '../assets/icons8-aws-logo.svg';
import gitIcon from '../assets/git-icon.svg';

type TechItem =
  | { type: 'icon'; label: string; src: string }
  | { type: 'text'; label: string };

const mobileFrontend: TechItem[] = [
  { type: 'icon', label: 'Flutter',          src: flutterIcon },
  { type: 'icon', label: 'Dart',             src: dartIcon },
  { type: 'text', label: 'GetX' },
  { type: 'text', label: 'Bloc' },
  { type: 'text', label: 'ChangeNotifier' },
  { type: 'icon', label: 'HIVE',             src: hiveIcon },
  { type: 'text', label: 'SharedPreference' },
  { type: 'icon', label: 'Firebase Auth',    src: firebaseIcon },
  { type: 'icon', label: 'Firestore',        src: firebaseIcon },
  { type: 'icon', label: 'SQLite',           src: sqliteIcon },
];

const backend: TechItem[] = [
  { type: 'icon', label: 'Golang',           src: goIcon },
  { type: 'text', label: 'Gin' },
  { type: 'text', label: 'Net/Http' },
  { type: 'text', label: 'API-REST' },
  { type: 'text', label: 'Socket.io' },
  { type: 'text', label: 'TCP' },
  { type: 'icon', label: 'RabbitMQ',         src: rabbitmqIcon },
  { type: 'icon', label: 'PostgreSQL',       src: postgresqlIcon },
  { type: 'icon', label: 'MySQL',            src: mysqlIcon },
  { type: 'icon', label: 'Supabase',         src: supabaseIcon },
  { type: 'icon', label: 'Firebase',         src: firebaseIcon },
];

const devops: TechItem[] = [
  { type: 'icon', label: 'Docker',           src: dockerIcon },
  { type: 'icon', label: 'AWS',              src: awsIcon },
  { type: 'icon', label: 'GCP',              src: gcpIcon },
  { type: 'text', label: 'Cloud Run' },
  { type: 'text', label: 'Artifact Registry' },
  { type: 'icon', label: 'Git / GitHub',     src: gitIcon },
];

function TechBadge({ item }: { item: TechItem }) {
  // Magnetic drift rather than full tilt: these badges number in the dozens and
  // are duplicated for the marquee, so a per-badge rotateX/rotateY spring would
  // cost far more than the effect returns.
  const magnetic = useMagnetic(7);

  return (
    <motion.div
      className="tech-badge"
      style={magnetic.disabled ? undefined : magnetic.style}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
    >
      {item.type === 'icon' ? (
        <img
          src={item.src}
          alt={item.label}
          className="tech-badge-icon"
          title={item.label}
        />
      ) : (
        <span className="tech-badge-dot" />
      )}
      <span className="tech-badge-text">{item.label}</span>
    </motion.div>
  );
}

/** Scroll speed shared by every track, in CSS pixels per second. */
const MARQUEE_SPEED = 50;

/**
 * An infinitely scrolling row of badges.
 *
 * The number of copies is measured, not guessed. A marquee loops seamlessly only
 * while content fills the viewport at every point in the cycle: the animation
 * travels exactly one copy before repeating, so the copies *behind* the first one
 * have to cover the viewport on their own — `(copies - 1) * copyWidth >= viewport`.
 *
 * Counting items cannot satisfy that, because badge widths depend on label length
 * and font metrics, and the viewport changes. Measuring one rendered copy against
 * the wrapper and adding copies until the inequality holds is what actually
 * guarantees no gap. (The original two-copy track failed this on wide viewports
 * for every list, not just the short ones.)
 *
 * The shift is set in pixels rather than as a percentage of the track. With a
 * flex `gap` between copies, one repeat of the pattern is `copyWidth + gap`,
 * which is not `100% / copies` of the total — a percentage shift would drift out
 * of alignment by one gap per copy.
 */
function CarouselTrack({ items, reverse = false }: { items: TechItem[]; reverse?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ copies: 2, shift: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const copy = copyRef.current;
    if (!wrapper || !copy) return;

    const measure = () => {
      const copyWidth = copy.getBoundingClientRect().width;
      const viewport = wrapper.clientWidth;
      if (copyWidth < 1 || viewport < 1) return;

      const gap = parseFloat(getComputedStyle(copy).columnGap) || 0;
      const period = copyWidth + gap;
      // +1 so the trailing copies cover the viewport once the first has passed.
      const copies = Math.max(2, Math.ceil(viewport / period) + 1);

      setMetrics((prev) =>
        prev.copies === copies && Math.abs(prev.shift - period) < 0.5
          ? prev
          : { copies, shift: period },
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(copy);
    return () => observer.disconnect();
  }, [items]);

  const copy = (
    <div className="carousel-copy" ref={copyRef}>
      {items.map((item) => (
        <TechBadge key={item.label} item={item} />
      ))}
    </div>
  );

  return (
    <div className="carousel-wrapper" ref={wrapperRef}>
      <div
        className={`carousel-track ${reverse ? 'reverse' : ''}`}
        style={
          {
            '--marquee-shift': `-${metrics.shift}px`,
            // Duration scales with the travel distance so every track scrolls at
            // the same visual speed regardless of how wide its list is.
            '--marquee-duration': `${metrics.shift / MARQUEE_SPEED}s`,
          } as React.CSSProperties
        }
      >
        {copy}
        {Array.from({ length: metrics.copies - 1 }, (_, i) => (
          <div className="carousel-copy" key={i} aria-hidden="true">
            {items.map((item) => (
              <TechBadge key={item.label} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Technologies() {
  const { t } = useLanguage();

  return (
    <section className="tech-section" id="technologies">
      <div className="tech-label">{t.tech.mobileFrontend}</div>
      <CarouselTrack items={mobileFrontend} />

      <div className="tech-label">{t.tech.backend}</div>
      <CarouselTrack items={backend} reverse />

      <div className="tech-label">{t.tech.devops}</div>
      <CarouselTrack items={devops} />
    </section>
  );
}
