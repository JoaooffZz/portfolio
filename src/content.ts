/**
 * Every piece of copy on the page, in both languages.
 *
 * Kept in one module so the CV and the site can be diffed against each other —
 * the experience bullets in particular should track the PDF in /public.
 */

export type Language = 'pt' | 'en';

export const LINKS = {
  email: 'joaooffzz.dev@gmail.com',
  github: 'https://github.com/JoaooffZz',
  linkedin: 'https://linkedin.com/in/joaooffzz',
  cv: `${import.meta.env.BASE_URL}curriculo-joao-paulo-soares-martins.pdf`,
} as const;

export interface DataRow {
  meta: string;
  title: string;
  detail: string;
  href?: string;
}

export interface Job {
  role: string;
  company: string;
  period: string;
  type: string;
  place: string;
  bullets: string[];
  stack: string[];
}

export interface Library {
  id: 'permguard' | 'otphive' | 'oltgo' | 'relay' | 'session-auth';
  name: string;
  lang: 'Go' | 'Flutter';
  tagline: string;
  description: string;
  tags: string[];
  links: { label: string; href: string }[];
}

export interface WebhookEvent {
  type: string;
  method: string;
  result: string;
}

export interface Content {
  meta: { skip: string; themeLabel: string; langLabel: string; langNext: string };
  nav: { work: string; oss: string; stack: string; contact: string };
  stage: {
    aria: string;
    steps: string[];
    captions: [string, string][];
    concept: { title: string[]; short: string; lead: string; cue: string; decode: string };
    spec: { title: string; short: string; body: string; rows: DataRow[] };
    layers: { title: string; short: string; body: string; rows: DataRow[] };
    code: { title: string; short: string; body: string; rows: DataRow[] };
    live: {
      title: string;
      short: string;
      body: string;
      send: string;
      replay: string;
      hintPointer: string;
      hintTouch: string;
    };
    notes: { core: string; webhook: string; twice: string };
    callouts: { inbox: string; core: string; code: string; retry: string };
    layerLabels: string[];
  };
  console: {
    title: string;
    idle: string;
    received: string;
    processed: string;
    ignored: string;
    replaySuffix: string;
    inboxNew: (id: string) => string;
    inboxDup: (id: string) => string;
    worker: (id: string) => string;
    domain: (result: string) => string;
    events: WebhookEvent[];
  };
  work: {
    index: string;
    title: string;
    intro: string;
    jobs: Job[];
    education: { title: string; course: string; school: string; period: string; place: string };
  };
  oss: { index: string; title: string; intro: string; libs: Library[] };
  stack: { index: string; title: string; intro: string; rows: DataRow[] };
  footer: {
    title: string;
    side: string;
    cv: string;
    localTime: string;
    sitemap: string;
    elsewhere: string;
    contact: string;
    cvLink: string;
    madeIn: string;
    top: string;
    role: string;
  };
}

const libLinks = {
  permguard: [{ label: 'GitHub', href: 'https://github.com/JoaooffZz/permguard' }],
  otphive: [{ label: 'GitHub', href: 'https://github.com/JoaooffZz/otphive' }],
  oltgo: [{ label: 'GitHub', href: 'https://github.com/JoaooffZz/oltgo' }],
  relay: [
    { label: 'pub.dev', href: 'https://pub.dev/packages/relay_job_queue' },
    { label: 'GitHub', href: 'https://github.com/JoaooffZz/relay' },
  ],
  'session-auth': [
    { label: 'pub.dev', href: 'https://pub.dev/packages/session_auth_auto' },
    { label: 'GitHub', href: 'https://github.com/JoaooffZz/session_auth_auto' },
  ],
};

