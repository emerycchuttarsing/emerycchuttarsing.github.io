---
title: 'Optimization for Link Prediction'
displayTitle: 'Optimization for Link Prediction'
summary: 'Predicting missing friendships on Last.fm: a matrix-factorization baseline in NumPy, compared with a graph neural network and a learned edge scorer.'
order: 5
featured: false
categories: ['Optimization', 'Graph learning']
technologies: ['NumPy', 'pandas', 'scikit-learn', 'PyTorch / PyG', 'Matplotlib']
editorialStatus: 'reviewed'
scenePoster: /media/scene/link-prediction.svg
scenePosterAlt: 'Two graph communities linked by a dashed edge. On hover, an orange signal follows connected edges, leaving a fading red trail.'
sceneAnimation: link-signal
poster:
  {
    'caption': 'Conceptual graph communities and a candidate link. The drawing is illustrative, not a prediction result.',
    'src': '/media/link-prediction.svg',
    'alt': 'Illustrative graph communities and a predicted connection; not experimental results.',
  }
accent: '#b39a79'
context: 'UC Berkeley · Optimization 240 · Joint project with Chenyu Tang'
role: 'Matrix-factorization baseline, numerical optimization & evaluation'
contributions:
  [
    'Implemented the regularized objective and full-batch gradients in NumPy.',
    'Built edge sampling, held-out evaluation and convergence diagnostics.',
    'Compared the baseline with a GCN–MLP approach in our joint report.',
  ]
workflow:
  [
    {
      'title': 'Hide known links',
      'description': 'Hold out friendships and sample negative user pairs.',
    },
    {
      'title': 'Learn user vectors',
      'description': 'Fit a factorization baseline or aggregate graph neighbourhoods.',
    },
    {
      'title': 'Evaluate edge ranking',
      'description': 'Assess held-out ROC-AUC and interpret thresholded metrics.',
    },
  ]
---

## Evaluation choices that matter

**Split before fitting.** The baseline holds out 20% of positive edges (5,562 friendships) and samples one negative per positive. The GCN configuration is selected using **validation average precision**, then evaluated on test pairs. The supplied trainer supports early stopping and restoring the best checkpoint.

**Check the sampler.** The baseline notebook excludes positives from only the split passed to its sampler. A held-out friendship can therefore be sampled as a training negative, and vice versa. Excluding the complete known edge set and reusing identical splits would make the comparison stronger.

**Separate ranking from decisions.** The baseline applies a sigmoid after squared-error training; this does not establish probability calibration. Its 0.5 classification threshold corresponds to a raw dot product of zero, which helps explain the high-recall, lower-precision operating point.

<details class="link-evidence">
  <summary>Original curve and reproducibility notes</summary>
  <img src="/media/link-prediction/original-loss.png" alt="Original 50-epoch training curve from the baseline notebook, including a small loss increase around epoch 35." width="2146" height="1418" loading="lazy" />
  <p>The objective is non-convex; the loss decrease does not prove a global minimum or validate the gradient by itself. The split uses random state 42, but the NumPy initialization and negative sampling are not seeded. No multi-seed uncertainty is reported.</p>
  <p>The local notebook and its saved outputs support the baseline results. The report and code appendix document the GCN–MLP architecture; its full run configuration, feature preprocessing and split-generation code were not supplied as a runnable local project. Its score is presented as reported, not independently reproduced. For the undirected graph, the concatenated pair features also merit an explicit edge-order symmetry check.</p>
</details>

<p class="link-sources"><a href="/reports/link-prediction-report.pdf">Read the project report ↗</a> · <a href="/code/link-prediction-gradient-descent.py" download>Baseline code ↓</a> · <a href="/data/link-prediction/reported-results.csv" download>Reported metrics ↓</a> · <a href="/data/link-prediction/baseline-loss.csv" download>Logged loss values ↓</a></p>
