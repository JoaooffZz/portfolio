import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { useMotionPrefs } from '../../hooks/useMotionPrefs';
import type { Content } from '../../content';
import { ADAPTER_LABELS, ANNOTATIONS } from './annotations';
import { LAYER_ORDER, type LayerKey } from './layout';
import { FallbackDiagram } from './FallbackDiagram';
import type { PacketKind } from './sim';
import { LAST_STAGE } from './stageMath';

/*
 * The only import path to three.js. When 3D is withheld the chunk is never
 * requested at all.
 */
const HexScene = lazy(() => import('./HexScene'));

function annotationText(id: string, t: Content) {
  if (id.startsWith('adapter-')) return ADAPTER_LABELS[Number(id.slice(8))];
  if (id.startsWith('layer-')) return t.stage.layerLabels[LAYER_ORDER.indexOf(id.slice(6) as LayerKey)];
  switch (id) {
    case 'note-core':
      return t.stage.notes.core;
    case 'note-webhook':
      return t.stage.notes.webhook;
    case 'note-twice':
      return t.stage.notes.twice;
    case 'callout-inbox':
      return t.stage.callouts.inbox;
    case 'callout-core':
      return t.stage.callouts.core;
    default:
      return '';
  }
}

function SpecCard({ shown, t }: { shown: boolean; t: Content }) {
  return (
    <div className={`spec-card ${shown ? 'is-shown' : ''}`} aria-hidden="true">
      <span className="text-label">{t.stage.callouts.code}</span>
      <pre>
        <code>
          <b>SELECT</b> id, payload <b>FROM</b> inbox{'\n'}
          {' '}<b>WHERE</b> status = <i>'pending'</i>{'\n'}
          {' '}<b>ORDER BY</b> created_at{'\n'}
          {' '}<b>LIMIT</b> 10{'\n'}
          {' '}<b className="hl">FOR UPDATE SKIP LOCKED</b>;
        </code>
      </pre>
      <span className="spec-card-foot">{t.stage.callouts.retry}</span>
    </div>
  );
}

interface StageVisualProps {
  stage: MotionValue<number>;
  active: number;
  inView: boolean;
  sim: {
    fire: (kind: PacketKind) => void;
    queue: RefObject<PacketKind[]>;
  };
}

export function StageVisual({ stage, active, inView, sim }: StageVisualProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { allow3D, maxDpr, isTouch } = useMotionPrefs();
  const hostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const annotations = useRef<Record<string, HTMLElement | null>>({});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const use3D = allow3D && !failed;
  const isLive = active === LAST_STAGE;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !use3D) return;

    // A context can be lost after a successful probe (GPU reset, too many
    // contexts). Fall back to the diagram rather than leave a hole.
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    host.addEventListener('webglcontextlost', onLost, true);

    // The whole stage is the pointer surface, so the model keeps following the
    // cursor while it is over the copy column.
    const surface = (host.closest('.stage') as HTMLElement | null) ?? host;
    let frame: number | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || frame !== null) return;
      const { clientX, clientY } = e;
      frame = requestAnimationFrame(() => {
        frame = null;
        pointer.current.x = clientX / window.innerWidth - 0.5;
        pointer.current.y = clientY / window.innerHeight - 0.5;
      });
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    surface.addEventListener('pointermove', onMove);
    surface.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('webglcontextlost', onLost, true);
      surface.removeEventListener('pointermove', onMove);
      surface.removeEventListener('pointerleave', onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [use3D]);

  const [caption, detail] = t.stage.captions[active];

  return (
    <div
      ref={hostRef}
      className={`stage-visual ${isLive ? 'is-live' : ''}`}
      data-stage={active}
      // Supplementary to the buttons in the copy column, which are the
      // keyboard- and screen-reader-accessible way to fire.
      onClick={isLive ? () => sim.fire('new') : undefined}
    >
      <FallbackDiagram className={use3D && ready ? 'is-hidden' : ''} />

      {use3D && (
        <div className={`stage-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
          <Suspense fallback={null}>
            <HexScene
              stage={stage}
              theme={theme}
              active={inView}
              maxDpr={maxDpr}
              pointer={pointer}
              annotations={annotations}
              packets={sim.queue}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
      )}

      {use3D && (
        <div className="stage-annotations" aria-hidden="true">
          {ANNOTATIONS.map((a) => (
            <div
              key={a.id}
              ref={(el) => {
                annotations.current[a.id] = el;
              }}
              className={`annot annot--${a.kind}`}
              data-id={a.id}
              style={{ opacity: 0 }}
            >
              <span className="annot-body">{annotationText(a.id, t)}</span>
            </div>
          ))}
        </div>
      )}

      <SpecCard shown={active === 1} t={t} />

      <span className={`stage-hint ${isLive ? 'is-shown' : ''}`} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5.2-3l-2.1-3.7a1.5 1.5 0 0 1 2.5-1.6L9 14" />
        </svg>
        {isTouch ? t.stage.live.hintTouch : t.stage.live.hintPointer}
      </span>

      <div className="stage-captions" aria-hidden="true" key={`${active}-${caption}`}>
        <span>{caption}</span>
        <span>{detail}</span>
      </div>
    </div>
  );
}
