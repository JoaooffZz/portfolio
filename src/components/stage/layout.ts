/*
 * Dimensions and placement of the stage model, as plain numbers.
 *
 * Split from model.ts so the DOM side (annotations, StageVisual) can share them
 * without importing three.js — any static import of `three` from outside the
 * lazy HexScene chunk would pull the whole renderer into the initial bundle.
 *
 * Angles are measured from +Z towards +X, so a hexagon vertex sits at angle 0
 * and edge midpoints at 30° + k·60°. The six adapters sit on those midpoints.
 */

export type LayerKey = 'base' | 'adapters' | 'ports' | 'app' | 'core';

/** Bottom to top — the order of the z-1 … z-5 labels. */
export const LAYER_ORDER: LayerKey[] = ['base', 'adapters', 'ports', 'app', 'core'];

export const DIM = {
  base: { outer: 2.35, depth: 0.1, y: -0.05 },
  ports: { outer: 1.45, inner: 1.12, depth: 0.16, y: 0.08 },
  app: { outer: 1.0, inner: 0.68, depth: 0.24, y: 0.12 },
  core: { outer: 0.56, depth: 0.36, y: 0.18 },
  adapter: { width: 0.8, depth: 0.42, height: 0.26, radius: 1.92, y: 0.13 },
  socket: { radius: 0.075, height: 0.07 },
} as const;

/** Apothem of a regular hexagon from its vertex radius. */
const apothem = (r: number) => r * Math.cos(Math.PI / 6);

/** Radius at which each layer's outer edge sits, for side labels. */
export const LAYER_RADIUS: Record<LayerKey, number> = {
  base: DIM.base.outer,
  adapters: DIM.adapter.radius + DIM.adapter.depth / 2,
  ports: DIM.ports.outer,
  app: DIM.app.outer,
  core: DIM.core.outer,
};

/** Vertical offset of each layer in the exploded view. */
export const EXPLODE_Y: Record<LayerKey, number> = {
  base: -1.5,
  adapters: -0.75,
  ports: 0,
  app: 0.75,
  core: 1.5,
};

/** Top surface height of each layer when assembled. */
export const LAYER_TOP: Record<LayerKey, number> = {
  base: DIM.base.y + DIM.base.depth / 2,
  adapters: DIM.adapter.y + DIM.adapter.height / 2,
  ports: DIM.ports.y + DIM.ports.depth / 2,
  app: DIM.app.y + DIM.app.depth / 2,
  core: DIM.core.y + DIM.core.depth / 2,
};

/** Centre-line height of each layer when assembled. */
export const LAYER_Y: Record<LayerKey, number> = {
  base: DIM.base.y,
  adapters: DIM.adapter.y,
  ports: DIM.ports.y,
  app: DIM.app.y,
  core: DIM.core.y,
};

/** Edge-midpoint angle of side k. */
export const sideAngle = (k: number) => Math.PI / 6 + (k * Math.PI) / 3;

/** Radii used to route packets and place labels. */
export const ROUTE = {
  adapterOuter: DIM.adapter.radius + DIM.adapter.depth / 2,
  adapter: DIM.adapter.radius,
  socket: apothem((DIM.ports.outer + DIM.ports.inner) / 2),
  app: apothem((DIM.app.outer + DIM.app.inner) / 2),
} as const;

/** The side the Asaas webhook adapter sits on — front-right from the camera. */
export const WEBHOOK_SIDE = 0;
