---
title: 'Signature-Based Deep Hedging'
displayTitle: 'Signature-Based Deep Hedging'
summary: 'Comparing raw price histories and path signatures for neural hedging of path-dependent options.'
order: 2
featured: true
categories: ['Quantitative finance', 'Deep learning']
technologies: ['Python', 'PyTorch', 'Path signatures']
editorialStatus: 'draft'
video: '/media/signature-deep-hedging.mp4'
scenePoster: /media/scene/signature-deep-hedging.svg
poster:
  {
    'caption': 'Conceptual wireframe surface for the hedging study. It is not an experimental loss or pricing surface.',
    'src': '/media/signature-deep-hedging.svg',
    'alt': 'Illustrative wireframe hedging surface; not experimental results.',
  }
accent: '#c9ae7a'
context: 'UC Berkeley · INDENG 223 Financial Engineering Systems II'
role: 'Benchmark implementation and experimental analysis'
contributions:
  [
    'Implemented a simulated Asian-option hedging benchmark with proportional transaction costs.',
    'Compared neural policies using raw price histories and time-augmented path signatures.',
    'Connected training, shortfall evaluation and diagnostic plots under a shared risk objective.',
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

## The research question

A path-dependent derivative connects its payoff to the history of an underlying asset. For an Asian call, that history enters through an average of observed prices. A hedging policy therefore needs useful information about the path as it decides how much of the underlying to hold over time.

This project asks whether path signatures can provide that information in a compact form for a neural hedging policy. I compare a policy that receives raw price history with a policy that receives signature features. Both operate within the same simulated market, transaction-cost convention and terminal risk objective, making the representation the central design question.

## My contribution

I implemented the benchmark in Python and PyTorch, from simulated trajectories to the final evaluation of hedging shortfall. The implementation brings together the option payoff, feature construction, neural policies, portfolio accounting and training objective. It also produces training diagnostics and distributions of terminal outcomes.

A useful part of this work was making the financial conventions explicit in the code. The hedge position carried from the previous date, the price at which trading occurs and the cost of changing the position all affect the terminal wealth. These details need to agree before a difference between models can be interpreted as a difference in representation quality.

## Market and payoff assumptions

The benchmark simulates geometric Brownian motion paths and uses a discretely monitored arithmetic Asian call. This creates a controlled environment in which the payoff depends on the sequence of observed prices. Trading is restricted to the underlying asset, with proportional costs applied when the hedge changes.

The previous hedge position is included in the policy input because the cost of an action depends on the position already held. The model produces a bounded hedge ratio. These constraints define the decision problem and help keep both policies comparable, while also limiting the range of strategies the experiment can express.

## Two representations, one benchmark

The raw-history policy receives the observed part of the price path in a fixed-size input. Unobserved future values are padded. The signature-based policy receives features of a time-augmented price path, built from the history available at each hedge date. Time augmentation makes the progression of the path explicit alongside price movement.

| Design choice    | Raw-history policy           | Signature-based policy                  |
| ---------------- | ---------------------------- | --------------------------------------- |
| Path information | Observed prices with padding | Signature features of the observed path |
| Trading state    | Previous hedge position      | Previous hedge position                 |
| Decision         | Bounded hedge ratio          | Bounded hedge ratio                     |
| Training target  | Terminal shortfall risk      | Terminal shortfall risk                 |

Both policies use feed-forward neural networks. The signature construction changes the input representation and therefore the parameterization of the first layer. A later numerical comparison should report those model sizes alongside the evaluation protocol, rather than attributing every difference in outcome to the representation alone.

## Evaluation approach

Terminal shortfall is defined from the option payoff and the wealth produced by the hedge. Training uses an empirical conditional value-at-risk objective, concentrating attention on adverse outcomes in the shortfall distribution. This makes the tail of that distribution a central diagnostic.

Evaluation should read several views together: training behavior, the distribution of terminal outcomes on independent simulated paths, and the chosen tail-risk statistic. Mean outcomes provide additional context about the accounting convention. The plots need matching scales and clearly identified samples so that visual differences can be interpreted consistently.

> **Accounting note.** The benchmark initializes the hedge without an explicit option premium. This convention affects absolute terminal profit and loss. The comparison concerns hedging policies under the same simulation and wealth convention.

## Limitations and next evidence

Geometric Brownian motion provides a tractable experiment, but real markets may include jumps, changing volatility and liquidity effects. Constant proportional costs and bounded positions simplify the trading problem further. Conclusions drawn from this setup therefore need to retain their simulation context.

The next evidence layer should include results across different random seeds and market configurations, together with sensitivity to transaction costs and signature construction. This provisional study presents the benchmark and its interpretation. It leaves numerical performance comparisons to a separate review of the saved experiment outputs and the assumptions behind them.
