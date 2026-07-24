import {
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  type MotionValue,
} from 'framer-motion';
import { useCallback, useRef } from 'react';
import { useMotionPrefs } from './useMotionPrefs';

/**
 * Pointer-driven 3D tilt, tuned for this project's neubrutalist surfaces.
 *
 * The tilt itself is conventional (rotateX/rotateY tracking the cursor), but the
 * hard offset shadow is driven *counter* to the tilt. A flat neubrutalist shadow
 * reads as a light source fixed at the top-left; if the card leans toward the
 * cursor, the shadow has to slide the other way or the two cues contradict each
 * other and the card looks like it is sliding rather than tilting.
 */

export interface TiltOptions {
  /** Peak rotation in degrees at the element's edge. */
  max?: number;
  /** Base offset of the hard shadow, in px, at rest. */
  shadowDistance?: number;
  /** How far the shadow travels against the tilt, in px. */
  shadowTravel?: number;
  /** Colour of the hard shadow. Any CSS colour or var(). */
  shadowColor?: string;
  /** Scale applied while hovered. */
  hoverScale?: number;
  /** Perspective depth. Lower = more dramatic distortion. */
  perspective?: number;
  /** Degrees of static rotation to preserve (e.g. the hero photo's 2deg skew). */
  baseRotate?: number;
}

export interface TiltResult {
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  /** Spread into a `motion.*` element's `style` prop. */
  style: {
    rotateX: MotionValue<number>;
    rotateY: MotionValue<number>;
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    boxShadow: MotionValue<string>;
    transformPerspective: number;
    transformStyle: 'preserve-3d';
  };
  /**
   * Spring-smoothed pointer offset, -0.5 → 0.5 on each axis.
   *
   * Exposed so callers can drive *inner* parallax. `translateZ` on children is
   * not an option here: these cards use `overflow: hidden`, which flattens the
   * 3D context and makes any child Z-offset a no-op. Counter-translating
   * children in 2D reads as depth and is immune to that.
   */
  nx: MotionValue<number>;
  ny: MotionValue<number>;
  /** True when tilt is disabled (touch / reduced motion) — render plain CSS instead. */
  disabled: boolean;
}

const SPRING = { stiffness: 260, damping: 26, mass: 0.5 };

export function useTilt(options: TiltOptions = {}): TiltResult {
  const {
    max = 9,
    shadowDistance = 6,
    shadowTravel = 6,
    shadowColor = 'var(--color-border)',
    hoverScale = 1.02,
    perspective = 900,
    baseRotate = 0,
  } = options;

  const { allowTilt } = useMotionPrefs();

  // Normalised pointer offset from element centre, -0.5 → 0.5 on both axes.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hovered = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING);
  const rotate = useSpring(
    useTransform(px, [-0.5, 0.5], [baseRotate + 0.6, baseRotate - 0.6]),
    SPRING,
  );
  const scale = useSpring(useTransform(hovered, [0, 1], [1, hoverScale]), SPRING);

  // Shadow slides opposite the lean, and grows slightly on hover to read as lift.
  const shadowX = useSpring(
    useTransform(px, [-0.5, 0.5], [shadowDistance + shadowTravel, shadowDistance - shadowTravel]),
    SPRING,
  );
  const shadowY = useSpring(
    useTransform(py, [-0.5, 0.5], [shadowDistance + shadowTravel, shadowDistance - shadowTravel]),
    SPRING,
  );
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 0px 0px ${shadowColor}`;

  const nx = useSpring(px, SPRING);
  const ny = useSpring(py, SPRING);

  const frame = useRef<number | null>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!allowTilt) return;
      const el = e.currentTarget;
      const { clientX, clientY } = e;

      // getBoundingClientRect forces layout, so coalesce to one read per frame.
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        px.set((clientX - rect.left) / rect.width - 0.5);
        py.set((clientY - rect.top) / rect.height - 0.5);
      });
    },
    [allowTilt, px, py],
  );

  const onPointerEnter = useCallback(() => {
    if (!allowTilt) return;
    hovered.set(1);
  }, [allowTilt, hovered]);

  const onPointerLeave = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    hovered.set(0);
    px.set(0);
    py.set(0);
  }, [hovered, px, py]);

  return {
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
    style: {
      rotateX,
      rotateY,
      rotate,
      scale,
      boxShadow,
      transformPerspective: perspective,
      transformStyle: 'preserve-3d',
    },
    nx,
    ny,
    disabled: !allowTilt,
  };
}

/**
 * Lightweight magnetic hover: the element drifts a few px toward the cursor.
 * Used on the tech badges, where a full tilt on dozens of small elements would
 * cost more than it returns.
 */
export function useMagnetic(strength = 6) {
  const { allowTilt } = useMotionPrefs();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 300, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 300, damping: 22, mass: 0.4 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!allowTilt) return;
      const rect = e.currentTarget.getBoundingClientRect();
      x.set(((e.clientX - rect.left) / rect.width - 0.5) * strength * 2);
      y.set(((e.clientY - rect.top) / rect.height - 0.5) * strength * 2);
    },
    [allowTilt, strength, x, y],
  );

  const onPointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    onPointerMove,
    onPointerLeave,
    style: { x: sx, y: sy },
    disabled: !allowTilt,
  };
}
