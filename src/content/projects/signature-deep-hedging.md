---
title: 'Signature-Based Deep Hedging'
displayTitle: 'Signature-Based Deep Hedging'
summary: 'Learning a cost-aware hedge for an Asian option. In a simulated benchmark, time-augmented signatures reduced extreme hedging shortfall versus raw price histories, using a smaller neural network.'
order: 2
featured: true
categories: ['Quantitative finance', 'Deep learning']
technologies: ['Python', 'PyTorch', 'signatory', 'Matplotlib']
editorialStatus: 'reviewed'
sceneAnimation: hedge-rebalancing
scenePoster: /media/scene/signature-deep-hedging.svg
scenePosterAlt: 'Illustrative hedge: a grey price curve and green position adjustments on an anthracite background.'
poster:
  {
    'caption': 'Conceptual wireframe surface for the hedging study. It is not an experimental loss or pricing surface.',
    'src': '/media/signature-deep-hedging.svg',
    'alt': 'Illustrative wireframe hedging surface; not experimental results.',
  }
accent: '#719a80'
context: 'UC Berkeley · INDENG 223 Financial Engineering Systems II'
role: 'Benchmark implementation and experimental analysis'
contributions:
  [
    'Built an Asian-option hedging benchmark with simulated prices and transaction costs.',
    'Implemented raw-history and signature-based neural policies in PyTorch.',
    'Compared tail risk and model size on 5,000 independent test paths.',
  ]
workflow:
  [
    {
      'title': 'Simulate trajectories',
      'description': 'Generate price paths and a payoff that depends on their history.',
    },
    {
      'title': 'Construct the hedge',
      'description': 'Compare raw-history and signature-based policies with the same trading rules.',
    },
    {
      'title': 'Examine shortfall',
      'description': 'Evaluate the distribution of hedging losses and its adverse tail.',
    },
  ]
---

## Results on unseen paths

The objective was to reduce severe hedging losses. **99% CVaR** measures the average shortfall in the worst 1% of scenarios: here, the **50 worst outcomes among 5,000 test paths**. Both models were tested on the same paths after 100 training epochs.

<figure>
  <a href="/media/deep-hedging/tail-risk.svg" aria-label="Enlarge the comparison of test shortfall risk">
    <picture>
      <source media="(max-width: 600px)" srcset="/media/deep-hedging/tail-risk-mobile.svg" />
      <img src="/media/deep-hedging/tail-risk.svg" width="900" height="470" loading="lazy" alt="Test 99 percent CVaR: 4.9669 for raw history and 3.6061 for signatures, a 27.4 percent reduction in the reported simulation run. Lower is better." />
    </picture>
  </a>
  <figcaption>Redrawn from Table 1 of the report. One simulated market configuration; values are in the benchmark's price units. <a href="/data/deep-hedging/reported-results.csv">Download the reported values (CSV)</a>.</figcaption>
</figure>

The signature model achieved **27.4% lower CVaR** with **23.8% fewer parameters**. Mean terminal P&L stayed close: −2.4822 for raw history and −2.4904 for signatures. The observed benefit was concentrated in the adverse tail.

<details>
  <summary>Inspect the original training and test figures</summary>
  <figure>
    <a href="/media/deep-hedging/training-cvar.webp" aria-label="Enlarge the original training convergence plot">
      <img src="/media/deep-hedging/training-cvar.webp" width="1440" height="800" loading="lazy" alt="Original 100-epoch training curves. Raw-FFNN in blue ends near 4.85 CVaR; Sig-FFNN in orange ends near 3.54, with fluctuations during training." />
    </a>
    <figcaption>Report, Figure 1. Full-training-set CVaR after each epoch. The signature model reaches a lower final loss in this run.</figcaption>
  </figure>
  <figure>
    <a href="/media/deep-hedging/terminal-pnl.webp" aria-label="Enlarge the original terminal P and L distribution">
      <img src="/media/deep-hedging/terminal-pnl.webp" width="1440" height="800" loading="lazy" alt="Original terminal P and L histogram on 5,000 test paths. The signature model's orange distribution is more concentrated around the similar negative mean than the raw-history model's blue distribution." />
    </a>
    <figcaption>Report, Figure 2. Similar means, different dispersion and adverse tails. No option premium is included in initial wealth.</figcaption>
  </figure>
</details>

## What I built

The Python benchmark connects price simulation, feature construction, stock-and-cash accounting and evaluation. **signatory** computes the depth-3 signatures of each observed time–price path; **PyTorch** differentiates the shortfall objective through the sequence of trades. The code also includes a PyTorch signature fallback and Matplotlib diagnostics.

Both policies use the same network design and trading rules. Changing the input from 60 price slots to 14 signature features reduces the first layer's size, while the previous position keeps transaction costs visible to the policy.

## Scope of the result

This is evidence from one seed and one GBM configuration, with constant costs and bounded positions. Multiple seeds, richer market dynamics and a **spot-plus-running-average baseline** would strengthen the comparison; the latter is particularly relevant for an Asian payoff. The experiment does not establish robustness on real markets.

**Accounting convention:** initial wealth excludes the option premium, so the negative mean P&L is not a pricing result. The supplied code charges rebalancing costs and marks final holdings to market without an additional liquidation fee.

[Read the full report (PDF)](/reports/signature-deep-hedging-report.pdf) · [View the benchmark code](/code/deep-hedging.py)
