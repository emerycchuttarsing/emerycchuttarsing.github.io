# Visual Learning & Image Analysis — source review

Reviewed 2026-10-15. This is a presentation of the existing joint project, not a new experiment. The page emphasizes EDA, feature engineering, model selection, handling imbalance and critical evaluation.

## Sources

- `/Users/emeryc/PDF des projets Berkeley/Data 200 Satellite Image Computrer Vision /Final Project Report.pdf`, 10 pages, by Xuanmian He, Emeryc Chuttarsing and Zhongling Zhao.
- `presentation.pdf` in the same folder, 22 pages. Especially slides 11–18: descriptors, correlations, model selection and damage validation.
- `/Users/emeryc/Grad Project Data 100/EDA.ipynb`: global EDA, distributions and 14-feature exploration.
- `/Users/emeryc/Grad Project Data 100/Milestone 3.ipynb`: exploratory classifiers and final 25-feature damage experiment. Cell numbering below is zero-based.
- `feature_utils.py`: RGB-to-grayscale, Sobel and uniform LBP (radius 3 in the selected extraction, 24 neighbours).
- `cv_eda_starter.ipynb`: saved original satellite scene and its corresponding Sobel/LBP outputs, cells 8, 16 and 18.
- Three event `train_labels.npy` arrays: 200 labels each. Hurricane Matthew counts 31/70/6/93; SoCal fire 64/2/1/133; Midwest flooding 155/6/6/33.

## Selected experiments

- Task A uses 400 flood/fire images and binary logistic regression with L2. Report §3.1 supplies 3 RGB means, 9 local Sobel means (3×3) and 12 local LBP quartiles (2×2): 24 inputs. Report Table 2 supplies five validation accuracies 1/.9875/.9875/1/.975, mean .99. This is validation performance on these event datasets, not an independent external test. The supplied local Task A modeling starter is mostly empty; no independent rerun is claimed. Scaling is specified only for Task B.
- Task B uses the Hurricane Matthew subset. `target_disaster=0` is Hurricane despite stale Midwest comments. Do not copy those comments into portfolio claims.
- Milestone cell 17 implements 9 RGB quartiles + 4 Sobel means + 12 LBP quartiles = 25 features. Comments saying 28 are stale; arithmetic and cell 21 output confirm 25.
- Cell 19 stratifies 160/40 with random_state=42. It horizontally flips only class 2, adding five images and yielding 165 training images. StandardScaler fits training only. The initial weighted classifier has class weights 2.8/1.3/10/1 and C=1; its saved macro-F1 .4251 and weighted F1 .60 match report Table 3 per-class figures.
- Cell 20 tunes C=.01/.1/1/10/100 with StratifiedKFold(5, shuffle=True, random_state=42), a StandardScaler→LogisticRegression pipeline, class weights 2.8/1.3/13/1 and macro-F1 scoring. Saved train values .520/.616/.644/.695/.751; validation .420/.533/.480/.518/.524. Selected C=.1.
- Final cell 20 test output: macro-F1 .4026; rounded weighted F1 .57; accuracy .50; four per-class F1 scores .43/.45/0/.73 with supports 6/14/1/19. Raw predictions absent, so displayed per-class figures use saved rounded values without inventing precision.
- Report and slides summarize weighted F1 as .55, which does not match the final saved output; report Table 3 corresponds to the earlier run. The main page uses final notebook metrics with an expandable explanation. Never combine report headline and notebook class-level scores as if one run.
- Ordinal and Random Forest experiments precede the weighted multinomial choice. Several report/slide conclusions retain an ordinal-model label; current code and modeling sections resolve this. No claim is made that ordinal regression mathematically requires equal visual distances.

## Interpretation and experimental limits

- Outer test split precedes augmentation. However, cell 20 cross-validates an already augmented training set. Flipped images and originals may be separated into folds. Scaling is correctly fit within folds, but this does not eliminate augmentation leakage. The page notes fold-local augmentation or grouping as the stronger protocol.
- Hyperparameter selection is not nested CV; validation maximum is a tuning result. Reported event classification is not evidence of new-event/geography generalization.
- Only six major-damage images occur in the hurricane data; test includes one, so zero class F1 is an observation, not a reliable population estimate.
- Correlation matrix shown comes from the 25-feature Hurricane analysis, cell 21 and slide 16. Red/green lower-quartile correlation .95 is legible in the source. No feature-pruning or ablation improvement is claimed. Blank matrix cells reflect an undefined correlation for a constant LBP feature.
- EDA's separately labeled RGB-vs-damage correlation code uses columns 0/1/2 of a vector ordered by red quartiles. Those labels are inconsistent; that figure is not used.
- Raw .npz imagery is absent locally, so no full training rerun is possible. Saved output panels are used as supplied. The downloaded PDFs are unchanged.
- General Sobel and LBP explanations checked against official scikit-image documentation; C inverse-regularization interpretation checked against scikit-learn LogisticRegression docs. These are linked on page.

## Visual provenance and regeneration

- `satellite.png`, `edges.png`, `texture.png`: crops (10,29)-(380,399) of the three matching 389×409 notebook outputs, removing only figure title/margins. Browser displays identical crops. These are real saved feature visualizations, not generated satellite scenes or predicted masks.
- `correlation.png`: unmodified PNG output from Milestone cell 21.
- Pixel-strip / smooth-versus-pattern swatches are explicitly explanatory CSS illustrations, not data.
- `pipeline.svg` and mobile variant: conceptual flow of fixed image features, classifier and training feedback. No CNN or learned image encoder is implied. Feature scaling is labeled Task B only.
- `damage-validation.svg` and `damage-class-f1.svg`: regenerated with Matplotlib from CSV files storing saved metrics. Validation lines connect tested settings, with no smoothing. Axes span 0–1. Class support displayed beside F1.
- `disaster-cv.csv` transcribes report Table 2. `damage-label-counts.csv` records observed label-array counts. `damage-test.csv` and `damage-validation.csv` transcribe cell 20 outputs.
- Regenerate charts/diagrams with `python3 scripts/generate-visual-learning-figures.py` (NumPy and Matplotlib). No training run is performed.

## Gallery animation

- The 2×2 mosaic uses four quadrants of the same saved 370×370 satellite scene, with exactly matching crops of its Sobel and LBP outputs. It does not imply four independent samples or display predicted damage masks.
- Each tile cycles original → edges → texture every 1.8 seconds, including a 1.08-second smooth crossfade. Four phase offsets keep the tiles out of sync. Rendering is capped at 60 fps, runs only on hover and freezes when motion is paused, the page is hidden or the panel leaves view. Reduced-motion and image-load failures retain a static poster.
- The gallery-only edge map has a 3.2× display gain and muted green tint; LBP uses a subdued green-gray palette. These are display treatments of the saved outputs. Original case-study images and numerical feature values are untouched.
- `node scripts/generate-vision-poster.mjs` regenerates the static WebP poster and two tinted maps from the existing case-study images. The poster uses the animation's shared layout and initial phases.
