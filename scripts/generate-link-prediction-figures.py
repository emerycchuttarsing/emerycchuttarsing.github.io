"""Portfolio figures from saved notebook outputs and report tables; no model retraining."""
from pathlib import Path
from html import escape
import csv
import json
import os
import tempfile
os.environ.setdefault('MPLCONFIGDIR', str(Path(tempfile.gettempdir()) / 'link-prediction-mpl'))
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'public/data/link-prediction'
OUT = ROOT / 'public/media/link-prediction'
OUT.mkdir(parents=True, exist_ok=True)
PAPER, INK, MUTED, LINE = '#f6f2e9', '#292820', '#6e6a60', '#d9d1c2'
GOLD, TEAL = '#997039', '#467c78'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':12,'text.color':INK,
                    'axes.labelcolor':MUTED,'xtick.color':MUTED,'ytick.color':MUTED,
                    'figure.facecolor':PAPER,'axes.facecolor':PAPER,'svg.fonttype':'none',
                    'svg.hashsalt':'link-prediction-portfolio'})

def clean(ax):
    for spine in ax.spines.values():spine.set_visible(False)
    ax.tick_params(length=0,pad=8)
    ax.set_axisbelow(True)

def save(fig, name):
    fig.savefig(OUT/name,metadata={'Date':None})
    target = OUT/name
    target.write_text(target.read_text().replace("font-family: 'DejaVu Sans'", 'font-family: Arial, sans-serif'))
    plt.close(fig)

# Two reported experiments, with different held-out sample counts.
with (DATA/'reported-results.csv').open() as f: results=list(csv.DictReader(f))
for compact in (False, True):
    fig,ax=plt.subplots(figsize=(4.4,3.8) if compact else (6.4,3.6));fig.subplots_adjust(left=.07,right=.96,top=.91,bottom=.2)
    for y,row,color in zip([1,0],results,[GOLD,TEAL]):
        score=float(row['auc_roc'])
        ax.barh(y,score,height=.20,color=color,zorder=3)
        ax.text(0,y+.23,row['model'],fontsize=12,color=color,weight='bold')
        ax.text(score,y+.23,f'{score:.4f}',fontsize=14,color=color,weight='bold',ha='right')
    ax.axvline(.5,color=MUTED,linestyle=(0,(4,4)),linewidth=1)
    ax.text(.505,-.43,'Random ranking',fontsize=10,color=MUTED)
    ax.set(xlim=(0,1),ylim=(-.6,1.55),yticks=[],xticks=[0,.25,.5,.75,1])
    ax.set_xlabel('ROC-AUC · higher is better',fontsize=11,labelpad=9)
    ax.grid(axis='x',color=LINE,linewidth=.7);clean(ax);save(fig,'auc-mobile.svg' if compact else 'auc.svg')
# Only the ten numeric checkpoints actually saved in the notebook.
with (DATA/'baseline-loss.csv').open() as f: rows=list(csv.DictReader(f))
epoch=np.array([int(r['epoch']) for r in rows]);loss=np.array([float(r['regularized_squared_loss']) for r in rows])
for compact in (False, True):
    fig,ax=plt.subplots(figsize=(4.4,3.8) if compact else (6.4,3.6));fig.subplots_adjust(left=.19 if compact else .13,right=.95,top=.91,bottom=.2)
    ax.plot(epoch,loss,color=GOLD,lw=2,marker='o',markersize=4)
    ax.set(xlim=(-1,47),ylim=(0,25000),xticks=[0,15,30,45],yticks=[0,10000,20000],yticklabels=['0','10,000','20,000'])
    ax.set_xlabel('Epoch · saved checkpoints',fontsize=11,labelpad=9)
    ax.text(.01,1.03,'Regularized squared loss',transform=ax.transAxes,fontsize=11,color=MUTED)
    ax.annotate('2,111',xy=(45,loss[-1]),xytext=(31,7500),color=GOLD,fontsize=12,
                arrowprops={'arrowstyle':'-','color':GOLD,'lw':1})
    ax.grid(axis='y',color=LINE,linewidth=.7);clean(ax);save(fig,'convergence-mobile.svg' if compact else 'convergence.svg')
