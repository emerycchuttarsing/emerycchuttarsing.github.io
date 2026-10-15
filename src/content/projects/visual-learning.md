---
title: 'Visual Learning & Image Analysis'
displayTitle: 'Visual Learning & Image Analysis'
summary: 'A data-science study of disaster imagery: designing visual features, comparing classifiers and evaluating predictions under class imbalance.'
order: 4
featured: false
categories: ['Computer vision', 'Data science']
technologies:
  ['NumPy / pandas', 'scikit-image', 'scikit-learn', 'Matplotlib / seaborn']
editorialStatus: 'reviewed'
scenePoster: /media/scene/visual-learning-mosaic.webp
scenePosterAlt: 'Four satellite-image regions crossfading between the original image, Sobel edges and local binary pattern texture.'
sceneAnimation: vision-features
poster:
  {
    'caption': 'Conceptual image tiles and feature regions. These are original illustrations, not satellite samples or model outputs.',
    'src': '/media/visual-learning.svg',
    'alt': 'Illustrative image tiles and feature patterns; not model outputs.',
  }
accent: '#78948b'
context: 'UC Berkeley · Graduate data science project · With Xuanmian He & Zhongling Zhao'
role: 'Exploratory analysis, feature engineering & damage-classification experiments'
contributions:
  [
    'Examined visual distributions and correlations to understand the available signal.',
    'Built compact image descriptors from color, local edges and texture.',
    'Explored models, class weighting and augmentation, then interpreted validation and class-level results.',
  ]
workflow:
  [
    {
      'title': 'Explore & represent',
      'description': 'Inspect labels and image statistics, then build local and global descriptors.',
    },
    {
      'title': 'Fit & validate',
      'description': 'Tune regularization and account for unequal class frequencies.',
    },
    {
      'title': 'Interpret errors',
      'description': 'Compare held-out metrics and inspect failures on scarce damage classes.',
    },
  ]
---

## The data-science decisions behind the pipeline

**Start with the data.** We checked image validity, visualized label frequencies and compared feature distributions. Correlation matrices helped identify redundant measurements; local blocks preserved information that an image-wide average could erase.

**Keep training and evaluation distinct.** The damage experiment makes a stratified 80/20 split: 160 training images and 40 test images. Horizontal flips expand the five major-damage training images to ten. Scaling is fitted on training data; in cross-validation, it is fitted separately within each fold using a scikit-learn pipeline.

**Choose a metric that exposes the problem.** Five-fold validation tunes C using macro-F1, so each damage class has equal weight. Comparing training and validation scores makes overfitting visible. The final class-level analysis shows why a respectable weighted score can still hide failures on a rare class.

<details class="visual-evidence">
  <summary>Experimental limits and source notes</summary>
  <p><strong>What the validation establishes.</strong> The disaster score is reported five-fold accuracy on the two event datasets, not a test on a new geography or disaster. Generalization would need event- or geography-separated evaluation.</p>
  <p><strong>One improvement to the damage protocol.</strong> Augmentation happens after the outer train/test split, so the held-out test images remain untouched. However, the saved cross-validation receives the already augmented training set: an original image and its flipped copy can fall into different folds. Augmenting inside each fold, or grouping related images, would give a cleaner validation estimate.</p>
  <p><strong>Which result is shown?</strong> The page uses the final saved notebook run: C = 0.1, test macro-F1 = 0.4026 and rounded weighted F1 = 0.57. The report and slides summarize weighted F1 as 0.55; the report's per-class table matches an earlier notebook run. These are not treated as the same experiment. Earlier references to an ordinal final model are superseded by the implemented weighted multinomial model.</p>
  <p><strong>Reproducibility.</strong> Figures use saved notebook outputs and report tables; no model was retrained for this page. Raw image archives are absent from the supplied local folder. The class counts are checked against the available label arrays.</p>
</details>

<p class="visual-sources"><a href="/reports/visual-learning-report.pdf">Project report ↗</a> · <a href="/reports/visual-learning-presentation.pdf">Presentation ↗</a> · <a href="/data/visual-learning/damage-validation.csv" download>Validation scores ↓</a> · <a href="/data/visual-learning/damage-test.csv" download>Class-level results ↓</a></p>

<p class="visual-sources">Feature methods: <a href="https://scikit-image.org/docs/stable/auto_examples/edges/plot_edge_filter.html">Sobel edge operators</a> · <a href="https://scikit-image.org/docs/stable/auto_examples/features_detection/plot_local_binary_pattern.html">Local binary patterns</a>.</p>
