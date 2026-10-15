"""Render the AKO case-study figures from observed sales and saved predictions.

Rebuild the small, plotted-data exports with --source '/path/to/Case AKO '.
Without --source, regenerate figures from public/data/retail-forecasting.
No model is fitted and no future observations or uncertainty bands are invented.
"""
from pathlib import Path
from collections import defaultdict
from datetime import datetime
from html import escape
import argparse
import csv
import json
import os
import re
import tempfile

os.environ.setdefault('MPLCONFIGDIR', str(Path(tempfile.gettempdir())/'retail-mpl'))
os.environ.setdefault('XDG_CACHE_HOME', str(Path(tempfile.gettempdir())/'retail-cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.ticker import FuncFormatter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT/'public/data/retail-forecasting'
OUT = ROOT/'public/media/retail-forecasting'
DATA.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path)
args = parser.parse_args()
EXAMPLES = [('NewYork', 'Flavour_03'), ('Phoenix', 'Flavour_01'), ('Seattle', 'Flavour_02')]

def read(name):
    with (DATA/name).open() as f:
        return list(csv.DictReader(f))

def write(name, fields, rows):
    with (DATA/name).open('w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

if args.source:
    with (args.source/'input.csv').open() as f:
        raw = list(csv.DictReader(f))
    with (args.source/'Output_chuttarsing.csv').open() as f:
        predictions = list(csv.DictReader(f))
    groups = defaultdict(list)
    for row in raw:
        groups[row['StoreID'], row['Article'], row['TransactionDate'][:7]].append(row)
    monthly = []
    for (store, article, month), rows in sorted(groups.items()):
        monthly.append(dict(store=store, article=article, month=month,
            sales=sum(float(r['SalesVolume']) for r in rows),
            price=np.mean([float(r['Price']) for r in rows]),
            temperature=np.mean([float(r['MaxMonthTemperature']) for r in rows])))
    assert len(raw) == 11986 and len(monthly) == 2400
    assert len(predictions) == len({(r['StoreID'], r['Article'], r['TransactionDate']) for r in predictions}) == 300
    assert all(np.isfinite(float(r['SalesVolume'])) for r in predictions)
    products = sorted({r['article'] for r in monthly})
    months = sorted({r['month'] for r in monthly})
    assert len(months) == 48 and len(products) == 5
    history = [{'month': m, **{a: round(sum(r['sales'] for r in monthly if r['month'] == m and r['article'] == a), 2) for a in products}} for m in months]
    write('demand-history.csv', ['month'] + products, history)
    correlations = []
    for a in products:
        values = []
        for m in months:
            rows = [r for r in monthly if r['month'] == m and r['article'] == a]
            values.append([sum(r['sales'] for r in rows), np.mean([r['temperature'] for r in rows]), np.mean([r['price'] for r in rows])])
        corr = np.corrcoef(np.array(values).T)[0, 1:]
        correlations.append(dict(article=a, temperature_r=corr[0], price_r=corr[1], monthly_observations=48))
    write('correlations.csv', ['article', 'temperature_r', 'price_r', 'monthly_observations'], correlations)
    examples = []
    for store, article in EXAMPLES:
        for r in monthly:
            if (r['store'], r['article']) == (store, article) and r['month'] >= '2016-01':
                examples.append(dict(store=store, article=article, date=r['month']+'-01', kind='observed', sales_volume=round(r['sales'], 2)))
        for r in predictions:
            if (r['StoreID'], r['Article']) == (store, article):
                examples.append(dict(store=store, article=article, date=r['TransactionDate'], kind='saved_forecast', sales_volume=r['SalesVolume']))
    assert len(examples) == 54
    write('forecast-examples.csv', ['store', 'article', 'date', 'kind', 'sales_volume'], examples)
    notebook = json.loads((args.source/'data_science_input.ipynb').read_text())
    output = ''.join(''.join(o.get('text', [])) for o in notebook['cells'][31]['outputs'])
    metrics = {k: float(re.search(pattern, output).group(1)) for k, pattern in [
        ('rmse', r'RMSE: ([\d.]+)'), ('r_squared', r'R²: ([\d.]+)'), ('wape_percent', r'WAPE: ([\d.]+)')]}
    metrics.update(source='Saved notebook cell 31 output; no model rerun',
        evaluation='Random 70/30 split, random_state=42; not an out-of-time backtest',
        usable_rows=1950, training_rows=1365, test_rows=585,
        model={'type': 'CatBoostRegressor', 'iterations': 500, 'depth': 6, 'learning_rate': 0.1, 'loss_function': 'RMSE'},
        feature_count=32, lag_features=12, target='SalesVolume at t+6 months')
    (DATA/'saved-metrics.json').write_text(json.dumps(metrics, indent=2)+'\n')

PAPER, INK, MUTED, LINE = '#f5f1e9', '#282c2c', '#6a706d', '#d8d2c7'
BLUE, ROSE = '#446a79', '#aa6a56'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11,
    'text.color': INK, 'axes.labelcolor': MUTED, 'xtick.color': MUTED, 'ytick.color': MUTED,
    'figure.facecolor': PAPER, 'axes.facecolor': PAPER, 'svg.fonttype': 'none',
    'svg.hashsalt': 'ako-retail-portfolio'})

