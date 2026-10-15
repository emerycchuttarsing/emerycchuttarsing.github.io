# Deep hedging portfolio content review

Reviewed against the user-supplied report and implementation on 2026-10-14.
This is a concise case study of the existing experiment, not a new training run.

## Sources

- `/Users/emeryc/PDF des projets Berkeley/Signature_Based_Deep_Hedging_for_Path_Dependent_Options-5.pdf`: nine-page report, May 2026. Table 1 on p. 6 supplies the numerical results; Figures 1 and 2 on pp. 7–8 supply the original diagnostics.
- `/Users/emeryc/Desktop/223 Final Project /projet.py`: GBM simulation, arithmetic Asian payoff, prefix signatures, shared feed-forward policies, accounting, CVaR training and evaluation.
- `/Users/emeryc/Desktop/223 Final Project /results_report_for_gemini.md`: supporting run summary with additional numerical precision. The website CSV uses the PDF's published precision.
- The two images in the source `outputs/` directory match the PDF's extracted images pixel for pixel. The smoke/check directories are not used.

## Claims and interpretation

- 20,000 train / 5,000 test paths, 60 trading decisions, S0 = K = 100, mu = 0, sigma = 0.20, T = 60/252, proportional cost = 0.001.
- Raw input: 60 price slots with future entries zero-padded, plus the previous position. Signature input: 14 depth-3 features of (time, price), plus the previous position. No lead–lag or log-signature is used here.
- Both policies: three 64-unit ReLU hidden layers and a sigmoid output in [0,1]; one network is reused across all dates. Adam trains the whole differentiable trading rollout; this is not PPO/SAC-style reinforcement learning.
- Table 1: CVaR 4.9669 vs 3.6061, parameters 12,353 vs 9,409, mean P&L -2.4822 vs -2.4904. Relative reductions are 27.3974% and 23.8323%, rounded to 27.4% and 23.8%.
- The supplied script defaults to 75 epochs; the published experiment and original figures use 100. The page explicitly identifies the reported run rather than inferring it from defaults. No model weights or raw per-epoch/per-path arrays were supplied, so none are reconstructed or invented.
- The implementation's empirical 99% CVaR averages the top 50 shortfalls across 5,000 test paths. Zero starting cash and no option premium explain why absolute P&L is not a complete option-pricing result.
- Report equation (2) includes a terminal liquidation cost, but `terminal_wealth` in the supplied code marks final stock holdings to market without a last transaction. The portfolio describes the code convention and does not claim that fee was charged. Similarly, the theoretical report allows date-specific policies whereas the implementation shares weights across dates.
- A spot-plus-running-average policy is a natural additional baseline for this Asian payoff. It was not tested, so signatures are not presented as uniquely necessary or superior to every compact representation.

## Visual provenance

- `asian-paths.svg` and its mobile variant: newly drawn, constructed paths with identical S0 = 100 and S60 = 106. Daily averages (excluding S0) are 107.505320 and 98.594680; payoffs at K = 100 are 7.505320 and 0. These illustrate path dependence only and are labeled accordingly.
- `tail-risk.svg` and its mobile variant: redraw from `public/data/deep-hedging/reported-results.csv`, faithfully transcribed from report Table 1. Zero-based axis; no invented confidence intervals.
- `training-cvar.webp` / `terminal-pnl.webp`: original embedded PDF images, saved losslessly. Their blue/orange legend is retained. Available in an expandable diagnostic section so the main case study remains short.
- The source PDF and Python script are provided unchanged as local downloads. Existing decorative gallery media remain separate from the experimental figures.

Regenerate the new explanatory and result figures with:

```sh
python3 scripts/generate-deep-hedging-figures.py
```

The new overview is scoped to this project. The shared page selects it instead of the generic decorative poster and method cards; other case studies retain their existing presentation.
