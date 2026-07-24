/// <reference types="vite/client" />

/**
 * vite/client declares the common asset types but not 3D models. The `.glb` is
 * listed in `assetsInclude` in vite.config.ts, so Vite emits it as a URL — this
 * declaration is what tells TypeScript the same thing.
 */
declare module '*.glb' {
  const src: string;
  export default src;
}
