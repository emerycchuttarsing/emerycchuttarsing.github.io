"""Draw a payoff illustration and the report's Table 1 comparison.

Requires numpy and matplotlib. Does not train models or reconstruct missing
experimental curves. Original training/distribution plots are kept separately.
"""

from pathlib import Path
import csv
import os
import tempfile

os.environ.setdefault("MPLCONFIGDIR", str(Path(tempfile.gettempdir()) / "hedging-plot-cache"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/media/deep-hedging"
OUT.mkdir(parents=True, exist_ok=True)
PAPER, INK, MUTED, GRID = "#f6f2e9", "#292820", "#706d62", "#ded8ca"
BLUE, GOLD = "#386882", "#a16f30"
plt.rcParams.update({
    "font.family": ["DejaVu Sans", "sans-serif"],
    "font.size": 14,
    "text.color": INK,
    "axes.labelcolor": MUTED,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "figure.facecolor": PAPER,
    "axes.facecolor": PAPER,
    "svg.fonttype": "none",
    "svg.hashsalt": "deep-hedging-portfolio",
})

# Constructed teaching example, not GBM samples or experimental predictions.
# The payoff uses days 1..60, matching asian_call_payoff in the supplied code.
days = np.arange(61)
u = days / 60
wiggle = 1.15 * np.sin(6 * np.pi * u) + .5 * np.sin(14 * np.pi * u)
paths = [100 + 6*u + 7*np.sin(np.pi*u) + wiggle,
         100 + 6*u - 7*np.sin(np.pi*u) + wiggle]
averages = [p[1:].mean() for p in paths]
payoffs = [max(a - 100, 0) for a in averages]
assert all(np.isclose(p[0], 100) and np.isclose(p[-1], 106) for p in paths)

for compact in (False, True):
    fig, ax = plt.subplots(figsize=(7.8, 5.2) if not compact else (5.5, 5.6))
    fig.subplots_adjust(left=.10 if not compact else .15, right=.95,
                        top=.79, bottom=.32)
    for path, average, color in zip(paths, averages, [GOLD, BLUE]):
        ax.plot(days, path, color=color, linewidth=2.8)
        ax.axhline(average, color=color, linestyle=(0, (4, 4)), linewidth=1.2, alpha=.65)
    ax.axhline(100, color=INK, linewidth=.9, alpha=.4)
    ax.scatter([0, 60], [100, 106], color=INK, s=23, zorder=4)
    ax.annotate("Same finish: 106", xy=(60,106), xytext=(32,116),
                fontsize=12, color=MUTED,
                arrowprops={"arrowstyle":"-", "color":MUTED, "lw":.9})
    ax.set(xlim=(0, 61), ylim=(93,118), xticks=[0,20,40,60], yticks=[100,110])
    ax.set_xlabel("Trading day", labelpad=6, fontsize=12)
    ax.set_ylabel("Price", fontsize=12)
    ax.tick_params(length=0, labelsize=12, pad=7)
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.grid(axis="y", color=GRID, linewidth=.7)
    ax.set_axisbelow(True)
    fig.text(.08, .93, "Early rise", color=GOLD, fontsize=15, weight="bold")
    fig.text(.52, .93, "Late recovery", color=BLUE, fontsize=15, weight="bold")
    for x, average, payoff, color in zip([.08,.52], averages, payoffs, [GOLD,BLUE]):
        fig.text(x,.145,f"Average  {average:.2f}",color=color,fontsize=13)
        fig.text(x,.075,f"Payoff  {payoff:.2f}",color=color,fontsize=16,weight="bold")
    fig.savefig(OUT / ("asian-paths-mobile.svg" if compact else "asian-paths.svg"),
                metadata={"Date":None})
    plt.close(fig)

with (ROOT / "public/data/deep-hedging/reported-results.csv").open() as handle:
    results = list(csv.DictReader(handle))
raw, sig = [float(row["cvar_99"]) for row in results]
improvement = (raw-sig)/raw*100
assert len(results)==2 and all(int(row["test_paths"])==5000 for row in results)
for compact in (False, True):
    fig, ax = plt.subplots(figsize=(5.7, 5) if compact else (9, 4.7))
    fig.subplots_adjust(left=.28 if compact else .23, right=.91,
                        top=.60 if compact else .62, bottom=.27 if compact else .25)
    title = "Lower shortfall in\nthe worst 1%" if compact else "Lower shortfall in the worst 1%"
    fig.text(.055,.95,title,fontsize=19 if compact else 21,va="top")
    fig.text(.055,.74 if compact else .82,
             "99% CVaR · 5,000 unseen simulated paths" if compact else "99% CVaR on 5,000 unseen simulated paths",
             fontsize=11 if compact else 12,color=MUTED)
    for y, row, color in zip([1,0], results, [BLUE,GOLD]):
        value=float(row["cvar_99"])
        ax.barh(y,value,height=.42,color=color,zorder=3)
        ax.text(value+.12,y,f"{value:.2f}",va="center",fontsize=15 if compact else 17,color=color,weight="bold")
    ax.set(xlim=(0,6.3 if compact else 5.8),ylim=(-.6,1.6),
           xticks=[0,2,4,6] if compact else [0,1,2,3,4,5],
           yticks=[1,0],yticklabels=["Raw history","Signatures"])
    ax.tick_params(length=0,pad=10,labelsize=12)
    ax.set_axisbelow(True)
    ax.xaxis.grid(True,color=GRID,linewidth=.7)
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.set_xlabel("Shortfall · lower is better" if compact else "Terminal shortfall · lower is better",fontsize=12,labelpad=12)
    footer = f"{improvement:.1f}% lower CVaR" if compact else f"{improvement:.1f}% lower CVaR in this reported run"
    fig.text(.055,.035,footer,fontsize=14,color=GOLD,weight="bold")
    fig.savefig(OUT/("tail-risk-mobile.svg" if compact else "tail-risk.svg"),metadata={"Date":None})
    plt.close(fig)
print(f"Illustrative averages: {averages}; payoffs: {payoffs}")
print(f"Reported CVaR reduction: {improvement:.4f}%")
