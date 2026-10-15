---
title: 'Bitcoin Trading with RL & Path Signatures'
displayTitle: 'Bitcoin Trading with RL & Path Signatures'
summary: 'Can path signatures help reinforcement learning agents generalize on Bitcoin data? We tested compact market representations and trading policies under costs and risk constraints. Volume timing was captured well; trading results remained sensitive to market regimes.'
order: 1
featured: true
categories: ['Quantitative finance', 'Reinforcement learning']
technologies: ['Python', 'PyTorch', 'pysiglib', 'D3QN / PPO / SAC']
editorialStatus: 'reviewed'
sceneAnimation: bitcoin-price
scenePoster: /media/scene/rl-path-signatures.svg
scenePosterAlt: 'Illustrative Bitcoin price path with small fluctuations forming broader rises and falls. Simulated, not historical market data.'
poster:
  {
    'caption': 'Signatures capture order: price moving before volume creates a different path from the reverse. Illustrative example.',
    'src': '/media/capstone/path-order.svg',
    'background': '#f3efe6',
    'alt': 'Two paths have the same start and finish but opposite ordering of price and volume movements.',
  }
accent: '#ad634a'
context: 'UC Berkeley MEng IEOR FinTech · Team capstone'
role: 'Implementation of market features, trading agents and evaluation'
contributions:
  [
    'Integrated path-signature features with three RL algorithms.',
    'Built trading environments with cash, holdings, costs and exposure limits.',
    'Compared policies across historical periods and random seeds.',
  ]
workflow:
  [
    {
      'title': 'Represent',
      'description': 'Summarize recent market paths with log-signatures.',
    },
    {
      'title': 'Learn',
      'description': 'Train trading decisions under capital and risk constraints.',
    },
    {
      'title': 'Evaluate',
      'description': 'Test on later periods and compare stability across seeds.',
    },
  ]
---

## Tools and implementation

My work connected feature extraction, three standard RL methods and portfolio accounting in a shared research framework.

| Tool or method       | Role in the project                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Python & PyTorch** | Implement the models and train neural trading policies.                                                                                                  |
| **pysiglib**         | Compute log-signatures from 24-bar market windows.                                                                                                       |
| **D3QN**             | Learn discrete buy, hold and sell actions. Prioritized replay and multi-step returns were tested as upgrades.                                            |
| **PPO**              | Learn continuous exposure levels with constrained policy updates.                                                                                        |
| **SAC**              | Learn continuous exposure using replay and an entropy objective to encourage exploration.                                                                |
| **Gymnasium**        | Reproduce the trading environment: observations, actions, rewards and portfolio accounting, with 0.10% fees, 0.02% assumed slippage and exposure limits. |

## Did the features capture useful structure?

To test whether the features captured event order, we created pairs of Bitcoin windows with **the same price path and total volume**, but moved volume earlier or later. The example below takes the opening price–volume illustration into a controlled experiment on market data.

<figure>
  <a href="/media/capstone/volume-timing.webp" aria-label="Enlarge the Bitcoin price and volume-timing example">
    <img src="/media/capstone/volume-timing.webp" width="1777" height="1235" loading="lazy" alt="Bitcoin window from 10 July to 2 August 2022. The top panel shows the unchanged closing price and high-low range. Below, blue bars put more volume early in the window, while orange bars put more volume late; both profiles have the same total volume." />
  </a>
  <figcaption>Same prices above; different volume timing below: early in blue, late in orange. The two volume profiles are constructed variants of the same Bitcoin window. Original report, Figure 2.</figcaption>
</figure>

The classifier then had to identify **when volume arrived** from each representation. We used the same small neural network throughout, so the comparison focused on the input features.

<figure>
  <a href="/media/capstone/volume-classification.webp" aria-label="Enlarge the volume-timing classification results">
    <img src="/media/capstone/volume-classification.webp" width="1597" height="877" loading="lazy" alt="Test accuracy on early-versus-late volume classification: summary statistics 49.6%, raw windows 68.0%, log-signatures 91.4%." />
  </a>
  <figcaption>Original presentation, slide 7; final report, Table 1. Controlled volume-timing classification, not trading accuracy.</figcaption>
</figure>

**91.4% test accuracy with 15 signature features**, versus 68.0% with 96 raw-window features. This supports the representation’s ability to capture temporal structure in this experiment.

## PPO, SAC and D3QN: what changed in practice?

The initial benchmark trained on **2014–2020** and evaluated on **2021–February 2024**. The chart includes the documented 200-episode, seed-42 configurations, including both PPO and SAC settings.

<figure>
  <a href="/media/capstone/agent-comparison.svg" aria-label="Enlarge the PPO, SAC and D3QN comparison">
    <picture>
      <source media="(max-width: 600px)" srcset="/media/capstone/agent-comparison-mobile.svg" />
      <img src="/media/capstone/agent-comparison.svg" width="720" height="480" loading="lazy" alt="Initial benchmark evaluation scores: PPO selected setting +0.6046, PPO conservative −0.3400, SAC baseline −0.3844, SAC lower entropy −0.3528, D3QN six actions −0.3346." />
    </picture>
  </a>
  <figcaption>Replotted from the project’s experiment log. One training seed; 50 fixed evaluation episodes per run. Configurations were tuned, and the selected PPO setting used out-of-sample results. <a href="/data/capstone/initial-agent-comparison.csv">Chart data</a>.</figcaption>
</figure>

PPO’s selected setting was positive, while conservative PPO, both SAC settings and six-action D3QN were negative. **The configuration mattered as well as the algorithm.** These exploratory runs motivated broader evaluation.

### Testing across market periods

The later study compared PPO and D3QN on **three rolling train/test splits × five seeds**. SAC was not included in this saved multi-seed comparison.

<figure>
  <a href="/media/capstone/walk-forward.svg" aria-label="Enlarge the rolling PPO and D3QN results">
    <picture>
      <source media="(max-width: 600px)" srcset="/media/capstone/walk-forward-mobile.svg" />
      <img src="/media/capstone/walk-forward.svg" width="720" height="439" loading="lazy" alt="Mean evaluation scores across three test periods. PPO: 1.11, 0.49, −0.19. Baseline D3QN: 0.86, 0.36, −0.94. Upgraded D3QN: 0.89, 0.55, −0.50." />
    </picture>
  </a>
  <figcaption>Saved rolling evaluation: five seeds per point, overlapping test periods. PPO and both D3QN configurations deteriorate in the final period. See the full report, Table 3.</figcaption>
</figure>

Upgraded D3QN increased its mean score from **0.09 to 0.31**; PPO remained ahead at **0.47**. All configurations turned negative in the weakest period. D3QN’s upgrades combine action design, replay and risk controls, so their benefit cannot be attributed to signatures alone.

Both charts use **mean episode return divided by its standard deviation**, without annualization or risk-free adjustment. This is an experimental evaluation score, not a conventional annualized Sharpe ratio. Model selection and overlapping periods leave an untouched final test necessary.

## What this project demonstrates

A practical application of **time-series feature engineering, deep RL and careful portfolio accounting**. The clearest result is that signatures captured order efficiently; the trading study shows why that useful representation still needs robust policies and validation across market regimes.

[Read the full report](/reports/capstone/report.pdf) · [View the presentation](/reports/capstone/presentation.pdf)