def save(fig, name):
    fig.savefig(OUT/name, metadata={'Date': None})
    p = OUT/name
    p.write_text(p.read_text().replace("font-family: 'DejaVu Sans'", 'font-family: Arial, sans-serif'))
    plt.close(fig)

def clean(ax):
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.tick_params(length=0, pad=8)
    ax.set_axisbelow(True)
    ax.grid(axis='y', color=LINE, lw=.7)

history = read('demand-history.csv')
fig, ax = plt.subplots(figsize=(6.4, 3.65))
fig.subplots_adjust(left=.11, right=.98, top=.80, bottom=.15)
colors = [BLUE, ROSE, '#708a71', '#a28e58', '#989ca9']
dates = [datetime.strptime(r['month'], '%Y-%m') for r in history]
for i, color in enumerate(colors, 1):
    ax.plot(dates, [float(r[f'Flavour_0{i}']) for r in history], color=color, lw=1.9, label=f'Flavour 0{i}')
ax.set(ylim=(0, None), xlim=(dates[0], dates[-1]))
ax.xaxis.set_major_locator(mdates.YearLocator())
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y'))
ax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f'{x/1000:.0f}k'))
ax.text(0, 1.22, 'Monthly sales · all 10 stores', transform=ax.transAxes, fontsize=10, color=MUTED)
ax.legend(loc='lower left', bbox_to_anchor=(-.02, 1.015), ncol=3, frameon=False, fontsize=9, columnspacing=1.5)
clean(ax)
save(fig, 'demand-history.svg')

correlations = read('correlations.csv')
fig, ax = plt.subplots(figsize=(6.4, 3.65))
fig.subplots_adjust(left=.25, right=.90, top=.84, bottom=.24)
values = np.array([[float(r['temperature_r']), float(r['price_r'])] for r in correlations])
cmap = LinearSegmentedColormap.from_list('retail', [BLUE, PAPER, ROSE])
im = ax.imshow(values, cmap=cmap, vmin=-1, vmax=1, aspect='auto')
for y in range(5):
    for x in range(2):
        ax.text(x, y, f'{values[y,x]:+.2f}', ha='center', va='center', fontsize=13, color=INK)
ax.set(xticks=[0,1], xticklabels=['Temperature', 'Price'], yticks=list(range(5)), yticklabels=[f'Flavour 0{i}' for i in range(1,6)])
ax.xaxis.tick_top()
ax.tick_params(length=0, pad=10)
for spine in ax.spines.values(): spine.set_visible(False)
cax = fig.add_axes([.25, .10, .65, .035])
cb = fig.colorbar(im, cax=cax, orientation='horizontal', ticks=[-1,0,1])
cb.outline.set_visible(False)
cb.ax.tick_params(length=0, labelsize=9)
save(fig, 'correlations.svg')

examples = read('forecast-examples.csv')
for store, article in EXAMPLES:
    rows = [r for r in examples if (r['store'], r['article']) == (store, article)]
    fig, ax = plt.subplots(figsize=(4.2, 2.9))
    fig.subplots_adjust(left=.13, right=.97, top=.85, bottom=.19)
    ax.axvspan(datetime(2017,1,1), datetime(2017,6,15), color='#eadbd2', alpha=.6)
    for kind, label, color, style in [('observed', 'Observed', BLUE, '-'), ('saved_forecast', 'Forecast', ROSE, '--')]:
        subset = sorted((r for r in rows if r['kind'] == kind), key=lambda r: r['date'])
        ax.plot([datetime.fromisoformat(r['date']) for r in subset], [float(r['sales_volume']) for r in subset], color=color, lw=2, ls=style, marker='o', ms=3, label=label)
    ax.set(ylim=(0, 25000), xlim=(datetime(2015,12,10), datetime(2017,6,20)), yticks=[0,10000,20000])
    ax.set_xticks([datetime(2016,1,1), datetime(2016,7,1), datetime(2017,1,1), datetime(2017,6,1)], ['Jan 16','Jul 16','Jan 17','Jun 17'])
    ax.tick_params(labelsize=9)
    ax.yaxis.set_major_formatter(FuncFormatter(lambda x, _: f'{x/1000:.0f}k'))
    ax.legend(loc='lower left', bbox_to_anchor=(-.02,1.01), ncol=2, frameon=False, fontsize=9)
    clean(ax)
    save(fig, store.lower()+'-forecast.svg')

