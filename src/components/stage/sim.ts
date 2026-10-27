import { useCallback, useEffect, useRef, useState } from 'react';
import type { Content, WebhookEvent } from '../../content';

/**
 * The finale's webhook simulator.
 *
 * The DOM side (this hook) owns the log and the counters; the 3D side only
 * animates packets. They stay in step because both read the same timings below
 * — the hook schedules each log line for the moment the scene's packet reaches
 * the matching hop.
 */

export type PacketKind = 'new' | 'dup';

/** Hop durations, in ms: edge → adapter → inbox → (queued) → app → domain. */
export const NEW_HOPS = [320, 420, 280, 360, 380];
/** A replay stops at the inbox, where it is recognised and dropped. */
export const DUP_HOPS = [320, 420, 300];

const sum = (hops: number[], n: number) => hops.slice(0, n).reduce((a, b) => a + b, 0);
const AT_INBOX = sum(NEW_HOPS, 2);
const AT_WORKER = sum(NEW_HOPS, 3);
const AT_DOMAIN = sum(NEW_HOPS, 5);

export type LogTag = 'http' | 'inbox' | 'worker' | 'domain' | 'idem';

export interface LogLine {
  key: number;
  time: string;
  tag: LogTag;
  text: string;
}

export interface SimStats {
  received: number;
  processed: number;
  ignored: number;
}

const MAX_LINES = 7;

function clock() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function eventId() {
  return `evt_${Math.random().toString(16).slice(2, 6)}`;
}

export function useWebhookSim(copy: Content['console']) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [stats, setStats] = useState<SimStats>({ received: 0, processed: 0, ignored: 0 });
  const [canReplay, setCanReplay] = useState(false);

  /** Drained by the scene each frame. */
  const queue = useRef<PacketKind[]>([]);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);
  const nextEvent = useRef(0);
  const last = useRef<{ id: string; event: WebhookEvent } | null>(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const log = useCallback((tag: LogTag, text: string) => {
    setLines((prev) => [...prev.slice(-(MAX_LINES - 1)), { key: ++seq.current, time: clock(), tag, text }]);
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const fire = useCallback(
    (kind: PacketKind) => {
      if (kind === 'dup' && !last.current) return;

      let id: string;
      let event: WebhookEvent;
      if (kind === 'new') {
        id = eventId();
        event = copy.events[nextEvent.current % copy.events.length];
        nextEvent.current += 1;
        last.current = { id, event };
        setCanReplay(true);
      } else {
        ({ id, event } = last.current!);
      }

      queue.current.push(kind);
      setStats((s) => ({ ...s, received: s.received + 1 }));
      log('http', `POST /webhooks/asaas ${event.type} · ${event.method} ${id}${kind === 'dup' ? ` ${copy.replaySuffix}` : ''}`);

      if (kind === 'dup') {
        later(AT_INBOX, () => {
          log('idem', copy.inboxDup(id));
          setStats((s) => ({ ...s, ignored: s.ignored + 1 }));
        });
        return;
      }

      later(AT_INBOX, () => log('inbox', copy.inboxNew(id)));
      later(AT_WORKER, () => log('worker', copy.worker(id)));
      later(AT_DOMAIN, () => {
        log('domain', copy.domain(event.result));
        setStats((s) => ({ ...s, processed: s.processed + 1 }));
      });
    },
    [copy, log, later],
  );

  return { lines, stats, canReplay, fire, queue };
}
