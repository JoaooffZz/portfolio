import { useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-driven parallax primitives.
 *
 * All movement is expressed as `y` translation only, so consumers can bind it
 * straight to `translate3d` and stay on the compositor. Nothing here touches
 * layout properties.
 */

interface ParallaxOptions {
  /**
   * How far the layer drifts, in pixels, across its full viewport traversal.
   * Positive values drift downward (layer appears *behind* the page — it lags
   * the scroll). Negative values drift upward (layer appears in *front*).
   */
  distance?: number;
  /** Smooth the motion value with a spring. Off by default: scroll-linked springs can feel laggy. */
  smooth?: boolean;
  /** When false the hook returns a permanently-zero motion value. */
  enabled?: boolean;
}

export interface ParallaxLayer<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  y: MotionValue<number>;
  progress: MotionValue<number>;
}

/**
 * Parallax for an element as it traverses the viewport.
 *
 * Progress runs 0 → 1 from "element top hits viewport bottom" to "element
 * bottom leaves viewport top". We remap to -0.5 → 0.5 so the layer sits at its
 * natural position when centred, and drifts symmetrically either side. Without
 * that centring the element would be permanently offset at rest.
 */
export function useParallaxLayer<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {},
): ParallaxLayer<T> {
  const { distance = 60, smooth = false, enabled = true } = options;

  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    enabled ? [-distance / 2, distance / 2] : [0, 0],
  );

  // Hooks must run unconditionally; we pick which value to hand back.
  const smoothed = useSpring(raw, { stiffness: 220, damping: 40, mass: 0.4 });

  return { ref, y: smooth && enabled ? smoothed : raw, progress: scrollYProgress };
}

/**
 * Parallax for a child element relative to a parent's scroll progress.
 * Use this to give elements inside one section differing depths — the depth
 * cue comes from the *difference* in travel, not the absolute amount.
 */
export function useNestedParallax(
  progress: MotionValue<number>,
  distance: number,
  enabled = true,
): MotionValue<number> {
  return useTransform(
    progress,
    [0, 1],
    enabled ? [-distance / 2, distance / 2] : [0, 0],
  );
}

/**
 * How far the visitor has scrolled past the hero, 0 → 1 over the first
 * viewport height.
 *
 * Everything driven by the hero's exit — the layer receding, the laptop lid
 * folding shut — reads from this one signal so the motions stay in lockstep.
 *
 * It measures the *document* scroll rather than the hero element, because the
 * hero is `position: sticky` and pinned: its bounding rect never changes, so
 * `useScroll({ target: heroRef })` reports 0 forever no matter how far the page
 * has scrolled.
 */
export function useHeroExitProgress(): MotionValue<number> {
  const { scrollY } = useScroll();
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window === 'undefined' ? 1 : window.innerHeight,
  );

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useTransform(scrollY, [0, Math.max(1, viewportHeight)], [0, 1], {
    clamp: true,
  });
}

/** Map a scroll progress range onto an arbitrary output range. */
export function useScrollRange(
  progress: MotionValue<number>,
  input: [number, number],
  output: [number, number],
  enabled = true,
): MotionValue<number> {
  return useTransform(progress, input, enabled ? output : [output[0], output[0]]);
}
