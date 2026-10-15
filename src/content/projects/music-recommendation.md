---
title: 'Multi-Stage Music Recommendation'
displayTitle: 'Multi-Stage Music Recommendation'
summary: 'From 2.26 million tracks to a playlist continuation: ALS retrieves, SASRec ranks, and MMR adds variety. Each stage is evaluated for its contribution.'
order: 3
featured: true
categories: ['Machine learning', 'Recommendation']
technologies: ['Python', 'implicit', 'PyTorch', 'NumPy', 'Streamlit', 'Modal']
editorialStatus: 'reviewed'
sceneAnimation: music-sorting
scenePoster: /media/scene/music-recommendation.svg
scenePosterAlt: 'Illustrative music sorting: notes flow through a green neural network; black notes join a playlist while grey notes drift aside on a sage background.'
poster:
  {
    'caption': 'Conceptual recommendation network and sound wave. The positions are illustrative, not learned embeddings.',
    'src': '/media/music-recommendation.svg',
    'alt': 'Illustrative music recommendation network and sound wave; not experimental results.',
  }
accent: '#96b495'
context: 'UC Berkeley · INDENG 242B machine learning · Team project'
role: 'Pipeline and application implementation within the project team'
contributions:
  [
    'Implemented a staged playlist-continuation workflow using ALS, a SASRec-style Transformer and MMR.',
    'Connected retrieval and ranking artifacts to a Streamlit interface with explicit catalog coverage.',
    'Prepared analysis views for ranking quality, diversity and the behavior of each stage.',
  ]
workflow:
  [
    {
      'title': 'Retrieve with ALS',
      'description': 'Find a manageable candidate set using collaborative-filtering embeddings.',
    },
    {
      'title': 'Rank with SASRec',
      'description': 'Use playlist order to score the retrieved tracks in context.',
    },
    {
      'title': 'Diversify with MMR',
      'description': 'Balance relevance with similarity to tracks already selected.',
    },
  ]
links:
  code: 'https://github.com/idrisalami/242B_final_project'
---

## Define the evaluation first

Hide each playlist’s final track and recover it from the preceding context. **Recall@K** measures how often it appears in the top K; **NDCG@10** rewards a higher rank.

<div class="music-split" role="img" aria-label="Dataset split: 700,000 training playlists, 150,000 validation playlists and 150,000 test playlists.">
  <div><strong>700K</strong><span>Train · 70%</span></div>
  <div><strong>150K</strong><span>Validation · 15%</span></div>
  <div><strong>150K</strong><span>Test · 15%</span></div>
</div>

Playlists are partitioned in dataset order. Validation uses a fixed **10,000-playlist subset** every two epochs; final ranking uses **150,000 test playlists**. Observed tracks and padding are excluded from candidate scoring.

## Choose the retriever from evidence

We compared **Two-Tower** (contrastive learning), **Track2Vec** (skip-gram co-occurrence) and **ALS** (matrix factorization). ALS offered the strongest practical starting point under our compute budget.

<figure>
  <a href="/media/music-recommendation/retrieval-benchmark.svg" aria-label="Enlarge the comparison of retrieval models">
    <picture><source media="(max-width: 600px)" srcset="/media/music-recommendation/retrieval-benchmark-mobile.svg" /><img src="/media/music-recommendation/retrieval-benchmark.svg" width="900" height="440" loading="lazy" alt="Reported Recall at 100: Two-Tower 0.029, Track2Vec 0.128 and ALS 0.151. Recorded training times: about 10 hours, 6 hours and 8 minutes respectively." /></picture>
  </a>
  <figcaption>Exploratory runs · different compute budgets and test sizes: Track2Vec 12,800 playlists, ALS 150,000. <a href="/data/music-recommendation/retrieval-baselines.csv">Source values (CSV)</a>.</figcaption>
</figure>

## Test what the Transformer adds

SASRec fine-tunes ALS embeddings using next-track prediction, with hard and random negatives. We tested it over the full catalog and over **1,000 ALS candidates**.

<figure>
  <a href="/media/music-recommendation/scoring-modes.svg" aria-label="Enlarge the candidate-filter comparison">
    <picture><source media="(max-width: 600px)" srcset="/media/music-recommendation/scoring-modes-mobile.svg" /><img src="/media/music-recommendation/scoring-modes.svg" width="900" height="490" loading="lazy" alt="Recall at 100 is 0.151 for ALS, 0.070 for SASRec over the full catalog and 0.236 for ALS plus SASRec. NDCG at 10 is 0.018, 0.013 and 0.046 respectively." /></picture>
  </a>
  <figcaption>Report, Table 2 · 150,000 test playlists. <a href="/data/music-recommendation/scoring-modes.csv">Source values (CSV)</a>.</figcaption>