# A real 13-user neighbourhood, with one observed edge hidden for illustration.
graph=json.loads((DATA/'example-subgraph.json').read_text())
nodes=graph['nodes'];index={n:i for i,n in enumerate(nodes)}
hidden=tuple(graph['illustrative_hidden_edge'])
edges=[(index[a],index[b]) for a,b in graph['edges'] if (a,b)!=hidden]
n=len(nodes);rng=np.random.default_rng(42);pos=rng.uniform(-1,1,(n,2));k=.65
for step in range(400):
    delta=pos[:,None,:]-pos[None,:,:];dist=np.maximum(np.linalg.norm(delta,axis=2),.03)
    force=(delta*(k*k/dist**2)[:,:,None]).sum(axis=1)
    for a,b in edges:
        pull=(pos[a]-pos[b])*np.linalg.norm(pos[a]-pos[b])/k
        force[a]-=pull;force[b]+=pull
    norms=np.maximum(np.linalg.norm(force,axis=1),.01)
    pos+=force/norms[:,None]*np.minimum(norms,.08*(1-step/400))[:,None]
    pos-=pos.mean(axis=0)
pos/=max(np.ptp(pos[:,0]),np.ptp(pos[:,1]));pos*=2.1
fig,ax=plt.subplots(figsize=(7.2,4.9));fig.subplots_adjust(left=.03,right=.97,top=.98,bottom=.08)
for a,b in edges:ax.plot(*pos[[a,b]].T,color=TEAL,alpha=.22,lw=1.2,zorder=1)
a,b=[index[v] for v in hidden]
ax.scatter(*pos.T,s=100,color='#b5c7bf',edgecolor=PAPER,linewidth=2,zorder=3)
ax.scatter(*pos[[a,b]].T,s=220,color=GOLD,edgecolor=PAPER,linewidth=3,zorder=4)
arc=FancyArrowPatch(pos[a],pos[b],connectionstyle='arc3,rad=-.3',arrowstyle='-',
                    linestyle=(0,(4,3)),color=GOLD,lw=2.4,zorder=2)
ax.add_patch(arc)
for i,label in [(a,'u'),(b,'v')]:
    ax.annotate(label,pos[i],xytext=(10,12),textcoords='offset points',fontsize=17,color=GOLD,weight='bold')
ax.set_aspect('equal');ax.set_axis_off();ax.margins(.13)
fig.text(.08,.035,'Observed friendship',fontsize=11,color=TEAL)
fig.text(.60,.035,'Hidden link: u ↔ v',fontsize=11,color=GOLD)
save(fig,'neighbourhood.svg')

# Architecture diagrams use schematic vectors; no learned values are implied.
def start(w,h):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">Two ways to score a missing link</title><desc id="desc">Matrix factorization learns node vectors directly and scores their dot product. The GCN aggregates neighbours through three layers, then an MLP scores pair features. Both receive feedback from their respective training losses.</desc>',
    f'<rect width="{w}" height="{h}" fill="{PAPER}"/><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="{MUTED}"/></marker></defs>']
def text(s,x,y,t,size=17,color=INK,anchor='start',weight='normal'):
    s.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}">{escape(t)}</text>')
def box(s,x,y,w,h,t,sub='',color=GOLD):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{color}" fill-opacity=".07" stroke="{color}" stroke-opacity=".5"/>')
    text(s,x+w/2,y+(h/2-3 if sub else h/2+6),t,18,color,'middle','bold')
    if sub:text(s,x+w/2,y+h/2+20,sub,14,MUTED,'middle')
def arrow(s,d,dashed=False):
    s.append(f'<path d="{d}" stroke="{MUTED}" stroke-width="1.6" fill="none" marker-end="url(#arrow)"'+(' stroke-dasharray="5 4"' if dashed else '')+'/>')
def vectors(s,x,y,color,label,width=14):
    for row in range(2):
        for col in range(6):
            s.append(f'<rect x="{x+col*(width+3)}" y="{y+row*34}" width="{width}" height="22" rx="2" fill="{color}" fill-opacity="{.2+((row*3+col*2)%7)*.1}"/>')
    text(s,x+6*(width+3)/2-2,y+86,label,14,MUTED,'middle')
def graph_icon(s,x,y):
    for dx,dy in [(-30,-27),(31,-24),(-35,24),(29,31)]:
        arrow(s,f'M{x+dx} {y+dy}L{x+dx*.28} {y+dy*.28}')
        s.append(f'<circle cx="{x+dx}" cy="{y+dy}" r="8" fill="#a9c1b7"/>')
    s.append(f'<circle cx="{x}" cy="{y}" r="12" fill="{TEAL}"/>')

