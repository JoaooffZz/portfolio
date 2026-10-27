import type { ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useReveal } from '../hooks/useReveal';
import type { Job, Library } from '../content';
import { ArrowIcon, SplitWords } from './text';
import permguardCover from '../assets/oss/permguard.jpg';
import otphiveCover from '../assets/oss/otphive.jpg';
import oltgoCover from '../assets/oss/oltgo.jpg';
import relayCover from '../assets/oss/relay.jpg';
import sessionAuthCover from '../assets/oss/session-auth.jpg';
import './Sections.css';

function SectionHead({ index, title, intro }: { index: string; title: string; intro: string }) {
  const [ref, state] = useReveal<HTMLDivElement>();
  return (
    <div className={`section-head ${state}`} ref={ref}>
      <div>
        <span className="section-index">{index}</span>
        <h2>
          <SplitWords text={title} />
        </h2>
      </div>
      <p className={`reveal ${state}`}>{intro}</p>
    </div>
  );
}

function Reveal({ as: Tag = 'div', className = '', index = 0, children, id }: {
  as?: 'div' | 'li' | 'article';
  className?: string;
  index?: number;
  children: ReactNode;
  id?: string;
}) {
  const [ref, state] = useReveal<HTMLElement>();
  return (
    <Tag
      // The union of element types is wider than any one ref type.
      ref={ref as never}
      id={id}
      className={`reveal ${state} ${className}`}
      style={{ '--i': index } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

function JobItem({ job }: { job: Job }) {
  return (
    <Reveal as="li" className="work-item">
      <div className="work-meta">
        <span className="work-period">{job.period}</span>
        <span>{job.type}</span>
        <span>{job.place}</span>
      </div>
      <div className="work-main">
        <h3 className="work-role">
          {job.role} <span className="work-company">· {job.company}</span>
        </h3>
        <ul className="work-bullets">
          {job.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <ul className="chip-list" aria-label="Stack">
          {job.stack.map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export function Work() {
  const { t } = useLanguage();
  const w = t.work;
  return (
    <section className="section" id="work">
      <div className="page-container">
        <SectionHead index={w.index} title={w.title} intro={w.intro} />
        <ol className="work-list">
          {w.jobs.map((job) => (
            <JobItem key={job.company} job={job} />
          ))}
          <Reveal as="li" className="work-item work-item--edu">
            <div className="work-meta">
              <span className="work-period">{w.education.period}</span>
              <span>{w.education.place}</span>
            </div>
            <div className="work-main">
              <span className="text-label text-muted">{w.education.title}</span>
              <h3 className="work-role">
                {w.education.course} <span className="work-company">· {w.education.school}</span>
              </h3>
            </div>
          </Reveal>
        </ol>
      </div>
    </section>
  );
}

const COVERS: Record<Library['id'], string> = {
  permguard: permguardCover,
  otphive: otphiveCover,
  oltgo: oltgoCover,
  relay: relayCover,
  'session-auth': sessionAuthCover,
};

function LibraryCard({ lib, index }: { lib: Library; index: number }) {
  return (
    <Reveal as="article" className={`lib-card ${index === 0 ? 'lib-card--featured' : ''}`} index={index % 2} id={`oss-${lib.id}`}>
      <div className="lib-cover">
        <img src={COVERS[lib.id]} alt="" loading="lazy" decoding="async" width="720" height="720" />
      </div>
      <div className="lib-body">
        <div className="lib-top">
          <span className="lib-lang">{lib.lang}</span>
          <h3 className="lib-name">{lib.name}</h3>
          <p className="lib-tagline">{lib.tagline}</p>
        </div>
        <p className="lib-description">{lib.description}</p>
        <ul className="chip-list">
          {lib.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        <div className="lib-links">
          {lib.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="lib-link">
              {link.label}
              <span className="arrow-circle" aria-hidden="true">
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export function OpenSource() {
  const { t } = useLanguage();
  const o = t.oss;
  return (
    <section className="section" id="oss">
      <div className="page-container">
        <SectionHead index={o.index} title={o.title} intro={o.intro} />
        <div className="lib-grid">
          {o.libs.map((lib, i) => (
            <LibraryCard key={lib.id} lib={lib} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stack() {
  const { t } = useLanguage();
  const s = t.stack;
  return (
    <section className="section" id="stack">
      <div className="page-container">
        <SectionHead index={s.index} title={s.title} intro={s.intro} />
        <ol className="stack-list">
          {s.rows.map((row, i) => (
            <Reveal as="li" key={row.meta} className="stack-row" index={i}>
              <span className="stack-meta">{row.meta}</span>
              <strong className="stack-title">{row.title}</strong>
              <span className="stack-detail">{row.detail}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
