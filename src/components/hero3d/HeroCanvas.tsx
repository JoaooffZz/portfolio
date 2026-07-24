import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { useMotionPrefs } from '../../hooks/useMotionPrefs';
import { useHeroExitProgress } from '../../hooks/useParallax';
import './HeroCanvas.css';

/*
 * The entire three.js stack sits behind this boundary. It is the only import
 * path to HeroScene, so when `allow3D` is false the chunk is never requested —
 * mobile, reduced-motion, and no-WebGL visitors pay nothing for it.
 */
const HeroScene = lazy(() => import('./HeroScene'));

/**
 * The hero's visual anchor.
 *
 * On a capable desktop this is the interactive 3D laptop, rendered full-bleed
 * behind the hero copy; everywhere else it is `fallback` (the photo card). They
 * are alternatives, not layers. The fallback also serves as the Suspense
 * placeholder, so the lazy load swaps one element for another with no layout
 * shift.
 */
export function HeroCanvas({ fallback }: { fallback: ReactNode }) {
  const { allow3D } = useMotionPrefs();
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, { margin: '100px' });
  const [failed, setFailed] = useState(false);

  /**
   * Normalised pointer position, -0.5 → 0.5 on each axis, relative to the hero
   * section. Written by a listener rather than the canvas' own pointer events:
   * the canvas is `pointer-events: none` so the headline stays selectable, which
   * means it never receives a pointermove of its own.
   */
  const pointer = useRef({ x: 0, y: 0 });

  /*
   * Drives the lid folding shut. Uses the shared hero-exit signal rather than
   * measuring this host element: the host lives inside the pinned hero, whose
   * rect never moves, so an element-relative measurement barely advances. It
   * also guarantees the lid closes in step with the hero receding.
   */
  const exitProgress = useHeroExitProgress();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A WebGL context can be lost after a successful probe (driver reset, too
    // many live contexts, backgrounded GPU process). Fall back rather than
    // leaving a blank hole where the hero was.
    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    host.addEventListener('webglcontextlost', onLost, true);

    // The hero section is the pointer surface — it spans the whole hero, so the
    // model keeps tracking the cursor even while it is over the copy.
    const section = host.closest('.hero-banner') as HTMLElement | null;
    const target = section ?? host;

    let frame: number | null = null;
    const onMove = (e: PointerEvent) => {
      if (frame !== null) return;
      const { clientX, clientY } = e;
      frame = requestAnimationFrame(() => {
        frame = null;
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointer.current.x = (clientX - rect.left) / rect.width - 0.5;
        pointer.current.y = (clientY - rect.top) / rect.height - 0.5;
      });
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerleave', onLeave);

    return () => {
      host.removeEventListener('webglcontextlost', onLost, true);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerleave', onLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  if (!allow3D || failed) {
    return <>{fallback}</>;
  }

  return (
    <div ref={hostRef} className="hero-canvas-host" aria-hidden="true">
      <Suspense fallback={<>{fallback}</>}>
        <HeroScene scrollProgress={exitProgress} active={inView} pointer={pointer} />
      </Suspense>
    </div>
  );
}
