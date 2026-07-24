import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import { RevealText, DrawLine } from './RevealText';
import './Timeline.css';

interface Experience {
  role: string;
  stack: string;
  company: string;
  period: string;
  type: string;
  location: string;
  bullets: string[];
}

/**
 * Entrance travel as a share of the card's own width, and a shorter throw for
 * the stacked narrow layout. See the matching constants in Libraries.tsx.
 */
const SLIDE_DISTANCE = 55;
const SLIDE_DISTANCE_SMALL = 24;

function TimelineCard({ exp, side }: { exp: Experience; side: 'left' | 'right' }) {
  const { allowParallax, isSmallScreen } = useMotionPrefs();
  const cardRef = useRef<HTMLDivElement>(null);

  /*
   * Scroll-linked entrance, matching the libraries. Here the direction is not
   * alternated arbitrarily — each card enters from the side of the spine it
   * already sits on, so the movement reinforces the timeline's zig-zag instead of
   * fighting it.
   *
   * Replaces the previous one-shot `useInView` transition so the motion tracks
   * the scroll position and reverses when scrolling back up.
   */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const direction = side === 'left' ? -1 : 1;
  const travel = isSmallScreen ? SLIDE_DISTANCE_SMALL : SLIDE_DISTANCE;

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    allowParallax ? [`${direction * travel}%`, '0%'] : ['0%', '0%'],
  );
  const opacity = useTransform(scrollYProgress, [0, 0.55], allowParallax ? [0, 1] : [1, 1]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    allowParallax ? [direction * 2, 0] : [0, 0],
  );
  // The node pops in as its card arrives rather than on a fixed delay.
  const nodeScale = useTransform(scrollYProgress, [0.25, 0.8], allowParallax ? [0, 1] : [1, 1]);
  const connectorOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.7],
    allowParallax ? [0, 1] : [1, 1],
  );

  return (
    <div className={`timeline-item ${side}`} ref={cardRef}>
      {side === 'right' && <div className="timeline-spacer" />}

      <div className="timeline-card-wrapper">
        <motion.div className="timeline-card" style={{ x, opacity, rotate }}>
          <h3 className="timeline-card-role">{exp.role}</h3>
          <div className="timeline-card-stack">{exp.stack}</div>
          <div className="timeline-card-company">{exp.company}</div>
          <div className="timeline-card-meta">
            <span className="timeline-card-period">{exp.period}</span>
            <span className="timeline-card-badge">{exp.type}</span>
            <span className="timeline-card-badge">{exp.location}</span>
          </div>
          <ul className="timeline-card-bullets">
            {exp.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      {side === 'left' && <div className="timeline-spacer" />}

      {/* Node */}
      <motion.div className="timeline-node" style={{ scale: nodeScale }} />

      {/* Connector */}
      <motion.div className="timeline-connector" style={{ opacity: connectorOpacity }} />
    </div>
  );
}

export default function Timeline() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const experiences: Experience[] = [
    {
      role: t.timeline.roleToq,
      stack: 'Golang & AWS',
      company: 'TOQ',
      period: t.timeline.periodToq,
      type: t.timeline.typeFullTime,
      location: t.timeline.locBrazil,
      bullets: t.timeline.bulletsToq,
    },
    {
      role: t.timeline.roleVivaPlus,
      stack: 'Golang & Flutter Web',
      company: 'VIVA PLUS',
      period: t.timeline.periodVivaPlus,
      type: t.timeline.typeIntermittent,
      location: t.timeline.locBrazil,
      bullets: t.timeline.bulletsVivaPlus,
    },
    {
      role: t.timeline.roleMheads,
      stack: 'Flutter — Android & iOS',
      company: 'MHEADS SISTEMAS',
      period: t.timeline.periodMheads,
      type: t.timeline.typeIntermittent,
      location: t.timeline.locBrazil,
      bullets: t.timeline.bulletsMheads,
    },
  ];

  return (
    <section className="timeline-section" id="experience" ref={sectionRef}>
      <div className="timeline-header">
        <RevealText as="div" className="timeline-title" staggerMs={26}>
          {t.timeline.title}
        </RevealText>
        <DrawLine className="timeline-title-line" height={4} delay={260} />
      </div>

      <div className="timeline-container">
        {/* Vertical line */}
        <div className="timeline-line">
          <motion.div
            className="timeline-line-progress"
            style={{ scaleY, height: '100%' }}
          />
        </div>

        {/* Experience cards */}
        {experiences.map((exp, i) => (
          <TimelineCard
            key={exp.company}
            exp={exp}
            side={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </section>
  );
}
