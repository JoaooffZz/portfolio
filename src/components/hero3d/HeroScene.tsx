import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { LaptopModel } from './LaptopModel';

/**
 * Shifts its children toward the right of the frame.
 *
 * The canvas is full-bleed across the hero, so the laptop has to be positioned
 * where the photo card used to sit rather than dead centre. The offset is taken
 * as a fraction of `viewport.width` — the frame's width in world units at z=0 —
 * so it lands in the same place regardless of the window's aspect ratio. A fixed
 * world offset would drift toward or off the edge as the window is resized.
 */
function OffsetRight({ fraction, children }: { fraction: number; children: ReactNode }) {
  const width = useThree((state) => state.viewport.width);
  return <group position={[width * fraction, 0, 0]}>{children}</group>;
}

/**
 * The hero's WebGL scene. Lazy-loaded — see HeroCanvas, which is the only
 * thing that should import this module.
 */
export default function HeroScene({
  scrollProgress,
  active,
  pointer,
}: {
  scrollProgress: MotionValue<number>;
  /** False when the hero is scrolled out of view: stops the render loop. */
  active: boolean;
  /** Normalised pointer position, owned by HeroCanvas. */
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      /*
       * 'never' fully parks the render loop while the hero is off-screen, which
       * is most of the page. 'demand' was the other option, but the pointer and
       * lid springs settle over many frames and would need an invalidate() loop
       * to drive them — more moving parts for no extra saving, since the real
       * win is not rendering at all when nobody is looking.
       */
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      /* No `shadows`: the model casts none (see LaptopModel), so enabling the
         shadow map would add a render pass per frame for nothing. */
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      /*
       * LaptopModel normalises itself to a longest dimension of 1.55 units,
       * centred on the origin. At fov 35 the visible height is 2*d*tan(17.5°)
       * ≈ 0.63*d, so d = 4.4 frames ~2.77 units and the laptop occupies a little
       * over half the hero's height — the right proportion now that the canvas
       * spans the full hero rather than the photo card's smaller box.
       */
      camera={{ position: [0, 0.5, 4.4], fov: 35 }}
    >
      {/*
        Toon shading needs a dominant directional light to produce readable
        bands; ambient alone would flatten every face to one tone. Kept low so
        the darkest band stays dark.
      */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[2.6, 3.4, 2.2]} intensity={2.6} />
      {/* Fill from the opposite side so the shadowed faces don't crush to black. */}
      <directionalLight position={[-2.4, 1.2, -1.6]} intensity={0.7} />

      <Suspense fallback={null}>
        <OffsetRight fraction={0.21}>
          {/* Three-quarter view: the model self-centres, so this group only sets
              the resting orientation. */}
          <group rotation={[0, -0.62, 0]}>
            <LaptopModel scrollProgress={scrollProgress} pointer={pointer} />
          </group>
        </OffsetRight>
      </Suspense>
    </Canvas>
  );
}

/* Colour management: the palette hexes are authored as sRGB, which is what
   three's default output colour space expects. Stated explicitly so a future
   change to the renderer's colour space doesn't silently shift the palette. */
THREE.ColorManagement.enabled = true;