</figure>

**Recall@100 rises from 15.1% to 23.6%** with ALS + SASRec. The weaker full-catalog result shows why retrieval and ranking have separate roles. Candidate recall at 1,000 is approximately **40.7%**: a ranker cannot recover a missing target.

<details class="music-qualifications">
  <summary>Training check: lower loss does not always mean better ranking</summary>

<figure>
  <a href="/media/music-recommendation/training-diagnostics.svg" aria-label="Enlarge the training and validation curves">
    <picture><source media="(max-width: 600px)" srcset="/media/music-recommendation/training-diagnostics-mobile.svg" /><img src="/media/music-recommendation/training-diagnostics.svg" width="900" height="400" loading="lazy" alt="Between epochs 2 and 14, training loss falls from 3.36 to 2.79 while validation NDCG at 10 improves early and then levels off, with the highest exported value at epoch 8." /></picture>
  </a>
  <figcaption>Exported training history · validation NDCG@10 measured every two epochs on 10,000 playlists. <a href="/data/music-recommendation/train-history.csv">Source values (CSV)</a>.</figcaption>
</figure>

<p>Validation gains level off around epochs 6–8 while training loss keeps falling. Checkpoint selection uses validation NDCG@10, with early stopping after three evaluation checkpoints without improvement.</p>
</details>

## Analyze similarity and redundancy

MMR balances relevance against **cosine similarity in the learned embeddings**. Its diversity metric, **ILD**, is the mean pairwise cosine distance between recommended tracks.

<div class="music-formula"><span>MMR score</span><strong>λ × relevance − (1 − λ) × redundancy</strong><p>Redundancy is the highest similarity to an already-selected track.</p></div>

<figure>
  <a href="/media/music-recommendation/diversity-tradeoff.svg" aria-label="Enlarge the relevance and diversity tradeoff">
    <picture><source media="(max-width: 600px)" srcset="/media/music-recommendation/diversity-tradeoff-mobile.svg" /><img src="/media/music-recommendation/diversity-tradeoff.svg" width="900" height="470" loading="lazy" alt="Compared with the original top 20, lambda 0.7 loses 1.1 percent recall and gains 6.6 percent diversity; lambda 0.5 loses 4.3 percent recall and gains 17.5 percent diversity; lambda 0.3 loses 17.8 percent recall and gains 34.7 percent diversity." /></picture>
  </a>
  <figcaption>Exported λ sweep · 150,000 test playlists · 20 recommendations. Changes are relative to the raw top-20 baseline. <a href="/data/music-recommendation/lambda-sweep.csv">Sweep results (CSV)</a>.</figcaption>
</figure>

At **λ = 0.5**, diversity improves by **17.5%** for a **4.3% relative recall loss**. The demo defaults to **λ = 0.7** for a gentler tradeoff. This measures embedding diversity; audio features were unavailable.

## Make the system inspectable

A **Streamlit demo** connects the stages, checks catalog coverage and exposes list length and λ. The stack combines **implicit** for ALS, **PyTorch + Modal** for SASRec and **NumPy** for MMR. Tests cover masking, candidate selection, diversification and fallback behavior.

<details class="music-qualifications">
  <summary>See the original application</summary>

<figure>
  <a href="/media/music-recommendation/demo.webp" aria-label="Enlarge the Streamlit demo screenshot"><img src="/media/music-recommendation/demo.webp" width="1545" height="815" loading="lazy" alt="Original Streamlit presentation demo showing all three stages ready, a recommendation-count control, a diversity-weight slider and confirmation of ten input tracks." /></a>
  <figcaption>Original Streamlit application · recorded project demonstration, 10:20.</figcaption>
</figure>

</details>

<details class="music-qualifications">
  <summary>Evaluation limits and next checks</summary>
  <p>ALS uses full playlist prefixes; SASRec preprocessing truncates to 50 slots before withholding the target. Matching these contexts would better isolate model effects. The λ sweep uses the test split; tuning on validation data and keeping a fresh final test would strengthen selection.</p>
  <p>The available results are aggregate metrics from the reported runs. Repeated seeds, popularity and cold-start breakdowns, and listening studies would help assess generalization. Playlist order does not necessarily reflect listening order.</p>
</details>

[Read the final report (PDF)](/reports/music-recommendation-report.pdf)
