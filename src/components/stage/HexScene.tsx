import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import type { Theme } from '../../hooks/useTheme';
import { ANNOTATIONS } from './annotations';
import {
  EXPLODE_Y,
  LAYER_ORDER,
  LAYER_RADIUS,
  LAYER_TOP,
  LAYER_Y,
  ROUTE,
  WEBHOOK_SIDE,
  type LayerKey,
} from './layout';
import { buildGrid, buildLayerGeometry, buildWires, onSide } from './model';
import { DUP_HOPS, NEW_HOPS, type PacketKind } from './sim';
import { clamp, sampleKeyframes, smoothstep, visibility } from './stageMath';

/*
 * Camera keyframes, one value per stage. Polar angle is measured from straight
 * down (0 = plan view), azimuth from the front.
 */
const CAM = {
  polar: [0.42, 0.015, 1.04, 0.96, 0.9],
  azimuth: [-0.5, 0, 0.62, 0.32, 0.22],
  distance: [11.6, 13.8, 13.4, 11.2, 10.9],
  targetY: [0, 0, 0.12, 0.05, 0.05],
  /* In the plan view +Z is screen-down, so this lifts the drawing clear of the
     SQL card pinned to the bottom of the frame. */
  targetZ: [0, 0.72, 0, 0, 0],
};

/** The pencil "boil": outlines re-jitter at a hand-drawn animation rate. */
const BOIL_FPS = 12;

interface ScenePalette {
  ink: string;
  pencil: string;
  accent: string;
  solids: Record<LayerKey, string>;
  coreEmissive: number;
  sky: string;
  ground: string;
  hemi: number;
  key: number;
  rim: number;
  grid: number;
  lineOnSolid: number;
}

/*
 * Mirrors the CSS tokens in index.css. The canvas renders with `flat` (no tone
 * mapping) so these hexes come out exactly as the page's own colours.
 */
const PALETTES: Record<Theme, ScenePalette> = {
  dark: {
    ink: '#f5f5f5',
    pencil: '#8f8f8f',
    accent: '#3ee6a8',
    solids: { base: '#141414', adapters: '#222222', ports: '#2b2b2b', app: '#343434', core: '#3ee6a8' },
    coreEmissive: 0.28,
    sky: '#ffffff',
    ground: '#1a1a1a',
    hemi: 1.15,
    key: 1.7,
    rim: 0.55,
    grid: 0.2,
    lineOnSolid: 0.22,
  },
  light: {
    ink: '#0a0a0a',
    pencil: '#6b6b6b',
    accent: '#0fb57c',
    solids: { base: '#d6d6d6', adapters: '#ececec', ports: '#f4f4f4', app: '#e4e4e4', core: '#2fd39a' },
    coreEmissive: 0.08,
    sky: '#ffffff',
    ground: '#8a8a8a',
    hemi: 1.9,
    key: 1.5,
    rim: 0.35,
    grid: 0.16,
    lineOnSolid: 0.3,
  },
};

interface Packet {
  mesh: THREE.Mesh;
  active: boolean;
  kind: PacketKind | 'ambient';
  path: THREE.Vector3[];
  hops: number[];
  elapsed: number;
}

