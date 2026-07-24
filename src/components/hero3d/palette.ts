import * as THREE from 'three';

/**
 * Fixed palette for the hero laptop.
 *
 * Deliberately theme-agnostic: an off-white shell with a black outline reads
 * correctly against both the dark theme's true black (#000000) and the light
 * theme's pistachio (#D4F9E0), so the scene does not need to rebuild its
 * materials when the theme toggles. Only the neon accent is shared with the
 * 2D design system.
 */
export const PALETTE = {
  shell: '#E8EAE6',
  shellDark: '#B9BFBA',
  keys: '#102620',
  trackpad: '#C1FBD4',
  display: '#36F4A4',
  bezel: '#02090A',
  accent: '#36F4A4',
  outline: '#000000',
} as const;

/**
 * Which palette entry each GLB node uses. Node names come from the asset
 * itself (base, lid, hinge, display, key_row_1..4, …), so this map is the
 * single place that couples the scene to the model's naming.
 */
export function colorForNode(name: string): string {
  if (name === 'display') return PALETTE.display;
  if (name === 'bezel') return PALETTE.bezel;
  if (name === 'logo') return PALETTE.accent;
  if (name === 'trackpad') return PALETTE.trackpad;
  if (name === 'camera') return PALETTE.bezel;
  if (name === 'keyboard_recess') return PALETTE.bezel;
  if (name.startsWith('key_row') || name === 'spacebar' || name.startsWith('mod_keys')) {
    return PALETTE.keys;
  }
  if (name.startsWith('port_') || name.startsWith('foot_') || name === 'hinge') {
    return PALETTE.shellDark;
  }
  if (name === 'notch') return PALETTE.shellDark;
  return PALETTE.shell;
}

/**
 * Three-step gradient ramp for MeshToonMaterial.
 *
 * MeshToonMaterial quantises lighting by sampling this 1D texture. With
 * NearestFilter the result is hard-edged bands instead of a smooth falloff —
 * which is the whole point here, since smooth PBR shading would contradict the
 * flat neubrutalist surfaces in the rest of the page.
 */
export function createToonGradient(): THREE.DataTexture {
  const steps = new Uint8Array([90, 170, 255]);
  const texture = new THREE.DataTexture(
    steps,
    steps.length,
    1,
    THREE.RedFormat,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}