def architecture(mobile):
    if mobile:
        s=start(440,940)
        text(s,24,35,'01  MATRIX FACTORIZATION',15,GOLD,weight='bold')
        box(s,24,60,142,65,'User IDs','u and v');arrow(s,'M178 92H233')
        vectors(s,260,63,GOLD,'Two 10D vectors',17)
        arrow(s,'M320 147V178')
        box(s,232,190,183,66,'Dot product','Vector similarity');arrow(s,'M220 223H178')
        box(s,24,190,142,66,'Link score','Raw similarity')
        arrow(s,'M94 268V307H429V91H395',True)
        text(s,220,338,'Squared error + L₂ → batch GD',16,GOLD,'middle','bold')
        text(s,220,364,'Update the node vectors U.',15,MUTED,'middle')
        text(s,220,401,'10 dimensions · 50 epochs',14,MUTED,'middle')
        s.append(f'<path d="M24 436H416" stroke="{LINE}"/>')
        text(s,24,475,'02  GCN + MLP',15,TEAL,weight='bold')
        graph_icon(s,77,546);text(s,82,609,'Features + graph',14,MUTED,'middle')
        arrow(s,'M126 548H176');box(s,190,511,223,72,'3 GCN layers','Aggregate neighbours',TEAL)
        arrow(s,'M303 595V637');vectors(s,254,648,TEAL,'Two 256D vectors',17)
        arrow(s,'M238 677H184');box(s,24,646,147,72,'Pair features','1,024 values',TEAL)
        arrow(s,'M97 730V764');box(s,24,777,147,67,'MLP decoder','Edge logit',TEAL)
        arrow(s,'M184 810H240');box(s,253,777,160,67,'Sigmoid','Link score',TEAL)
        arrow(s,'M414 812H429V495H303V504',True)
        arrow(s,'M429 812V861H97V852',True)
        text(s,220,888,'Binary cross-entropy → Adam',16,TEAL,'middle','bold')
        text(s,220,916,'Update the encoder and decoder.',15,MUTED,'middle')
    else:
        s=start(1180,460)
        text(s,26,35,'01  MATRIX FACTORIZATION',16,GOLD,weight='bold')
        box(s,26,64,150,66,'User IDs','u and v');arrow(s,'M189 97H242')
        vectors(s,270,64,GOLD,'Two 10D vectors',17);arrow(s,'M415 97H485')
        box(s,501,64,230,66,'Dot product','Vector similarity');arrow(s,'M747 97H807')
        box(s,824,64,326,66,'Link score','Raw similarity · sigmoid at evaluation')
        arrow(s,'M987 143V175H404V123H394',True)
        text(s,655,198,'Squared error + L₂  →  full-batch gradient descent  →  update U',17,GOLD,'middle')
        text(s,1150,35,'10 dimensions · 50 epochs',15,MUTED,'end')
        s.append(f'<path d="M26 227H1150" stroke="{LINE}"/>')
        text(s,26,263,'02  GCN + MLP',16,TEAL,weight='bold')
        graph_icon(s,76,331);text(s,76,391,'Features + graph',14,MUTED,'middle')
        arrow(s,'M128 330H166');box(s,180,294,190,72,'3 GCN layers','Neighbour aggregation',TEAL)
        arrow(s,'M384 330H419');vectors(s,440,298,TEAL,'Two 256D vectors',15)
        arrow(s,'M565 330H601');box(s,615,294,200,72,'Pair features','1,024 values',TEAL)
        arrow(s,'M830 330H866');box(s,880,294,270,72,'MLP → sigmoid','Score the candidate edge',TEAL)
        arrow(s,'M1015 381V412H275V380',True)
        text(s,655,440,'Binary cross-entropy  →  Adam  →  update GCN and MLP weights',17,TEAL,'middle')
        text(s,1150,263,'256D embeddings · 20% dropout',15,MUTED,'end')
    (OUT/('architecture-mobile.svg' if mobile else 'architecture.svg')).write_text('\n'.join(s+['</svg>'])+'\n')
architecture(False);architecture(True)
print('Generated real subgraph illustration, architecture diagrams and source-backed result charts.')
