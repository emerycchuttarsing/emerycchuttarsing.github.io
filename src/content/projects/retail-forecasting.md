---
title: 'Retail Demand Forecasting'
displayTitle: 'Retail Demand Forecasting'
summary: 'A retail forecasting case study connecting product and store demand to temporal validation and business interpretation.'
order: 7
featured: false
categories: ['Forecasting', 'Applied data science']
technologies: ['Python', 'Time series', 'Data analysis']
editorialStatus: 'draft'
scenePoster: /media/scene/retail-forecasting.svg
poster:
  {
    'caption': 'Conceptual seasonal series and forecast interval. The band is decorative and does not represent estimated uncertainty.',
    'src': '/media/retail-forecasting.svg',
    'alt': 'Illustrative seasonal series and forecast interval; not actual forecasts.',
  }
accent: '#b9958b'
context: 'AKO data-science case study · Fictional retail setting'
role: 'Data preparation, feature engineering and forecasting implementation'
contributions:
  [
    'Prepared transaction records for monthly analysis by product and store.',
    'Constructed lagged predictors and connected them to a CatBoost regression model.',
    'Produced a forecast-output workflow and identified evaluation assumptions to revisit.',
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

## The business question

Demand forecasts support purchasing, allocation and replenishment decisions. In this fictional retail case, the task is to estimate future monthly sales for products across several stores. The useful output is a forecast at the same product–store granularity as those decisions.

The case connects data preparation, exploratory analysis and regression modeling, with particular attention to the time relationship between a predictor and its target.

## My contribution

I implemented the preparation and modeling workflow in the case-study notebook. The work includes cleaning transaction records, aggregating monthly information, constructing predictors and fitting a CatBoost regressor. It also connects the fitted model to the required forecast-output structure.

The case uses product and store context alongside sales history and commercial variables. Handling those fields consistently is necessary to make the same transformations available when producing future predictions.

## Method and assumptions

The notebook constructs lagged features within product–store series and aligns them with a future sales target. CatBoost provides a way to combine numeric predictors with categorical identifiers. Feature availability at the forecast date remains a central assumption: a contextual value that is observed later cannot automatically be treated as known when the forecast is issued.

The current notebook uses a random train/test split. That implementation choice is part of the provisional study and needs to be reconsidered before making claims about future-period forecasting quality.

## Evaluation approach

A stronger evaluation would move the cutoff forward through time, rebuild features using only available history and compare forecasts with a simple seasonal baseline. Errors should be examined by horizon, product and store, because aggregate summaries can hide important differences.

## Limitations and next evidence

Target alignment, missing months and the availability of external predictors can affect the validity of a forecast. The current workflow also needs a clearer distinction between a point prediction and an uncertainty estimate.

Future figures should pair a documented temporal split with actual predictions and error analysis. The poster remains an illustration: its interval is not an estimated confidence band, and no business improvement is claimed here.
