import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Libraries.css';
import oltgoLogo from '../assets/logo-oltgo.png';
import relayLogo from '../assets/logo-relay.png';

interface Library {
  name: string;
  language: string;
  description: string;
  logo: string;
  githubUrl: string;
  tags: string[];
  features: string[];
}

const libraries: Library[] = [
  {
    name: 'Oltgo',
    language: 'Go',
    description: 'Uma biblioteca de telemetria e observabilidade concorrente, leve e de alta performance desenvolvida em Go. Ela permite capturar, estruturar e rastrear logs e transações de forma assíncrona, eliminando gargalos de I/O na aplicação principal.',
    logo: oltgoLogo,
    githubUrl: 'https://github.com/JoaooffZz/oltgo',
    tags: ['Observabilidade', 'Telemetria', 'Concorrência', 'Logger', 'Tracing', 'OpenTelemetry'],
    features: [
      'Design Assíncrono baseada em Go Channels para consumo sem bloqueios de I/O.',
      'Propagação Automática de contexto (context.Context) para eventos hierárquicos.',
      'Arquitetura modular de Agente único (1 Serviço -> 1 Agente) para controle do ciclo de vida.',
      'Coleta Thread-Safe em memória unificada sob um schema estruturado JSON.',
    ],
  },
  {
    name: 'Relay',
    language: 'Flutter',
    description: 'Uma biblioteca de fila de tarefas (Job Queue) offline-first de alta performance desenvolvida para Dart e Flutter. Ela garante que ações assíncronas em segundo plano sejam executadas com total confiabilidade, mesmo quando o dispositivo estiver sem conexão com a internet.',
    logo: relayLogo,
    githubUrl: 'https://github.com/JoaooffZz/relay',
    tags: ['Offline-First', 'Job Queue', 'Dart & Flutter', 'Resiliência', 'SQLite / Drift', 'Background Jobs'],
    features: [
      'Conexão Inteligente com monitoramento automático do estado da rede para pausar ou retomar a fila.',
      'Retry com Backoff automático suportando estratégias Fixa, Linear ou Exponencial.',
      'Controle reativo com Streams de eventos em tempo real para acompanhar o ciclo de vida das tarefas.',
      'Persistência robusta com Drift/SQLite para recuperação e execução contínua pós-reinicializações.',
    ],
  },
];

export default function Libraries() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section className="libraries-section" id="libraries" ref={sectionRef}>
      <div className="libraries-header">
        <div className="libraries-title">Bibliotecas de Autoria Própria</div>
        <div className="libraries-title-line" />
      </div>

      <div className="libraries-container">
        {libraries.map((lib, index) => (
          <motion.div
            key={lib.name}
            className="library-card"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.15,
            }}
          >
            {/* Banner/Image area */}
            <div className="library-banner-container">
              <img src={lib.logo} alt={`${lib.name} Banner`} className="library-banner" />
              <div className="library-lang-badge">{lib.language}</div>
            </div>

            {/* Content area */}
            <div className="library-content">
              <div className="library-top">
                <h3 className="library-name">{lib.name}</h3>
                <div className="library-tags">
                  {lib.tags.map((tag) => (
                    <span key={tag} className="library-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="library-description">{lib.description}</p>

              <div className="library-features-section">
                <h4 className="library-features-title">Destaques da Arquitetura:</h4>
                <ul className="library-features-list">
                  {lib.features.map((feature, idx) => (
                    <li key={idx} className="library-feature-item">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="library-footer">
                <a
                  href={lib.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-github-neubrutal"
                >
                  <span>Ver no GitHub</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="btn-github-icon"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
