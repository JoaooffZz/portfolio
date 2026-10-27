import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { DIM, LAYER_TOP, ROUTE, sideAngle, type LayerKey } from './layout';

/*
 * Geometry for the stage model: concentric extruded hexagons lying on the XZ
 * plane. Dimensions live in layout.ts.
 */

const BEVEL = 0.018;

/** Point on the XZ plane at `radius` along side k's midpoint direction. */
export function onSide(k: number, radius: number, y: number, target = new THREE.Vector3()) {
  const a = sideAngle(k);
  return target.set(Math.sin(a) * radius, y, Math.cos(a) * radius);
}

function hexPoints(r: number) {
  // Shape space: after rotateX(-π/2), shape-y maps to world -z.
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return new THREE.Vector2(Math.sin(a) * r, -Math.cos(a) * r);
  });
}

function hexShape(outer: number, inner?: number) {
  const shape = new THREE.Shape(hexPoints(outer));
  // Holes wind opposite to the outline.
  if (inner) shape.holes.push(new THREE.Path(hexPoints(inner).reverse()));
  return shape;
}

function rectShape(width: number, depth: number) {
  const w = width / 2;
  const d = depth / 2;
  return new THREE.Shape([
    new THREE.Vector2(-w, -d),
    new THREE.Vector2(w, -d),
    new THREE.Vector2(w, d),
    new THREE.Vector2(-w, d),
  ]);
}

/**
 * Extrudes a shape upward into a slab centred on the origin.
 *
 * The bevel is offset inward by its own size so the nominal dimensions hold
 * whether or not it is enabled — the solid (bevelled) and the outline
 * (unbevelled) versions of a part therefore line up.
 */
function slab(shape: THREE.Shape, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - bevel * 2, 0.001),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: 2,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.center();
  return geometry;
}

interface Part {
  solid: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
}

function part(shape: THREE.Shape, depth: number, y: number): Part {
  const solid = slab(shape, depth, BEVEL);
  const plain = slab(shape, depth, 0);
  const edges = new THREE.EdgesGeometry(plain, 20);
  plain.dispose();
  solid.translate(0, y, 0);
  edges.translate(0, y, 0);
  return { solid, edges };
}

/** Rotates a part about Y onto side k and pushes it out to `radius`. */
function placeOnSide(p: Part, k: number, radius: number): Part {
  const m = new THREE.Matrix4()
    .makeTranslation(onSide(k, radius, 0))
    .multiply(new THREE.Matrix4().makeRotationY(sideAngle(k)));
  return { solid: p.solid.clone().applyMatrix4(m), edges: p.edges.clone().applyMatrix4(m) };
}

function mergeParts(parts: Part[]): Part {
  const merged = {
    solid: mergeGeometries(parts.map((p) => p.solid))!,
    edges: mergeGeometries(parts.map((p) => p.edges))!,
  };
  for (const p of parts) {
    p.solid.dispose();
    p.edges.dispose();
  }
  return merged;
}

/** One geometry pair per layer: a merged solid and its merged outline. */
export function buildLayerGeometry(): Record<LayerKey, Part> {
  const base = part(hexShape(DIM.base.outer), DIM.base.depth, DIM.base.y);

  const adapterTemplate = part(rectShape(DIM.adapter.width, DIM.adapter.depth), DIM.adapter.height, DIM.adapter.y);
  const adapters = mergeParts(
    Array.from({ length: 6 }, (_, k) => placeOnSide(adapterTemplate, k, DIM.adapter.radius)),
  );
  adapterTemplate.solid.dispose();
  adapterTemplate.edges.dispose();

  const portsRing = part(hexShape(DIM.ports.outer, DIM.ports.inner), DIM.ports.depth, DIM.ports.y);
  const socketY = LAYER_TOP.ports + DIM.socket.height / 2;
  const sockets = Array.from({ length: 6 }, (_, k) => {
    const solid = new THREE.CylinderGeometry(DIM.socket.radius, DIM.socket.radius, DIM.socket.height, 20);
    // A wide threshold keeps only the two rims, not one line per facet.
    const edges = new THREE.EdgesGeometry(solid, 40);
    const at = onSide(k, ROUTE.socket, socketY);
    solid.translate(at.x, at.y, at.z);
    edges.translate(at.x, at.y, at.z);
    // Cylinders are indexed, extrusions are not; merging needs them to match.
    return { solid: solid.toNonIndexed(), edges };
  });
  const ports = mergeParts([portsRing, ...sockets]);

  const app = part(hexShape(DIM.app.outer, DIM.app.inner), DIM.app.depth, DIM.app.y);
  const core = part(hexShape(DIM.core.outer), DIM.core.depth, DIM.core.y);

  return { base, adapters, ports, app, core };
}

/**
 * Dashed "wires" from each port socket out to its adapter. They belong to no
 * layer: they lie on the base plate and are hidden while the layers explode.
 */
export function buildWires() {
  const points: THREE.Vector3[] = [];
  const y = LAYER_TOP.base + 0.005;
  for (let k = 0; k < 6; k++) {
    points.push(onSide(k, ROUTE.socket + 0.1, y), onSide(k, DIM.adapter.radius - DIM.adapter.depth / 2, y));
  }
  // Inner inset outline on the base plate, for some drafting detail.
  const inset = hexPoints(DIM.base.outer - 0.2).map((p) => new THREE.Vector3(p.x, y, -p.y));
  for (let i = 0; i < 6; i++) points.push(inset[i], inset[(i + 1) % 6]);
  return new THREE.BufferGeometry().setFromPoints(points);
}

/**
 * Drafting grid under the model, faded out towards its edges with per-vertex
 * alpha so it reads as paper rather than a hard-edged square.
 */
export function buildGrid(extent = 3.6, step = 0.3) {
  const positions: number[] = [];
  const colors: number[] = [];
  const y = DIM.base.y - DIM.base.depth / 2 - 0.08;
  const alphaAt = (x: number, z: number) => {
    const d = Math.hypot(x, z);
    return Math.max(0, 1 - Math.max(0, d - 1.6) / (extent - 1.6));
  };
  const push = (x: number, z: number) => {
    positions.push(x, y, z);
    colors.push(1, 1, 1, alphaAt(x, z));
  };
  const n = Math.round(extent / step);
  for (let i = -n; i <= n; i++) {
    const c = i * step;
    for (let j = -n; j < n; j++) {
      const a = j * step;
      const b = (j + 1) * step;
      push(c, a);
      push(c, b);
      push(a, c);
      push(b, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
  return geometry;
}
