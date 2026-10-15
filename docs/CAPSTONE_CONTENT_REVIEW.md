# Capstone portfolio content review

Updated 2026-10-14. Scope: the RL/path-signature case study, its summary and
supporting assets. Site language remains English. Following the user's request
for a concise but more visual portfolio overview, the page prioritizes the
objective, tools and their roles, implementation and results. The opening
“Rough path signatures. What are they?” explainer connects path order to the
agents’ input features. The motivation and “Why use signatures?” now appear
before the model architecture, with no duplicate rationale in the Markdown body.
The original classification plot is joined by a PPO/SAC/D3QN benchmark and a
separate rolling PPO/D3QN plot. Detailed theory, fold tables and coordinate
ablations remain in the linked report. No training was rerun.

## Source map

Local documents supplied by the user:

- `/Users/emeryc/PDF des projets Berkeley/Capstone Project RL Signature Bitcoin/Capstone_Project_Report-9.pdf`
- `/Users/emeryc/PDF des projets Berkeley/Capstone Project RL Signature Bitcoin/Presentation Spring Capstone .pdf`
- Implementation root: `/Users/emeryc/Capstone Project SinFench/base_d3qn`

| Reviewed material                           | Evidence                                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introductory path example                   | Newly constructed piecewise-linear paths; exact cross-term calculation. Not experimental data.                                                                                                                      |
| Time / lead-lag / log-signature explanation | Report section 2.2; Chevyrev & Kormilitzin, https://arxiv.org/abs/1603.03788; Lyons & McLeod, https://arxiv.org/abs/2206.14674.                                                                                     |
| Implementation                              | `rl/features/signature.py`, `rl/envs/wrappers.py`, both capital environments, `configs/signature.yaml`, `configs/ppo_signature.yaml`, `configs/d3qn_signature_capital_6act_per06_n3_worstfold.yaml`.                |
| Volume task and classifier results          | Report section 2.5.1 / Table 1, PDF pages 10–12; presentation slides 6–7. Reported, not rerun.                                                                                                                      |
| Volume-pair image                           | Original embedded PNG from report PDF page 11, Figure 2 (1777 × 1235). Converted to WebP.                                                                                                                           |
| Accuracy image                              | Original embedded JPEG from presentation PDF page 7 (1597 × 877). Converted to WebP.                                                                                                                                |
| Trading comparison                          | Report Table 3; `runs/batch_wf_rolling_long_oos_repeat/summary_by_algo*.csv` and `runs/wf_rolling_long_oos_d3qn_6act_a06_n3_worstfold/summary_by_algo*.csv`.                                                        |
| Initial three-agent comparison              | `reports/experiments.md`, protocol and sections A–B. All five documented seed-42, 200-episode capital-aware PPO/SAC settings and the six-action D3QN setting. Values transcribed to `initial-agent-comparison.csv`. |
| Protocol and score definition               | `configs/folds_rolling_long_oos.json`, `scripts/walk_forward_protocol.py`, `scripts/eval.py:498–504`, `rl/algos/ppo/trainer.py:493–495`.                                                                            |
| Coordinate ablation                         | Report Table 4 and presentation slide 9. One fold only; not independently rerun.                                                                                                                                    |
| Personal contribution                       | Existing portfolio brief attributes implementation to Emeryc and retains team context. No new sole-authorship claim.                                                                                                |

## Editorial corrections and boundaries

1. The presentation's 1.1079 / 0.8650 / 0.8905 scores are f1 values in the report
   and saved CSVs, not the complete rolling evaluation. The concise page uses
   the aggregate comparison and explicitly mentions the negative weakest fold.
2. The saved `sharpe_ratio` is the mean divided by population standard deviation
   of total episode returns. It is neither annualized nor risk-free adjusted.
   The page defines its evaluation score explicitly; the retained CSVs preserve
   the original metric names. The reported aggregate SD is the sample
   SD across 15 runs, not the denominator of each run's score.
3. Report section 2.3.2 incorrectly assigns sum(d^k) to log-signature dimension.
   This is the ordinary signature count (excluding level zero). Independent
   log-signature dimensions for d=4 and degrees 1,2,3 are 4,6,20; total 30.
   No unsupported 124-dimensional observation claim is repeated.
4. The supplied reference configurations use daily observations and a window
   size of 24. The page says 24 bars, not 24 hours.
