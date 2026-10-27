import { LAYER_ORDER, LAYER_TOP, ROUTE, WEBHOOK_SIDE, type LayerKey } from './layout';

/**
 * HTML labels pinned to points on the 3D model.
 *
 * They are DOM rather than in-scene text so they use the page's fonts, theme
 * and language without rebuilding textures. The scene projects each anchor to
 * screen space every frame and writes the transform straight to the element.
 */

export type AnnotationKind = 'note' | 'label' | 'callout' | 'layer';

export type Anchor =
  /** A point on side `side` (or the centre when omitted) of a layer. */
  | { type: 'point'; layer: LayerKey; side?: number; radius: number; y: number }
  /** A layer's right-hand edge, as seen from the camera. */
  | { type: 'layer'; layer: LayerKey };

export interface Annotation {
  id: string;
  kind: AnnotationKind;
  /** Stage ranges in which the annotation is visible. */
  ranges: (readonly [number, number])[];
  anchor: Anchor;
}

/** Adapter names. Product names, so they are not translated. */
export const ADAPTER_LABELS = ['Webhook · Asaas', 'HTTP · Gin', 'MySQL', 'Redis', 'RabbitMQ', 'OTel · SES'];

const SPEC: [number, number] = [1, 1];
const LIVE: [number, number] = [4, 4];

export const ANNOTATIONS: Annotation[] = [
  {
    id: 'note-core',
    kind: 'note',
    ranges: [[0, 0]],
    anchor: { type: 'point', layer: 'core', radius: 0, y: LAYER_TOP.core },
  },
  {
    id: 'note-webhook',
    kind: 'note',
    ranges: [[0, 0]],
    anchor: { type: 'point', layer: 'adapters', side: WEBHOOK_SIDE, radius: ROUTE.adapterOuter, y: LAYER_TOP.adapters },
  },
  {
    id: 'note-twice',
    kind: 'note',
    ranges: [[0, 0]],
    anchor: { type: 'point', layer: 'ports', side: 4, radius: ROUTE.socket, y: LAYER_TOP.ports },
  },
  ...ADAPTER_LABELS.map(
    (_, k): Annotation => ({
      id: `adapter-${k}`,
      kind: 'label',
      ranges: k === WEBHOOK_SIDE ? [SPEC, LIVE] : [SPEC],
      anchor: { type: 'point', layer: 'adapters', side: k, radius: ROUTE.adapterOuter + 0.42, y: LAYER_TOP.adapters },
    }),
  ),
  {
    id: 'callout-inbox',
    kind: 'callout',
    ranges: [SPEC, LIVE],
    anchor: { type: 'point', layer: 'ports', side: WEBHOOK_SIDE, radius: ROUTE.socket, y: LAYER_TOP.ports + 0.07 },
  },
  {
    id: 'callout-core',
    kind: 'callout',
    ranges: [SPEC, LIVE],
    anchor: { type: 'point', layer: 'core', radius: 0, y: LAYER_TOP.core },
  },
  ...LAYER_ORDER.map(
    (layer): Annotation => ({
      id: `layer-${layer}`,
      kind: 'layer',
      ranges: [[2, 2]],
      anchor: { type: 'layer', layer },
    }),
  ),
];
