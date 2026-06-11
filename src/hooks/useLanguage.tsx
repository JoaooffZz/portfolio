/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'pt' | 'en';

interface TranslationKeys {
  hero: {
    role: string;
    scroll: string;
  };
  tech: {
    mobileFrontend: string;
    backendDevops: string;
  };
  libraries: {
    title: string;
    featuresTitle: string;
    viewOnGithub: string;
    oltgoDescription: string;
    oltgoFeatures: string[];
    relayDescription: string;
    relayFeatures: string[];
  };
  timeline: {
    title: string;
    roleVivaPlus: string;
    roleMheads: string;
    typeIntermittent: string;
    locBrazil: string;
    periodVivaPlus: string;
    periodMheads: string;
    bulletsVivaPlus: string[];
    bulletsMheads: string[];
  };
  contact: {
    title: string;
    buttonText: string;
    location: string;
    footerText: string;
  };
}

const translations: Record<Language, TranslationKeys> = {
  pt: {
    hero: {
      role: 'Engenheiro de Software',
      scroll: 'scroll',
    },
    tech: {
      mobileFrontend: 'Mobile & Frontend',
      backendDevops: 'Backend & DevOps',
    },
    libraries: {
      title: 'Bibliotecas de Autoria Própria',
      featuresTitle: 'Destaques da Arquitetura:',
      viewOnGithub: 'Ver no GitHub',
      oltgoDescription: 'Uma biblioteca de telemetria e observabilidade concorrente, leve e de alta performance desenvolvida em Go. Ela permite capturar, estruturar e rastrear logs e transações de forma assíncrona, eliminando gargalos de I/O na aplicação principal.',
      oltgoFeatures: [
        'Design Assíncrono baseado em Go Channels para consumo sem bloqueios de I/O.',
        'Propagação Automática de contexto (context.Context) para eventos hierárquicos.',
        'Arquitetura modular de Agente único (1 Serviço -> 1 Agente) para controle do ciclo de vida.',
        'Coleta Thread-Safe em memória unificada sob um schema estruturado JSON.',
      ],
      relayDescription: 'Uma biblioteca de fila de tarefas (Job Queue) offline-first de alta performance desenvolvida para Dart e Flutter. Ela garante que ações assíncronas em segundo plano sejam executadas com total confiabilidade, mesmo quando o dispositivo estiver sem conexão com a internet.',
      relayFeatures: [
        'Conexão Inteligente com monitoramento automático do estado da rede para pausar ou retomar a fila.',
        'Retry com Backoff automático suportando estratégias Fixa, Linear ou Exponencial.',
        'Controle reativo com Streams de eventos em tempo real para acompanhar o ciclo de vida das tarefas.',
        'Persistência robusta com Drift/SQLite para recuperação e execução contínua pós-reinicializações.',
      ],
    },
    timeline: {
      title: 'Experiência Profissional',
      roleVivaPlus: 'Developer Full Stack',
      roleMheads: 'Developer Mobile',
      typeIntermittent: 'Contrato Intermitente',
      locBrazil: 'Brazil',
      periodVivaPlus: 'Fev 2026 – Abr 2026',
      periodMheads: 'Nov 2025 – Fev 2026',
      bulletsVivaPlus: [
        'Desenvolvimento completo da Viva+, startup de gestão imobiliária participante da 2ª edição da FAPESC.',
        'Back-end em Go + Gin com Arquitetura Monolítica Modular e padrão Port/Adapter, deploy serverless na GCP com Cloud Run.',
        'Front-end com Flutter/Dart em Arquitetura Limpa, integração Firebase Auth + Firestore e deploy via Firebase Hosting.',
      ],
      bulletsMheads: [
        'Cluster Dash — painel gerencial com dashboards interativos (fl_chart), autenticação JWT + reCAPTCHA v3.',
        'Cluster Coletor — app logístico com leitura de códigos de barras (mobile_scanner) e suporte a hardware industrial.',
        'Arquitetura em camadas com separação clara de responsabilidades em ambos os projetos.',
      ],
    },
    contact: {
      title: 'Vamos trabalhar juntos?',
      buttonText: 'Enviar mensagem',
      location: 'Teresina, Piauí — BR',
      footerText: 'João Paulo Soares Martins · Engenheiro de Software · 2025',
    },
  },
  en: {
    hero: {
      role: 'Software Engineer',
      scroll: 'scroll',
    },
    tech: {
      mobileFrontend: 'Mobile & Frontend',
      backendDevops: 'Backend & DevOps',
    },
    libraries: {
      title: 'Self-Authored Libraries',
      featuresTitle: 'Architecture Highlights:',
      viewOnGithub: 'View on GitHub',
      oltgoDescription: 'A concurrent, lightweight, and high-performance telemetry and observability library developed in Go. It enables asynchronous log and transaction capturing, structuring, and tracking, eliminating I/O bottlenecks in the main application.',
      oltgoFeatures: [
        'Asynchronous design based on Go Channels for non-blocking I/O consumption.',
        'Automatic context propagation (context.Context) for hierarchical events.',
        'Modular single-agent architecture (1 Service -> 1 Agent) for lifecycle control.',
        'Thread-safe collection in unified memory under a structured JSON schema.',
      ],
      relayDescription: 'A high-performance offline-first job queue library developed for Dart and Flutter. It ensures asynchronous background actions are executed with complete reliability, even when the device is without internet connection.',
      relayFeatures: [
        'Smart connection with automatic network state monitoring to pause or resume the queue.',
        'Automatic retry with backoff supporting Fixed, Linear, or Exponential strategies.',
        'Reactive control with real-time event streams to track the job lifecycle.',
        'Robust persistence with Drift/SQLite for recovery and continuous execution after restarts.',
      ],
    },
    timeline: {
      title: 'Professional Experience',
      roleVivaPlus: 'Full Stack Developer',
      roleMheads: 'Mobile Developer',
      typeIntermittent: 'Contractor',
      locBrazil: 'Brazil',
      periodVivaPlus: 'Feb 2026 – Apr 2026',
      periodMheads: 'Nov 2025 – Feb 2026',
      bulletsVivaPlus: [
        'Full development of Viva+, a real estate management startup participating in the 2nd edition of FAPESC.',
        'Back-end in Go + Gin with Modular Monolithic Architecture and Port/Adapter pattern, serverless deployment on GCP with Cloud Run.',
        'Front-end with Flutter/Dart in Clean Architecture, Firebase Auth + Firestore integration, and deployment via Firebase Hosting.',
      ],
      bulletsMheads: [
        'Cluster Dash — management panel with interactive dashboards (fl_chart), JWT authentication + reCAPTCHA v3.',
        'Cluster Coletor — logistics app with barcode reading (mobile_scanner) and industrial hardware support.',
        'Layered architecture with a clear separation of responsibilities in both projects.',
      ],
    },
    contact: {
      title: "Let's work together?",
      buttonText: 'Send message',
      location: 'Teresina, Piauí — BR',
      footerText: 'João Paulo Soares Martins · Software Engineer · 2025',
    },
  },
};

interface LanguageContextProps {
  language: Language;
  t: TranslationKeys;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'pt' || saved === 'en') return saved;
    // Default to PT or detect browser language
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('pt') ? 'pt' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