function buildScene() {
  const root = new THREE.Group();
  const geometry = buildLayerGeometry();

  const layers = LAYER_ORDER.map((key) => {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.62,
      metalness: 0.04,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(geometry[key].solid, material);
    const lineMaterial = new THREE.LineBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false });
    const lines = new THREE.LineSegments(geometry[key].edges, lineMaterial);
    group.add(mesh, lines);
    root.add(group);
    return { key, group, mesh, material, lines, lineMaterial, jitter: new THREE.Vector3() };
  });

  const wires = new THREE.LineSegments(
    buildWires(),
    new THREE.LineDashedMaterial({ dashSize: 0.07, gapSize: 0.05, transparent: true, toneMapped: false, depthWrite: false }),
  );
  wires.computeLineDistances();

  const grid = new THREE.LineSegments(
    buildGrid(),
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, toneMapped: false, depthWrite: false }),
  );
  root.add(wires, grid);

  const hemi = new THREE.HemisphereLight();
  const key = new THREE.DirectionalLight();
  key.position.set(3.5, 7, 4.5);
  const rim = new THREE.DirectionalLight();
  rim.position.set(-4, 2.5, -3.5);
  root.add(hemi, key, rim);

  const packetGeometry = new THREE.IcosahedronGeometry(0.08, 1);
  const packetAccent = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false });
  const packetMuted = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false });
  const packets: Packet[] = Array.from({ length: 24 }, () => {
    const mesh = new THREE.Mesh(packetGeometry, packetAccent);
    mesh.visible = false;
    root.add(mesh);
    return { mesh, active: false, kind: 'ambient', path: [], hops: [], elapsed: 0 };
  });

  const colors = {
    ink: new THREE.Color(),
    pencil: new THREE.Color(),
    line: new THREE.Color(),
  };

  function dispose() {
    for (const l of layers) {
      l.material.dispose();
      l.lineMaterial.dispose();
      l.mesh.geometry.dispose();
      l.lines.geometry.dispose();
    }
    for (const obj of [wires, grid]) {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
    packetGeometry.dispose();
    packetAccent.dispose();
    packetMuted.dispose();
  }

  return { root, layers, wires, grid, hemi, key, rim, packets, packetAccent, packetMuted, colors, dispose };
}

type Built = ReturnType<typeof buildScene>;

function applyPalette(built: Built, p: ScenePalette) {
  for (const l of built.layers) {
    l.material.color.set(p.solids[l.key]);
    if (l.key === 'core') {
      l.material.emissive.set(p.solids.core);
      l.material.emissiveIntensity = p.coreEmissive;
    }
  }
  built.colors.ink.set(p.ink);
  built.colors.pencil.set(p.pencil);
  (built.grid.material as THREE.LineBasicMaterial).color.set(p.ink);
  built.hemi.color.set(p.sky);
  built.hemi.groundColor.set(p.ground);
  built.hemi.intensity = p.hemi;
  built.key.intensity = p.key;
  built.rim.intensity = p.rim;
  built.packetAccent.color.set(p.accent);
  built.packetMuted.color.set(p.pencil);
}

/* Packet routes, in assembled model space. Packets only fly in the finale,
   when every layer is back at its resting height. */
const ROUTE_POINTS = {
  edge: onSide(WEBHOOK_SIDE, ROUTE.adapterOuter + 0.6, LAYER_TOP.adapters + 0.4),
  adapter: onSide(WEBHOOK_SIDE, ROUTE.adapter, LAYER_TOP.adapters + 0.12),
  inbox: onSide(WEBHOOK_SIDE, ROUTE.socket, LAYER_TOP.ports + 0.14),
  app: onSide(WEBHOOK_SIDE, ROUTE.app, LAYER_TOP.app + 0.12),
  core: new THREE.Vector3(0, LAYER_TOP.core + 0.12, 0),
};

function ambientRoute(side: number, inbound: boolean) {
  const path = [
    onSide(side, ROUTE.adapter, LAYER_TOP.adapters + 0.12),
    onSide(side, ROUTE.socket, LAYER_TOP.ports + 0.14),
    onSide(side, ROUTE.app, LAYER_TOP.app + 0.12),
    ROUTE_POINTS.core.clone(),
  ];
  return inbound ? path : path.reverse();
}

