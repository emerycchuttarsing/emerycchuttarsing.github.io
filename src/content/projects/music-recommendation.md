---
title: 'Multi-Stage Music Recommendation'
summary: 'A playlist continuation pipeline combining ALS retrieval, SASRec re-ranking and MMR diversification.'
order: 3
featured: true
categories: ['Machine learning', 'Recommendation']
technologies: ['Python', 'ALS', 'SASRec', 'Streamlit']
editorialStatus: 'draft'
poster:
  {
    'src': '/media/project-placeholder.svg',
    'alt': 'Illustrative abstract curves; not experimental results.',
  }
accent: '#96b495'
---

## Engineering question

How can a recommendation pipeline balance relevance and diversity when extending a playlist?

## Approach

ALS retrieves candidate tracks, a SASRec-style Transformer re-ranks them using playlist context, and MMR controls the final relevance–diversity tradeoff. A Streamlit application exposes the recommendation workflow.

## Evaluation to present

The full study will document the dataset split, ranking metrics, catalog coverage and diversity comparisons. An application preview and verified results will accompany the pipeline explanation.
