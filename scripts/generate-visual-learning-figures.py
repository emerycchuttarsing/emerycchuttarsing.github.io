"""Redraw saved project metrics and explain the feature/classifier pipeline.
No model fitting, synthetic scores or interpolated experiment results.
"""
from pathlib import Path
from html import escape
import csv
import os
import tempfile
os.environ.setdefault('MPLCONFIGDIR', str(Path(tempfile.gettempdir())/'visual-learning-mpl'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'public/media/visual-learning'
DATA = ROOT/'public/data/visual-learning'
PAPER, INK, MUTED, LINE = '#f5f3eb', '#292d27', '#657166', '#d4d9cd'
TEAL, GOLD = '#3f706e', '#a57943'
plt.rcParams.update({'font.family':'DejaVu Sans', 'font.size':12, 'text.color':INK,
    'axes.labelcolor':MUTED, 'xtick.color':MUTED, 'ytick.color':MUTED,
    'figure.facecolor':PAPER, 'axes.facecolor':PAPER, 'svg.fonttype':'none',
    'svg.hashsalt':'visual-learning-portfolio'})

def save(fig,name):
    fig.savefig(OUT/name, metadata={'Date':None})
    p=OUT/name
    p.write_text(p.read_text().replace("font-family: 'DejaVu Sans'",'font-family: Arial, sans-serif'))
    plt.close(fig)

def clean(ax):
    for spine in ax.spines.values():spine.set_visible(False)
    ax.tick_params(length=0,pad=8)
    ax.set_axisbelow(True)
    ax.grid(axis='y', color=LINE, lw=.7)

rows=list(csv.DictReader((DATA/'damage-validation.csv').open()))
x=np.arange(len(rows))
fig,ax=plt.subplots(figsize=(6.2,3.8))
fig.subplots_adjust(left=.1,right=.97,top=.83,bottom=.19)
ax.axvspan(.75,1.25,color='#e2e6d6',zorder=0)
for key,color,label,style in [('train_macro_f1',GOLD,'Training','--'),('validation_macro_f1',TEAL,'Validation','-')]:
    y=[float(r[key]) for r in rows]
    ax.plot(x,y,color=color,linestyle=style,lw=2,marker='o',ms=5,label=label)
ax.annotate('0.533',xy=(1,.533),xytext=(1,.29),ha='center',fontsize=12,color=TEAL,
            arrowprops={'arrowstyle':'-','color':TEAL,'lw':1})
ax.set(xlim=(-.25,4.25),ylim=(0,1),xticks=x,xticklabels=['0.01','0.1','1','10','100'],yticks=[0,.25,.5,.75,1])
ax.set_xlabel('C · inverse regularization strength',labelpad=10,fontsize=11)
ax.text(0,1.12,'Macro-F1',transform=ax.transAxes,color=MUTED,fontsize=11)
ax.legend(loc='lower right',bbox_to_anchor=(1,1.01),ncol=2,frameon=False,fontsize=10)
clean(ax);save(fig,'damage-validation.svg')

rows=list(csv.DictReader((DATA/'damage-test.csv').open()))
fig,ax=plt.subplots(figsize=(6.2,3.8));fig.subplots_adjust(left=.065,right=.95,top=.91,bottom=.18)
colors=['#69847a','#8d986a','#b59159','#9d654b']
for i,(row,color) in enumerate(zip(rows,colors)):
    y=3-i; score=float(row['f1'])
    ax.barh(y,1,height=.19,color='#e1e4da')
    ax.barh(y,score,height=.19,color=color,zorder=3)
    ax.text(0,y+.24,f'{row["damage_level"]}  {row["class"]}',fontsize=12,color=INK)
    ax.text(1,y+.24,f'F1 {score:.2f}  ·  n = {row["support"]}',fontsize=11,color=color,ha='right')
    if score==0:ax.scatter(0,y,marker='x',s=30,color=color,zorder=4,clip_on=False)
ax.set(xlim=(0,1),ylim=(-.45,3.65),yticks=[],xticks=[0,.25,.5,.75,1])
ax.set_xlabel('F1 by class · held-out test split',fontsize=11,labelpad=10)
clean(ax);ax.grid(False);save(fig,'damage-class-f1.svg')

# Diagrams are explanatory: blocks depict measured features, not learned embeddings.
def start(w,h):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>Image features and logistic classification</title><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10" fill="none" stroke="{TEAL}" stroke-width="1.5"/></marker></defs><rect width="100%" height="100%" fill="{PAPER}"/>']
def text(s,x,y,words,size=17,color=INK,anchor='middle',weight='400'):
    s.append(f'<text x="{x}" y="{y}" fill="{color}" text-anchor="{anchor}" font-family="Arial,sans-serif" font-size="{size}" font-weight="{weight}">{escape(words)}</text>')
def arrow(s,d,dashed=False):
    s.append(f'<path d="{d}" fill="none" stroke="{TEAL}" stroke-width="1.6" marker-end="url(#arrow)"'+(' stroke-dasharray="5 5"' if dashed else '')+'/>')
def box(s,x,y,w,h,title,subtitle=''):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="#e5e9df" stroke="#aabbb0"/>')
    text(s,x+w/2,y+29,title,18,weight='600')
    if subtitle:text(s,x+w/2,y+53,subtitle,14,MUTED)
def tiles(s,x,y,size=13):
    colors=['#55745e','#8d9e74','#788e6a','#a8b58b','#536b5a','#b9c4a5','#6a816c','#899d7b','#a4b394']
    for i,c in enumerate(colors):s.append(f'<rect x="{x+(i%3)*(size+2)}" y="{y+(i//3)*(size+2)}" width="{size}" height="{size}" fill="{c}"/>')
def vector(s,x,y):
    for i,c in enumerate([TEAL]*3+[GOLD]*3+['#8e9671']*3):s.append(f'<rect x="{x+i*12}" y="{y}" width="9" height="24" fill="{c}" opacity=".75"/>')
for mobile in [False,True]:
    s=start(440,780) if mobile else start(1180,340)
    if mobile:
        text(s,24,33,'FIXED REPRESENTATION',13,TEAL,'start', '600')
        tiles(s,43,64,18);text(s,73,151,'RGB image',15)
        arrow(s,'M118 96H154');box(s,170,63,242,73,'Color · edges · texture','Global + local measurements')
        arrow(s,'M290 148V176H220V204');vector(s,168,219)
        text(s,220,273,'24 or 25 features per image',16)
        arrow(s,'M220 290V330');text(s,24,318,'LEARNED CLASSIFIER',13,TEAL,'start','600')
        box(s,111,345,218,75,'Logistic regression','Scale features for Task B')
        arrow(s,'M220 433V478');box(s,111,491,218,75,'Class probabilities','Choose the largest score')
        arrow(s,'M342 525H411V626H335',True)
        box(s,111,591,218,73,'Log loss + L2','Compare with true labels')
        arrow(s,'M98 628H34V382H98',True)
        text(s,220,706,'Update classifier weights',17,TEAL)
        text(s,220,739,'Color / Sobel / LBP stay fixed.',15,MUTED)
    else:
        text(s,27,36,'FIXED REPRESENTATION',13,TEAL,'start','600')
        text(s,690,36,'LEARNED CLASSIFIER',13,TEAL,'start','600')
        tiles(s,43,81,19);text(s,74,178,'RGB image',16)
        arrow(s,'M122 113H167');box(s,181,77,244,76,'Color · edges · texture','Global + local measurements')
        arrow(s,'M437 113H481');vector(s,502,100)
        text(s,553,156,'Feature vector',16);text(s,553,178,'24 or 25 values',14,MUTED)
        arrow(s,'M624 113H676');box(s,690,77,210,76,'Logistic regression','Scale features for Task B')
        arrow(s,'M912 113H957');box(s,971,77,183,76,'Probabilities','Choose a class')
        arrow(s,'M1062 166V226H910',True)
        box(s,690,193,210,73,'Log loss + L2','Compare with true labels')
        arrow(s,'M678 230H655V166H795V159',True)
        text(s,796,304,'Update classifier weights',16,TEAL)
        text(s,284,257,'The image filters stay fixed.',17,MUTED)
        text(s,284,282,'Only the decision rule is learned.',15,MUTED)
    (OUT/('pipeline-mobile.svg' if mobile else 'pipeline.svg')).write_text('\n'.join(s+['</svg>'])+'\n')
print('Generated pipeline diagrams and charts from saved metrics.')
