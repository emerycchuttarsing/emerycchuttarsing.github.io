---
title: 'Building a TinyStories Transformer'
displayTitle: 'TinyStories Transformer'
summary: 'An end-to-end language modeling project, from tokenization to Transformer training and text generation.'
order: 4
featured: false
categories: ['Machine learning', 'Language modeling']
technologies: ['Python', 'PyTorch', 'BPE']
editorialStatus: 'draft'
scenePoster: /media/scene/tinystories-transformer.svg
poster:
  {
    'caption': 'Conceptual tokens and attention matrix. The cells do not display attention weights from a trained model.',
    'src': '/media/tinystories-transformer.svg',
    'alt': 'Illustrative tokens and attention matrix; not measured model attention.',
  }
accent: '#a698bd'
context: 'UC Berkeley · INDENG 242B · Individual language-modeling project'
role: 'Tokenizer, model and training-pipeline implementation'
contributions:
  [
    'Connected TinyStories preparation and BPE tokenization to the language-modeling pipeline.',
    'Implemented a causal Transformer, training workflow and autoregressive generation.',
    'Examined learning diagnostics and the readability of generated text.',
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

## The engineering question

Building a small language model brings several ideas into one working system: a representation of text, a neural architecture, a training objective and a procedure for producing new sequences. This individual coursework project uses TinyStories to make those connections concrete.

The focus is on understanding the pipeline and its failure modes. Short stories offer recognizable structure, so generated examples can reveal problems that a loss value alone would leave difficult to interpret.

## My contribution

I implemented the project workflow from text preparation to autoregressive generation. The work includes BPE tokenization, a decoder-style Transformer, training scripts and diagnostics for validation loss and perplexity. I also explored vocabulary choices and inspected the resulting text.

Keeping tokenization connected to generation is essential. The same vocabulary and conventions must be used when preparing data, training the model and decoding its output.

## Model and data flow

BPE represents text through reusable subword units. The decoder receives token sequences and learns to predict their continuation through causal attention, which restricts each position to the context available before its prediction.

During generation, a prompt becomes the initial context. The model predicts a next token, the sequence grows, and the process repeats. Small errors can therefore accumulate across a continuation. Inspecting the decoded text helps connect token-level behavior with sentence structure and narrative consistency.

## Evaluation approach

Validation loss and perplexity provide a view of next-token prediction on held-out text. Generated examples provide a complementary qualitative view: readable tokens, local grammar, repetition and the ability to maintain a story's subject.

> **Reading note.** A fluent fragment does not establish sustained narrative coherence. Examples should include typical failures as well as readable continuations.

## Limitations and next evidence

The model and training budget constrain what can be learned from the corpus. Vocabulary changes also alter sequence length and the prediction task, which complicates direct comparisons. A future evidence package should pair a fixed evaluation setup with learning curves and representative generations. This provisional study describes the implemented workflow without claiming a measured quality improvement.
