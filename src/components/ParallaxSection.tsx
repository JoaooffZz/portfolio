import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import { useHeroExitProgress } from '../hooks/useParallax';
import './ParallaxSection.css';

/**
 * A section that drifts vertically as it crosses the viewport.
 *
 * Only `translate3d` is animated, so the whole effect stays on the compositor.
 * The section keeps its natural box in the document flow — the transform is
 * applied to an inner wrapper — which means the drift can never open a gap
 * between stacked sections.
 */
export function ParallaxSection({
  children,
  className = '',
  distance = 60,
  zIndex,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  zIndex?: number;
}) {
  const { allowParallax } = useMotionPrefs();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Centred remap: the layer sits at its natural position mid-viewport and
  // drifts symmetrically either side of it.
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    allowParallax ? [distance / 2, -distance / 2] : [0, 0],
  );

  return (
    <div ref={ref} className={`parallax-layer ${className}`} style={{ zIndex }}>
      <motion.div className="parallax-layer-inner" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * The hero "cake layer": pinned to the top of the viewport while the sections
 * below scroll over it, receding in scale and opacity as it goes.
 *
 * Pinning is desktop-only (see ParallaxSection.css) because the mobile hero is
 * auto-height and would be clipped by a fixed 100vh sticky box.
 */
export function ParallaxHeroLayer({ children }: { children: ReactNode }) {
  const { allowParallax } = useMotionPrefs();

  // Shared with the 3D hero scene, so the layer receding and the laptop lid
  // folding shut are two halves of one gesture rather than two timelines.
  const exit = useHeroExitProgress();

  const scale = useTransform(exit, [0, 1], allowParallax ? [1, 0.9] : [1, 1]);
  const opacity = useTransform(exit, [0, 0.8], allowParallax ? [1, 0.15] : [1, 1]);
  const y = useTransform(exit, [0, 1], allowParallax ? [0, 70] : [0, 0]);

  return (
    <div className="parallax-layer parallax-layer--hero">
      <motion.div
        className="parallax-layer-inner parallax-hero-inner"
        style={{ scale, opacity, y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
