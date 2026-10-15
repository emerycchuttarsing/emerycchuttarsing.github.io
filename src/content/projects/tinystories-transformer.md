---
title: 'TinyStories Transformer'
displayTitle: 'TinyStories Transformer'
summary: 'A small language-modeling study on TinyStories: token representations, causal attention and a critical reading of cross-entropy, perplexity and generated text.'
order: 6
featured: false
categories: ['Machine learning', 'Language modeling']
technologies: ['Python', 'PyTorch', 'Hugging Face Tokenizers', 'Matplotlib']
editorialStatus: 'reviewed'
scenePoster: /media/scene/tinystories-transformer.svg
scenePosterAlt: 'Simple story words in an illustrative 3D embedding space, with dog near cat and cat near whiskers.'
sceneAnimation: embedding-space
poster:
  {
    'caption': 'Conceptual tokens and attention matrix. The cells do not display attention weights from a trained model.',
    'src': '/media/tinystories-transformer.svg',
    'alt': 'Illustrative tokens and attention matrix; not measured model attention.',
  }
accent: '#a698bd'
context: 'UC Berkeley · INDENG 242B · Individual language-modeling project'
role: 'Language-modeling pipeline and experimental analysis'
contributions:
  [
    'Built BPE preprocessing and next-token training / sampling scripts.',
    'Studied causal attention, positional encoding and tied embeddings.',
    'Analysed loss diagnostics and the limits of generated text.',
  ]
workflow:
  [
    {
      'title': 'Tokenize stories',
      'description': 'Turn text into a vocabulary of reusable subword units.',
    },
    {
      'title': 'Train the decoder',
      'description': 'Learn next-token predictions with causal attention.',
    },
    {
      'title': 'Read generations',
      'description': 'Inspect sampled continuations alongside validation diagnostics.',
    },
  ]
---

## Experimental interpretation

The homework reports fewer word fragments with **5,000 rather than 3,000 BPE tokens**, but weak grammar remained. This is qualitative: changing the tokenizer also changes the prediction units, so raw loss or perplexity alone cannot establish which vocabulary is better.

<details class="tiny-evidence" id="implementation-evidence">
  <summary>Implementation and evidence limits</summary>
  <p><strong>Design versus executable model.</strong> The report describes pre-norm Transformer blocks. The training configuration specifies 5 layers, 8 heads and width 256; the feed-forward default is 384. However, a second class definition in <code>model.py</code> replaces the Transformer with embeddings, positional encoding and a tied output projection. The saved weights could not be inspected, so the reported curve cannot be attributed to the complete architecture.</p>
  <p><strong>Diagnostics.</strong> The perplexity plotting script contains placeholder values, not verified measurements. Predictive entropy was not recorded. Generation uses temperature sampling, with 0.7 as the function default but 7 in the example call; the report does not specify its sampling settings. These differences prevent a controlled explanation of the generation failures.</p>
</details>

<p class="tiny-sources"><strong>Tools:</strong> PyTorch for training, Hugging Face Tokenizers for BPE, Matplotlib for diagnostics.<br /><a href="/reports/tinystories-homework.pdf">Original homework ↗</a> · <a href="https://arxiv.org/abs/1706.03762">Attention formulation ↗</a> · <a href="https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html">Cross-entropy objective ↗</a></p>
