---
title: 'Retail Demand Forecasting'
displayTitle: 'Retail Demand Forecasting'
summary: 'A data-science case study for the startup AKO: turning retail transactions into monthly demand forecasts through exploratory analysis, lagged features and CatBoost.'
order: 7
featured: false
categories: ['Forecasting', 'Applied data science']
technologies:
  ['Python / pandas', 'CatBoost', 'scikit-learn', 'Matplotlib / seaborn']
editorialStatus: 'reviewed'
scenePoster: /media/scene/retail-forecasting.svg
scenePosterAlt: 'AKO retail demand planning: sales bars, a copper forecast curve and three store indicators. Illustrative values.'
sceneAnimation: retail-demand
poster:
  {
    'caption': 'Conceptual seasonal series and forecast interval. The band is decorative and does not represent estimated uncertainty.',
    'src': '/media/retail-forecasting.svg',
    'alt': 'Illustrative seasonal series and forecast interval; not actual forecasts.',
  }
accent: '#b9958b'
context: 'Case study for AKO · Retail forecasting startup'
role: 'Exploratory analysis, feature engineering & demand forecasting'
contributions:
  [
    'Prepared 11,986 transaction records and examined product, store and seasonal demand patterns.',
    'Built a shared CatBoost model using categorical context and within-series lagged features.',
    'Evaluated the saved experiment and exported 300 product–store–month forecasts.',
  ]
workflow:
  [
    {
      'title': 'Prepare monthly data',
      'description': 'Clean records and aggregate demand by product and store.',
    },
    {
      'title': 'Build predictors',
      'description': 'Combine lagged sales and contextual features for regression.',
    },
    {
      'title': 'Produce forecasts',
      'description': 'Generate future demand estimates and examine their assumptions.',
    },
  ]
---

## Connecting the model to a business decision

For AKO’s use case, the useful unit is **one product, in one store, for one month**. That granularity makes forecasts relevant to purchasing and allocation. The work connects data cleaning, exploratory analysis, feature engineering, model fitting and a structured output that can feed those decisions.

<details class="retail-evidence">
  <summary>Evaluation limits and implementation notes</summary>
  <p><strong>Time-aware evaluation.</strong> The saved 70/30 random split uses 1,365 training rows and 585 test rows. Adjacent months from the same series can appear on both sides. A stronger next step is rolling-origin evaluation: keep training target dates before each cutoff and compare with a seasonal-naive baseline.</p>
  <p><strong>Forecast horizon.</strong> The implementation predicts sales six months after each input row. The submitted January–June 2017 export uses July–December 2016 inputs. Forecasting all six horizons from one December cutoff would require an explicit multi-horizon setup.</p>
  <p><strong>Aggregation semantics.</strong> The notebook sums two industry-volume fields within each product–store month. The source data repeats the same market-level values across transaction rows, so these sums depend on transaction count. Preserving one market value per month would be a correction to test in a revised model.</p>
  <p><strong>Evidence.</strong> Metrics are transcribed from the saved notebook output, and forecasts come from the submitted CSV. No model was retrained for this page. Future actuals, prediction intervals and measured inventory improvements are unavailable; the graphs show point forecasts.</p>
</details>

<p class="retail-sources">Plotted data: <a href="/data/retail-forecasting/demand-history.csv" download>Monthly sales ↓</a> · <a href="/data/retail-forecasting/correlations.csv" download>Correlations ↓</a> · <a href="/data/retail-forecasting/forecast-examples.csv" download>Forecast examples ↓</a> · <a href="/data/retail-forecasting/saved-metrics.json" download>Saved metrics ↓</a></p>

<p class="retail-sources">Model reference: <a href="https://catboost.ai/docs/en/concepts/algorithm-main-stages">How CatBoost trains an ensemble</a> · <a href="https://catboost.ai/docs/en/concepts/python-reference_catboostregressor">CatBoostRegressor documentation</a>.</p>
