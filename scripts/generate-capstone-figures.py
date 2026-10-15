"""Generate the explanatory diagram and plot the published Capstone CSVs.

Requires matplotlib. Run from any directory; no training is performed.
"""

from pathlib import Path
import csv

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/media/capstone"
OUT.mkdir(parents=True, exist_ok=True)
PAPER, INK, MUTED = "#f3efe6", "#292d2b", "#646c66"
BLUE, RUST, GREEN = "#386882", "#b06646", "#57735a"
plt.rcParams.update({
    "font.family": ["DejaVu Sans", "sans-serif"], "font.size": 12,
    "text.color": INK, "axes.labelcolor": MUTED,
    "xtick.color": MUTED, "ytick.color": MUTED,
    "figure.facecolor": PAPER, "axes.facecolor": PAPER,
    "svg.fonttype": "none", "svg.hashsalt": "capstone-portfolio",
})

# Exact pedagogical paths: (0,0)->(1,0)->(1,1) and its opposite order.
fig, axes = plt.subplots(1, 2, figsize=(12.8, 7.6))
fig.subplots_adjust(left=.1, right=.94, top=.77, bottom=.23, wspace=.48)
fig.text(.5, .93, "Same endpoints. Different order.", ha="center", fontsize=25)
fig.text(.5, .866, "Two normalized coordinates · illustrative paths", ha="center", color=MUTED, fontsize=13)
for ax, points, color, title, value in zip(
    axes,
    [[(0, 0), (1, 0), (1, 1)], [(0, 0), (0, 1), (1, 1)]],
    [BLUE, RUST],
    ["A · Price, then volume", "B · Volume, then price"],
    ["Signed area  +0.5", "Signed area  −0.5"],
):
    ax.add_patch(Polygon(points, color=color, alpha=.09))
    ax.plot([0, 1], [0, 1], color=MUTED, alpha=.35, linestyle="--", linewidth=1.4)
    xs, ys = zip(*points)
    ax.plot(xs, ys, color=color, linewidth=3.8, marker="o", markersize=7)
    for (x0, y0), (x1, y1) in zip(points[:-1], points[1:]):
        ax.annotate("", xy=(x0+.66*(x1-x0), y0+.66*(y1-y0)),
                    xytext=(x0+.4*(x1-x0), y0+.4*(y1-y0)),
                    arrowprops={"arrowstyle": "-|>", "color": color, "lw": 2.5, "mutation_scale": 20})
    ax.set(xlim=(-.15, 1.15), ylim=(-.15, 1.15), xticks=[0, 1], yticks=[0, 1])
    ax.set_aspect("equal")
    ax.set_title(title, loc="left", pad=22, fontsize=17, color=color)
    ax.set_xlabel("Price change", labelpad=8, fontsize=14)
    ax.set_ylabel("Cumulative volume", labelpad=8, fontsize=14)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.tick_params(length=0)
    ax.text(.5, -.22, value, ha="center", transform=ax.transAxes, fontsize=17, color=color)
fig.text(.5, .04, "First-order terms match: (1, 1). Second-order cross-terms distinguish the paths.", ha="center", fontsize=13)
fig.savefig(OUT / "path-order.svg", metadata={"Date": None})
plt.close(fig)

def rows(name):
    with (ROOT / "public/data/capstone" / name).open() as handle:
        return list(csv.DictReader(handle))

