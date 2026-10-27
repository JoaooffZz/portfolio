import { MotionConfig } from 'framer-motion';
import Header from './components/Header';
import Stage from './components/stage/Stage';
import { OpenSource, Stack, Work } from './components/Sections';
import Footer from './components/Footer';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ThemeProvider } from './hooks/useTheme';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function Page() {
  const { t } = useLanguage();
  useSmoothScroll();

  return (
    <>
      <a className="skip-link" href="#work">
        {t.meta.skip}
      </a>
      <Header />
      <main id="main">
        <Stage />
        <Work />
        <OpenSource />
        <Stack />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    /* reducedMotion="user" makes every framer-motion transition respect the OS
       setting. Scroll-driven values are gated separately (useMotionPrefs). */
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <LanguageProvider>
          <Page />
        </LanguageProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
