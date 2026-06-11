import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Libraries.css';
import oltgoLogo from '../assets/logo-oltgo.png';
import relayLogo from '../assets/logo-relay.png';
import { useLanguage } from '../hooks/useLanguage';

interface Library {
  name: string;
  language: string;
  description: string;
  logo: string;
  githubUrl: string;
  tags: string[];
  features: string[];
}

export default function Libraries() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const libraries: Library[] = [
    {
      name: 'Oltgo',
      language: 'Go',
      description: t.libraries.oltgoDescription,
      logo: oltgoLogo,
      githubUrl: 'https://github.com/JoaooffZz/oltgo',
      tags: ['Observabilidade', 'Telemetria', 'Concorrência', 'Logger', 'Tracing', 'OpenTelemetry'],
      features: t.libraries.oltgoFeatures,
    },
    {
      name: 'Relay',
      language: 'Flutter',
      description: t.libraries.relayDescription,
      logo: relayLogo,
      githubUrl: 'https://github.com/JoaooffZz/relay',
      tags: ['Offline-First', 'Job Queue', 'Dart & Flutter', 'Resiliência', 'SQLite / Drift', 'Background Jobs'],
      features: t.libraries.relayFeatures,
    },
  ];

  return (
    <section className="libraries-section" id="libraries" ref={sectionRef}>
      <div className="libraries-header">
        <div className="libraries-title">{t.libraries.title}</div>
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
                <h4 className="library-features-title">{t.libraries.featuresTitle}</h4>
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
                  <span>{t.libraries.viewOnGithub}</span>
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