5. The reviewed baseline embeddings support log price, log return, rolling mean
   and rolling volatility. The configured degree-3 baseline uses the first,
   second and fourth, plus time. The volume/range experiment is documented in
   the PDFs, but its complete implementation is absent from this code snapshot.
6. Lead-lag is explained as an available construction, not an enabled baseline
   feature. Time augmentation is enabled. No automatic denoising or scale
   invariance is claimed; signatures scale by c^k at level k.
7. The reference action settings are long-only. The report architecture figure's
   short/hold/long labels are therefore not reused as implementation evidence.
8. Worst-fold OOS selection still reuses held-out periods for model development.
   The concise page notes overlapping test periods and model selection as
   reasons why further validation is needed.
9. The six-action comparison simultaneously changes action design, replay,
   n-step returns and risk controls. It is not a causal estimate of any one
   upgrade's benefit. The coordinate study is also limited to f1.
10. The report's raw/LSTM/signature generalization-gap table lacks matching
    experiment artifacts in the supplied snapshot, so it is not added as another
    headline comparison. Later sell-fraction studies in `reports/experiments.md`
    are separate run groups and are not mixed into the report's comparison.
11. SAC is documented in the historical single-split experiment log, but is
    absent from the saved rolling multi-seed summaries. These are therefore
    two distinct figures, with explicit dates, seeds and protocol descriptions.
    The historical run directories named by the log are absent from this
    snapshot; its four-decimal results are presented as documented results,
    not independently regenerated metrics. Both PPO configurations and both
    SAC configurations are plotted, including the negative conservative PPO.
    The positive PPO configuration was selected using OOS results; this is
    disclosed in the figure caption rather than presented as an unbiased test.
12. The opening price/volume paths are exact illustrative piecewise-linear
    examples with coordinates from zero to one. The diagonal closes the path;
    signed areas are +0.5 and −0.5. This is not a claim that the baseline trading
    observation includes volume. Its input channels are named in the flow.
    The small market trace is also schematic, hidden from assistive technology.
13. Ordinary signature counts shown in the short explanation exclude level
    zero: 4 + 4² + 4³ = 84, and 8 + 8² + 8³ = 584. These are not log-signature
    dimensions or a measured runtime ratio.

## Asset regeneration

`scripts/generate-capstone-figures.py` uses matplotlib. It builds the explanatory
diagram and plots the copied fold CSVs; no model execution is involved.
`public/reports/capstone` holds byte-for-byte copies of the two supplied PDFs.
`public/data/capstone` holds byte-for-byte copies of the four saved summaries
and a five-row transcription of the historical experiment log, including run
IDs, dates, seeds and evaluation settings.

The generated SVG plots complement the original presentation image. Dedicated
portrait SVG variants keep both trading plots readable on narrow screens.
The original `volume-timing.webp` is now displayed immediately before the
classification results. The introduction connects the opening path-order
illustration to the controlled Bitcoin experiment, and a short transition
explains the classifier's task. The figure preserves the source pixels and
is not regenerated from estimated data. Its caption and alt text distinguish
the unchanged historical price window (July 10–August 2, 2022) from the two
constructed early/late volume profiles; both preserve total window volume.
The image links to the full-resolution asset for closer inspection.
`SignatureExplainer.astro` displays the explanatory path geometry and equations
as responsive HTML/SVG/MathML in place of the generic case-study poster and
method overview for this project. The gallery now uses the simulated Bitcoin
price animation described below; the case-study figures remain unchanged.

## Architecture illustration

`CapstoneArchitecture.astro` follows the explanation and relocated
“Why use signatures?” section in `SignatureExplainer.astro`. Following the
author’s request to simplify the architecture, it now shows one common
observation → model → action → Gymnasium loop, followed by three aligned
conceptual network diagrams. These are static, responsive HTML/SVG with
semantic `data-node` and `data-edge` hooks for later animation. Nothing is trained
or simulated in the browser. The diagram is shown only on this case-study page.