function spawn(built: Built, kind: Packet['kind']) {
  const packet = built.packets.find((p) => !p.active);
  if (!packet) return;
  const r = ROUTE_POINTS;
  if (kind === 'new') {
    packet.path = [r.edge, r.adapter, r.inbox, r.inbox, r.app, r.core];
    packet.hops = NEW_HOPS;
  } else if (kind === 'dup') {
    packet.path = [r.edge, r.adapter, r.inbox, r.inbox];
    packet.hops = DUP_HOPS;
  } else {
    // Background traffic on the other five adapters: reads coming in, writes
    // going out. Never on the webhook side, so it can't be mistaken for the
    // visitor's own event.
    const side = 1 + Math.floor(Math.random() * 5);
    packet.path = ambientRoute(side, Math.random() < 0.5);
    packet.hops = [360, 300, 300];
  }
  packet.kind = kind;
  packet.elapsed = 0;
  packet.active = true;
  packet.mesh.material = kind === 'new' ? built.packetAccent : built.packetMuted;
  packet.mesh.visible = true;
}

/** Advances a packet; returns true on the frame it arrives at the domain. */
function stepPacket(packet: Packet, deltaMs: number, built: Built) {
  packet.elapsed += deltaMs;
  let t = packet.elapsed;
  let hop = 0;
  while (hop < packet.hops.length && t > packet.hops[hop]) {
    t -= packet.hops[hop];
    hop++;
  }

  if (hop >= packet.hops.length) {
    packet.active = false;
    packet.mesh.visible = false;
    return packet.kind === 'new';
  }

  const u = smoothstep(0, 1, t / packet.hops[hop]);
  packet.mesh.position.lerpVectors(packet.path[hop], packet.path[hop + 1], u);

  const grow = clamp(packet.elapsed / 140);
  let scale = packet.kind === 'ambient' ? 0.7 * grow : grow;
  if (packet.kind === 'dup' && hop === packet.hops.length - 1) {
    // Recognised at the inbox: it greys out and is dropped there.
    packet.mesh.material = built.packetMuted;
    scale *= 1 - u;
  }
  if (packet.kind === 'ambient' && hop === packet.hops.length - 1) scale *= 1 - u * 0.8;
  packet.mesh.scale.setScalar(Math.max(scale, 0.001));
  return false;
}

interface MotionState {
  s: number;
  px: number;
  py: number;
  boil: number;
  ambient: number;
  pulse: number;
}

interface FrameInput {
  stage: number;
  delta: number;
  elapsed: number;
  camera: THREE.Camera;
  width: number;
  height: number;
  pointer: { x: number; y: number };
  palette: ScenePalette;
  annotations: Record<string, HTMLElement | null> | null;
  queue: PacketKind[] | null;
}

const scratch = {
  v: new THREE.Vector3(),
  edge: new THREE.Vector3(),
  right: new THREE.Vector3(),
  edgeX: [0, 0, 0, 0, 0],
  edgeY: [0, 0, 0, 0, 0],
};

/**
 * One frame of the scene: camera, layer choreography, packets, annotations.
 *
 * Lives outside the component on purpose. It is all imperative mutation of
 * three.js objects and DOM nodes — exactly how R3F is meant to be driven, but
 * not something the React Compiler's immutability rules can reason about
 * inside a component body.
 */
