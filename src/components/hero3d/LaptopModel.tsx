import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
/*
 * GLTFLoader is imported straight from three's examples rather than through
 * drei's useGLTF, which was the only thing this project used drei for. Measured
 * saving was ~7.6kB gzip — rolldown already tree-shook most of three-stdlib —
 * but it also drops a dependency, so the trade is worth keeping. The remaining
 * ~246kB gzip in the three chunk is three's core renderer and is not avoidable.
 */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import { PALETTE, colorForNode, createToonGradient } from './palette';
import { createScreenTexture } from './screenTexture';
import laptopUrl from '../../assets/Laptop.glb';

/**
 * World-space thickness of the inverted-hull outline, in scene units, against
 * a model normalised to TARGET_SIZE.
 *
 * Tuned by eye: 0.02 is nearly invisible at this camera distance and 0.08 reads
 * as chunky on the small parts (keys, ports). Note that a hull outline's
 * apparent thickness varies with how steeply a surface faces the camera, so
 * grazing edges will always look thinner than face-on ones.
 */
const OUTLINE_THICKNESS = 0.045;

/**
 * Longest dimension the model is normalised to, in scene units.
 *
 * The GLB's authored scale is not something this component should depend on, so
 * the model is measured and rescaled at load time. That keeps the camera
 * distance, the shadow plane height and the outline thickness all expressed
 * against one known size instead of being retuned by hand if the asset changes.
 */
const TARGET_SIZE = 1.55;

/*
 * Hinge angles, in radians, measured against this asset.
 *
 * The GLB's authored rest pose (rotation 0) is very nearly the open laptop, not
 * the shut one — so opening is a small positive angle and closing is a large
 * one, which is the opposite of what the node name suggests.
 */
const LID_OPEN = 0.25;
const LID_SHUT = 1.9;
/** Fraction of the hero's exit over which the lid completes its fold. */
const LID_CLOSE_AT = 0.9;

/**
 * Builds a back-face "shell" one step larger than the mesh it wraps.
 *
 * drei's <Edges> would give screen-space line widths, but it has to be nested
 * as a child of each mesh — impossible here, because the model arrives as one
 * cloned GLTF subtree rendered through <primitive> rather than as declarative
 * JSX per part.
 *
 * The scale is computed per axis from the mesh's own bounding box. A single
 * uniform scale factor would make the outline thickness proportional to each
 * part's size, so the thin parts (keys, ports, bezel) would get hairlines while
 * the base got a slab. Per-axis compensation keeps thickness constant.
 */
function buildOutline(
  mesh: THREE.Mesh,
  material: THREE.Material,
  /**
   * Outline thickness expressed in the mesh's *local* units.
   *
   * This has to be passed in rather than using OUTLINE_THICKNESS directly: the
   * root gets uniformly rescaled after this runs, so a thickness authored in
   * world units would be multiplied by that scale factor and collapse to
   * nothing. The caller divides it out.
   */
  localThickness: number,
): THREE.Mesh {
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox!;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const outline = new THREE.Mesh(mesh.geometry, material);
  const sx = size.x > 1e-6 ? 1 + (localThickness * 2) / size.x : 1;
  const sy = size.y > 1e-6 ? 1 + (localThickness * 2) / size.y : 1;
  const sz = size.z > 1e-6 ? 1 + (localThickness * 2) / size.z : 1;
  outline.scale.set(sx, sy, sz);

  /*
   * Scaling happens about the object's local origin, but this model bakes each
   * part's position into its vertices instead of using node translations — so
   * almost every geometry's bounding box is offset from that origin. Scaling
   * such a geometry up *displaces* the part outward rather than inflating it in
   * place, which is why the outlines were invisible: they were sliding out from
   * behind their own meshes instead of surrounding them.
   *
   * Translating by center*(1-scale) puts the bounding-box centre back where it
   * started, making the expansion symmetric about the part itself.
   */
  outline.position.set(
    center.x * (1 - sx),
    center.y * (1 - sy),
    center.z * (1 - sz),
  );
  // The hull must not cast or receive shadows, or it would shadow the very
  // mesh it is wrapping.
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.renderOrder = -1;
  return outline;
}

