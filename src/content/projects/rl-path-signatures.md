---
title: 'Reinforcement Learning & Path Signatures for Crypto Markets'
displayTitle: 'Reinforcement Learning & Path Signatures'
summary: 'Exploring path representations and reinforcement learning policies for cryptocurrency markets, with attention to temporal evaluation, costs and risk.'
order: 1
featured: true
categories: ['Quantitative finance', 'Reinforcement learning']
technologies: ['Python', 'PyTorch', 'Path signatures']
editorialStatus: 'draft'
video: '/media/rl-path-signatures.mp4'
scenePoster: /media/scene/rl-path-signatures.svg
poster:
  {
    'caption': 'Conceptual market trajectories and path representations. The illustration contains no backtest results.',
    'src': '/media/rl-path-signatures.svg',
    'alt': 'Illustrative market paths and path representations; not experimental results.',
  }
accent: '#8ba6b4'
context: 'UC Berkeley MEng IEOR FinTech capstone · Team quantitative research project'
role: 'Research implementation within the capstone team'
contributions:
  [
    'Implemented a shared research pipeline for D3QN, PPO and SAC trading policies.',
    'Built portfolio accounting with cash, holdings, transaction costs and exposure controls.',
    'Connected path representations, experiment configurations and historical evaluation workflows.',
  ]
workflow:
  [
    {
      'title': 'Represent the path',
      'description': 'Build observations from historical market windows and path-signature features.',
    },
    {
      'title': 'Learn a policy',
      'description': 'Train allocation policies inside a capital-aware trading environment.',
    },
    {
      'title': 'Evaluate over time',
      'description': 'Compare behavior across held-out periods, costs and market conditions.',
    },
  ]
---

## The research question

A trading policy sees a sequence of observations and chooses an action whose consequences extend beyond the next price change. The shape of recent market history, the current position and the cost of changing that position all matter. This capstone explores how path signatures can represent that history for reinforcement learning policies applied to cryptocurrency markets.

The motivation is practical: a compact representation may make sequential structure easier to use, while a realistic environment makes the resulting decisions easier to interpret. The project brings these questions together in a research workspace that supports several policy families on a shared market pipeline.

## My contribution

I implemented the project code within a team quantitative research setting. My work connects data preparation, environment behavior, learning algorithms and evaluation tooling. This includes a trading environment that tracks cash, fractional holdings and total equity, along with transaction costs, slippage and limits on exposure.

I also worked on the experiment workflow around the models: configuration files, training entry points, checkpoints and evaluation outputs. Keeping these pieces connected makes it possible to explain how a policy was trained and what assumptions were used when its decisions were replayed. The team context matters because the research question and interpretation extend beyond implementation alone.

## Data and assumptions

The pipeline uses historical Bitcoin market data. Observations must be constructed from information available at the decision time. Features based on a recent path therefore need the same temporal discipline as more familiar rolling statistics: the endpoint of the observation window cannot include the outcome being evaluated.

The environment represents a strategy acting as a small price-taker. It maintains explicit portfolio state and applies configurable trading frictions. This accounting gives actions an economic meaning: a change in allocation affects both exposure to the next market move and the cost incurred immediately. Assumptions about execution remain part of the experiment and need to accompany any future performance comparison.

## Policy design

Path signatures summarize ordered interactions along an observed trajectory. They provide a structured alternative to passing an entire raw window directly to a model. Their usefulness depends on choices such as the underlying path channels, preprocessing and signature construction, so these choices belong in the experiment configuration.

The workspace supports three policy families:

| Policy | Decision structure            | Comparison focus                       |
| ------ | ----------------------------- | -------------------------------------- |
| D3QN   | Discrete trading actions      | Value estimation and action design     |
| PPO    | Continuous allocation control | Policy updates and stability           |
| SAC    | Continuous allocation control | Entropy regularization and exploration |

The environment and evaluation conventions provide the common ground for comparison. An algorithm label alone does not describe a strategy: the action space, reward, risk controls and trading frictions influence its behavior. These settings need to be considered together when interpreting a run.

## Evaluation approach

The central evaluation question is whether a policy behaves consistently on market periods outside its training window. The research workflow supports rolling walk-forward comparisons and separate training-period and out-of-sample reports. Future result figures should identify the relevant split, configuration and model selection rule.

I would read cumulative equity alongside drawdown, turnover, exposure and the cost of trading. Risk-adjusted summaries are useful, but the underlying trajectories help explain whether a result depends on a small part of the evaluation period. Comparisons across seeds and market conditions also help distinguish a repeatable behavior from a favorable run.

> **Method note.** A controlled prediction experiment and a trading backtest answer different questions. Predictive accuracy needs its own label definition and split; economic evaluation additionally depends on portfolio accounting, risk and execution costs.

## Limitations and next evidence

Historical replay cannot capture every effect of deploying a strategy in a live market. Liquidity, changing market structure and execution uncertainty can alter the relationship between a chosen action and its realized outcome. Flexible feature and reward choices also create opportunities to overfit the research process itself.

The next evidence layer should make those choices inspectable: a comparison of observation representations, policy behavior across time, and sensitivity to costs and exposure constraints. This provisional study explains the implementation and evaluation framework. Performance claims will be added only when the corresponding experiment records can be presented with their assumptions.
