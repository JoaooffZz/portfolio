import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePrefersReducedMotion } from './useMotionPrefs';

/**
 * Single Lenis instance for the page.
 *
 * Module-level rather than context: the only consumers are imperative
 * `scrollToTarget` calls from click handlers, which never need to re-render
 * when the instance changes.
 */
let lenis: Lenis | null = null;

/** Height of the fixed header, so anchored sections don't land under it. */
const HEADER_OFFSET = -72;

export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    // Touch scrolling is left native (syncTouch off): momentum on phones is
    // already smooth, and hijacking it is what makes smooth-scroll sites feel
    // sluggish.
    const instance = new Lenis({ lerp: 0.11, autoRaf: true });
    lenis = instance;
    return () => {
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);
}

export function scrollToTarget(target: string | number | HTMLElement, { offset = HEADER_OFFSET } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4 });
    return;
  }

  let top: number;
  if (typeof target === 'number') {
    top = target;
  } else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    top = el.getBoundingClientRect().top + window.scrollY + offset;
  }
  window.scrollTo({ top, behavior: 'auto' });
}

/** Click handler for in-page `href="#id"` links. */
export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href');
  if (!href?.startsWith('#')) return;
  e.preventDefault();
  scrollToTarget(href === '#top' ? 0 : href);
  if (href !== '#top') history.replaceState(null, '', href);
}
