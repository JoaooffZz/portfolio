import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { onAnchorClick, scrollToTarget } from '../../hooks/useSmoothScroll';
import type { DataRow } from '../../content';
import { ArrowIcon, DecodeText, SplitWords } from '../text';
import { StageVisual } from './StageVisual';
import { Console } from './Console';
import { useWebhookSim } from './sim';
import { LAST_STAGE, SCROLL_STAGES, progressToStage, stageToProgress } from './stageMath';
import './Stage.css';

const pad = (n: number) => String(n).padStart(2, '0');

function Panel({ index, active, children }: { index: number; active: number; children: ReactNode }) {
  const isActive = index === active;
  return (
    <article className={`stage-panel ${isActive ? 'is-active' : ''}`} aria-hidden={!isActive} inert={!isActive}>
      {children}
    </article>
  );
}

function DataList({ rows, three = false }: { rows: DataRow[]; three?: boolean }) {
  return (
    <ol className="data-list hide-mobile">
      {rows.map((row, i) => {
        const inner = (
          <>
            <span className="data-list-meta">{row.meta}</span>
            {three ? (
              <>
                <strong>{row.title}</strong>
                <span className="text-muted">{row.detail}</span>
              </>
            ) : (
              <span>
                {row.title} <span className="text-muted">· {row.detail}</span>
              </span>
            )}
          </>
        );
        return (
          <li
            key={row.title}
            className={`data-list-row ${three ? 'data-list-row--three' : ''}`}
            style={{ '--i': i } as React.CSSProperties}
          >
            {row.href ? (
              <a className="data-list-link" href={row.href} onClick={onAnchorClick}>
                {inner}
                <span className="arrow-circle" aria-hidden="true">
                  <ArrowIcon direction="right" />
                </span>
              </a>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The pinned five-stage scroll story: copy on the left, the model on the right,
 * a rail along the bottom. One scroll-progress value drives all three.
 */
export default function Stage() {
  const { t } = useLanguage();
  const s = t.stage;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const stage = useTransform(scrollYProgress, progressToStage);
  const railFill = useTransform(stage, (v) => v / LAST_STAGE);
  const [active, setActive] = useState(0);
  const inView = useInView(sectionRef);
  const sim = useWebhookSim(t.console);
  const { fire } = sim;

  useMotionValueEvent(stage, 'change', (v) => {
    const next = Math.round(v);
    setActive((prev) => (prev === next ? prev : next));
  });

  // The finale fires one event on its own the first time it's reached, so it
  // arrives already running rather than as an empty console.
  const autoFired = useRef(false);
  useEffect(() => {
    if (active !== LAST_STAGE || autoFired.current) return;
    const id = window.setTimeout(() => {
      autoFired.current = true;
      fire('new');
    }, 650);
    return () => window.clearTimeout(id);
  }, [active, fire]);

  const goTo = (index: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    scrollToTarget(top + stageToProgress(index) * scrollable, { offset: 0 });
  };

  return (
    <section
      className="stage"
      id="top"
      ref={sectionRef}
      aria-label={s.aria}
      style={{ '--scroll-stages': SCROLL_STAGES } as React.CSSProperties}
    >
      <div className="stage-sticky">
        <div className="page-container stage-grid">
          <div className="stage-copy">
            <div className="stage-steps" aria-hidden="true">
              <span>
                <strong>{pad(active + 1)}</strong> / {s.steps[active]}
              </span>
              <span className="stage-steps-dots">
                {s.steps.map((step, i) => (
                  <span key={step} className={i === active ? 'is-active' : ''} />
                ))}
              </span>
            </div>

            <div className="stage-panels">
              <Panel index={0} active={active}>
                <h1 className="text-hero">
                  <SplitWords lines={s.concept.title} />
                </h1>
                <p className="stage-short">{s.concept.short}</p>
                <p className="text-lead">
                  <SplitWords text={s.concept.lead} offset={4} />
                </p>
                <div className="scroll-cue">
                  <strong>
                    <ArrowIcon direction="down" />
                    {s.concept.cue}
                  </strong>
                  <DecodeText key={s.concept.decode} text={s.concept.decode} className="scroll-cue-decode" />
                </div>
              </Panel>

              <Panel index={1} active={active}>
                <h2 className="text-headline">
                  <SplitWords text={s.spec.title} />
                </h2>
                <p className="stage-short">{s.spec.short}</p>
                <p className="text-body">{s.spec.body}</p>
                <DataList rows={s.spec.rows} />
              </Panel>

              <Panel index={2} active={active}>
                <h2 className="text-headline">
                  <SplitWords text={s.layers.title} />
                </h2>
                <p className="stage-short">{s.layers.short}</p>
                <p className="text-body">{s.layers.body}</p>
                <DataList rows={s.layers.rows} three />
              </Panel>

              <Panel index={3} active={active}>
                <h2 className="text-headline">
                  <SplitWords text={s.code.title} />
                </h2>
                <a className="stage-short stage-short-link" href="#oss" onClick={onAnchorClick}>
                  {s.code.short}
                </a>
                <p className="text-body">{s.code.body}</p>
                <DataList rows={s.code.rows} three />
              </Panel>

              <Panel index={4} active={active}>
                <h2 className="text-headline">
                  <SplitWords text={s.live.title} />
                </h2>
                <p className="stage-short">{s.live.short}</p>
                <p className="text-body hide-mobile">{s.live.body}</p>
                <div className="stage-actions">
                  <button type="button" className="button button-primary" onClick={() => fire('new')}>
                    {s.live.send}
                    <ArrowIcon />
                  </button>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => fire('dup')}
                    disabled={!sim.canReplay}
                  >
                    {s.live.replay}
                  </button>
                </div>
                <Console t={t} lines={sim.lines} stats={sim.stats} />
              </Panel>
            </div>
          </div>

          <StageVisual stage={stage} active={active} inView={inView} sim={sim} />
        </div>

        <nav className="page-container stage-rail" aria-label={s.aria}>
          <div className="stage-rail-track">
            <motion.span className="stage-rail-fill" style={{ scaleX: railFill }} aria-hidden="true" />
            {s.steps.map((step, i) => (
              <button
                key={step}
                type="button"
                className={`stage-rail-notch ${i <= active ? 'is-passed' : ''}`}
                style={{ '--position': `${(i / LAST_STAGE) * 100}%` } as React.CSSProperties}
                aria-label={`${pad(i + 1)} ${step}`}
                aria-current={i === active ? 'step' : undefined}
                onClick={() => goTo(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <div className="stage-rail-label" aria-live="polite">
            <span className="text-label">
              {pad(active + 1)} / {pad(LAST_STAGE + 1)}
            </span>
            <strong>{s.steps[active]}</strong>
          </div>
        </nav>
      </div>
    </section>
  );
}