const pt: Content = {
  meta: {
    skip: 'Pular para o conteúdo',
    themeLabel: 'Modo escuro',
    langLabel: 'Idioma: português. Mudar para inglês',
    langNext: 'EN',
  },
  nav: { work: 'Trabalho', oss: 'Open source', stack: 'Stack', contact: 'Contato' },
  stage: {
    aria: 'Do esboço à produção, em cinco etapas',
    steps: ['Conceito', 'Especificação', 'Camadas', 'Código', 'Produção'],
    captions: [
      ['Fig. 01 · Esboço', 'Lápis · 12 fps'],
      ['Fig. 02 · Especificação', 'Portas e adaptadores'],
      ['Fig. 03 · Camadas', 'Vista explodida'],
      ['Fig. 04 · Material', 'Pronto para produção'],
      ['Fig. 05 · Ao vivo', 'Webhook → Inbox → Worker'],
    ],
    concept: {
      title: ['João Paulo', 'Soares Martins.'],
      short: 'Engenheiro de Software Backend · Teresina, PI',
      lead: 'Construo em Go sistemas de cobrança, assinaturas e integração com gateways de pagamento. Esta página é um desses sistemas sendo montado: role e veja um webhook fazer a viagem inteira.',
      cue: 'Role para construir',
      decode: 'Go · Pagamentos · TOQ',
    },
    spec: {
      title: 'Toda cobrança deixa um registro.',
      short: 'Consistência, idempotência e confiabilidade em produção',
      body: 'Hoje construo o módulo de assinaturas self-service da TOQ: Asaas com cartão, Pix e boleto, webhooks pelo padrão Inbox e um worker com retry e backoff.',
      rows: [
        { meta: '2026–hoje', title: 'Developer Backend Go', detail: 'TOQ' },
        { meta: '2026', title: 'Developer Full Stack', detail: 'Viva Plus' },
        { meta: '2025–26', title: 'Developer Mobile', detail: 'Mheads Sistemas' },
        { meta: '2026–', title: 'Análise e Desenv. de Sistemas', detail: 'FIAP' },
      ],
    },
    layers: {
      title: 'O domínio fica no centro.',
      short: 'Arquitetura hexagonal · DDD · monólito modular',
      body: 'Separo regra de negócio de detalhe de implementação. Gateway, banco e framework são adaptadores trocáveis; o domínio continua isolado e testável.',
      rows: [
        { meta: 'z-1', title: 'Infra', detail: 'AWS · GCP · Docker · OpenTelemetry' },
        { meta: 'z-2', title: 'Adaptadores', detail: 'Gin · MySQL · PostgreSQL · Redis · Asaas' },
        { meta: 'z-3', title: 'Portas', detail: 'HTTP · Webhooks · RabbitMQ' },
        { meta: 'z-4', title: 'Aplicação', detail: 'Casos de uso · Inbox · idempotência' },
        { meta: 'z-5', title: 'Domínio', detail: 'Go · DDD · regras de cobrança' },
      ],
    },
    code: {
      title: 'Mesma ideia, código aberto.',
      short: 'Ver bibliotecas →',
      body: 'Cinco bibliotecas publicadas, Go no servidor e Flutter no cliente, com o mesmo cuidado com concorrência e falha.',
      rows: [
        { meta: 'Go', title: 'permguard', detail: 'Autorização hierárquica', href: '#oss-permguard' },
        { meta: 'Go', title: 'otphive', detail: '2FA · ~2M ops/s', href: '#oss-otphive' },
        { meta: 'Go', title: 'oltgo', detail: 'Telemetria assíncrona', href: '#oss-oltgo' },
        { meta: 'Flutter', title: 'relay', detail: 'Fila de jobs offline-first', href: '#oss-relay' },
        { meta: 'Flutter', title: 'session_auth_auto', detail: 'Sessões e tokens', href: '#oss-session-auth' },
      ],
    },
    live: {
      title: 'Agora está rodando. Dispare.',
      short: 'Envie um webhook e acompanhe os logs',
      body: 'O endpoint valida, grava o evento no Inbox e responde na hora. Um worker processa em background. Reenvie o mesmo evento: nada é cobrado duas vezes.',
      send: 'Enviar webhook',
      replay: 'Reenviar o mesmo',
      hintPointer: 'Clique para disparar',
      hintTouch: 'Toque para disparar',
    },
    notes: {
      core: 'domínio no centro?',
      webhook: 'webhook → inbox ↓',
      twice: 'nunca cobrar 2×!',
    },
    callouts: {
      inbox: 'Inbox · chave de idempotência',
      core: 'Domínio · zero dependências',
      code: 'worker · inbox',
      retry: 'retry · backoff 2ⁿ',
    },
    layerLabels: ['z-1 · Infra', 'z-2 · Adaptadores', 'z-3 · Portas', 'z-4 · Aplicação', 'z-5 · Domínio'],
  },
  console: {
    title: 'logs · webhook-worker',
    idle: 'aguardando eventos…',
    received: 'recebidos',
    processed: 'processados',
    ignored: 'ignorados',
    replaySuffix: '(reenvio)',
    inboxNew: (id) => `INSERT ${id} → 200 OK · 4ms`,
    inboxDup: (id) => `${id} já existe → 200 OK · ignorado`,
    worker: (id) => `FOR UPDATE SKIP LOCKED → ${id}`,
    domain: (result) => `${result} ✓`,
    events: [
      { type: 'PAYMENT_CONFIRMED', method: 'cartão', result: 'assinatura ativa' },
      { type: 'PAYMENT_RECEIVED', method: 'Pix', result: 'corretor desbloqueado' },
      { type: 'PAYMENT_RECEIVED', method: 'boleto', result: 'cobrança conciliada' },
    ],
  },
  work: {
    index: '02',
    title: 'Experiência',
    intro: 'Backend em Go para pagamentos e assinaturas, com passagens por full stack e mobile.',
    jobs: [
      {
        role: 'Developer Backend Go',
        company: 'TOQ',
        period: 'Mai 2026 – atual',
        type: 'Tempo integral',
        place: 'Brasil',
        bullets: [
          'Substituí o módulo antigo de pagamentos, com cobrança manual via admin, por assinaturas self-service in-app: o corretor contrata, troca de plano, muda a forma de pagamento e se desbloqueia sozinho.',
          'Integrei o gateway Asaas (cartão, Pix e boleto) com webhooks pelo padrão Inbox: o endpoint valida o token, persiste o evento de forma idempotente e responde na hora; um worker consome a fila em background (FOR UPDATE SKIP LOCKED) com retry e backoff.',
          'Construí o sistema de promoções e cupons: pacotes por plano com desconto percentual ou fixo por N ciclos, agendamento, publicação e limite de uso; cupons com validação por plano, uso único por usuário e regra de acúmulo com promoções.',
          'Entreguei a gestão completa no admin: CRUD de planos, promoções e cupons, assinatura de cada corretor, envio de link de pagamento, reprocessamento de webhooks, conciliação de cobranças e relatórios de paridade com o gateway.',
        ],
        stack: ['Go', 'Gin', 'Arquitetura Hexagonal', 'MySQL', 'Asaas', 'Webhooks', 'Padrão Inbox'],
      },
      {
        role: 'Developer Full Stack',
        company: 'Viva Plus',
        period: 'Fev 2026 – Abr 2026',
        type: 'Contrato intermitente',
        place: 'Brasil',
        bullets: [
          'Desenvolvimento completo da Viva+, startup de gestão imobiliária que une agências e locatários em um só ecossistema, selecionada na 2ª edição da FAPESC.',
          'Back-end em Go + Gin como monólito modular com Port/Adapter, PostgreSQL via Supabase, cobranças pelo Asaas e deploy serverless na GCP (Cloud Run + Artifact Registry).',
          'Front-end em Flutter Web com Arquitetura Limpa, GetX e Dio, Firebase Authentication + Firestore em tempo real e deploy no Firebase Hosting.',
          'Contribuí para centralizar os dados contratuais e automatizar as cobranças de aluguel.',
        ],
        stack: ['Go', 'Gin', 'PostgreSQL', 'Supabase', 'Asaas', 'Cloud Run', 'Flutter', 'Firebase'],
      },
      {
        role: 'Developer Mobile',
        company: 'Mheads Sistemas',
        period: 'Nov 2025 – Fev 2026',
        type: 'Contrato intermitente',
        place: 'Brasil',
        bullets: [
          'Cluster Dash: 5 indicadores de negócio no celular para +100 gestores, com dashboards em fl_chart e estado reativo em GetX, reduzindo em 20% a dependência de relatórios no desktop.',
          'Cluster Coletor: leitura de código de barras e QR com mobile_scanner acelerou em 80% balanço, picking e conferência, com +1.000 leituras por dia.',
          'Feedback sonoro por leitura e inputs compatíveis com coletores industriais reduziram em 70% os erros de conferência; persistência local eliminou 85% das perdas por oscilação de rede.',
          'JWT + reCAPTCHA v3 bloqueou 75% das tentativas automatizadas de login; uma camada de rede em Dio padronizou +20 endpoints e cortou 30% do tempo médio de resposta.',
        ],
        stack: ['Flutter', 'Dart', 'GetX', 'Dio', 'fl_chart', 'mobile_scanner'],
      },
    ],
    education: {
      title: 'Formação',
      course: 'Análise e Desenvolvimento de Sistemas',
      school: 'FIAP',
      period: 'Jan 2026 – atual',
      place: 'São Paulo, SP',
    },
  },
  oss: {
    index: '03',
    title: 'Open source',
    intro: 'Bibliotecas que escrevi, publiquei e mantenho.',
    libs: [
      {
        id: 'permguard',
        name: 'permguard',
        lang: 'Go',
        tagline: 'Autorização por permissões hierárquicas',
        description:
          'Autorização para serviços HTTP com notação hierárquica por ponto: um prefixo implica todas as sub-permissões. Funciona com net/http, chi, Echo e Gin. Modo Single com sharded map em memória (256 shards) ou Multi com Redis Sets e escrita atômica via TxPipeline, middleware RequireAll/RequireAny, TTL e revogação em tempo real.',
        tags: ['Concorrência', 'Authorization', 'Redis', 'Middleware'],
        links: libLinks.permguard,
      },
      {
        id: 'otphive',
        name: 'otphive',
        lang: 'Go',
        tagline: 'Verificação 2FA de alta performance',
        description:
          'Verificação 2FA a ~2M ops/s com sharded map sem lock global. Modo Single em memória ou Multi com Redis (TxPipeline + Lua) e Memcached, rate limiting atômico, anti-replay automático e revogação por tentativas excedidas.',
        tags: ['2FA', 'Redis', 'Memcached', 'High-performance'],
        links: libLinks.otphive,
      },
      {
        id: 'oltgo',
        name: 'oltgo',
        lang: 'Go',
        tagline: 'Telemetria e observabilidade',
        description:
          'Pipeline assíncrono via channels, propagação por context.Context, árvore hierárquica de eventos e schema unificado de logs. Exporta para OpenTelemetry, ElasticSearch e stdout. Um serviço, um agente: zero I/O no caminho da aplicação.',
        tags: ['OpenTelemetry', 'ElasticSearch', 'Observability'],
        links: libLinks.oltgo,
      },
      {
        id: 'relay',
        name: 'relay',
        lang: 'Flutter',
        tagline: 'Fila de jobs offline-first',
        description:
          'Execução confiável de jobs assíncronos mesmo sem internet: retry com backoff exponencial, fila por prioridade, garantia de idempotência, persistência em Drift/SQLite e eventos em tempo real por Streams.',
        tags: ['Offline-first', 'Drift', 'SQLite'],
        links: libLinks.relay,
      },
      {
        id: 'session-auth',
        name: 'session_auth_auto',
        lang: 'Flutter',
        tagline: 'Sessões e tokens sem boilerplate',
        description:
          'Credenciais no Keychain/Keystore e tokens em SQLite via Drift. Renovação reativa com clock skew configurável, re-login silencioso como fallback e auto-refresh proativo na inicialização do app.',
        tags: ['Security', 'Keychain/Keystore', 'Drift'],
        links: libLinks['session-auth'],
      },
    ],
  },
  stack: {
    index: '04',
    title: 'Stack',
    intro: 'O que uso no dia a dia, do domínio ao deploy.',
    rows: [
      { meta: 'Backend', title: 'Go', detail: 'Gin · net/http · REST · Socket.io · TCP · RabbitMQ' },
      { meta: 'Pagamentos', title: 'Asaas', detail: 'Webhooks · padrão Inbox · idempotência · conciliação' },
      { meta: 'Dados', title: 'MySQL', detail: 'PostgreSQL · Redis · Supabase · SQLite' },
      { meta: 'Cloud', title: 'AWS', detail: 'EC2 · S3 · SES · SSM · GCP Cloud Run · Docker · OpenTelemetry' },
      { meta: 'Arquitetura', title: 'Hexagonal', detail: 'DDD · monólito modular · Clean Architecture' },
      { meta: 'Mobile', title: 'Flutter', detail: 'Dart · GetX · Bloc · Hive · Firebase Auth · Firestore' },
    ],
  },
  footer: {
    title: 'Vamos construir algo que aguente produção.',
    side: 'Backend em Go para pagamentos, assinaturas e integrações, do desenho do domínio ao deploy.',
    cv: 'Baixar currículo',
    localTime: 'Agora em Teresina',
    sitemap: 'Mapa',
    elsewhere: 'Em outros lugares',
    contact: 'Contato',
    cvLink: 'Currículo (PDF)',
    madeIn: 'Desenhado e construído em Teresina, PI',
    top: 'Voltar ao topo',
    role: 'Engenheiro de Software Backend',
  },
};

