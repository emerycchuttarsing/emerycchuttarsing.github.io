export const site = {
  name: 'Emeryc Chuttarsing',
  headline: 'Quantitative Finance & Machine Learning',
  description:
    'Projects in quantitative finance, machine learning and engineering by Emeryc Chuttarsing.',
  biography:
    'I build models and systems at the intersection of quantitative finance and machine learning. My training at UC Berkeley and Arts et Métiers brings together stochastic modeling, optimization, and engineering. My projects span reinforcement learning for financial markets, neural hedging, and recommendation systems.',
  links: {
    github: 'https://github.com/emerycchuttarsing',
    linkedin: null as string | null,
    email: null as string | null,
    resume: null as string | null,
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'About', href: '/about/' },
  ],
} as const;
