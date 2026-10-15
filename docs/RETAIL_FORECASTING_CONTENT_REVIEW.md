# Retail Demand Forecasting — AKO source review

Reviewed 2026-10-15. This page presents the user's completed data-science case study for the startup AKO. The client context is prominent; the fictional retailer FashionDrink remains clearly identified. No claim of employment, production deployment or measured inventory savings is made.

## Sources and scope

- `/Users/emeryc/Case AKO /data_science_input.ipynb`: brief, submitted implementation, saved EDA plots and evaluation. Cell references below are zero-based.
- `input.csv`: 11,986 transaction rows, January 2013–December 2016.
- `Output_chuttarsing.csv`: 300 finite, unique product–store–month point forecasts for January–June 2017. The extra saved pandas index is not a feature.
- `output.csv`: unfilled 300-row submission template; no future actuals.
- `catboost_info/learn_error.tsv`: 500 training RMSE observations. These are training errors, not a validation trajectory, and are not used as forecast-performance evidence on the page.
- No separate retail PDF was found in the supplied project/document directories. The notebook contains both the brief and the analysis. No notebook instructions to contact people or publish a private repository are executed.

## Business context

Notebook cells 1–2 describe AKO's focus on granular retail demand forecasting and purchasing/allocation/replenishment recommendations. FashionDrink is explicitly fictional: five beverage products, ten US stores and a request for the first six months of 2017. The user's explicit request identifies AKO as a startup. The large AKO lettering is a typographic project label, not a claim to reproduce an official logo.

## Preparation and EDA

- Each of the 50 product–store pairs has 48 observed months: 2,400 monthly rows. No monthly gaps occur in this input. There are 4,787 empty MonthEvents fields; these become an empty event set. Ten distinct event tokens become binary indicators. Other source fields are populated.
- Sales are summed by store, product and calendar month. Mean pre-discount price minus mean discount gives mean selling price; the identity holds on every input row. Temperature uses the monthly mean. Event flags use a maximum.
- Boxplots and source-row inspection in cells 18–19 investigate low prices and unusually high sales; those values are retained. The portfolio does not claim systematic winsorization or automatic removal.
- Cells 21–23 compare product trajectories, event timing and store patterns. The plotted data export sums actual monthly sales across stores for each product.
- Cell 25 computes product-specific Pearson correlations over 48 months, using total sales and mean temperature/price across stores. The new two-column heatmap reproduces that subset: temperature r = .5265/.6698/.4704/.0919/.2128, price r = −.1731/.1805/.1011/−.4978/−.2841. Values shown are rounded to two decimals.
- The notebook's broad prose about an absence of price correlation is not copied: Flavour 04 has r ≈ −.50. These are observational aggregated associations, not elasticity estimates or causal effects. No feature-importance or ablation claim is added.

## Model and temporal alignment

- Cell 29 constructs 1-, 2- and 3-row lags of four variables within each product–store series: sales, discount, leader volume and industry volume. The source monthly groups are chronologically sorted and complete, so the shifts correspond to months in this dataset. The target is SalesVolume.shift(-6).
- 32 model inputs: 19 non-date columns in the monthly frame, 12 lags and one source-month string. Store, Article and month_num are passed as categorical features. Demographic fields present in the raw CSV are not merged into this model.
- Removing three unavailable initial lag rows and six unavailable terminal targets leaves 39 rows per series, 1,950 total. The notebook's random 70/30 split with random_state=42 gives 1,365 training and 585 test rows.
- Cell 30 configures CatBoostRegressor(iterations=500, depth=6, learning_rate=.1, loss_function='RMSE'). One model pools all series. There is no documented model comparison, tuning sweep, early stopping or chronological holdout to claim.
- The diagram shows schematic decision trees, not recovered fitted splits. Its feedback arrow denotes successive boosting updates from training errors. It does not imply a neural network, recursive forecast, or online retraining.
- Cells 32–34 apply that fixed +6-month model to July–December 2016 feature rows and advance their output dates by six months. This is not a six-horizon model with all forecasts issued from the same December 2016 origin. Page examples and the expanded notes make this distinction explicit.

## Saved results and limits

- Cell 31 reports RMSE 1,013.10, R² .93 and WAPE 13.25%, rounded in notebook output. The page labels these as saved random-split metrics, with the temporal limitation immediately adjacent.
- There is no saved fitted model or vector of test predictions supplied. No matching model retrain or recomputation of these test metrics is claimed.
- Adjacent months can occur on both sides of the random split. A future evaluation should enforce target dates before each training cutoff and compare against a seasonal-naive baseline. This is a proposed improvement, not completed work.
- The two market-volume fields each have exactly one distinct value per calendar month across all raw transactions. Summing those repeated values within product–store groups introduces transaction-count dependence. The existing code does this; the page records it as an aggregation correction for a revised model rather than silently presenting it as sound market aggregation.
- Charts use the same three examples as notebook cells 37–39: New York / Flavour 03, Phoenix / Flavour 01 and Seattle / Flavour 02. These stores are the three largest by total 2016 sales. We do not claim the final notebook visualized two top-2015 products per store, as the original brief requested; it actually plotted these three examples.
- Forecast charts show 2016 actual monthly totals and six saved 2017 predictions each, on common 0–25,000 axes (the largest observed point is 22,526.11). Forecast shading indicates the forecast period only. No confidence interval or future ground truth is invented.

## Assets and verification

- `scripts/generate-retail-figures.py --source '/path/to/Case AKO '` rebuilds curated CSVs from the source data and extracts the saved metrics from notebook cell 31. Without --source it regenerates the visuals from the curated exports. It performs no model fitting.
- `demand-history.csv`: 48 monthly rows × five product totals. `correlations.csv`: five product-wise associations. `forecast-examples.csv`: 54 plotted observations/predictions. `saved-metrics.json`: saved scores, configuration and split provenance.
- The input CSV, recruitment brief, contact details and full notebook are not published as site assets. The case-study figures retain the measured results described above.
- General descriptions of CatBoost checked against the official [training overview](https://catboost.ai/docs/en/concepts/algorithm-main-stages) and [CatBoostRegressor reference](https://catboost.ai/docs/en/concepts/python-reference_catboostregressor); both are linked on the page.

## Animated gallery artwork

- Original canvas animation: an AKO wordmark, sales bars, a copper forecast line, and three store-level demand indicators. Values are procedural and illustrative; they do not represent saved predictions, live stock or measured business outcomes. The preview caption and poster description make this distinction.
- New York, Phoenix and Seattle match the cities illustrated in the case study. The animation does not claim deployed purchasing or online model updates.
- Shared vector primitives generate both the animation and its static SVG fallback. Important content stays within the central portrait crop.
- The animation runs while its project row is hovered, or automatically while its preview is open and visible, independently of pointer position. It follows the existing global pause, page visibility and reduced-motion behavior. A 60 Hz cap keeps speed consistent across refresh rates; paused time is not advanced when playback resumes.
- Verify with `node scripts/check-retail-animation.mjs`; regenerate the still with `node scripts/generate-retail-poster.mjs`.
