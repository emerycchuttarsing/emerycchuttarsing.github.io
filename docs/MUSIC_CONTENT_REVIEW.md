# Music recommendation content review

Reviewed on 2026-10-14. This portfolio presents the existing project; no models were retrained and no new experimental scores were produced.

## Sources and scope

- Final report: `/Users/emeryc/Downloads/242B_final_project.pdf`, eight pages, especially Tables 1–3 and appendices. Copied unchanged to the public report download.
- Local report source: `report.tex` in `/Users/emeryc/242B Final Project Final/242B_final_project`. The PDF omits the abstract present in this source; reported tables agree.
- Recorded presentation: `/Users/emeryc/Downloads/242B Final Project Presentation .mov`, 13:08. Inspected slide/contact-sheet views and the application demonstration. The webpage uses a crop from 10:20, not a reconstruction of the UI.
- Implementation: the current workspace's Stage 1 ALS training/evaluation, Stage 2 SASRec/preprocessing/training/evaluation, Stage 3 MMR and Stage 4 integration/analysis. Remote source link matches `git remote -v`: https://github.com/idrisalami/242B_final_project.
- Original CSV exports: `stage_4/analysis_exports/{stage_comparison,train_history,lambda_sweep}.csv`, copied byte for byte. These exports combine saved experiment artifacts and documented baseline values; they are not per-playlist observations.
- `stage_1/STAGE_1_SUMMARY.md` supplies exploratory-run qualifications omitted from the report table.

## Editorial decisions

- Shortened after reader feedback: keep the three-stage overview, protocol and key result charts in the main reading flow. Training diagnostics, the original demo and evaluation qualifications remain available in expandable sections.

- Explain ALS, SASRec and MMR separately: collaborative co-occurrence, sequence-aware ranking, then greedy diversity selection. MMR is not another trained neural network. The schematic matrix, token sequence and shortlist are conceptual, with no invented empirical coefficients.
- Explain Two-Tower and Track2Vec as evaluated exploratory alternatives, rather than omitting unsuccessful approaches.
- Show the 700K/150K/150K playlist split, final-track target, observed-track masking and the fixed 10K validation subset. Split order follows the input dataset; do not call it a random or chronological holdout.
- Keep causal attention and PAD candidate masking distinct: the supplied SASRec code deliberately does not pass the padding mask into attention.
- Pipeline R@100 is 0.236 and NDCG@10 is 0.046; full-catalog SASRec is 0.070 and 0.013. Show the candidate-filter comparison explicitly. Do not present its improvement as a pure causal estimate of order information.
- Keep gallery media unchanged in this request. This case-study component replaces only the generic explanatory-page poster and workflow cards for the music project.

## Source discrepancies / qualifications

1. The report's Table 1 caption claims all neural baselines are 5–7× worse. This does not hold for Track2Vec. Do not repeat it. The Stage 1 summary says Track2Vec used 12,800 test playlists, versus 150K for ALS; the Two-Tower test sample size is not specified. Training times are approximate run records, not hardware-controlled speed comparisons.
2. The report text says validation peaked at epoch 6. The exported precise history peaks at epoch 8 (NDCG@10 0.04892070689708405, vs 0.04850254610088512 at epoch 6). The plot follows the export and says 'highest exported value', without asserting which checkpoint artifact was used. Early stopping after epoch 14 is consistent with an epoch-8 peak and the checked code.
3. ALS evaluation uses the full prefix, while Stage 2 candidates are cached after truncating to 50 slots and withholding the final track. This changes the context; a matched-context comparison would better isolate model effects. The approx. 0.407 candidate ceiling comes from the report, not a fresh recomputation.
4. The MMR sweep is evaluated on the test set. Do not describe lambda as independently validation-tuned or the sweep as an untouched final test after selection. The application defaults to 0.7; 0.5 is the report's highlighted setting.
5. MMR measures cosine similarity in learned embeddings. Audio-feature data were unavailable; tempo, energy, mood, artist diversity and Pearson/Spearman correlation analyses are not established by these materials. No correlation matrix, significance test or per-playlist uncertainty is fabricated. The user has been asked whether a separate correlation-analysis document exists.
6. The exported MMR relative changes retain their original precision, including artifact baseline values that differ slightly from the report's rounded 0.1186 / 0.3682. The displayed deltas round to -4.3% recall and +17.5% ILD for lambda 0.5.
7. The source checkout lacks large model/data artifacts and some excluded data-loading modules. Its existence is not presented as a freshly runnable/live portfolio demo. The screenshot comes from the actual recorded presentation. No Spotify credentials or live account access were used.

## Visuals and attribution

- `generate-music-figures.py` redraws four figures, each with a compact variant. Inputs are the public CSVs; bar axes start at zero. Training curves connect only the seven exported observations. No interpolated points, uncertainty bands or new benchmark runs are claimed.
- `retrieval-baselines.csv` transcribes final report Table 1, with evaluation-scope notes from Stage 1's summary.
- `scoring-modes.csv` transcribes final report Table 2. Original stage-comparison export is separately retained unchanged.
- `demo.webp`: original presentation frame at 620 seconds, cropped from (185,145) to (1730,960), with no reconstruction of displayed results.
- Spotify logo: unchanged `Full_Logo_Green_RGB.svg` from the official package https://developer.spotify.com/images/guidelines/design/2024-spotify-full-logo.zip. Source guidance: https://developer.spotify.com/documentation/design. Displayed with its wordmark on black, separated from competing graphics; context identifies a Berkeley team project using the dataset.

## Reproduce figures

```sh
python3 scripts/generate-music-figures.py
```

## Source checksums

- `242B_final_project.pdf`: `16665e5ea548a53761aa813ef0c01d6ff5c64b9274b948531313eaf84efcef48`
- `report.tex`: `6dfb449d19c3588d99de49f867bd146e2472864c0578c63a2d318b13837b514a`
- `train_history.csv`: `ec83480ee985815ae34b41798460d8f105bfb3ccdb816f60be3d0486175e41c2`
- `lambda_sweep.csv`: `58b335f1716361ad580a0ac4e62adb4576d4441bc65599aeb5f978477eacd036`
- `stage_comparison.csv`: `9f4d8293e6b34a171a36b4298cb1d45e8eda9b0c473be45d48617ca9d7129237`