The visible comparison focuses on D3QN’s action-value network and discrete
trades, PPO’s actor and state-value critic, and SAC’s actor and twin action-value
critics. The SAC critics receive both observation and action. Each diagram
continues from the action to Gymnasium feedback and a training block. Dashed
return arrows explicitly update the Q-network or the actor and critic networks;
they are training-only weight updates, not inference-time inputs.
The replay/fresh-experience notes distinguish training data use; SAC’s entropy
objective is summarized as encouraging exploration. The D3QN buy/hold/sell
labels group action types rather than claiming the implementation has only
three actions. The continuous sliders illustrate the action range, not a
measured or recommended allocation. Detailed neural layers, action fractions,
reward formulas and the hyperparameter table were removed from the public
diagram. The implementation evidence below remains for internal traceability.

Sources rechecked for the diagram:

- `rl/envs/make_env.py`: data sorting, environment selection and feature wrapper.
- `rl/features/signature.py`, `rl/envs/wrappers.py`: causal 24-bar window,
  configured price/return/5-bar volatility embedding, log-signature and
  concatenated account features.
- `configs/d3qn_signature_capital_6act_per06_n3_worstfold.yaml`,
  `configs/ppo_signature.yaml`, `configs/sac_signature.yaml`: reviewed settings.
  These are the reference configurations used for the implementation review,
  not a claim that every plotted experiment used identical hyperparameters.
- `rl/algos/{d3qn,ppo,sac}/networks.py`: D3QN has two convolutional layers and
  dueling value/advantage streams; PPO has Gaussian actor and value MLPs; SAC
  has a squashed Gaussian actor, twin Q critics and target critics.
- The respective trainers/replay implementations: PPO uses fresh rollouts and
  GAE with clipped updates; D3QN uses prioritized replay, 3-step Double Q
  targets and target-network refreshes; SAC uses replay, twin targets, an
  entropy objective and soft target updates.
- `rl/envs/trading_env_discrete_capital.py`: D3QN buys 20/40/60/80% of the
  maximum feasible purchase, not those fractions of total equity. Its six
  actions are hold, four buy fractions and sell all. It uses an 80% exposure
  ceiling, further reduced by volatility, and hold/cooldown constraints.
- `rl/envs/trading_env_continuous.py`: PPO/SAC use long-only target exposure
  in [0, 1], with cash feasibility and execution costs.
- Both capital environments: initial cash 100,000; fee 10 bps; assumed slippage
  2 bps; `sr_enhanced` is change in the 30-step mean-return/sample-SD score,
  clipped to [-1, 1] before D3QN trade penalties; termination at the window end
  or the configured 20% equity floor. This training reward is distinct from
  the episode-level evaluation score used in the results charts.

The project author confirmed that Gymnasium was used to reproduce the trading
environment. The tools table and architecture now name Gymnasium explicitly,
following this clarification. The supplied implementation snapshot uses custom
classes and returns `(reward, done, observation)` through its wrapper; no
Gymnasium import, `Env` subclass or space declaration was found in that snapshot.
The public qualification has been removed based on the author's confirmation;
the page does not make a separate claim about this snapshot's API compatibility.

The common loop returns the next observation and supplies the reward for
learning. The comparison diagrams now show the requested learning cycle:

- D3QN: a replay batch corrects action-value predictions toward reward plus
  estimated future value. Changing Q-values changes action selection; there
  is no separate actor. Checked against `rl/algos/d3qn/agent.py`.
- PPO: the latest rollout supplies return targets for the critic and advantages
  for the actor. The text describes clipping as discouraging large policy
  changes, not a strict bound on the eventual parameter change. Checked against
  `rl/algos/ppo/trainer.py:670–712`.
- SAC: replay updates both critics; the actor optimizes estimated value plus
  an entropy-based exploration objective. Checked against
  `rl/algos/sac/trainer.py:407–446`.

The feedback boxes name reward and next observation for readability; batches
also retain the observation, action and episode-end information. The diagrams
show the conceptual cycle, not a claim that every model update happens after
one trade. Evaluation freezes weights and has no learning feedback route.

## Signature formulas

The opening explainer places the two illustrative paths on the left and the
signature definition on the right. Native MathML displays the sequence of
levels and their iterated-integral coordinates. Following the author’s request
for a lighter explanation, only the path X and signature level k are defined;
the examples explain the first two levels without a full notation glossary.
The layout stacks on smaller screens. The definition follows report section
2.3.2; no incorrect log-signature dimension claim from that section is reused.

