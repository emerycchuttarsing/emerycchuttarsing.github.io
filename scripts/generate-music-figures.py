"""Redraw reported Spotify experiments; no fitting or synthetic measurements.

Sources live in public/data/music-recommendation. Requires numpy/matplotlib.
Compact variants keep labels readable on small screens.
"""
from pathlib import Path
import csv
import os
import tempfile

os.environ.setdefault('MPLCONFIGDIR', str(Path(tempfile.gettempdir()) / 'music-plot-cache'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter, FormatStrFormatter
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/media/music-recommendation'
DATA = ROOT / 'public/data/music-recommendation'
OUT.mkdir(parents=True, exist_ok=True)
PAPER, INK, MUTED, GRID = '#f6f2e9', '#292d27', '#70756c', '#deded2'
GREEN, BLUE, OCHRE = '#416d62', '#3e6982', '#a06c36'
plt.rcParams.update({
    'font.family': ['DejaVu Sans', 'sans-serif'], 'font.size': 12,
    'text.color': INK, 'axes.labelcolor': MUTED, 'xtick.color': MUTED,
    'ytick.color': MUTED, 'figure.facecolor': PAPER, 'axes.facecolor': PAPER,
    'svg.fonttype': 'none', 'svg.hashsalt': 'music-recommendation-portfolio',
})

def read(name):
    with (DATA / f'{name}.csv').open() as f:
        return list(csv.DictReader(f))

def clean(ax, grid='x'):
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.tick_params(length=0, pad=9, labelsize=11)
    ax.grid(axis=grid, color=GRID, lw=.7)
    ax.set_axisbelow(True)

def save(fig, name, compact):
    fig.savefig(OUT / f'{name}{"-mobile" if compact else ""}.svg', metadata={'Date': None})
    plt.close(fig)

retrieval = read('retrieval-baselines')
modes = read('scoring-modes')
history = read('train-history')
sweep = sorted(read('lambda-sweep'), key=lambda row: float(row['lambda']), reverse=True)
assert len(retrieval) == 3 and len(modes) == 3 and len(history) == 7 and len(sweep) == 3
epochs = np.array([int(r['epoch']) for r in history])
loss = np.array([float(r['train_loss']) for r in history])
ndcg = np.array([float(r['val_NDCG@10']) for r in history])

for compact in [False, True]:
    fig, ax = plt.subplots(figsize=(5.7, 4.7) if compact else (9, 4.4))
    fig.subplots_adjust(left=.26 if compact else .20, right=.73, top=.69, bottom=.20)
    fig.text(.05, .94, 'Choose the first-stage\nretriever' if compact else 'Choose the first-stage retriever',
             fontsize=19 if compact else 22, va='top')
    fig.text(.81, .76, 'Training\ntime', color=MUTED, fontsize=10)
    for y, row, color in zip([2,1,0], retrieval, [OCHRE, BLUE, GREEN]):
        value=float(row['recall100'])
        ax.barh(y, value, height=.46, color=color)
        ax.text(value+.006, y, f'{value:.1%}', va='center', fontsize=12, color=color, weight='bold')
        ax.text(1.17, y, ['~10 h','~6 h','~8 min'][2-y], transform=ax.get_yaxis_transform(), va='center', fontsize=12)
    ax.set(yticks=[2,1,0], yticklabels=['Two-Tower', 'Track2Vec', 'ALS'], ylim=(-.6,2.6),
           xlim=(0,.20), xticks=[0,.05,.10,.15])
    ax.xaxis.set_major_formatter(PercentFormatter(1, decimals=0))
    clean(ax)
    ax.set_xlabel('Recall@100 · higher is better', fontsize=11, labelpad=13)
    save(fig, 'retrieval-benchmark', compact)

    fig, axes = plt.subplots(2 if compact else 1, 1 if compact else 2,
                             figsize=(5.7,6.4) if compact else (9,4.9))
    fig.subplots_adjust(left=.30 if compact else .22, right=.94, top=.74,
                        bottom=.10 if compact else .22, hspace=.72, wspace=.23)
    fig.text(.045,.95,'A ranker needs\nthe right candidate set' if compact else 'A ranker needs the right candidate set',
             fontsize=20 if compact else 22, va='top')
    fig.text(.045,.79 if compact else .84, '150,000 test playlists · reported scoring modes', fontsize=10 if compact else 12, color=MUTED)
    for ax, metric, title, limit in zip(axes, ['recall100','ndcg10'], ['Recall@100', 'NDCG@10'], [.285,.058]):
        for y, row, color in zip([2,1,0], modes, [GREEN,OCHRE,BLUE]):
            value=float(row[metric]); ax.barh(y,value,height=.44,color=color)
            text=f'{value:.1%}' if metric=='recall100' else f'{value:.3f}'
            ax.text(value+limit*.025,y,text,va='center',fontsize=11,color=color,weight='bold')
        labels=['ALS','SASRec\nfull catalog','ALS +\nSASRec'] if compact else ['ALS','SASRec full catalog','ALS + SASRec']
        ax.set(yticks=[2,1,0], yticklabels=labels if compact or metric=='recall100' else [],
               ylim=(-.65,2.6),xlim=(0,limit))
        ax.set_title(title,loc='left',fontsize=13,pad=12)
        if metric=='recall100':
            ax.set_xticks([0,.1,.2]); ax.xaxis.set_major_formatter(PercentFormatter(1,decimals=0))
        else: ax.set_xticks([0,.02,.04])
        clean(ax)
    save(fig,'scoring-modes',compact)

    fig, axes = plt.subplots(2 if compact else 1, 1 if compact else 2,
                             figsize=(5.7,6.3) if compact else (9,4))
    fig.subplots_adjust(left=.16 if compact else .09,right=.94,top=.72,bottom=.11 if compact else .22,
                        hspace=.8,wspace=.3)
    fig.text(.045,.95,'Lower loss is not\nthe whole story' if compact else 'Lower loss is not the whole story',
             fontsize=20 if compact else 22,va='top')
    for ax, values, title, color in zip(axes, [loss,ndcg], ['Training loss','Validation NDCG@10'], [GREEN,BLUE]):
        ax.plot(epochs,values,color=color,marker='o',ms=4,lw=2)
        ax.set_title(title,loc='left',fontsize=13,color=color,pad=13)
        ax.set(xticks=[2,6,10,14],xlim=(1.5,14.5))
        ax.set_xlabel('Epoch',fontsize=11,labelpad=9)
        clean(ax,'y')
    axes[0].set(ylim=(2.7,3.5),yticks=[2.8,3.1,3.4])
    axes[1].set(ylim=(.0435,.050),yticks=[.044,.047,.050])
    axes[1].yaxis.set_major_formatter(FormatStrFormatter('%.3f'))
    best=int(ndcg.argmax())
    axes[1].scatter([epochs[best]],[ndcg[best]],s=115,facecolors='none',edgecolors=BLUE,lw=1.2,zorder=4)
    save(fig,'training-diagnostics',compact)

    fig, ax = plt.subplots(figsize=(5.7,5.1) if compact else (9,4.7))
    fig.subplots_adjust(left=.17 if compact else .13,right=.90,top=.65,bottom=.23)
    fig.text(.045,.95,'The price of\na more varied list' if compact else 'The price of a more varied list',
             fontsize=20 if compact else 22,va='top')
    fig.text(.045,.72 if compact else .80,'Recall@20',color=OCHRE,fontsize=12,weight='bold')
    fig.text(.48 if compact else .31,.72 if compact else .80,'Diversity (ILD)',color=GREEN,fontsize=12,weight='bold')
    ax.axvline(0,color=MUTED,lw=.9)
    ax.axhspan(.57,1.43,color=GREEN,alpha=.055)
    for y,row in zip([2,1,0],sweep):
        recall=float(row['Recall change vs raw top-20']); diversity=float(row['ILD change vs raw top-20'])
        ax.barh(y+.13,recall,height=.23,color=OCHRE)
        ax.barh(y-.13,diversity,height=.23,color=GREEN)
        ax.text(recall-1,y+.13,f'{recall:.1f}%',ha='right',va='center',fontsize=11,color=OCHRE)
        ax.text(diversity+1,y-.13,f'+{diversity:.1f}%',va='center',fontsize=11,color=GREEN)
    ax.set(yticks=[2,1,0],yticklabels=['λ = 0.7','λ = 0.5','λ = 0.3'],xlim=(-30,45),ylim=(-.6,2.6),xticks=[-20,0,20,40])
    clean(ax)
    ax.set_xlabel('Relative change from raw top-20 (%)',fontsize=10 if compact else 12,labelpad=13)
    save(fig,'diversity-tradeoff',compact)

print(f'Generated eight source-backed figures. Highest exported validation NDCG: epoch {epochs[ndcg.argmax()]}.')
