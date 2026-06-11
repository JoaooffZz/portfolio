import HeroBanner from './components/HeroBanner';
import Technologies from './components/Technologies';
import Libraries from './components/Libraries';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import { LanguageProvider } from './hooks/useLanguage';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <div className="parallax-stack">
        <div className="controls-container">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className="parallax-layer parallax-layer--hero">
          <HeroBanner />
        </div>
        <div className="parallax-layer parallax-layer--tech">
          <Technologies />
        </div>
        <div className="parallax-layer parallax-layer--libraries">
          <Libraries />
        </div>
        <div className="parallax-layer parallax-layer--timeline">
          <Timeline />
        </div>
        <div className="parallax-layer parallax-layer--contact">
          <Contact />
        </div>
      </div>
    </LanguageProvider>
  );
}

export default App;
