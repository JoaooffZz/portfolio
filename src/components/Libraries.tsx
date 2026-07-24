import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Libraries.css';
import oltgoLogo from '../assets/logo-oltgo.png';
import relayLogo from '../assets/logo-relay.png';
import sessionAuthLogo from '../assets/logo-session-auth.png';
import otphiveLogo from '../assets/logo-otphive.png';
import permguardLogo from '../assets/logo-permguard.png';
import { useLanguage } from '../hooks/useLanguage';
import { useTilt } from '../hooks/useTilt';
import { useMotionPrefs } from '../hooks/useMotionPrefs';
import { RevealText, DrawLine } from './RevealText';

interface Library {
  name: string;
  language: string;
  description: string;
  logo: string;
  githubUrl: string;
  tags: string[];
  features: string[];
}

/**
 * How far off-centre a card starts its entrance, as a share of its own width.
 *
 * Percentage rather than pixels so the travel scales with the layout. Narrow
 * screens get a shorter throw: at full width a 68% slide is most of the screen,
 * which reads as the card being flung in rather than settling into place.
 */
const SLIDE_DISTANCE = 68;
const SLIDE_DISTANCE_SMALL = 28;

function LibraryCard({
  lib,
  index,
  featuresTitle,
  githubLabel,
}: {
  lib: Library;
  index: number;
  featuresTitle: string;
  githubLabel: string;
}) {
  const { allowParallax, isSmallScreen } = useMotionPrefs();
  const cardRef = useRef<HTMLDivElement>(null);

  const tilt = useTilt({
    max: 6,
    shadowDistance: 8,
    shadowTravel: 5,
    shadowColor: 'var(--card-shadow-color)',
    hoverScale: 1.015,
    perspective: 1400,
  });

  /*
   * Scroll-linked entrance: each card slides to centre as it crosses into view,
   * alternating side — first from the right, the next from the left, and so on.
   *
   * Driven by the card's own scroll progress rather than a one-shot `useInView`
   * transition, so the movement tracks the scroll position directly and reverses
   * if the visitor scrolls back up. Progress runs from "the card's top edge
   * reaches the bottom of the viewport" to "the card is centred".
   */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const direction = index % 2 === 0 ? 1 : -1;
  const travel = isSmallScreen ? SLIDE_DISTANCE_SMALL : SLIDE_DISTANCE;
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    allowParallax ? [`${direction * travel}%`, '0%'] : ['0%', '0%'],
  );
  const enterOpacity = useTransform(
    scrollYProgress,
    [0, 0.55],
    allowParallax ? [0, 1] : [1, 1],
  );
  // A slight lean into the direction of travel, resolving square on arrival.
  const enterRotate = useTransform(
    scrollYProgress,
    [0, 1],
    allowParallax ? [direction * -2.5, 0] : [0, 0],
  );

  // Inner parallax: the logo drifts against the card's lean, so the banner
  // plane reads as sitting deeper than the card face.
  const logoX = useTransform(tilt.nx, [-0.5, 0.5], [14, -14]);
  const logoY = useTransform(tilt.ny, [-0.5, 0.5], [10, -10]);

  /*
   * The entrance and the pointer tilt both write `transform`, so they have to be
   * composed into one style object — framer-motion merges its transform keys into
   * a single matrix. Handing them over as two separate props would let the later
   * one overwrite the earlier.
   *
   * `rotate` is the one key both want. The tilt's version already folds in its own
   * baseline, so during the entrance the lean is summed in via `rotateZ`, which
   * framer-motion composes separately from `rotate`.
   */
  const style = !tilt.disabled
    ? { ...tilt.style, x, opacity: enterOpacity, rotateZ: enterRotate }
    : allowParallax
      ? { x, opacity: enterOpacity, rotate: enterRotate }
      : // Nothing to drive: leave the element styleless so the plain CSS
        // :hover lift in Libraries.css stays in charge. An inline identity
        // transform would silently outrank it.
        undefined;

  return (
    <motion.div
      ref={cardRef}
      className={`library-card ${tilt.disabled ? '' : 'library-card--tilt'}`}
      style={style}
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={tilt.onPointerEnter}
      onPointerLeave={tilt.onPointerLeave}
    >
      {/* Banner/Image area */}
      <div className="library-banner-container">
        <motion.img
          src={lib.logo}
          alt={`${lib.name} Banner`}
          className="library-banner"
          loading="lazy"
          style={tilt.disabled ? undefined : { x: logoX, y: logoY, scale: 1.08 }}
        />
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
          <h4 className="library-features-title">{featuresTitle}</h4>
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
            <span>{githubLabel}</span>
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
  );
}

export default function Libraries() {
  const { t } = useLanguage();

  const libraries: Library[] = [
    {
      name: 'PermGuard',
      language: 'Go',
      description: t.libraries.permguardDescription,
      logo: permguardLogo,
      githubUrl: 'https://github.com/JoaooffZz/permguard',
      tags: t.libraries.permguardTags,
      features: t.libraries.permguardFeatures,
    },
    {
      name: 'Oltgo',
      language: 'Go',
      description: t.libraries.oltgoDescription,
      logo: oltgoLogo,
      githubUrl: 'https://github.com/JoaooffZz/oltgo',
      tags: t.libraries.oltgoTags,
      features: t.libraries.oltgoFeatures,
    },
    {
      name: 'Relay',
      language: 'Flutter',
      description: t.libraries.relayDescription,
      logo: relayLogo,
      githubUrl: 'https://github.com/JoaooffZz/relay',
      tags: t.libraries.relayTags,
      features: t.libraries.relayFeatures,
    },
    {
      name: 'Session Auth Auto',
      language: 'Flutter',
      description: t.libraries.sessionAuthAutoDescription,
      logo: sessionAuthLogo,
      githubUrl: 'https://github.com/JoaooffZz/session_auth_auto',
      tags: t.libraries.sessionAuthAutoTags,
      features: t.libraries.sessionAuthAutoFeatures,
    },
    {
      name: 'OTPHive',
      language: 'Go',
      description: t.libraries.otphiveDescription,
      logo: otphiveLogo,
      githubUrl: 'https://github.com/JoaooffZz/otphive',
      tags: t.libraries.otphiveTags,
      features: t.libraries.otphiveFeatures,
    },
  ];

  return (
    <section className="libraries-section" id="libraries">
      <div className="libraries-header">
        <RevealText as="div" className="libraries-title" staggerMs={26}>
          {t.libraries.title}
        </RevealText>
        <DrawLine className="libraries-title-line" height={4} delay={260} />
      </div>

      <div className="libraries-container">
        {libraries.map((lib, index) => (
          <LibraryCard
            key={lib.name}
            lib={lib}
            index={index}
            featuresTitle={t.libraries.featuresTitle}
            githubLabel={t.libraries.viewOnGithub}
          />
        ))}
      </div>
    </section>
  );
}
