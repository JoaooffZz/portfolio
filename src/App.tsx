import { MotionConfig } from 'framer-motion';
import HeroBanner from './components/HeroBanner';
import Technologies from './components/Technologies';
import Libraries from './components/Libraries';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import { ParallaxSection, ParallaxHeroLayer } from './components/ParallaxSection';
import { LanguageProvider } from './hooks/useLanguage';
import './App.css';

function App() {
  return (
    /* reducedMotion="user" makes every framer-motion transform/opacity
       animation in the tree respect the OS setting without per-component
       opt-in. Scroll- and pointer-driven values are gated separately in
       useMotionPrefs, since those are not plain transitions. */
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <div className="parallax-stack">
          <div className="controls-container">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <ParallaxHeroLayer>
            <HeroBanner />
          </ParallaxHeroLayer>

          <ParallaxSection className="parallax-layer--tech" zIndex={2} distance={40}>
            <Technologies />
          </ParallaxSection>

          <ParallaxSection className="parallax-layer--libraries" zIndex={3} distance={70}>
            <Libraries />
          </ParallaxSection>

          <ParallaxSection className="parallax-layer--timeline" zIndex={4} distance={50}>
            <Timeline />
          </ParallaxSection>

          <ParallaxSection className="parallax-layer--contact" zIndex={5} distance={30}>
            <Contact />
          </ParallaxSection>
        </div>
      </LanguageProvider>
    </MotionConfig>
  );
}

export default App;
