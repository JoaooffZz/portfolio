import * as THREE from 'three';
import { PALETTE } from './palette';

/**
 * Draws the laptop's screen content into a 2D canvas and wraps it as a texture.
 *
 * A CanvasTexture rather than drei's <Html> or <RenderTexture>: this project
 * dropped drei to keep the 3D chunk lean, and a DOM overlay would need to track
 * the lid's rotation every frame to stay aligned with a surface that folds shut.
 * Painting once into a texture costs nothing per frame and folds with the lid
 * for free, because it *is* the lid.
 */

const WIDTH = 1024;
const HEIGHT = 640;

/** A Go snippet, matching the stack this portfolio leads with. */
const CODE: Array<Array<{ text: string; color: string }>> = [
  [{ text: 'package', color: '#FF7BD5' }, { text: ' main', color: '#E8EAE6' }],
  [],
  [{ text: 'func', color: '#FF7BD5' }, { text: ' main', color: '#7FD8FF' }, { text: '() {', color: '#E8EAE6' }],
  [
    { text: '  srv', color: '#E8EAE6' },
    { text: ' := ', color: '#A1A1AA' },
    { text: 'relay', color: '#7FD8FF' },
    { text: '.', color: '#A1A1AA' },
    { text: 'New', color: '#36F4A4' },
    { text: '(', color: '#E8EAE6' },
    { text: ':8080', color: '#FFD479' },
    { text: ')', color: '#E8EAE6' },
  ],
  [
    { text: '  srv', color: '#E8EAE6' },
    { text: '.', color: '#A1A1AA' },
    { text: 'Use', color: '#36F4A4' },
    { text: '(permguard.', color: '#E8EAE6' },
    { text: 'Auth', color: '#36F4A4' },
    { text: '())', color: '#E8EAE6' },
  ],
  [],
  [
    { text: '  ', color: '#E8EAE6' },
    { text: 'if', color: '#FF7BD5' },
    { text: ' err ', color: '#E8EAE6' },
    { text: ':= ', color: '#A1A1AA' },
    { text: 'srv.', color: '#E8EAE6' },
    { text: 'Listen', color: '#36F4A4' },
    { text: '(); err ', color: '#E8EAE6' },
    { text: '!= ', color: '#A1A1AA' },
    { text: 'nil', color: '#FF7BD5' },
    { text: ' {', color: '#E8EAE6' },
  ],
  [
    { text: '    log', color: '#E8EAE6' },
    { text: '.', color: '#A1A1AA' },
    { text: 'Fatal', color: '#36F4A4' },
    { text: '(err)', color: '#E8EAE6' },
  ],
  [{ text: '  }', color: '#E8EAE6' }],
  [{ text: '}', color: '#E8EAE6' }],
];

export function createScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // ── Screen body ──
  ctx.fillStyle = PALETTE.bezel;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── Title bar ──
  const barHeight = 74;
  ctx.fillStyle = '#0B1F22';
  ctx.fillRect(0, 0, WIDTH, barHeight);
  ctx.fillStyle = '#1E2C31';
  ctx.fillRect(0, barHeight - 3, WIDTH, 3);

  const dots = ['#FF5F57', '#FEBC2E', PALETTE.accent];
  dots.forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(46 + i * 44, barHeight / 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.font = '500 26px ui-monospace, Menlo, monospace';
  ctx.fillStyle = '#A1A1AA';
  ctx.textBaseline = 'middle';
  ctx.fillText('main.go', 210, barHeight / 2);

  // ── Code ──
  const font = '500 30px ui-monospace, Menlo, Monaco, monospace';
  ctx.font = font;
  // Monospace: every glyph is one advance wide, so a single measurement gives
  // the column width and lets runs be laid out without re-measuring each span.
  const charWidth = ctx.measureText('M').width;

  const lineHeight = 46;
  const top = barHeight + 52;
  const gutter = 92;

  CODE.forEach((line, row) => {
    const y = top + row * lineHeight;

    // Line number
    ctx.font = '400 24px ui-monospace, Menlo, monospace';
    ctx.fillStyle = '#3F3F46';
    ctx.fillText(String(row + 1).padStart(2, ' '), 30, y);

    ctx.font = font;
    let column = 0;
    for (const span of line) {
      ctx.fillStyle = span.color;
      ctx.fillText(span.text, gutter + column * charWidth, y);
      column += span.text.length;
    }
  });

  // ── Caret on the line after the snippet ──
  ctx.fillStyle = PALETTE.accent;
  ctx.fillRect(gutter, top + CODE.length * lineHeight - 16, 16, 32);

  const texture = new THREE.CanvasTexture(canvas);
  // flipY is left at its default (true), which is what the display face's UVs
  // expect — the canvas' top-left lands at the screen's top-left.
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}