function stepScene(built: Built, m: MotionState, input: FrameInput) {
  const { camera, delta, palette, width: w, height: h } = input;
  // Lenis already smooths the scroll; this second, short damp only matters for
  // jumps — rail clicks, anchor links, resizes — which would otherwise cut
  // rather than glide.
  m.s = THREE.MathUtils.damp(m.s, input.stage, 7, delta);
  const s = m.s;

  /* ── Camera ─────────────────────────────────────────── */
  const live = smoothstep(2.6, 3.4, s);
  m.px = THREE.MathUtils.damp(m.px, input.pointer.x, 3, delta);
  m.py = THREE.MathUtils.damp(m.py, input.pointer.y, 3, delta);
  const pointerWeight = 0.3 + 0.7 * live;
  const idle = live * Math.sin(input.elapsed * 0.22) * 0.16;

  const explode = smoothstep(0, 1, 1 - Math.abs(s - 2));
  const aspect = w / Math.max(h, 1);

  const polar = clamp(sampleKeyframes(CAM.polar, s) + m.py * 0.22 * pointerWeight, 0.015, 1.3);
  const azimuth = sampleKeyframes(CAM.azimuth, s) + m.px * 0.5 * pointerWeight + idle;
  // Portrait viewports lose horizontal field of view; back off to compensate.
  const distance = sampleKeyframes(CAM.distance, s) * Math.max(1, 1.02 / aspect);
  const targetY = sampleKeyframes(CAM.targetY, s);
  const targetZ = sampleKeyframes(CAM.targetZ, s);
  // On narrow frames the exploded view slides left, so the z-labels column on
  // the right has room instead of sitting on top of the model.
  const slide = explode * clamp((1.1 - aspect) / 0.5) * 1.5;
  const targetX = Math.cos(azimuth) * slide;
  const targetZ2 = targetZ - Math.sin(azimuth) * slide;

  camera.position.set(
    targetX + Math.sin(polar) * Math.sin(azimuth) * distance,
    targetY + Math.cos(polar) * distance,
    targetZ2 + Math.sin(polar) * Math.cos(azimuth) * distance,
  );
  camera.lookAt(targetX, targetY, targetZ2);
  camera.updateMatrixWorld();

  /* ── Layers ─────────────────────────────────────────── */
  const sketch = 1 - smoothstep(0.3, 0.95, s);
  const solid = smoothstep(2.3, 3.05, s);
  const ghost = visibility(s, [[2, 2]], 0.7) * 0.16;
  const fill = Math.max(solid, ghost);

  const { colors } = built;
  colors.line.lerpColors(colors.pencil, colors.ink, 1 - sketch);
  const lineOpacity = THREE.MathUtils.lerp(1, palette.lineOnSolid, solid);

  m.boil += delta;
  const reboil = m.boil > 1 / BOIL_FPS;
  if (reboil) m.boil = 0;

  for (const l of built.layers) {
    l.group.position.y = EXPLODE_Y[l.key] * explode;
    l.material.opacity = fill;
    l.material.depthWrite = fill > 0.98;
    l.mesh.visible = fill > 0.004;
    l.lineMaterial.color.copy(colors.line);
    l.lineMaterial.opacity = lineOpacity;

    if (reboil) l.jitter.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    l.lines.position.set(l.jitter.x * 0.02 * sketch, 0, l.jitter.z * 0.02 * sketch);
    l.lines.rotation.y = l.jitter.y * 0.014 * sketch;
  }

  const core = built.layers[built.layers.length - 1];
  m.pulse = THREE.MathUtils.damp(m.pulse, 0, 3.5, delta);
  core.material.emissiveIntensity = palette.coreEmissive + m.pulse * 0.9;
  core.mesh.scale.set(1 + m.pulse * 0.05, 1 + m.pulse * 0.18, 1 + m.pulse * 0.05);

  const wireMaterial = built.wires.material as THREE.LineDashedMaterial;
  wireMaterial.color.copy(colors.line);
  wireMaterial.opacity = (1 - explode) * THREE.MathUtils.lerp(0.85, 0.4, solid);
  built.wires.visible = wireMaterial.opacity > 0.004;
  built.wires.position.copy(built.layers[0].lines.position);

  const gridMaterial = built.grid.material as THREE.LineBasicMaterial;
  gridMaterial.opacity = visibility(s, [[1, 1]], 0.6) * palette.grid;
  built.grid.visible = gridMaterial.opacity > 0.004;

  /* ── Packets ────────────────────────────────────────── */
  const liveVisible = visibility(s, [[3.7, 4]], 0.45);
  built.packetAccent.opacity = liveVisible;
  built.packetMuted.opacity = liveVisible;

  const queue = input.queue;
  while (queue && queue.length) spawn(built, queue.shift()!);

  if (liveVisible > 0.5) {
    m.ambient += delta;
    if (m.ambient > 0.85) {
      m.ambient = 0;
      spawn(built, 'ambient');
    }
  }

  const deltaMs = Math.min(delta, 0.1) * 1000;
  for (const packet of built.packets) {
    if (packet.active && stepPacket(packet, deltaMs, built)) m.pulse = 1;
  }

  /* ── Annotations ────────────────────────────────────── */
  const nodes = input.annotations;
  if (!nodes) return;
  const toScreen = (v: THREE.Vector3) => {
    v.project(camera);
    return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h] as const;
  };

  // Layer labels line up in one column to the right of the widest layer, each
  // with a leader line back to its own edge.
  scratch.right.setFromMatrixColumn(camera.matrixWorld, 0);
  let column = 0;
  LAYER_ORDER.forEach((key, i) => {
    const y = LAYER_Y[key] + EXPLODE_Y[key] * explode;
    scratch.edge.set(0, y, 0).addScaledVector(scratch.right, LAYER_RADIUS[key]);
    const [x, sy] = toScreen(scratch.edge);
    scratch.edgeX[i] = x;
    scratch.edgeY[i] = sy;
    column = Math.max(column, x);
  });
  column = Math.min(column + 28, w - 150);

  for (const a of ANNOTATIONS) {
    const node = nodes[a.id];
    if (!node) continue;
    const vis = visibility(s, a.ranges);
    if (vis < 0.01) {
      if (node.style.opacity !== '0') node.style.opacity = '0';
      continue;
    }

    let x: number;
    let y: number;
    if (a.anchor.type === 'layer') {
      const i = LAYER_ORDER.indexOf(a.anchor.layer);
      x = column;
      y = scratch.edgeY[i];
      node.style.setProperty('--leader', `${Math.max(0, column - scratch.edgeX[i]).toFixed(1)}px`);
    } else {
      const { layer, side, radius, y: ay } = a.anchor;
      if (side === undefined) scratch.v.set(0, ay, 0);
      else onSide(side, radius, ay, scratch.v);
      scratch.v.y += EXPLODE_Y[layer] * explode;
      [x, y] = toScreen(scratch.v);
      // Callouts read to the right of their anchor; near the right edge they
      // flip to the left so they aren't cut off.
      if (a.kind === 'callout') {
        const flip = x > w * 0.56 ? 'left' : 'right';
        if (node.dataset.flip !== flip) node.dataset.flip = flip;
      }
    }

    node.style.opacity = vis.toFixed(3);
    node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
}

