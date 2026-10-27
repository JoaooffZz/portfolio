/**
 * Plan view of the hexagonal model, as a static SVG.
 *
 * Stands in for the WebGL scene while its chunk loads, and permanently for
 * visitors who asked for reduced motion or less data, or whose browser has no
 * WebGL. Same proportions as model.ts, drawn from directly above.
 */

const deg = (rad: number) => (rad * 180) / Math.PI;
const side = (k: number) => Math.PI / 6 + (k * Math.PI) / 3;

function hex(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return `${(Math.sin(a) * r).toFixed(3)},${(Math.cos(a) * r).toFixed(3)}`;
  }).join(' ');
}

const SOCKET = ((1.45 + 1.12) / 2) * Math.cos(Math.PI / 6);

export function FallbackDiagram({ className = '' }: { className?: string }) {
  return (
    <svg className={`stage-fallback ${className}`} viewBox="-2.9 -2.9 5.8 5.8" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="0.018" strokeLinejoin="round">
        <polygon points={hex(2.35)} />
        <polygon points={hex(2.15)} opacity="0.4" />
        {Array.from({ length: 6 }, (_, k) => {
          const a = side(k);
          const [sx, sy] = [Math.sin(a), Math.cos(a)];
          return (
            <g key={k}>
              <line
                x1={sx * (SOCKET + 0.1)}
                y1={sy * (SOCKET + 0.1)}
                x2={sx * 1.71}
                y2={sy * 1.71}
                strokeDasharray="0.07 0.05"
                opacity="0.7"
              />
              <rect
                x={-0.4}
                y={-0.21}
                width={0.8}
                height={0.42}
                rx={0.03}
                transform={`translate(${sx * 1.92} ${sy * 1.92}) rotate(${-deg(a)})`}
              />
              <circle cx={sx * SOCKET} cy={sy * SOCKET} r={0.075} />
            </g>
          );
        })}
        <polygon points={hex(1.45)} />
        <polygon points={hex(1.12)} />
        <polygon points={hex(1.0)} />
        <polygon points={hex(0.68)} />
      </g>
      <polygon points={hex(0.56)} className="stage-fallback-core" />
    </svg>
  );
}
