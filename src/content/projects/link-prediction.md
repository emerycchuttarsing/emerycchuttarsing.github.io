---
title: 'Optimization for Link Prediction'
summary: 'Learning graph representations for link prediction on a Last.fm network through numerical optimization.'
order: 5
featured: false
categories: ['Optimization', 'Graph learning']
technologies: ['Python', 'NumPy', 'Optimization']
editorialStatus: 'draft'
poster:
  {
    'caption': 'Conceptual graph communities and a candidate link. The drawing is illustrative, not a prediction result.',
    'src': '/media/link-prediction.svg',
    'alt': 'Illustrative graph communities and a predicted connection; not experimental results.',
  }
accent: '#b39a79'
context: 'Optimization 240 · Graph-learning coursework'
role: 'Numerical optimization and evaluation implementation'
contributions:
  [
    'Mapped Last.fm graph nodes to learnable vector representations.',
    'Implemented a regularized factorization objective and batch gradient updates in NumPy.',
    'Connected link scores to classification metrics and convergence diagnostics.',
  ]
workflow:
  [
    {
      'title': 'Build edge examples',
      'description': 'Separate observed links and construct sampled negative pairs.',
    },
    {
      'title': 'Optimize embeddings',
      'description': 'Fit node vectors through a regularized factorization objective.',
    },
    {
      'title': 'Score missing links',
      'description': 'Use learned similarities to evaluate held-out edge examples.',
    },
  ]
---

## The modeling question

A network contains information in the pattern of its connections. Link prediction asks whether that structure can help identify plausible connections that are absent from an observed graph. This coursework project explores the question on a Last.fm network through learned node representations.

The emphasis is numerical: formulate an objective, compute its gradient and examine how the resulting vectors behave when used to score node pairs.

## My contribution

I implemented the preprocessing, optimization and evaluation workflow. Node identifiers are mapped to a contiguous index space, observed edges supply positive examples, and sampled pairs supply negative examples. The core optimizer uses NumPy to accumulate gradients for the node vectors involved in each example.

This makes the relationship between the loss, regularization and parameter update visible in the implementation.

## Objective and method

Each node receives a vector. A pair's raw score is the inner product of its vectors. The training objective combines squared prediction error with a penalty on embedding magnitude, and batch gradient descent updates the shared representation matrix.

The evaluation workflow transforms raw scores and compares them with held-out labels using ranking and classification metrics. Thresholded decisions introduce an additional choice: the operating threshold can affect precision and recall even when the underlying ranking is unchanged.

## Evaluation approach

Convergence diagnostics help identify sensitivity to the learning rate and regularization. Link-level evaluation also depends on how positive and negative examples are constructed. An unobserved edge is not automatically a verified negative, and random edge splits may retain substantial information about test nodes in the training graph.

## Limitations and next evidence

The negative sampler checks candidate pairs against the positive edges supplied to it. A stronger evaluation needs to check the complete known edge set when constructing negatives, and to document whether the intended task concerns known or unseen nodes.

Future figures should connect the objective curve with a clearly specified sampling protocol. This provisional study presents the optimization exercise and its assumptions, with numerical conclusions reserved for a later review.