# Schematic architecture, not a visualization of fitted tree splits.
def text(s, x, y, label, size=17, color=INK, anchor='middle', weight='400'):
    s.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}">{escape(label)}</text>')

def rect(s, x, y, w, h, fill='#e6e7e0', stroke='#bcc4bf'):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{fill}" stroke="{stroke}"/>')

def arrow(s, d, dash=False):
    s.append(f'<path d="{d}" fill="none" stroke="{BLUE}" stroke-width="1.7" marker-end="url(#arrow)"'+(' stroke-dasharray="5 5"' if dash else '')+'/>')

def tree(s, x, y, label):
    s.append(f'<path d="M{x} {y}L{x-24} {y+28}M{x} {y}L{x+24} {y+28}M{x-24} {y+28}L{x-36} {y+53}M{x-24} {y+28}L{x-12} {y+53}M{x+24} {y+28}L{x+12} {y+53}M{x+24} {y+28}L{x+36} {y+53}" fill="none" stroke="{BLUE}" stroke-width="1.5"/>')
    for dx,dy in [(0,0),(-24,28),(24,28),(-36,53),(-12,53),(12,53),(36,53)]:
        s.append(f'<circle cx="{x+dx}" cy="{y+dy}" r="4" fill="{BLUE}"/>')
    text(s,x,y+82,label,14,MUTED)

for mobile in [False, True]:
    w,h = (440,750) if mobile else (1180,360)
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>Monthly features, CatBoost trees and six-month-ahead sales</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="{BLUE}" stroke-width="1.5"/></marker></defs><rect width="100%" height="100%" fill="{PAPER}"/>']
    if mobile:
        text(s,24,32,'01 / MONTHLY FEATURES',13,BLUE,'start','600')
        rect(s,24,51,392,120)
        for y,label in [(82,'Store · product · month'),(113,'Sales + 1 / 2 / 3-month lags'),(144,'Prices · temperature · events · market data')]:text(s,220,y,label,16)
        arrow(s,'M220 180V216')
        text(s,24,244,'02 / ONE SHARED CATBOOST MODEL',13,BLUE,'start','600')
        rect(s,24,263,392,197,fill='#e5e8e5')
        for x,label in [(100,'Tree 1'),(220,'Tree 2'),(340,'Tree 500')]:tree(s,x,298,label)
        text(s,160,332,'+',23,ROSE);text(s,280,332,'···',23,ROSE)
        text(s,220,427,'Base prediction + weighted tree outputs',16)
        arrow(s,'M220 470V506')
        rect(s,80,520,280,76,fill='#eadbd2',stroke='#c3a699')
        text(s,220,550,'Sales at t + 6 months',21,weight='600')
        text(s,220,576,'One forecast for each input row',14,MUTED)
        arrow(s,'M220 604V636H10V391H24',True)
        text(s,240,666,'Training: compare with actual sales.',15,BLUE)
        text(s,220,697,'Fit the next tree to remaining errors.',15,BLUE)
        text(s,220,731,'Schematic trees · RMSE objective',12,MUTED)
    else:
        text(s,24,33,'01 / MONTHLY FEATURES',13,BLUE,'start','600')
        rect(s,24,58,260,168)
        for y,label in [(92,'Store · product · month'),(126,'Sales + 1 / 2 / 3-month lags'),(160,'Prices · temperature · events'),(194,'Market indicators')]:text(s,154,y,label,16)
        arrow(s,'M296 142H338')
        text(s,356,33,'02 / ONE SHARED CATBOOST MODEL',13,BLUE,'start','600')
        rect(s,350,58,490,168,fill='#e5e8e5')
        for x,label in [(430,'Tree 1'),(590,'Tree 2'),(760,'Tree 500')]:tree(s,x,88,label)
        text(s,510,122,'+',25,ROSE);text(s,674,122,'···',25,ROSE)
        text(s,595,209,'Base prediction + weighted tree outputs',16)
        arrow(s,'M852 142H895')
        text(s,918,33,'03 / PREDICT',13,ROSE,'start','600')
        rect(s,908,90,248,105,fill='#eadbd2',stroke='#c3a699')
        text(s,1032,128,'Sales at t + 6 months',21,weight='600')
        text(s,1032,159,'One forecast per input row',14,MUTED)
        arrow(s,'M1032 209V282H595V239',True)
        text(s,814,318,'Training: compare with actual sales; fit the next tree to remaining errors.',15,BLUE)
        text(s,154,280,'32 inputs · 12 lag features',16)
        text(s,154,307,'Schematic trees · RMSE objective',12,MUTED)
    (OUT/('architecture-mobile.svg' if mobile else 'architecture.svg')).write_text('\n'.join(s+['</svg>'])+'\n')
print('Generated 5 data charts and 2 architecture diagrams; no model retrained.')