# Historical one-seed benchmark, kept separate from rolling multi-seed results.
# Values are transcribed from reports/experiments.md; original run folders were
# not present in the supplied code snapshot. Include both documented PPO/SAC
# settings to make configuration sensitivity visible, rather than cherry-pick.
initial = rows("initial-agent-comparison.csv")
assert len(initial) == 5
assert {r["seed"] for r in initial} == {"42"}
assert {r["training_episodes"] for r in initial} == {"200"}
fig, ax = plt.subplots(figsize=(10, 6.67))
fig.subplots_adjust(left=.31, right=.95, bottom=.19, top=.75)
fig.text(.055, .935, "PPO, SAC and D3QN", fontsize=25)
fig.text(.055, .875, "Initial benchmark · test period: 2021–Feb 2024", fontsize=13, color=MUTED)
colors = {"PPO": BLUE, "SAC": GREEN, "D3QN": RUST}
for y, record in zip([4.6, 3.7, 2.4, 1.5, .2], initial):
    value = float(record["oos_score"])
    color = colors[record["algo"]]
    ax.barh(y, value, height=.46, color=color, zorder=3)
    ax.text(value + (.025 if value >= 0 else -.025), y, f"{value:+.2f}".replace("-", "−"),
            va="center", ha="left" if value >= 0 else "right", fontsize=16, color=color)
    ax.text(-.59, y+.11, record["algo"], va="center", ha="right", fontsize=15, fontweight="bold", color=color)
    ax.text(-.59, y-.2, record["configuration"], va="center", ha="right", fontsize=11, color=MUTED)
ax.set(xlim=(-.56, .79), ylim=(-.45, 5.25), yticks=[], xticks=[-.4, 0, .4, .8])
ax.axvline(0, color=INK, linewidth=1.1)
ax.set_axisbelow(True)
ax.xaxis.grid(True, color="#d7d5cb", linewidth=.7)
ax.set_xlabel("Out-of-sample evaluation score", labelpad=12, fontsize=13)
ax.tick_params(length=0, pad=8, labelsize=12)
for spine in ax.spines.values():
    spine.set_visible(False)
fig.text(.055, .038, "One seed · 200 training episodes · 50 evaluation episodes · tuned configurations", fontsize=11, color=MUTED)
fig.savefig(OUT / "agent-comparison.svg", metadata={"Date": None})
plt.close(fig)

baseline = rows("baselines-folds.csv")
improved = rows("d3qn-improved-folds.csv")
fig, ax = plt.subplots(figsize=(10, 6.1))
fig.subplots_adjust(left=.13, right=.94, bottom=.26, top=.76)
fig.text(.13, .935, "Performance depends on the test period", fontsize=20)
fig.text(.13, .88, "Mean episode return / dispersion score · five seeds per point", fontsize=12, color=MUTED)
for algo, data, label, color, marker, offset in [
    ("ppo", baseline, "PPO", BLUE, "o", -.035),
    ("d3qn", baseline, "D3QN · 3 actions", RUST, "s", 0),
    ("d3qn", improved, "D3QN · 6 actions + PER + n-step", GREEN, "^", .035),
]:
    ordered = sorted([r for r in data if r["algo"] == algo], key=lambda r: r["fold_id"])
    assert [r["fold_id"] for r in ordered] == ["f1", "f2", "f3"]
    values = [float(r["oos_sharpe_mean"]) for r in ordered]
    ax.plot([x+offset for x in range(3)], values, label=label, color=color, marker=marker,
            markersize=8, linewidth=2)
ax.axhline(0, color=INK, linewidth=1)
ax.set_axisbelow(True)
ax.yaxis.grid(True, color="#d7d5cb", linewidth=.7)
ax.set(xticks=[0, 1, 2], xticklabels=["f1\n2019–2022", "f2\n2020–2023", "f3\n2021–Feb 2024"],
       yticks=[-1, -.5, 0, .5, 1], xlim=(-.17, 2.17), ylim=(-1.1, 1.25))
ax.set_ylabel("Episode return / dispersion", labelpad=12)
for spine in ax.spines.values():
    spine.set_visible(False)
