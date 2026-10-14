export interface ProfileEntry {
  date: string;
  organization: string;
  location: string;
  title: string;
  description: readonly string[];
}

export const site = {
  name: 'Emeryc Chuttarsing',
  headline: 'Quantitative Finance & Machine Learning',
  description:
    'Projects in quantitative finance, machine learning and engineering by Emeryc Chuttarsing.',
  biography:
    'I build models and systems at the intersection of quantitative finance and machine learning. My training at UC Berkeley and Arts et Métiers brings together stochastic modeling, optimization, and engineering. My projects span reinforcement learning for financial markets, neural hedging, and recommendation systems.',
  shortBiography:
    'Trained in engineering at Arts et Métiers and in financial technology at UC Berkeley, I explore how mathematical ideas become useful models, tools and decisions.',
  approach: [
    'I like working through the entire modeling process: formulating a question, choosing a representation, implementing a method, and examining where it stops working. Finance makes that process especially interesting because decisions depend on uncertainty, time, and the costs of acting.',
    'My work also extends to recommendation, language modeling and visual learning. Across these projects, I care about the connection between a model and the system around it: data preparation, evaluation, interfaces, and clear explanations of what the evidence supports.',
  ],
  education: [
    {
      date: 'Aug 2025 – May 2026',
      organization: 'University of California, Berkeley',
      location: 'Berkeley, California',
      title:
        'Master of Engineering · Industrial Engineering & Operations Research · FinTech',
      description: [
        'Coursework in applied stochastic processes, financial engineering, machine learning for financial markets, optimization analytics and data science.',
      ],
    },
    {
      date: 'Sept 2022 – June 2025',
      organization: 'Arts et Métiers',
      location: 'Paris, France',
      title: 'Diplôme d’Ingénieur · Master-equivalent engineering degree',
      description: [
        'Engineering training with a focus on mathematics, statistics and optimization, connecting analytical methods with implementation.',
      ],
    },
    {
      date: 'Sept 2023 – June 2024',
      organization: 'Paris Dauphine University – PSL',
      location: 'Paris, France',
      title: 'Final year of the Bachelor’s Degree in Economics',
      description: [
        'Studied alongside Arts et Métiers, with coursework in portfolio management, econometrics, advanced microeconomics and international economics.',
      ],
    },
  ] satisfies readonly ProfileEntry[],
  experience: [
    {
      date: 'Jan 2026 – Present',
      organization: 'EquitX',
      location: 'Berkeley, California',
      title: 'Technical Co-Founder & Lead Engineer',
      description: [
        'Designed agent-based demand simulations and willingness-to-pay models to study clearing prices and bidder outcomes in a batch-auction marketplace.',
        'Built Python services and an OR-Tools CP-SAT allocation engine with quantity and adjacency constraints, and supported the auction workflow through settlement.',
      ],
    },
    {
      date: 'Sept 2024 – Feb 2025',
      organization: 'CCHE Entreprise',
      location: 'Geneva, Switzerland',
      title:
        'Assistant Project Manager Intern · Data Analytics & Predictive Modeling',
      description: [
        'Built a CatBoost model from historical contractor execution records to estimate completion times and support short-term planning.',
        'Connected execution reporting with schedule and budget decisions, translating operational data into information the project team could use.',
      ],
    },
  ] satisfies readonly ProfileEntry[],
  skillGroups: [
    {
      title: 'Quantitative methods',
      items: [
        'Stochastic modeling & statistics',
        'Financial engineering & path signatures',
        'Optimization & risk-aware evaluation',
      ],
    },
    {
      title: 'Machine learning & data',
      items: [
        'PyTorch & reinforcement learning',
        'NumPy, pandas & scikit-learn',
        'CatBoost, XGBoost & Gymnasium',
      ],
    },
    {
      title: 'Engineering tools',
      items: [
        'Python, SQL, R & MATLAB',
        'OR-Tools, Gurobi & mathematical programming',
        'VBA & LaTeX',
      ],
    },
    { title: 'Languages', items: ['French · Native', 'English · Fluent'] },
  ],
  contact: {
    heading: 'Let’s compare notes.',
    description:
      'For conversations about quantitative finance, machine learning or the projects here, get in touch by email. My CV provides a concise overview of my background.',
  },
  links: {
    github: 'https://github.com/emerycchuttarsing',
    linkedin: null as string | null,
    email: 'emeryc.chuttarsing@berkeley.edu' as string | null,
    resume: '/resume/emeryc-chuttarsing-resume.pdf' as string | null,
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'About', href: '/about/' },
  ],
} as const;
