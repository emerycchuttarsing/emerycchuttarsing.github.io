# Link prediction portfolio content review

Reviewed against the supplied report, local notebook and raw edge list on 2026-10-14. This page presents the existing project, not a new training run.

## Sources

- `/Users/emeryc/PDF des projets Berkeley/Network Optimization Project.pdf`: 24 pages. Main study pp. 1–4; baseline preprocessing and optimizer pp. 5–6; encoder, decoder and trainer code pp. 6–24. Tables 1–2 supply published metrics.
- `/Users/emeryc/Optimization 240 project/Gradient descent.ipynb`: seven cells, with full-batch NumPy baseline, saved loss checkpoints, test metrics and network/loss figures. The second local notebook is empty.
- `/Users/emeryc/Optimization 240 project/lastfm_asia_edges.csv`: 7,624 unique nodes and 27,806 undirected edges, density 2E/[N(N−1)] = 0.0009568849 (0.096% rounded).
- `/Users/emeryc/Optimization 240 project/loss_plot.png`: original baseline training curve, retained unchanged in the expandable evidence section.

## Claims and scope

- Portfolio attribution emphasizes the local NumPy implementation and a comparison in the joint report by Emery Chuttarsing and Chenyu Tang. It does not claim sole authorship of the neural model.
- Baseline: 10-dimensional vectors, summed squared error plus lambda times squared Frobenius norm, learning rate 0.01, regularization 0.01, 50 epochs. `np.add.at` accumulates the gradients at both endpoints, without materializing the full N×N adjacency reconstruction.
- Baseline: 22,244 training positives and 5,562 test positives; one sampled negative per positive yields 11,124 test pairs. Saved AUC = 0.8435, precision = 0.6061, recall = 0.9087, F1 = 0.7271.
- GCN configuration comes from report §4.2 and the appendix: three GCN layers, hidden/output width 256, dropout 0.2, Adam learning rate 0.001, weight decay 0.00005. Each edge uses `[z_i, z_j, z_i * z_j, abs(z_i-z_j)]`, hence 1,024 pair features, followed by an MLP logit. The decoder's number/width of hidden layers is not specified for the selected run and is not invented.
- Selected by validation AP. The appendix trainer supports early stopping and restoring the best checkpoint; these capabilities are not described as verified settings of the best run. Table 2 gives test AUC 0.9579, AP 0.9655, accuracy 0.9074, BCE 0.3303, on 5,560 balanced labeled pairs.
- Different test sizes prevent presenting the two AUCs as a controlled architecture ablation. No confidence intervals, seed averages, timing results or GCN training curves were supplied.
- The GCN's full feature preprocessing, split builder, selected checkpoint and run configuration were not found as a runnable local project. No input feature width or exact split ratios are asserted. The schematic graph input depicts neighbourhood aggregation, not a verified leakage-free split implementation.

## Interpretation checks

- Negative sampling in the baseline excludes only the supplied split's positives; it can label known edges from the other split as negatives. Correcting the experimental code is outside this portfolio-edit task. The page states the limitation and the stronger full-edge-set exclusion protocol.
- Random state 42 controls the positive split, but NumPy embedding initialization and negative draws are not seeded in the notebook.
- The objective is non-convex. The original plot shows a small loss rebound around epoch 35, despite the report describing monotonic convergence. The page avoids that claim and does not infer a global optimum or gradient correctness from the curve.
- Ten saved losses at epochs 0, 5, …, 45 are extracted exactly. No value at epoch 49/50 is inferred from the raster, and no missing points are reconstructed. Lines connect the observed checkpoints without smoothing.
- Applying sigmoid after squared-error fitting does not establish calibrated probabilities. The threshold sigmoid(score)>0.5 equals raw score>0; AUC is unchanged by this monotonic transformation. The page distinguishes ranking from classification.
- The graph is undirected but concatenating the two endpoint vectors makes the MLP input order-dependent unless symmetry is enforced elsewhere; this is a follow-up check, not an assertion about missing code.
- The introduction mentions SGD, but no SGD comparison is evidenced, so the page presents only full-batch GD and the GCN–MLP experiment.

## Visual provenance

- `neighbourhood.svg`: a real induced 13-node subgraph of original hub ID 7237 and its 12 highest-degree neighbours. The edge (290, 3240) is removed from the layout's visible-edge set and redrawn dashed solely to explain held-out link prediction. No model score or prediction is claimed. Node IDs differ from the notebook's remapped IDs. The exact subgraph is saved in `public/data/link-prediction/example-subgraph.json`.
- `architecture.svg` and mobile variant: explanatory diagrams, with schematic embedding cells. Show both the forward score and the optimization feedback.
- `auc.svg`: zero-based ROC-AUC bars from report Tables 1–2 with a random-ranking reference of 0.5. Different test counts are stated beside the chart.
- `convergence.svg`: exact numeric checkpoints from the notebook. Raw CSV is downloadable. Original curve available separately.
- Report and original PNG are copied unchanged. The downloadable Python file concatenates the original notebook code cells without modifying them; saved outputs are documented separately. Existing gallery media are preserved.

Regenerate with `python3 scripts/generate-link-prediction-figures.py` (NumPy and Matplotlib required). Only this project's page selects the new overview.
