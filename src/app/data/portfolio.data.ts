import { Portfolio } from '../models/portfolio.model';

// Every piece of text on the site comes from this file.
// Edit here, save, and the whole site updates.

export const PORTFOLIO: Portfolio = {
  // #region Site-wide

  seo: {
    title: 'Muhammad Zohaib Zaheer | Senior Full-Stack Software Engineer',
    description:
      'Portfolio of Muhammad Zohaib Zaheer, a senior full-stack software engineer working with Angular, TypeScript, .NET / C# and SQL Server, based in Ilmenau, Germany.',
  },

  profile: {
    name: 'Muhammad Zohaib Zaheer',
    initials: 'MZZ',
    role: 'Senior Full-Stack Software Engineer',
    location: 'Ilmenau, Germany',
    email: 'muhammadzohaibzaheer.dev@gmail.com',
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/muhammad-zohaibzaheer',
        icon: 'linkedin',
      },
      { label: 'GitHub', href: 'https://github.com/Muhammad-Zohaib-Zaheer', icon: 'github' },
    ],
    photo: 'images/avatar-cutout.webp',
    resumeUrl: '',
  },

  nav: [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Toolkit' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'contact', label: 'Contact' },
  ],

  ui: {
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    resume: 'Resume',
    scrollDown: 'Scroll to the next section',
    backToTop: 'Back to top',
    builtWith: 'Built with',
  },

  // #endregion

  // #region Hero and avatar

  hero: {
    availability: 'Open to on-site, hybrid or remote roles across Germany, available immediately',
    greeting: "Hi, I'm Muhammad Zohaib Zaheer",
    roles: ['Full-Stack Engineer', 'Angular Developer', '.NET Engineer', 'Team Lead'],
    headline: {
      start: 'I build enterprise software that ',
      highlight: 'holds up in production',
      end: '.',
    },
    intro:
      'Three and a half years of shipping Angular and ASP.NET Core applications for banking and trade compliance. ' +
      "Now I'm doing my master's at TU Ilmenau and looking for a team in Germany that cares about clean, dependable code.",
    actions: [
      { label: 'See my work', href: '#projects', variant: 'primary', icon: 'arrow-right' },
      { label: 'Get in touch', href: '#contact', variant: 'ghost', icon: 'mail' },
    ],
    stats: [
      { value: '3.5+', label: 'years building production software' },
      { value: '6', label: 'developers led on one product' },
      { value: '#2', label: 'ICPC Pakistan, out of 180 teams' },
      { value: 'M.Sc.', label: 'Computer & Systems Eng., TU Ilmenau' },
    ],
  },

  avatar: {
    modelUrl: '',
    photoUrl: '',
    // Colours sampled from my photo
    skin: '#d09a76',
    hair: '#2c2829',
    eyes: '#2a1a12',
    lips: '#b0706a',
    shirt: '#1e2130',
    blazer: '#5c584d',
    blazerCheck: '#262420',
    blazerLine: '#b8b09a',
    beard: false,
    stubble: false,
    glasses: false,
    watch: true,
    greeting: 'Hey there! 👋',
    hint: 'Drag to turn me, tap to say hi',
    orbitLabels: ['Angular', 'TypeScript', 'C#', '.NET', 'SQL Server', 'RxJS', 'SignalR'],
    codeFileName: 'muhammad-zohaib-zaheer.ts',
    codeLines: [
      'const engineer = {',
      "  name: 'Muhammad Zohaib Zaheer',",
      "  role: 'Full-Stack Engineer',",
      "  stack: ['Angular', '.NET', 'SQL'],",
      "  basedIn: 'Ilmenau, DE',",
      '  experience: 3.5,',
      '  available: true,',
      '};',
    ],
  },

  // #endregion

  // #region About

  about: {
    title: 'Software that keeps working after launch day.',
    photoBadges: ['3.5+ years', 'Angular · .NET', 'Ilmenau, DE'],
    paragraphs: [
      "I'm a full-stack engineer from Karachi, now living in Ilmenau, Germany. I spent three and a half years at AKSIQ " +
        'building enterprise platforms for the banking and trade sector, mostly Angular on the front end and ASP.NET Core ' +
        'with SQL Server behind it.',
      "The product I know best is an anti-money-laundering platform that a bank's trade, compliance and business teams " +
        'use every day. I led its team of six from requirements to production, owned the architecture decisions and the ' +
        'code reviews, and took on the unglamorous work too: slow queries, background services and the production issues ' +
        'nobody else wanted to touch.',
      'Competitive programming taught me to think a problem through before I start typing, and that habit still shapes ' +
        "how I write code. Right now I'm doing a research master's at TU Ilmenau and learning German on the side.",
    ],
    tags: [
      'Full-stack development',
      'Banking & compliance',
      'Team leadership',
      'Clean architecture',
    ],
    strengthsTitle: 'What I bring',
    strengths: [
      {
        icon: 'layers',
        title: 'End-to-end ownership',
        text: 'From the first requirements call to the release, and the support that comes after it.',
      },
      {
        icon: 'users',
        title: 'Team leadership',
        text: 'Sprint planning, task breakdown and day-to-day technical help for a team of six.',
      },
      {
        icon: 'shield',
        title: 'Security in mind',
        text: 'SSO, OAuth 2.0, role-based access and AES-256. In regulated banking software, security and correctness come first.',
      },
      {
        icon: 'zap',
        title: 'Problem solving',
        text: 'Years of ICPC training: find the real bottleneck first, then fix it properly.',
      },
    ],
  },

  // #endregion

  // #region Skills

  skills: {
    title: 'The tools I reach for.',
    intro:
      'Most of my day is Angular, C# and SQL Server, but I am comfortable moving across the whole stack.',
    sphereHint: 'Hover over the sphere to spin it',
    groups: [
      {
        label: 'Frontend',
        icon: 'code',
        items: [
          'Angular (v8–20)',
          'TypeScript',
          'RxJS',
          'HTML5',
          'CSS / SCSS',
          'Bootstrap',
          'Responsive SPA / PWA',
          'React',
        ],
      },
      {
        label: 'Backend',
        icon: 'server',
        items: [
          'C#',
          'ASP.NET Core',
          '.NET 6–8',
          'ASP.NET Zero / ABP Framework',
          'Entity Framework Core',
          'LINQ',
          'SignalR',
          'Windows Services',
          'Node.js',
        ],
      },
      {
        label: 'Databases',
        icon: 'database',
        items: [
          'SQL Server (T-SQL, stored procedures, query and index tuning)',
          'MySQL',
          'MongoDB',
        ],
      },
      {
        label: 'APIs & Security',
        icon: 'shield',
        items: [
          'REST API design',
          'OAuth 2.0',
          'Single Sign-On (SSO)',
          'Role-Based Access Control',
          'AES-256',
          'XSS / CSRF hardening',
        ],
      },
      {
        label: 'Architecture & Practices',
        icon: 'check',
        items: [
          'Clean Code',
          'SOLID',
          'Design patterns',
          'Dependency injection',
          'Code reviews',
          'Unit testing',
          'Agile / Scrum',
          'Technical documentation',
        ],
      },
      {
        label: 'DevOps & Tools',
        icon: 'tool',
        items: [
          'Git',
          'Azure DevOps (Boards / Repos)',
          'Docker',
          'CI/CD pipelines',
          'AWS',
          'Google Cloud',
          'Visual Studio 2022',
          'VS Code',
        ],
      },
      {
        label: 'ML & Data',
        icon: 'layers',
        items: ['Python', 'PyTorch', 'Pandas', 'CNNs', 'Random Forest', 'Time-series analysis'],
      },
      {
        label: 'AI-Assisted Development',
        icon: 'zap',
        items: [
          'Claude Code',
          'Cursor',
          'GitHub Copilot',
          'Model Context Protocol (MCP)',
          'LLM API integration',
          'Reviewing and testing AI-generated code',
        ],
      },
    ],
  },

  // #endregion

  // #region Experience

  experience: {
    title: 'Where I have worked.',
    intro: '',
    items: [
      {
        company: 'AKSIQ',
        companyUrl: '',
        role: 'Senior Software Engineer',
        period: 'Mar 2023 – Sep 2026',
        location: 'Karachi, Pakistan · remote from Germany since Apr 2026',
        summary:
          'A software house building compliance and management platforms for banks and the trade sector.',
        points: [
          'Led a team of six developers: sprint planning, task breakdown in Azure DevOps, delivery tracking and daily technical guidance. Promoted to senior for consistently delivering on schedule.',
          "Owned end-to-end delivery of enterprise web apps in Angular, ASP.NET Core and SQL Server, from the client's requirements and the technical spec through release and production support.",
          'Ran all code reviews and held the codebase to Clean Code, SOLID and dependency injection. Mentored junior developers and onboarded new joiners with documentation and knowledge-transfer sessions.',
          'Designed and maintained secure REST APIs (OAuth 2.0, RBAC) and the integrations with external systems and client portals.',
          'Diagnosed and fixed hard production issues in SQL Server queries, background services and real-time components, keeping performance and stability up for banking clients.',
          "Worked directly with business analysts, QA and the banks' compliance teams to turn regulatory requirements into working software.",
        ],
        stack: [
          'Angular',
          'TypeScript',
          'ASP.NET Core',
          'C#',
          'SQL Server',
          'SignalR',
          'Azure DevOps',
        ],
      },
    ],
  },

  // #endregion

  // #region Projects

  projects: {
    title: 'Things I have built.',
    intro: 'A mix of production systems from work and projects from university.',
    items: [
      {
        name: 'AI-Based Anti-Money-Laundering Platform',
        context: 'Banking · Trade finance',
        summary:
          "A single-window compliance platform that a bank's trade, compliance and business departments use to run due diligence on import and export transactions. I led the development team on this product.",
        points: [
          'Workflow engine that escalates invoices across departments, with every step decided by the people handling it.',
          'Modules for invoice verification, name screening, vessel and container tracking, and customer risk profiling.',
          'Live status updates over SignalR, with Windows Services verifying invoices in the background.',
          'Enterprise SSO, OAuth 2.0 secured APIs, fine-grained roles and permissions, AES-256, XSS hardening and license-key activation.',
          'Dashboards, fields, grids and navigation that each bank can configure without a code change.',
        ],
        stack: [
          'ASP.NET Zero',
          '.NET 6',
          'C#',
          'Angular 14',
          'TypeScript',
          'SQL Server',
          'SignalR',
          'Windows Services',
          'SSO / OAuth 2.0',
        ],
        featured: true,
        links: [],
      },
      {
        name: 'Travel Agency Management System',
        context: 'Enterprise SaaS',
        summary:
          'A platform that handles bookings, customer relationships and the money side of running a travel agency.',
        points: [
          'CRM and booking modules with real-time data sync, custom dashboards and reporting.',
          'Stripe for multi-currency payments, with invoices generated and sent by email and SMS automatically.',
          'Role-based access, multi-language support and a layout that works on every screen size.',
        ],
        stack: ['Angular', 'Node.js', 'REST', 'Stripe'],
        featured: false,
        links: [],
      },
      {
        name: 'Pull-Request Review Agent for .NET and Angular',
        context: 'Personal project · in progress',
        summary:
          'A pipeline that reviews pull requests for security issues, architecture-rule violations and missing tests, then posts one consolidated review comment.',
        points: [
          'Runs automatically in GitHub Actions on every pull request.',
          'A set of seeded bugs measures how many problems it catches and how many false alarms it raises.',
        ],
        stack: ['C#', '.NET 8', 'Semantic Kernel', 'MCP', 'GitHub Actions'],
        featured: false,
        links: [],
      },
      {
        name: 'Dark Vessel Detection System',
        context: 'B.Sc. thesis',
        summary:
          'A machine-learning system that flags anomalous ("dark") vessel activity, using unsupervised learning and time-series analysis on large maritime datasets.',
        points: [
          'Built the Angular front end and a Python REST API over MySQL with role-based permissions.',
          'Real-time map visualisation of detections with the Google Maps API.',
        ],
        stack: ['Angular', 'Python REST API', 'MySQL', 'PyTorch', 'Google Maps API'],
        featured: false,
        links: [],
      },
      {
        name: 'Bitcoin Price-Range Prediction',
        context: 'ML coursework',
        summary:
          "A convolutional neural network that predicts Bitcoin's next-day price range from historical data going back to 2011.",
        points: [
          'Built in PyTorch on the full price history, from 2011 up to today.',
          'Incremental training, so the model learns from new data without a full retrain.',
        ],
        stack: ['Python', 'PyTorch', 'CNN', 'Time series'],
        featured: false,
        links: [],
      },
      {
        name: 'Landmine Detection Robot',
        context: 'University robotics',
        summary:
          'A robot that drives over rough ground looking for landmines and streams what it sees back to the operator.',
        points: [
          'Arduino motion control and sensors, plus an ESP32 camera doing image processing in real time.',
          'Live monitoring through Google Cloud, a React remote-control app and autonomous navigation for difficult terrain.',
        ],
        stack: ['ESP32', 'Arduino', 'Google Cloud', 'React'],
        featured: false,
        links: [],
      },
    ],
  },

  // #endregion

  // #region Education

  education: {
    title: 'Where I studied.',
    intro: '',
    items: [
      {
        degree: 'M.Sc. Research in Computer & Systems Engineering',
        school: 'TU Ilmenau',
        schoolUrl: 'https://www.tu-ilmenau.de',
        location: 'Ilmenau, Germany',
        period: 'Apr 2026 – present',
        detail: 'A research-based programme with a flexible schedule.',
      },
      {
        degree: 'B.Sc. Software Engineering',
        school: 'Muhammad Ali Jinnah University',
        schoolUrl: 'https://jinnah.edu',
        location: 'Karachi, Pakistan',
        period: 'Sep 2020 – Jun 2024',
        detail: 'Thesis: detecting dark vessel activity with machine learning.',
      },
      {
        degree: 'Advanced Diploma in Software Engineering (ADSE)',
        school: 'Aptech Computer Education',
        schoolUrl: 'https://aptech-education.com.pk/',
        location: 'Karachi, Pakistan',
        period: '2018 – 2021',
        detail: 'A three-year career programme in software engineering (ACCP).',
      },
    ],
  },

  // #endregion

  // #region Highlights

  highlights: {
    title: 'A few things I am proud of.',
    awardsTitle: 'Awards',
    awards: [
      {
        title: 'Gold Medal · National Rank 2',
        event: 'ICPC Pakistan Online Qualifier',
        detail: 'Finished 2nd out of 180 teams nationwide.',
        link: { label: 'Verified ICPC profile', href: 'https://icpc.global/ICPCID/Q4ZIA7MD63QB' },
      },
      {
        title: 'Bronze Medal · National Rank 11',
        event: 'ICPC Pakistan Onsite Regional',
        detail: 'Finished 11th out of 50 teams at the onsite contest.',
        link: { label: 'Verified ICPC profile', href: 'https://icpc.global/ICPCID/Q4ZIA7MD63QB' },
      },
      {
        title: 'Winner',
        event: 'Code-Heist Speed Programming Contest',
        detail: 'Muhammad Ali Jinnah University, Karachi.',
        link: null,
      },
    ],
    languagesTitle: 'Languages',
    languages: [
      {
        name: 'English',
        level: 'C1',
        detail: 'Fluent, my working language for over three years.',
        proficiency: 90,
      },
      {
        name: 'German',
        level: 'A1',
        detail: 'In an intensive course, aiming for B1 by mid-2027.',
        proficiency: 22,
      },
      { name: 'Urdu', level: 'Native', detail: 'First language.', proficiency: 100 },
    ],
  },

  // #endregion

  // #region Contact and footer

  contact: {
    title: "Let's build something solid together.",
    text:
      "I'm looking for an engineering role in Germany, on-site, hybrid or remote, and I'm available immediately. " +
      'If you have a position, a project or just a question about my work, drop me a message.',
    emailLabel: 'Email me',
    copyLabel: 'Copy email',
    copiedLabel: 'Copied',
    facts: [
      { icon: 'map-pin', text: 'Based in Ilmenau, Germany' },
      { icon: 'briefcase', text: 'Open to relocation nationwide · on-site, hybrid or remote' },
      { icon: 'globe', text: 'Student residence permit (§16b), EU Blue Card eligible' },
    ],
  },

  footer: {
    text: 'Designed and built with Angular and three.js.',
  },

  // #endregion
};
