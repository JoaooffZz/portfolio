import { useEffect, useState } from 'react';

/**
 * Motion preferences & device capability detection.
 *
 * Everything animated in this project reads from here so that
 * `prefers-reduced-motion` and low-end devices get a calmer (or static)
 * experience without each component re-deriving the rules.
 */

export type MotionTier = 'full' | 'reduced' | 'none';

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Live-updating `prefers-reduced-motion` listener. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readReducedMotion);

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/**
 * Coarse device capability probe, evaluated once.
 *
 * The heuristics are deliberately conservative: we would rather serve a
 * static fallback to a capable phone than a stuttering WebGL canvas to a
 * weak one.
 */
function probeDevice() {
  if (typeof window === 'undefined') {
    return { isTouch: false, isSmallScreen: false, isWeak: false, saveData: false };
  }

  const nav = navigator as NavigatorWithHints;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const isWeak = cores <= 4 || memory <= 4;

  const saveData = nav.connection?.saveData === true;

  return { isTouch, isSmallScreen, isWeak, saveData };
}

let webglSupport: boolean | null = null;

/** Cached WebGL probe — creates a throwaway context exactly once. */
export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof window === 'undefined') return (webglSupport = false);

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    webglSupport = gl !== null;
    // Free the context immediately — we only wanted the answer.
    if (gl) {
      const lose = gl.getExtension('WEBGL_lose_context');
      lose?.loseContext();
    }
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

export interface MotionPrefs {
  /** Overall animation budget for this visit. */
  tier: MotionTier;
  /** User explicitly asked for less motion. */
  prefersReduced: boolean;
  /** Pointer cannot hover — skip mouse-driven tilt/parallax entirely. */
  isTouch: boolean;
  isSmallScreen: boolean;
  /** Safe to mount a WebGL canvas. */
  allow3D: boolean;
  /** Upper bound on the canvas pixel ratio. */
  maxDpr: number;
  /** Safe to run pointer-driven effects (magnetic buttons, scene parallax). */
  allowPointerFx: boolean;
}

export function useMotionPrefs(): MotionPrefs {
  const prefersReduced = usePrefersReducedMotion();
  const [device] = useState(probeDevice);

  const tier: MotionTier = prefersReduced
    ? 'none'
    : device.isWeak || device.saveData
      ? 'reduced'
      : 'full';

  return {
    tier,
    prefersReduced,
    isTouch: device.isTouch,
    isSmallScreen: device.isSmallScreen,
    /*
     * The stage scene is a few dozen extruded hexagons and line segments — no
     * textures, no shadow maps, no post-processing — so phones can run it too.
     * It is withheld only when the visitor asked for less motion (the whole
     * scene is scroll-driven camera movement) or for less data.
     */
    allow3D: !prefersReduced && !device.saveData && supportsWebGL(),
    // Weak and touch devices tend to pair small GPUs with 3x screens: cap the
    // fill rate rather than the feature.
    maxDpr: device.isWeak || device.isTouch ? 1.5 : 2,
    allowPointerFx: tier === 'full' && !device.isTouch,
  };
}
