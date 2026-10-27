import type { Content } from '../../content';
import type { LogLine, SimStats } from './sim';

/** The finale's live log, fed by useWebhookSim. */
export function Console({ t, lines, stats }: { t: Content; lines: LogLine[]; stats: SimStats }) {
  return (
    <div className="console" role="log" aria-live="polite" aria-label={t.console.title}>
      <div className="console-head">
        <span className="console-dot" aria-hidden="true" />
        <span className="console-title">{t.console.title}</span>
        <span className="console-stats">
          {stats.received} {t.console.received} · {stats.processed} {t.console.processed} · {stats.ignored}{' '}
          {t.console.ignored}
        </span>
      </div>
      <ol className="console-body">
        {lines.length === 0 && <li className="console-idle">{t.console.idle}</li>}
        {lines.map((line) => (
          <li key={line.key} className={`console-line console-line--${line.tag}`}>
            <span className="console-time">{line.time}</span>
            <span className="console-tag">{line.tag}</span>
            <span className="console-text">{line.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
