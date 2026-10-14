---
title: 'Multi-Stage Music Recommendation'
displayTitle: 'Multi-Stage Music Recommendation'
summary: 'A playlist continuation pipeline combining ALS retrieval, SASRec re-ranking and MMR diversification.'
order: 3
featured: true
categories: ['Machine learning', 'Recommendation']
technologies: ['Python', 'ALS', 'SASRec', 'Streamlit']
editorialStatus: 'draft'
video: '/media/music-recommendation.mp4'
scenePoster: /media/scene/music-recommendation.svg
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
---

## The engineering question

Continuing a playlist requires a system to find tracks that fit an existing listening context. A useful recommendation should be relevant to the playlist while avoiding an unnecessarily repetitive final selection. At catalog scale, the system also needs a practical way to narrow the search before applying a more expensive model.

This team project addresses those requirements with a staged architecture. Implicit-feedback ALS retrieves candidates, a SASRec-style Transformer ranks them using playlist order, and maximal marginal relevance adjusts the final selection for diversity. A Streamlit interface connects the models to a workflow in which a user supplies tracks and inspects the recommendations.

## My contribution

I implemented the project code within the team setting, connecting the recommendation stages and the application workflow. This includes the interface between the catalog mapping, learned model artifacts, candidate scores and the final ranked list. The surrounding logic matters because a model can only act on tracks that its vocabulary represents.

The application makes stage availability and catalog coverage explicit. If an optional artifact is absent, the interface can describe the resulting fallback. This helps a visitor understand which computation produced the recommendations. It also makes the system easier to demonstrate without confusing a retrieval-only output with the complete staged pipeline.

## Data and task definition

The project uses the Spotify Million Playlist Dataset. A playlist is treated as an ordered sequence, and the prediction task uses an observed context to recommend a held-out continuation. The catalog mapping connects Spotify track identifiers to the internal indices used by the models.

That mapping creates an operational boundary: a pasted track may exist on Spotify while remaining outside the local training catalog. The application checks coverage before inference. The same discipline is needed during evaluation, where unknown tracks, previously observed tracks and padding tokens should have clearly defined treatment.

## A staged recommendation architecture

The retrieval stage uses ALS embeddings learned from implicit playlist–track interactions. An observed playlist is represented by pooling its track embeddings, giving a query that can be scored against the catalog. This stage is designed to find plausible candidates efficiently; pooling does not preserve their order.

The SASRec-style model introduces sequence information through causal attention and positional representations. It scores the candidate set in the context of the observed playlist. The final MMR stage selects tracks greedily, balancing a relevance score against similarity to tracks already included.

| Stage          | Information used                  | Design tradeoff                                   |
| -------------- | --------------------------------- | ------------------------------------------------- |
| ALS retrieval  | Playlist–track co-occurrence      | Broad candidate coverage with a simple query      |
| SASRec ranking | Ordered playlist context          | More detailed scoring within retrieved candidates |
| MMR selection  | Relevance and pairwise similarity | Control over repetition in the final list         |

The candidate set places a ceiling on downstream recovery: a ranker cannot promote a relevant track that retrieval never supplied. Conversely, a model trained to rank candidates needs to be evaluated in that operating setting. These dependencies are why the complete pipeline deserves examination alongside its individual components.

## Evaluation approach

Ranking quality can be assessed with recall and discounted gain at specified cutoffs. Diversity introduces another view, such as the similarity among tracks in the final list. Each comparison needs the same held-out task, candidate policy and handling of observed tracks, so that the effect of a stage is interpretable.

The MMR weight exposes a useful tradeoff for analysis: increasing diversity can change the order and relevance of the selected tracks. A future result figure should show both quantities together. Looking only at a diversity score would leave the recommendation objective incomplete.

> **System note.** The interface reports which tracks are covered by the local catalog and which stages are active. Those states are part of the recommendation explanation, especially when optional artifacts are unavailable.

## Limitations and next evidence

Playlist order is a useful modeling signal, but it may not represent a complete listening session or a user's current intent. Catalog coverage, popularity effects and the definition of a relevant continuation also influence the task. Offline ranking metrics cannot establish whether a person would prefer the generated playlist.

The next evidence layer should connect a fixed evaluation protocol to stage comparisons and the relevance–diversity tradeoff. This portfolio currently presents the architecture and implementation choices. Numerical comparisons and an application demonstration will be added after the supporting artifacts are reviewed and prepared for presentation.
