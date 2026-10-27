import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * One-shot entrance trigger. Returns a ref and the class to add once the
 * element is a little way into the viewport; the transitions live in CSS
 * (`.reveal`, `.w-i`), so nothing re-renders per frame.
 */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  return [ref, inView ? 'is-in' : ''] as const;
}
