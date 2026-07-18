import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useLanguage } from '../hooks/useLanguage';
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

function TimelineCard({ exp, side, index }: { exp: Experience; side: 'left' | 'right'; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: '-100px' });

  const xOffset = side === 'left' ? -30 : 30;

  return (
    <div className={`timeline-item ${side}`} ref={cardRef}>
      {side === 'right' && <div className="timeline-spacer" />}

      <div className="timeline-card-wrapper">
        <motion.div
          className="timeline-card"
          initial={{ opacity: 0, x: xOffset }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            delay: index * 0.15,
          }}
        >
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
      <motion.div
        className="timeline-node"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
      />

      {/* Connector */}
      <motion.div
        className="timeline-connector"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.15 + 0.1 }}
      />
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
        <div className="timeline-title">{t.timeline.title}</div>
        <div className="timeline-title-line" />
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
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
