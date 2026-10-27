import { Fragment, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/useMotionPrefs';

/**
 * Splits copy into masked words for the line-by-line reveal.
 *
 * Each word gets its stagger index as `--i`; the CSS decides when to play it
 * (an `.is-active` stage panel, an in-view section). The plain spaces between
 * words stay as text nodes, so the copy still reads normally to assistive tech
 * and wraps like ordinary text.
 */
export function SplitWords({ text, lines, offset = 0 }: { text?: string; lines?: string[]; offset?: number }) {
  let i = offset;
  const renderLine = (line: string) =>
    line.split(' ').map((word, w) => (
      <Fragment key={w}>
        {w > 0 && ' '}
        <span className="w">
          <span className="w-i" style={{ '--i': i++ } as React.CSSProperties}>
            {word}
          </span>
        </span>
      </Fragment>
    ));

  if (lines) {
    return (
      <>
        {lines.map((line, l) => (
          <span className="split-line" key={l}>
            {renderLine(line)}
          </span>
        ))}
      </>
    );
  }
  return <>{renderLine(text ?? '')}</>;
}

const GLYPHS = '01<>/{}[]#$%&*+=ABCDEFX';

/** Scrambles into its text, a character at a time. Decorative only. */
export function DecodeText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.textContent = text;
      return;
    }

    const frames = 24;
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const revealed = Math.floor((frame / frames) * text.length);
      node.textContent = Array.from(text, (c, i) =>
        i < revealed || c === ' ' || c === '·' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      ).join('');
      if (frame >= frames) {
        node.textContent = text;
        window.clearInterval(id);
      }
    }, 45);
    return () => window.clearInterval(id);
  }, [text, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

export function ArrowIcon({ direction = 'up-right' }: { direction?: 'up-right' | 'down' | 'up' | 'right' }) {
  const rotate = { 'up-right': 0, right: 45, down: 135, up: -45 }[direction];
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}
