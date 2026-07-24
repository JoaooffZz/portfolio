import { animate, split, stagger, svg } from 'animejs';
import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import './RevealText.css';

/**
 * Per-character headline reveal.
 *
 * This is the one job anime.js does that framer-motion has no answer for:
 * `split()` walks the text node, wraps every glyph in its own span, keeps the
 * surrounding markup intact, and sets `aria-label` on the host so screen
 * readers still announce the original string instead of spelling it out.
 * Hand-rolling that in React means either splitting in JSX (which wrecks text
 * selection and line breaking) or maintaining the accessibility shim yourself.
 *
 * Because `split()` mutates the DOM that React owns, two rules apply:
 *   - the children must be a plain string, never elements React will re-render;
 *   - the splitter must be reverted on cleanup, and re-created when the string
 *     changes (i.e. on language toggle).
 */
export function RevealText({
  children,
  as: Tag = 'span',
  className = '',
  delay = 0,
  duration = 900,
  staggerMs = 22,
  from = 'first',
  once = true,
}: {
  children: string;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
  duration?: number;
  staggerMs?: number;
  from?: 'first' | 'last' | 'center' | 'random';
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: '-15%' });
  const { prefersReduced } = useMotionPrefs();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || prefersReduced) return;

    /*
     * `words: true` is load-bearing, not decoration. Splitting to chars alone
     * leaves every glyph as an independent inline-block with no word wrapper,
     * so the browser happily breaks a line between any two letters — the hero
     * headline rendered as "JOÃO PAU / LO". The word spans keep each word
     * atomic while the chars inside them stay individually animatable.
     */
    const splitter = split(el as HTMLElement, {
      chars: true,
      words: true,
      accessible: true,
    });

    const animation = animate(splitter.chars, {
      opacity: [0, 1],
      y: ['0.55em', '0em'],
      // A slight lean that resolves to square — reads as the glyphs snapping
      // into the grid rather than simply fading, which suits the blocky type.
      rotate: [-7, 0],
      duration,
      // `jitter` roughens the cadence so the reveal doesn't march like a metronome.
      delay: stagger(staggerMs, { start: delay, from, jitter: staggerMs * 0.4 }),
      ease: 'outExpo',
    });

    return () => {
      animation.revert();
      splitter.revert();
    };
    // `children` is in the deps so a language toggle re-splits the new string.
  }, [inView, prefersReduced, children, delay, duration, staggerMs, from]);

  // The `as` prop makes Tag a union of intrinsic elements whose ref types don't
  // unify, so the element type is widened once here rather than at each usage.
  const Host = Tag as 'div';

  return (
    <Host ref={ref as React.Ref<HTMLDivElement>} className={className}>
      {children}
    </Host>
  );
}

/**
 * Draws an SVG line/path from nothing to full as it enters the viewport.
 * Uses anime.js's `createDrawable`, which handles the stroke-dasharray and
 * stroke-dashoffset bookkeeping across arbitrary path geometry.
 */
export function DrawLine({
  className = '',
  height = 4,
  delay = 0,
  duration = 700,
  color = 'var(--color-border)',
}: {
  className?: string;
  height?: number;
  delay?: number;
  duration?: number;
  color?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const { prefersReduced } = useMotionPrefs();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;

    const path = el.querySelector('line');
    if (!path) return;

    if (prefersReduced) {
      // Skip the draw, but the line must still end up visible.
      path.style.strokeDashoffset = '0';
      path.style.strokeDasharray = 'none';
      return;
    }

    const drawable = svg.createDrawable(path);
    const animation = animate(drawable, {
      draw: ['0 0', '0 1'],
      duration,
      delay,
      ease: 'inOutQuad',
    });

    return () => {
      animation.revert();
    };
  }, [inView, prefersReduced, delay, duration]);

  return (
    <svg
      ref={ref}
      className={className}
      height={height}
      width="100%"
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1="0"
        y1={height / 2}
        x2="100"
        y2={height / 2}
        stroke={color}
        strokeWidth={height}
      />
    </svg>
  );
}
