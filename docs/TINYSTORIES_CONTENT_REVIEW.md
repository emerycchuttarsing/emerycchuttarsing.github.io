# TinyStories content review

Reviewed on 2026-10-14. Portfolio presentation of existing coursework; no retraining, new scores or reconstructed experimental data.

## Sources

- Primary homework: `/Users/emeryc/PDF des projets Berkeley/Transformer Project.pdf`, 4 pages. The copy in `public/reports/tinystories-homework.pdf` is unchanged. Its text matches `Downloads/Homework_CHAT_GPT2_242B-2.pdf`.
- Code: `/Users/emeryc/Desktop/242B Homework 3 /Transformer/` (`model.py`, `dataset.py`, `train.py`, `generate.py`, `traintokenizer.py`, `plot_perplexity.py`, `Proxim.py`, `count_token.py`). Code was read, not modified.
- Assignment context: `Downloads/HW3 IEOR 1242B.pdf`, decoder-only language-model homework requirements. Requirements are not evidence of completed implementation.

## What the page establishes

- A 3,000-token vocabulary is reported in the homework and set in tokenizer/model/training scripts. Context length and embedding dimension are 256 in the training code. Approx. one-hour training time is reported, not a fresh timing measurement.
- BPE preparation, shifted input/target samples, AdamW cross-entropy training with gradient norm cap 1, validation every 500 steps (up to 50 batches), temperature sampling, and embedding cosine probes are directly present in the scripts.
- The model architecture is explicitly labelled as the design described in the report. It is not represented as the architecture verified in the saved weights.
- A single short repetition excerpt is transcribed from p. 3. The multi-prompt viewer and embedding-neighbour display are omitted to concentrate on the architecture and scientific interpretation.
- Native SVG diagrams show symbolic token IDs selecting embedding rows, fixed position vectors, tensor shapes, tied input/output weights, Q/K/V projections, causal masks, concatenation, pre-norm and both residual paths. Shapes omit the batch dimension. The intended configuration is 5 blocks, 8 heads, model width 256, head width 32 and FFN width 384. Colored matrix cells are schematic, not saved weights.
- The 3K -> 5K vocabulary observation is reported qualitatively on p. 4. No controlled comparison, numerical gain or coherent-language claim is invented.

## Discrepancies and exclusions

1. `model.py` defines `TransformerDecoderOnly` twice. The second definition overrides the first and contains embeddings, sinusoidal positions, a tied output projection and TODOs for attention blocks. No `TransformerBlock` implementation exists in the supplied folder. The webpage labels the full Transformer diagram as report design and visibly directs readers to implementation notes. Header contributions do not assert that a complete Transformer was implemented.
2. `poids_modele.pth` and `tinystories_bpe.json` are macOS dataless placeholders. Reads did not return; inspection was stopped. No checkpoint keys, weight shapes or actual tokenizer output were verified. Files remain unchanged.
3. `plot_perplexity.py` hardcodes [250.5,120.3,85.1,60.4,45.8] and explicitly calls them fake/example values awaiting replacement. The corresponding PDF figure is excluded from the portfolio's experimental evidence. It is present only in the unchanged source download.
4. The original loss figure from PDF page 2 is retained, unmodified, alongside the loss analysis in the main page. No final loss or perplexity is inferred from raster pixels. Its initial value above 250 is far above ln(3000) ≈ 8.01 (uniform prediction), so the page explains that initialization/logit scale needs checking. This discrepancy alone is not proof of a logging error.
5. `generate.py` defaults to temperature 0.7 but its executable example calls 7. Report sample temperatures are unknown; the page does not attribute failures to temperature or training budget alone. No top-k/top-p sampler is claimed.
6. `dataset.py` uses overlapping stride-1 windows. `count_token.py` multiplies their count by context length, which counts exposures rather than distinct tokens. The report repeats the token count as sample count. These ambiguous totals are omitted; neither number is promoted as a verified dataset size.
7. Cosine neighbours include `dog` itself; the diagram removes only that self-match, leaving boy, cat, named, hairy, girl in reported order. It assigns no distances and avoids overclaiming clean semantic clusters. The puppy - dog + cat probe does not establish a kitten analogy.

## Assets and scope

- Homework first loss figure extracted losslessly with pypdf from page 2 into `public/media/tinystories/training-loss.png`.
- `scripts/generate-tinystories-figures.py` generates desktop and mobile tensor-flow/block diagrams and desktop/mobile mathematical confidence-versus-correctness illustrations. In the toy distribution, the maximum probability is 0.9 and each remaining probability is 1/30 over four tokens. Target B receives either 0.9 or 1/30: entropy is 0.434944 nats in both cases, while cross-entropy is 0.105361 or 3.401197. Bar labels show exact probabilities 0.9 and 1/30, totaling 1. The figure is explicitly not a measurement.
- The source of the attention formulation is Vaswani et al., https://arxiv.org/abs/1706.03762. Pre-norm and project-specific dimensions come from the homework and code configuration, not the original post-norm paper. PyTorch CrossEntropyLoss documentation supports logits-based training.
- The formulas distinguish target cross-entropy from predictive entropy. PPL is exp(mean token cross-entropy), using natural logs. The uniform 3,000-token reference is analytic, not an observed baseline. Predictive entropy was not logged in the homework.
- Project-list poster and gallery animation unchanged in this request.
- Generic page template only adds the TinyStories overview branch, navigation entries and scoped styles. Other project branches preserved.

## Validation

- Astro/TypeScript and static-build/link checks.
- Desktop and mobile browser inspection; responsive diagrams, evidence disclosures and no horizontal overflow.

## Checksums

- `Transformer Project.pdf`: `86f0c25910c54431f06037d90c59901918dc942f2aaa06c4dfb3f7b05f89f7dd`
- `model.py`: `5ecaefd91b200dc05fdb5e76e923d860e8437c1f19285ffc0669def71c5bb966`
- `plot_perplexity.py`: `48627d3aa0cf11d5ab7db2a33a74f91b8b63678bd4ee69a524de3c1d1d2dff2d`
- `training-loss.png`: `62b55d96741223e87815e64cd4afb6a531779ad1676eac7bdda71e35a748aee0`
