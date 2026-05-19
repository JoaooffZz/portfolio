import './Technologies.css';

import flutterIcon from '../assets/Flutter_logo.svg';
import dartIcon from '../assets/dart.svg';
import hiveIcon from '../assets/hive.svg';
import sqliteIcon from '../assets/sqlite-icon.svg';
import firebaseIcon from '../assets/firebase-icon.svg';
import goIcon from '../assets/go.svg';
import rabbitmqIcon from '../assets/rabbitmq.svg';
import postgresqlIcon from '../assets/postgresql.svg';
import supabaseIcon from '../assets/supabase.svg';
import dockerIcon from '../assets/docker-engine.svg';
import gcpIcon from '../assets/google-cloud-platform.svg';
import gitIcon from '../assets/git-icon.svg';

type TechItem =
  | { type: 'icon'; label: string; src: string }
  | { type: 'text'; label: string };

const mobileFrontend: TechItem[] = [
  { type: 'icon', label: 'Flutter',          src: flutterIcon },
  { type: 'icon', label: 'Dart',             src: dartIcon },
  { type: 'text', label: 'GetX' },
  { type: 'text', label: 'Bloc' },
  { type: 'text', label: 'ChangeNotifier' },
  { type: 'icon', label: 'HIVE',             src: hiveIcon },
  { type: 'text', label: 'SharedPreference' },
  { type: 'icon', label: 'Firebase Auth',    src: firebaseIcon },
  { type: 'icon', label: 'Firestore',        src: firebaseIcon },
  { type: 'icon', label: 'SQLite',           src: sqliteIcon },
];

const backendDevops: TechItem[] = [
  { type: 'icon', label: 'Golang',           src: goIcon },
  { type: 'text', label: 'Gin' },
  { type: 'text', label: 'Net/Http' },
  { type: 'text', label: 'API-REST' },
  { type: 'text', label: 'Socket.io' },
  { type: 'icon', label: 'RabbitMQ',         src: rabbitmqIcon },
  { type: 'text', label: 'TCP' },
  { type: 'icon', label: 'PostgreSQL',       src: postgresqlIcon },
  { type: 'icon', label: 'Supabase',         src: supabaseIcon },
  { type: 'icon', label: 'Firebase',         src: firebaseIcon },
  { type: 'icon', label: 'Docker',           src: dockerIcon },
  { type: 'icon', label: 'GCP',              src: gcpIcon },
  { type: 'text', label: 'Cloud Run' },
  { type: 'text', label: 'Artifact Registry' },
  { type: 'icon', label: 'Git / GitHub',     src: gitIcon },
];

function TechBadge({ item }: { item: TechItem }) {
  return (
    <div className="tech-badge">
      {item.type === 'icon' ? (
        <img
          src={item.src}
          alt={item.label}
          className="tech-badge-icon"
          title={item.label}
        />
      ) : (
        <span className="tech-badge-dot" />
      )}
      <span className="tech-badge-text">{item.label}</span>
    </div>
  );
}

function CarouselTrack({ items, reverse = false }: { items: TechItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="carousel-wrapper">
      <div className={`carousel-track ${reverse ? 'reverse' : ''}`}>
        {doubled.map((item, i) => (
          <TechBadge key={`${item.label}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Technologies() {
  return (
    <section className="tech-section" id="technologies">
      <div className="tech-label">Mobile &amp; Frontend</div>
      <CarouselTrack items={mobileFrontend} />

      <div className="tech-label">Backend &amp; DevOps</div>
      <CarouselTrack items={backendDevops} reverse />
    </section>
  );
}