interface SceneProps {
  stage: MotionValue<number>;
  theme: Theme;
  pointer: RefObject<{ x: number; y: number }>;
  annotations: RefObject<Record<string, HTMLElement | null>>;
  packets: RefObject<PacketKind[]>;
}

function Rig({ stage, theme, pointer, annotations, packets }: SceneProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const built = useMemo(() => buildScene(), []);
  const motion = useRef<MotionState>({ s: stage.get(), px: 0, py: 0, boil: 0, ambient: 0, pulse: 0 });

  useEffect(() => applyPalette(built, PALETTES[theme]), [built, theme]);
  useEffect(() => () => built.dispose(), [built]);

  useFrame((frame, delta) => {
    stepScene(built, motion.current, {
      stage: stage.get(),
      delta,
      elapsed: frame.clock.elapsedTime,
      camera,
      width: size.width,
      height: size.height,
      pointer: pointer.current ?? { x: 0, y: 0 },
      palette: PALETTES[theme],
      annotations: annotations.current,
      queue: packets.current,
    });
  });

  return <primitive object={built.root} />;
}

/**
 * The stage's WebGL scene. Lazy-loaded — StageVisual is the only importer, so
 * three.js stays out of the initial bundle.
 */
export default function HexScene({
  active,
  maxDpr,
  onReady,
  ...props
}: SceneProps & { active: boolean; maxDpr: number; onReady: () => void }) {
  return (
    <Canvas
      flat
      dpr={[1, maxDpr]}
      // Parked entirely while the stage is off-screen, which is most of the page.
      frameloop={active ? 'always' : 'never'}
      camera={{ fov: 30, near: 0.1, far: 80, position: [0, 12, 0.1] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={onReady}
    >
      <Rig {...props} />
    </Canvas>
  );
}