export function LaptopModel({
  scrollProgress,
  pointer,
}: {
  /** 0 → 1 across the hero's scroll traversal. Drives the lid angle. */
  scrollProgress: MotionValue<number>;
  /** Normalised pointer position, -0.5 → 0.5 on each axis. */
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const { scene } = useLoader(GLTFLoader, laptopUrl);
  const groupRef = useRef<THREE.Group>(null);
  /*
   * The hinge is mirrored into a ref rather than read straight off the memo.
   *
   * useFrame mutates it every frame, and the react-hooks immutability rule
   * (correctly, in general) rejects mutating a render-derived value after
   * render. Per-frame imperative mutation of scene objects is exactly how R3F
   * works, so the object is held in a ref — which is the sanctioned escape
   * hatch — instead of suppressing the rule.
   */
  const hingeRef = useRef<THREE.Object3D | null>(null);

  // Clone once, then restyle: useGLTF caches the source scene across mounts, so
  // mutating it directly would leak toon materials into any other consumer and
  // would double-add outlines on a remount.
  const model = useMemo(() => {
    const root = scene.clone(true);
    const gradientMap = createToonGradient();
    const screenTexture = createScreenTexture();
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: PALETTE.outline,
      side: THREE.BackSide,
    });

    /*
     * Step 1 — pose, then measure.
     *
     * The lid is swung to its open angle before measuring, because that is the
     * pose the model rests in and it is what determines the largest bounding
     * box. Measuring it shut would frame the open laptop too large and crop the
     * screen out of view.
     */
    const hinge = root.getObjectByName('hinge');
    if (hinge) hinge.rotation.x = LID_OPEN;

    root.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(root);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    const longest = Math.max(size.x, size.y, size.z);
    const scale = longest > 1e-6 ? TARGET_SIZE / longest : 1;

    /*
     * Step 2 — materials and outlines, now that `scale` is known.
     *
     * Order matters. The outline thickness is authored in world units, but it is
     * applied to meshes that live under a root about to be scaled by `scale`, so
     * it has to be divided out here or the outlines shrink into invisibility.
     */
    const localThickness = OUTLINE_THICKNESS / scale;
    const outlines: Array<{ parent: THREE.Object3D; mesh: THREE.Mesh }> = [];

    root.traverse((child: THREE.Object3D) => {
      if (!(child instanceof THREE.Mesh)) return;

      if (child.name === 'display') {
        /*
         * The screen is the one surface that must not be toon-shaded: a display
         * emits light rather than reflecting it, so shading it would band the
         * code content and read as a printed panel instead of a lit screen.
         * MeshBasicMaterial ignores lighting entirely, which is exactly right.
         */
        child.material = new THREE.MeshBasicMaterial({ map: screenTexture });
      } else {
        // The GLB ships metallic 0.8 / roughness 0.4 PBR materials. Toon shading
        // replaces them wholesale — specular highlights and reflections are
        // exactly what this design language rejects.
        child.material = new THREE.MeshToonMaterial({
          color: colorForNode(child.name),
          gradientMap,
        });
      }
      outlines.push({
        parent: child,
        mesh: buildOutline(child, outlineMaterial, localThickness),
      });
    });

    // Attaching during traverse would visit the freshly added outlines too.
    for (const { parent, mesh } of outlines) parent.add(mesh);

    // Step 3 — centre on the origin at the normalised scale.
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return { root, gradientMap, screenTexture, outlineMaterial, hinge: hinge ?? null };
  }, [scene]);

  // Cloned geometries are shared with the cached source scene, so they must not
  // be disposed here. The materials and the gradient texture are ours.
  useEffect(() => {
    hingeRef.current = model.hinge;
  }, [model]);

  useEffect(() => {
    const { root, gradientMap, screenTexture, outlineMaterial } = model;
    return () => {
      root.traverse((child: THREE.Object3D) => {
        // The outline meshes share one material, disposed separately below.
        if (child instanceof THREE.Mesh && child.material !== outlineMaterial) {
          (child.material as THREE.Material).dispose();
        }
      });
      outlineMaterial.dispose();
      gradientMap.dispose();
      screenTexture.dispose();
    };
  }, [model]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const p = pointer.current ?? { x: 0, y: 0 };

    // damp() is frame-rate independent, unlike a raw lerp with a fixed alpha —
    // which would settle at different speeds on 60Hz and 120Hz displays.
    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, p.x * 0.7, 4, delta);
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, p.y * 0.35, 4, delta);

    const progress = scrollProgress.get();

    /*
     * Open at rest, folding shut as the hero scrolls away — the gesture reads as
     * putting the laptop down on the way into the rest of the page. The hinge
     * node parents the whole lid subtree (lid → lid.seg1 → display/bezel/logo),
     * so rotating it alone swings everything about the correct pivot.
     *
     * The angle is eased in rather than mapped linearly. Linearly, the lid looked
     * all but shut by the time the hero was only half gone: the visible screen
     * area falls off with the cosine of the hinge angle, so the first half of the
     * rotation hides far more of the screen than the second. Easing in keeps the
     * screen readable through most of the scroll and lands the lid shut just as
     * the hero finishes fading.
     */
    const hinge = hingeRef.current;
    if (hinge) {
      const closing = Math.min(1, progress / LID_CLOSE_AT) ** 1.8;
      const target = THREE.MathUtils.lerp(LID_OPEN, LID_SHUT, closing);
      hinge.rotation.x = THREE.MathUtils.damp(hinge.rotation.x, target, 6, delta);
    }

    // Sinks slightly as it closes, so the two motions read as one gesture.
    group.position.y = -progress * 0.22;
  });

  /*
   * No ground shadow. The laptop reads as floating in the page rather than
   * resting on a surface, and a cast shadow implied a floor that isn't there.
   * Dropping it also removes the shadow-map pass from every frame — the
   * directional light no longer casts, and the Canvas no longer enables shadows.
   * Depth now comes entirely from the toon banding and the outline.
   */
  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={model.root} />
    </group>
  );
}

// Warms the loader cache as soon as this chunk evaluates, so the fetch overlaps
// the rest of the scene's setup instead of following it.
useLoader.preload(GLTFLoader, laptopUrl);