const en: Content = {
  meta: {
    skip: 'Skip to content',
    themeLabel: 'Dark mode',
    langLabel: 'Language: English. Switch to Portuguese',
    langNext: 'PT',
  },
  nav: { work: 'Work', oss: 'Open source', stack: 'Stack', contact: 'Contact' },
  stage: {
    aria: 'From sketch to production, in five stages',
    steps: ['Concept', 'Spec', 'Layers', 'Code', 'Production'],
    captions: [
      ['Fig. 01 · Sketch', 'Pencil · 12 fps'],
      ['Fig. 02 · Spec', 'Ports and adapters'],
      ['Fig. 03 · Layers', 'Exploded view'],
      ['Fig. 04 · Material', 'Production-ready'],
      ['Fig. 05 · Live', 'Webhook → Inbox → Worker'],
    ],
    concept: {
      title: ['João Paulo', 'Soares Martins.'],
      short: 'Backend Software Engineer · Teresina, Brazil',
      lead: 'I build billing, subscription and payment-gateway systems in Go. This page is one of those systems being assembled: scroll and watch a webhook make the whole trip.',
      cue: 'Scroll to build it',
      decode: 'Go · Payments · TOQ',
    },
    spec: {
      title: 'Every charge leaves a record.',
      short: 'Consistency, idempotency and reliability in production',
      body: "I'm building TOQ's self-service subscriptions module: Asaas with card, Pix and boleto, webhooks through the Inbox pattern, and a worker with retry and backoff.",
      rows: [
        { meta: '2026–now', title: 'Backend Go Developer', detail: 'TOQ' },
        { meta: '2026', title: 'Full Stack Developer', detail: 'Viva Plus' },
        { meta: '2025–26', title: 'Mobile Developer', detail: 'Mheads Sistemas' },
        { meta: '2026–', title: 'Systems Analysis & Development', detail: 'FIAP' },
      ],
    },
    layers: {
      title: 'The domain stays at the centre.',
      short: 'Hexagonal architecture · DDD · modular monolith',
      body: 'I keep business rules apart from implementation detail. Gateway, database and framework are swappable adapters; the domain stays isolated and testable.',
      rows: [
        { meta: 'z-1', title: 'Infra', detail: 'AWS · GCP · Docker · OpenTelemetry' },
        { meta: 'z-2', title: 'Adapters', detail: 'Gin · MySQL · PostgreSQL · Redis · Asaas' },
        { meta: 'z-3', title: 'Ports', detail: 'HTTP · Webhooks · RabbitMQ' },
        { meta: 'z-4', title: 'Application', detail: 'Use cases · Inbox · idempotency' },
        { meta: 'z-5', title: 'Domain', detail: 'Go · DDD · billing rules' },
      ],
    },
    code: {
      title: 'Same idea, open source.',
      short: 'See the libraries →',
      body: 'Five published libraries, Go on the server and Flutter on the client, built with the same care for concurrency and failure.',
      rows: [
        { meta: 'Go', title: 'permguard', detail: 'Hierarchical authorization', href: '#oss-permguard' },
        { meta: 'Go', title: 'otphive', detail: '2FA · ~2M ops/s', href: '#oss-otphive' },
        { meta: 'Go', title: 'oltgo', detail: 'Async telemetry', href: '#oss-oltgo' },
        { meta: 'Flutter', title: 'relay', detail: 'Offline-first job queue', href: '#oss-relay' },
        { meta: 'Flutter', title: 'session_auth_auto', detail: 'Sessions and tokens', href: '#oss-session-auth' },
      ],
    },
    live: {
      title: "Now it's running. Fire it.",
      short: 'Send a webhook and follow the logs',
      body: 'The endpoint validates, writes the event to the Inbox and answers right away. A worker processes it in the background. Replay the same event: nothing gets charged twice.',
      send: 'Send webhook',
      replay: 'Replay the same',
      hintPointer: 'Click to fire',
      hintTouch: 'Tap to fire',
    },
    notes: {
      core: 'domain in the middle?',
      webhook: 'webhook → inbox ↓',
      twice: 'never charge twice!',
    },
    callouts: {
      inbox: 'Inbox · idempotency key',
      core: 'Domain · zero dependencies',
      code: 'worker · inbox',
      retry: 'retry · 2ⁿ backoff',
    },
    layerLabels: ['z-1 · Infra', 'z-2 · Adapters', 'z-3 · Ports', 'z-4 · Application', 'z-5 · Domain'],
  },
  console: {
    title: 'logs · webhook-worker',
    idle: 'waiting for events…',
    received: 'received',
    processed: 'processed',
    ignored: 'ignored',
    replaySuffix: '(replay)',
    inboxNew: (id) => `INSERT ${id} → 200 OK · 4ms`,
    inboxDup: (id) => `${id} already exists → 200 OK · ignored`,
    worker: (id) => `FOR UPDATE SKIP LOCKED → ${id}`,
    domain: (result) => `${result} ✓`,
    events: [
      { type: 'PAYMENT_CONFIRMED', method: 'card', result: 'subscription active' },
      { type: 'PAYMENT_RECEIVED', method: 'Pix', result: 'broker unlocked' },
      { type: 'PAYMENT_RECEIVED', method: 'boleto', result: 'charge reconciled' },
    ],
  },
  work: {
    index: '02',
    title: 'Experience',
    intro: 'Go backend for payments and subscriptions, with earlier stints in full stack and mobile.',
    jobs: [
      {
        role: 'Backend Go Developer',
        company: 'TOQ',
        period: 'May 2026 – present',
        type: 'Full-time',
        place: 'Brazil',
        bullets: [
          'Replaced the legacy payments module, where billing was manual through the admin, with in-app self-service subscriptions: brokers subscribe, switch plans, change payment method and unlock themselves.',
          'Integrated the Asaas gateway (card, Pix and boleto) with webhooks through the Inbox pattern: the endpoint validates the token, persists the event idempotently and answers immediately; a background worker drains the queue (FOR UPDATE SKIP LOCKED) with retry and backoff.',
          'Built the promotions and coupons system: per-plan promo packages with percentage or fixed discounts for N cycles, scheduling, publishing and usage caps; coupons validated per plan, single use per user, with stacking rules against promotions.',
          'Delivered full admin management: CRUD for plans, promotions and coupons, each broker’s subscription, payment links, webhook reprocessing, charge reconciliation and parity reports against the gateway.',
        ],
        stack: ['Go', 'Gin', 'Hexagonal Architecture', 'MySQL', 'Asaas', 'Webhooks', 'Inbox pattern'],
      },
      {
        role: 'Full Stack Developer',
        company: 'Viva Plus',
        period: 'Feb 2026 – Apr 2026',
        type: 'Contract',
        place: 'Brazil',
        bullets: [
          'Built Viva+ end to end, a real-estate management startup that brings agencies and tenants into one ecosystem, selected for the 2nd edition of FAPESC.',
          'Go + Gin back-end as a modular monolith with Port/Adapter, PostgreSQL on Supabase, billing through Asaas and serverless deployment on GCP (Cloud Run + Artifact Registry).',
          'Flutter Web front-end with Clean Architecture, GetX and Dio, Firebase Authentication + real-time Firestore, deployed on Firebase Hosting.',
          'Helped centralise contract data and automate rent billing.',
        ],
        stack: ['Go', 'Gin', 'PostgreSQL', 'Supabase', 'Asaas', 'Cloud Run', 'Flutter', 'Firebase'],
      },
      {
        role: 'Mobile Developer',
        company: 'Mheads Sistemas',
        period: 'Nov 2025 – Feb 2026',
        type: 'Contract',
        place: 'Brazil',
        bullets: [
          'Cluster Dash: 5 business KPIs on mobile for 100+ managers, with fl_chart dashboards and reactive GetX state, cutting reliance on desktop reports by 20%.',
          'Cluster Coletor: barcode and QR scanning with mobile_scanner sped up stocktaking, picking and checking by 80%, at 1,000+ scans a day.',
          'Per-scan audio feedback and inputs that work with industrial scanners cut checking errors by 70%; local persistence removed 85% of progress lost to flaky warehouse Wi-Fi.',
          'JWT + reCAPTCHA v3 blocked 75% of automated login attempts; a Dio network layer standardised 20+ endpoints and cut average response time by 30%.',
        ],
        stack: ['Flutter', 'Dart', 'GetX', 'Dio', 'fl_chart', 'mobile_scanner'],
      },
    ],
    education: {
      title: 'Education',
      course: 'Systems Analysis & Development',
      school: 'FIAP',
      period: 'Jan 2026 – present',
      place: 'São Paulo, Brazil',
    },
  },
  oss: {
    index: '03',
    title: 'Open source',
    intro: 'Libraries I wrote, published and maintain.',
    libs: [
      {
        id: 'permguard',
        name: 'permguard',
        lang: 'Go',
        tagline: 'Hierarchical permission authorization',
        description:
          'Authorization for HTTP services with hierarchical dot notation: a prefix implies every sub-permission. Works with net/http, chi, Echo and Gin. Single mode on an in-memory sharded map (256 shards) or Multi mode on Redis Sets with atomic TxPipeline writes, RequireAll/RequireAny middleware, TTL and real-time revocation.',
        tags: ['Concurrency', 'Authorization', 'Redis', 'Middleware'],
        links: libLinks.permguard,
      },
      {
        id: 'otphive',
        name: 'otphive',
        lang: 'Go',
        tagline: 'High-performance 2FA verification',
        description:
          '2FA verification at ~2M ops/s on a sharded map with no global lock. Single mode in memory or Multi mode on Redis (TxPipeline + Lua) and Memcached, atomic rate limiting, automatic anti-replay and revocation after too many attempts.',
        tags: ['2FA', 'Redis', 'Memcached', 'High-performance'],
        links: libLinks.otphive,
      },
      {
        id: 'oltgo',
        name: 'oltgo',
        lang: 'Go',
        tagline: 'Telemetry and observability',
        description:
          'Asynchronous pipeline over channels, context.Context propagation, a hierarchical event tree and a unified log schema. Exports to OpenTelemetry, ElasticSearch and stdout. One service, one agent: no I/O on the application’s hot path.',
        tags: ['OpenTelemetry', 'ElasticSearch', 'Observability'],
        links: libLinks.oltgo,
      },
      {
        id: 'relay',
        name: 'relay',
        lang: 'Flutter',
        tagline: 'Offline-first job queue',
        description:
          'Reliable async jobs even without a connection: retry with exponential backoff, priority queues, idempotency guarantees, Drift/SQLite persistence and real-time events over Streams.',
        tags: ['Offline-first', 'Drift', 'SQLite'],
        links: libLinks.relay,
      },
      {
        id: 'session-auth',
        name: 'session_auth_auto',
        lang: 'Flutter',
        tagline: 'Sessions and tokens without boilerplate',
        description:
          'Credentials in Keychain/Keystore and tokens in SQLite via Drift. Reactive renewal with configurable clock skew, silent re-login as a fallback and proactive auto-refresh on app start.',
        tags: ['Security', 'Keychain/Keystore', 'Drift'],
        links: libLinks['session-auth'],
      },
    ],
  },
  stack: {
    index: '04',
    title: 'Stack',
    intro: 'What I reach for day to day, from domain to deploy.',
    rows: [
      { meta: 'Backend', title: 'Go', detail: 'Gin · net/http · REST · Socket.io · TCP · RabbitMQ' },
      { meta: 'Payments', title: 'Asaas', detail: 'Webhooks · Inbox pattern · idempotency · reconciliation' },
      { meta: 'Data', title: 'MySQL', detail: 'PostgreSQL · Redis · Supabase · SQLite' },
      { meta: 'Cloud', title: 'AWS', detail: 'EC2 · S3 · SES · SSM · GCP Cloud Run · Docker · OpenTelemetry' },
      { meta: 'Architecture', title: 'Hexagonal', detail: 'DDD · modular monolith · Clean Architecture' },
      { meta: 'Mobile', title: 'Flutter', detail: 'Dart · GetX · Bloc · Hive · Firebase Auth · Firestore' },
    ],
  },
  footer: {
    title: "Let's build something that holds up in production.",
    side: 'Go backends for payments, subscriptions and integrations, from domain design to deploy.',
    cv: 'Download CV',
    localTime: 'Now in Teresina',
    sitemap: 'Sitemap',
    elsewhere: 'Elsewhere',
    contact: 'Contact',
    cvLink: 'Résumé (PDF, PT)',
    madeIn: 'Designed and built in Teresina, Brazil',
    top: 'Back to top',
    role: 'Backend Software Engineer',
  },
};

export const CONTENT: Record<Language, Content> = { pt, en };