ax.tick_params(length=0, pad=9)
handles, labels = ax.get_legend_handles_labels()
fig.legend(handles, labels, loc="lower left", bbox_to_anchor=(.12, .064), frameon=False, fontsize=11, ncol=2)
fig.text(.13, .025, "Overlapping OOS periods · no annualization · source: saved project evaluation summaries", fontsize=10, color=MUTED)
fig.savefig(OUT / "walk-forward.svg", metadata={"Date": None})
plt.close(fig)
# Portrait variants keep labels readable without requiring zoom on phones.
fig, ax = plt.subplots(figsize=(5, 6.2))
fig.subplots_adjust(left=.14, right=.95, bottom=.25, top=.76)
fig.text(.055, .94, "PPO / SAC / D3QN", fontsize=20)
fig.text(.055, .891, "Initial benchmark · 2021–Feb 2024", fontsize=11, color=MUTED)
positions = [4.8, 3.65, 2.5, 1.35, .2]
for y, record in zip(positions, initial):
    value = float(record["oos_score"])
    color = colors[record["algo"]]
    ax.barh(y, value, height=.27, color=color, zorder=3)
    ax.text(value + (.025 if value >= 0 else -.025), y, f"{value:+.2f}".replace("-", "−"),
            va="center", ha="left" if value >= 0 else "right", fontsize=12, color=color)
    ax.text(-.60, y+.42, record["algo"]+" · "+record["configuration"],
            ha="left", va="center", fontsize=12, color=color,
            bbox={"facecolor": PAPER, "edgecolor": "none", "pad": .5})
ax.set(xlim=(-.64, .87), ylim=(-.35, 5.4), yticks=[], xticks=[-.4, 0, .4, .8])
ax.axvline(0, color=INK, linewidth=.8)
ax.tick_params(length=0, pad=8, labelsize=10)
ax.set_xlabel("Out-of-sample evaluation score", fontsize=11, labelpad=12)
for spine in ax.spines.values():
    spine.set_visible(False)
fig.text(.055, .06, "One seed · 200 training episodes\n50 evaluation episodes · tuned configurations", fontsize=9.5, color=MUTED, linespacing=1.6)
fig.savefig(OUT / "agent-comparison-mobile.svg", metadata={"Date": None})
plt.close(fig)

fig, ax = plt.subplots(figsize=(5, 6.1))
fig.subplots_adjust(left=.17, right=.95, bottom=.34, top=.76)
fig.text(.065, .94, "Different periods,", fontsize=20)
fig.text(.065, .883, "different outcomes", fontsize=20)
fig.text(.065, .824, "Mean score · five seeds per point", fontsize=11, color=MUTED)
for algo, data, label, color, marker, offset in [
    ("ppo", baseline, "PPO", BLUE, "o", -.035),
    ("d3qn", baseline, "D3QN · 3 actions", RUST, "s", 0),
    ("d3qn", improved, "D3QN · 6 actions + PER + n-step", GREEN, "^", .035),
]:
    ordered = sorted([r for r in data if r["algo"] == algo], key=lambda r: r["fold_id"])
    ax.plot([x+offset for x in range(3)], [float(r["oos_sharpe_mean"]) for r in ordered],
            label=label, color=color, marker=marker, markersize=6, linewidth=1.7)
ax.axhline(0, color=INK, linewidth=.8)
ax.set_axisbelow(True)
ax.yaxis.grid(True, color="#d7d5cb", linewidth=.7)
ax.set(xticks=[0, 1, 2], xticklabels=["f1\n2019–22", "f2\n2020–23", "f3\n2021–24*"],
       yticks=[-1, -.5, 0, .5, 1], xlim=(-.17, 2.17), ylim=(-1.1, 1.25))
ax.set_ylabel("Episode return / dispersion", labelpad=6, fontsize=10)
ax.tick_params(length=0, pad=7, labelsize=10)
for spine in ax.spines.values():
    spine.set_visible(False)
handles, labels = ax.get_legend_handles_labels()
fig.legend(handles, labels, loc="lower left", bbox_to_anchor=(.065, .075), frameon=False, fontsize=10)
fig.text(.065, .029, "*To Feb 2024 · overlapping test periods", fontsize=9.5, color=MUTED)
fig.savefig(OUT / "walk-forward-mobile.svg", metadata={"Date": None})
plt.close(fig)
print("Generated explanation, agent comparison and rolling evaluation plots")
