---
title: 'Signature-Based Deep Hedging'
summary: 'Comparing raw price histories and path signatures for neural hedging of path-dependent options.'
order: 2
featured: true
categories: ['Quantitative finance', 'Deep learning']
technologies: ['Python', 'PyTorch', 'Path signatures']
editorialStatus: 'draft'
poster:
  {
    'src': '/media/project-placeholder.svg',
    'alt': 'Illustrative abstract curves; not experimental results.',
  }
accent: '#c9ae7a'
---

## Research question

Can a compact path representation support neural hedging of an Asian option?

## Approach

Compare policies that consume raw price histories with policies that consume path signatures. The setup connects the path-dependent payoff, transaction costs and tail-risk objective.

## Evaluation to present

The detailed study will explain the simulation protocol, policy sizes and out-of-sample loss distributions. Comparisons and numerical claims remain pending verification against the experiment outputs.
