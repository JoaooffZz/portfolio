import HeroBanner from './components/HeroBanner';
import Technologies from './components/Technologies';
import Libraries from './components/Libraries';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <div className="parallax-stack">
      <ThemeToggle />
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
  );
}

export default App;
