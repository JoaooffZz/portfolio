/**
 * Scroll → stage mapping, shared by the copy column, the rail and the 3D scene
 * so all three agree on where the page is.
 *
 * The stage value is a float from 0 to LAST_STAGE. Integer values are "resting"
 * on a stage; fractions are mid-transition.
 */

export const STAGE_COUNT = 5;
export const LAST_STAGE = STAGE_COUNT - 1;

/**
 * Extra scroll, in stage-lengths, spent resting on the final stage. Without it
 * the last stage would only be reached at the very bottom of the section and
 * the interactive finale would unpin the moment it arrived.
 */
const FINAL_HOLD = 0.6;

/** Total scroll length of the section, in stage-lengths, beyond one viewport. */
export const SCROLL_STAGES = LAST_STAGE + FINAL_HOLD;

/**
 * Within each stage-length of scroll, the visual holds still until HOLD_UNTIL
 * and then transitions to the next stage by TRANSITION_END. Holding first is
 * what makes each stage readable rather than a continuous smear.
 */
const HOLD_UNTIL = 0.42;
const TRANSITION_END = 0.94;

export function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Section scroll progress (0–1) → stage float (0–LAST_STAGE). */
export function progressToStage(progress: number) {
  const raw = clamp(progress * (LAST_STAGE + FINAL_HOLD), 0, LAST_STAGE);
  const index = Math.floor(raw);
  if (index >= LAST_STAGE) return LAST_STAGE;
  return index + smoothstep(HOLD_UNTIL, TRANSITION_END, raw - index);
}

/** The section progress at which `stage` is resting, a little into its hold. */
export function stageToProgress(stage: number) {
  return clamp((stage + 0.12) / (LAST_STAGE + FINAL_HOLD));
}

/**
 * How visible something is at stage float `s`, given the stage ranges it
 * belongs to. Fully visible inside a range, fading out over `fade` stages on
 * either side.
 */
export function visibility(s: number, ranges: readonly (readonly [number, number])[], fade = 0.38) {
  let best = 0;
  for (const [from, to] of ranges) {
    const outside = Math.max(from - s, s - to, 0);
    best = Math.max(best, 1 - smoothstep(0, fade, outside));
  }
  return best;
}

/** Interpolates keyframe values indexed by stage. */
export function sampleKeyframes(frames: readonly number[], s: number) {
  const i = clamp(Math.floor(s), 0, frames.length - 1);
  const j = Math.min(i + 1, frames.length - 1);
  const t = s - i;
  return frames[i] + (frames[j] - frames[i]) * t;
}
