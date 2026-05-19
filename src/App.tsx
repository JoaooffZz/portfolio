import HeroBanner from './components/HeroBanner';
import Technologies from './components/Technologies';
import Timeline from './components/Timeline';
import Contact from './components/Contact';
import './App.css';

function App() {
  return (
    <div className="parallax-stack">
      <div className="parallax-layer parallax-layer--hero">
        <HeroBanner />
      </div>
      <div className="parallax-layer parallax-layer--tech">
        <Technologies />
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
