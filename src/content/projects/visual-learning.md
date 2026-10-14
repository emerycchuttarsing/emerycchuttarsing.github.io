---
title: 'Visual Learning & Image Analysis'
displayTitle: 'Visual Learning & Image Analysis'
summary: 'Exploring satellite imagery, image representations and classification for disaster and damage analysis.'
order: 6
featured: false
categories: ['Computer vision', 'Data science']
technologies: ['Python', 'Image analysis', 'Classification']
editorialStatus: 'draft'
scenePoster: /media/scene/visual-learning.svg
poster:
  {
    'caption': 'Conceptual image tiles and feature regions. These are original illustrations, not satellite samples or model outputs.',
    'src': '/media/visual-learning.svg',
    'alt': 'Illustrative image tiles and feature patterns; not model outputs.',
  }
accent: '#92aaad'
context: 'Data 100 · Satellite-imagery and computer-vision project'
role: 'Feature engineering, exploratory analysis and classifier implementation'
contributions:
  [
    'Explored satellite imagery and labels across disaster contexts.',
    'Constructed image representations using gradients, texture and color information.',
    'Compared classification approaches and examined class-sensitive evaluation.',
  ]
workflow:
  [
    {
      'title': 'Inspect the imagery',
      'description': 'Connect images, disaster context and damage labels.',
    },
    {
      'title': 'Extract features',
      'description': 'Represent visual patterns with explicit image descriptors.',
    },
    {
      'title': 'Classify and inspect',
      'description': 'Compare predictions and errors across the available classes.',
    },
  ]
---

## The practical question

Satellite imagery can help describe the effects of a disaster, but translating pixels into damage categories requires choices about representation and evaluation. This project explores those choices using imagery associated with different disaster contexts.

The work focuses on an inspectable image-analysis pipeline: understand the images and labels, construct features, fit classifiers and examine the kinds of mistakes they make.

## My contribution

I implemented exploratory analyses, image-feature extraction and classification experiments. The notebooks explore gradient, texture and color information, including Sobel-derived features, local binary patterns and related descriptor combinations. The modeling work includes logistic, ordinal and ensemble classification approaches.

These representations make it possible to reason about what information is retained before fitting a classifier. They also expose limitations when visual differences are subtle or depend on context outside an image crop.

## From pixels to predictions

Images and labels are prepared together so that transformations preserve their correspondence. Feature extraction turns each image into a numeric representation. Scaling and model fitting then connect those representations to the classification task.

The notebooks explore several descriptor combinations and augmentation choices. Each choice changes the information presented to the model, so a comparison needs consistent treatment of preprocessing and the evaluation samples.

## Evaluation approach

Class-sensitive measures, confusion patterns and example predictions provide complementary views of the model. Overall accuracy alone can obscure poor behavior on less common damage categories.

> **Evaluation note.** Nearby images and images from the same event can share visual conditions. A stronger test of transfer should examine separation by event or geography, alongside the label distribution.

## Limitations and next evidence

Damage labels summarize complex scenes, and a visual descriptor may respond to lighting, background or acquisition conditions as well as damage. Class imbalance and variation between events further complicate interpretation.

A future evidence package should connect representative images to the feature pipeline, class-level evaluation and failure examples. The current illustrations are conceptual; they make no claim to display actual imagery or model predictions.