The first level is the net increment, (1, 1) for both illustrative paths. In the
price-then-volume example, the price/volume cross term is 1 and its reverse is 0. For volume-then-price these values swap. Half their difference gives the
displayed signed areas, +0.5 and −0.5, linking the formula directly to the
drawings. These are exact piecewise-linear examples, not experimental results.
The text distinguishes the full signature from the truncated log-signatures
used as features in the project.

## Origins and personal motivation

The short history connects Brownian motion, a classic irregular signal from
physics, to the mathematical lineage of signatures: K.-T. Chen’s iterated
integrals and Terry Lyons’s introduction of rough path theory in 1998. It does
not claim that physicists invented signatures. The linked historical source is
Yuzuru Inahama, “Rough path theory and stochastic calculus” (2016),
https://arxiv.org/abs/1602.03255.

The project author explicitly supplied a personal account: their stochastic
processes professor, Xin Guo, told them that applying signatures to Amazon’s
supply chain during the war in Ukraine helped save several billion dollars.
Following the author's tone correction, the figure appears only in the prose,
with clear attribution to what she told them. The large savings headline has
been replaced by a small “What sparked my interest” heading. The connection to
theory concerns describing irregular paths, rather than a claim that signatures
were invented for supply-chain crises. This is a paraphrase, not a direct quotation, published case-study
metric or result of the student capstone. No date or classroom setting is
invented. It explains the author’s motivation for exploring the method.

The separate public paper “Transportation Marketplace Rate Forecast Using
Signature Transform”, https://arxiv.org/abs/2401.04857, reports an estimated
annualized $50MM transportation saving. That published metric is not substituted
for the user’s personal account, and the paper is not cited as evidence for
the several-billion-dollar anecdote.

The original `capture-the-chaos` anchor is retained for existing links. The
table of contents now lists the signature explanation, why signatures were
used, and the ML architecture in their visible order. “Capture the Chaos”
remains as the rationale’s short thematic label.

## Hover-only Bitcoin gallery animation

The old gallery motion video is replaced by a locally generated CanvasTexture
selected by `sceneAnimation: bitcoin-price`. The label explicitly says simulated
price path; neither historical prices nor a model's predictions are displayed.
The existing MP4 is no longer referenced by this project.

A regime lasts uniformly 1.8–4.2 seconds (mean 3). Its direction is drawn with
probabilities 0.6 up and 0.4 down. Each regime has 4, 6 or 8 micro-movements
(mean 6), placed at irregular intervals. Balanced signs are shuffled, giving
each position a 50/50 marginal direction; these signs are not independent.
Positive and negative amplitude budgets produce the chosen regime's net
change without an extra jump at the boundary. Larger moves receive more time,
with random jitter, to avoid sudden spikes. Cubic easing interpolates each
micro-movement monotonically, and the rolling vertical scale follows smoothly.

A requestAnimationFrame-driven canvas targets 60 updates/s and runs only while
the mouse or pen is over this project's row, or its visual in the open preview.
Leaving freezes the current frame; re-entering resumes with no elapsed-time
catch-up. Keyboard focus alone and touch do not animate it. Pause, reduced
motion, Save-Data, document visibility and panel visibility stop motion.
No extra WebGL context or media download is introduced.

The visible history is 12 seconds, showing roughly four broader movements.
The panel uses a dark red-ochre background, an imperial-yellow price curve and
a larger Bitcoin label. Its project accent warms the surrounding gallery light.

The static SVG is generated from the same deterministic initial 12-second
history as the canvas (`node scripts/generate-bitcoin-poster.mjs`). Subsequent
regimes are randomized at runtime, so this is not a repeating video loop.
The existing composite gallery fallback stills predate this change; individual
project previews use the new SVG even when WebGL is unavailable.

`node scripts/check-bitcoin-path.mjs` checks distributions, mean timing,
amplitude-generated directions, continuity and frame-rate-independent prices.
Across 30,000 seeded regimes: 60.08% up, 50% upward micro-movements, 3.001 s
mean regime duration and 1.998 micro-movements/s.

Clock checks at 60, 120 and 144 Hz each produced 600 texture updates in ten
seconds; a long pause did not advance or catch up the price. Browser checks
confirmed pointer-only start/stop, a frozen 46.533 s state across an idle
interval, resume from that state, and the pause control overriding hover.
In the local preview, 3,415 additional updates covered 57.0 s of simulation
time (59.9 updates/s); this is a measured local run, not a device-independent
frame-rate guarantee.
