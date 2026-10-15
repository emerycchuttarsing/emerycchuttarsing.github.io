"""Native SVG teaching diagrams. No checkpoint weights or experiment curves invented."""
from pathlib import Path
from html import escape
import math

OUT = Path(__file__).resolve().parents[1] / 'public/media/tinystories'
OUT.mkdir(parents=True, exist_ok=True)
INK, MUTED, PLUM, GREEN = '#28242c', '#68616b', '#766084', '#60745d'
PAPER, LILAC, LINE = '#f6f2ea', '#e4dbe9', '#cfc4d3'

def svg(w, h, title, description):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>',
        f'<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="{PLUM}"/></marker></defs>',
        f'<rect width="{w}" height="{h}" fill="{PAPER}"/>',
        '<style>text{font-family:Arial,sans-serif} .mono{font-family:monospace}</style>']

def text(s, x, y, value, size=16, color=INK, anchor='start', weight='normal', cls=''):
    s.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" text-anchor="{anchor}" font-weight="{weight}" class="{cls}">{escape(value)}</text>')

def rect(s, x, y, w, h, fill=LILAC, stroke=LINE, r=5):
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')

def arrow(s, points, dashed=False):
    s.append(f'<path d="{points}" fill="none" stroke="{PLUM}" stroke-width="1.7" marker-end="url(#arrow)"'+(' stroke-dasharray="5 4"' if dashed else '')+'/>')

def matrix(s, x, y, rows=4, cols=7, cell=13, mask=False, color=PLUM):
    for i in range(rows):
        for j in range(cols):
            active = not mask or j <= i
            opacity = (0.23 + ((i * 3 + j * 5) % 8) * 0.085) if not mask else .75
            s.append(f'<rect x="{x+j*(cell+3)}" y="{y+i*(cell+3)}" width="{cell}" height="{cell}" rx="1.5" fill="{color if active else "#ede8df"}" fill-opacity="{opacity if active else 1}" stroke="{LINE}" stroke-width=".4"/>')

def box(s, x, y, w, h, title, subtitle='', fill=LILAC):
    rect(s,x,y,w,h,fill)
    text(s,x+w/2,y+(h/2+6 if not subtitle else h/2-3),title,16,anchor='middle',weight='bold')
    if subtitle:text(s,x+w/2,y+h/2+18,subtitle,12,MUTED,'middle')

def plus(s,x,y):
    s.append(f'<circle cx="{x}" cy="{y}" r="13" fill="{PAPER}" stroke="{PLUM}" stroke-width="1.5"/>')
    text(s,x,y+6,'+',20,PLUM,'middle')

def save(name,s):
    (OUT/name).write_text('\n'.join(s+['</svg>']))

def architecture(mobile=False):
    if mobile:
        s=svg(420,700,'Tokens, embeddings and the decoder','Configured Transformer design. Token IDs select learned 256-dimensional embedding rows. Add fixed positional vectors. Five decoder blocks preserve T by 256 shape. Final normalization and tied projection produce T by 3000 logits.')
        text(s,22,29,'ONE SEQUENCE · T ≤ 256',12,MUTED,cls='mono')
        for i in range(4):
            rect(s,23,63+i*24,55,21)
            text(s,50,78+i*24,f'x{i+1}',14,anchor='middle',cls='mono')
            arrow(s,f'M82 {74+i*24}H112')
        matrix(s,120,63,4,8,21)
        text(s,204,48,'Embedding lookup',17,anchor='middle',weight='bold')
        text(s,205,169,'E[x] · T × 256',14,PLUM,'middle',cls='mono')
        arrow(s,'M205 181V212');plus(s,205,228)
        box(s,261,207,140,42,'Position P','fixed sinusoidal',fill='#e3e7dd')
        arrow(s,'M260 228H221');arrow(s,'M205 242V274')
        text(s,221,264,'H₀ = E[x] + P',13,PLUM,cls='mono')
        for delta in [12,6,0]:rect(s,98+delta,285-delta,216,96)
        text(s,206,321,'5 decoder blocks',20,anchor='middle',weight='bold')
        text(s,206,348,'8 heads · residual width 256',13,MUTED,'middle')
        text(s,206,368,'T × 256 → T × 256',13,PLUM,'middle',cls='mono')
        arrow(s,'M205 382V412')
        box(s,96,422,218,58,'Final LayerNorm + Eᵀ','Shared embedding weights')
        arrow(s,'M205 481V514')
        box(s,96,524,218,57,'Next-token logits','T × 3,000',fill='#eee7d9')
        arrow(s,'M205 582V615')
        text(s,205,639,'softmax → p(next token)',17,anchor='middle',weight='bold')
        text(s,205,669,'Training uses logits; generation samples.',12,MUTED,'middle')
        arrow(s,'M308 105H391V450H318',True)
        text(s,366,398,'Eᵀ',14,PLUM,cls='mono')
        save('architecture-mobile.svg',s);return
    s=svg(1180,300,'From token IDs to next-token probabilities','For one sequence, symbolic token IDs select rows from an embedding table E of shape 3000 by 256. Add positional encodings. Five decoder blocks preserve T by 256. Final LayerNorm and projection using the transpose of E produce T by 3000 logits, followed by softmax. Colored cells are schematic.')
    text(s,25,29,'01  TOKEN IDS',12,MUTED,cls='mono')
    text(s,158,29,'02  EMBEDDING LOOKUP',12,MUTED,cls='mono')
    text(s,524,29,'03  CAUSAL DECODER',12,MUTED,cls='mono')
    text(s,822,29,'04  VOCABULARY OUTPUT',12,MUTED,cls='mono')
    for i in range(4):
        rect(s,28,70+i*21,52,18)
        text(s,54,84+i*21,f'x{i+1}',14,anchor='middle',cls='mono')
        arrow(s,f'M87 {79+i*21}H148')
    matrix(s,160,70,4,8,18)
    text(s,241,205,'E[x] : T × 256',15,PLUM,'middle',cls='mono')
    text(s,241,226,'E is learned · 3,000 × 256',12,MUTED,'middle')
    arrow(s,'M331 119H369');plus(s,388,119)
    matrix(s,357,169,4,4,12,color=GREEN)
    arrow(s,'M388 164V137')
    text(s,388,245,'Fixed position P',12,GREEN,'middle')
    arrow(s,'M403 119H502');text(s,451,100,'H₀',16,PLUM,'middle')
    for delta in [14,7,0]:rect(s,518+delta,68-delta,205,121)
    text(s,620,110,'5 decoder blocks',20,anchor='middle',weight='bold')
    text(s,620,138,'8 heads per block',14,MUTED,'middle')
    text(s,620,162,'T × 256 → T × 256',14,PLUM,'middle',cls='mono')
    arrow(s,'M741 119H802')
    box(s,814,73,161,92,'LayerNorm + Eᵀ','256 → 3,000')
    arrow(s,'M978 119H1004')
    for i,h in enumerate([17,48,29,67,22,11]):rect(s,1014+i*19,161-h,11,h,PLUM,PLUM,1)
    text(s,1074,198,'T × 3,000 logits',14,PLUM,'middle',cls='mono')
    text(s,1074,220,'softmax → probabilities',12,MUTED,'middle')
    arrow(s,'M244 237V278H895V176',True)
    rect(s,447,264,275,25,PAPER,PAPER,0)
    text(s,585,281,'Weight tying · same E at input and output',12,PLUM,'middle')
    save('architecture.svg',s)

def block(mobile=False):
    if mobile:
        s=svg(420,700,'Inside a pre-norm decoder block','Residual width is 256. LayerNorm then masked attention uses eight heads, each with 32-dimensional queries, keys and values. Add the original input. LayerNorm then a feed-forward network expands to 384 and returns to 256; add the second residual.')
        text(s,22,28,'ONE PRE-NORM BLOCK',12,MUTED,cls='mono')
        text(s,200,60,'H · T × 256',16,PLUM,'middle',cls='mono');arrow(s,'M200 72V95')
        box(s,110,100,180,39,'LayerNorm')
        arrow(s,'M200 140V167')
        for x,name in [(53,'Q'),(166,'K'),(279,'V')]:
            box(s,x,183,88,49,name,'T × 32')
        arrow(s,'M200 168H97V181');arrow(s,'M200 168H210V181');arrow(s,'M200 168H323V181')
        arrow(s,'M97 233V263H200V284');arrow(s,'M210 233V263');arrow(s,'M323 233V263H220V284')
        box(s,70,296,280,67,'softmax(QKᵀ / √32 + M) V','Future positions are masked')
        arrow(s,'M200 365V388')
        box(s,80,399,260,51,'8 heads → concatenate → Wₒ','T × 256')
        arrow(s,'M200 452V475');plus(s,200,491)
        arrow(s,'M200 78H29V491H184');text(s,38,471,'residual',12,PLUM)
        arrow(s,'M200 505V524')
        box(s,90,535,220,43,'LayerNorm')
        arrow(s,'M200 578V594');box(s,90,601,220,47,'FFN · 256 → 384 → 256')
        arrow(s,'M200 649V669');plus(s,200,684)
        arrow(s,'M201 514H379V684H216')
        save('decoder-block-mobile.svg',s);return
    s=svg(1180,290,'Inside one pre-norm Transformer block','Input H passes through LayerNorm and masked multi-head self-attention, then the first residual addition. LayerNorm and a position-wise feed-forward network precede the second residual addition. Eight heads of dimension 32 preserve width 256. The triangular matrix shows allowed attention positions, not measured attention weights.')
    text(s,25,25,'INSIDE ONE BLOCK · PRE-NORM',12,MUTED,cls='mono')
    text(s,29,133,'H',21,PLUM,cls='mono');arrow(s,'M52 125H76')
    box(s,84,100,97,50,'LayerNorm');arrow(s,'M182 125H208')
    for y,name in [(56,'Q'),(108,'K'),(160,'V')]:
        box(s,220,y,66,38,name)
        arrow(s,f'M210 125V{y+19}H218')
    text(s,253,225,'Linear projections · T × 32 / head',12,PLUM,'middle',cls='mono')
    arrow(s,'M288 75H310V104H329');arrow(s,'M288 127H329');arrow(s,'M288 179H310V151H329')
    rect(s,337,56,211,143)
    text(s,442,80,'Masked attention',16,anchor='middle',weight='bold')
    matrix(s,353,97,4,4,17,mask=True)
    text(s,495,118,'QKᵀ / √32',12,PLUM,'middle',cls='mono')
    text(s,495,139,'+ mask M',12,PLUM,'middle',cls='mono')
    text(s,495,160,'softmax',13,PLUM,'middle')
    text(s,442,186,'A · V → T × 32',12,MUTED,'middle',cls='mono')
    arrow(s,'M550 125H573');box(s,583,83,128,83,'8 heads','Concat + Wₒ')
    arrow(s,'M713 125H739');plus(s,756,125)
    arrow(s,'M63 125V42H756V110');text(s,618,35,'Residual connection',12,PLUM,'middle')
    arrow(s,'M770 125H794');box(s,804,100,96,50,'LayerNorm')
    arrow(s,'M902 125H924');box(s,934,83,168,83,'Feed-forward','256 → 384 → 256')
    arrow(s,'M1105 125H1127');plus(s,1144,125)
    arrow(s,'M781 125V210H1144V141');text(s,969,232,'Residual connection',12,PLUM,'middle')
    arrow(s,'M1158 125H1177')
    text(s,25,274,'Q / K compare tokens; V carries their content. Mask: Mᵢⱼ = −∞ for j > i. Each residual stream stays T × 256.',14,MUTED)
    save('decoder-block.svg',s)

def entropy(mobile=False):
    if mobile:
        s=svg(350,440,'Confidence is not correctness','Four-token illustration. True target B is green. Equal entropy, different cross-entropy; not model measurements.')
        for off,probs,label in [(0,[1/30,.9,1/30,1/30],'Confident + correct'),(205,[.9,1/30,1/30,1/30],'Confident + wrong')]:
            text(s,175,off+28,label,17,anchor='middle',weight='bold')
            for i,(name,p) in enumerate(zip('ABCD',probs)):
                x=70+i*57;h=p*90
                rect(s,x,off+141-h,34,h,GREEN if name=='B' else PLUM,GREEN if name=='B' else PLUM,1)
                text(s,x+17,off+132-h,'0.9' if p==.9 else '1/30',11,MUTED,'middle')
                text(s,x+17,off+161,name,13,GREEN if name=='B' else INK,'middle',weight='bold' if name=='B' else 'normal')
            ce=-math.log(probs[1]);h=-sum(p*math.log(p) for p in probs)
            text(s,175,off+190,f'H = {h:.3f}  ·  CE = {ce:.3f}',15,PLUM,'middle',cls='mono')
        text(s,175,422,'Target = B (green). Toy example; units: nats.',12,MUTED,'middle')
        save('cross-entropy-mobile.svg',s);return
    s=svg(700,230,'Confidence is not correctness','Illustrative distributions over four tokens. The correct target is B. Both put probability 0.9 on one token and 1/30 on each remaining token: both have entropy 0.435 nats. Cross-entropy is 0.105 when B receives 0.9 and 3.401 when B receives 1/30. These are mathematical examples, not measured model predictions.')
    for off,probs,label in [(0,[1/30,.9,1/30,1/30],'Confident + correct'),(350,[.9,1/30,1/30,1/30],'Confident + wrong')]:
        text(s,off+175,28,label,17,anchor='middle',weight='bold')
        for i,(name,p) in enumerate(zip('ABCD',probs)):
            x=off+70+i*57;h=p*90
            rect(s,x,141-h,34,h,GREEN if name=='B' else PLUM,GREEN if name=='B' else PLUM,1)
            text(s,x+17,132-h,'0.9' if p == .9 else '1/30',11,MUTED,'middle')
            text(s,x+17,161,name,13,GREEN if name=='B' else INK,'middle',weight='bold' if name=='B' else 'normal')
        ce=-math.log(probs[1]);h=-sum(p*math.log(p) for p in probs)
        text(s,off+175,190,f'H = {h:.3f}  ·  CE = {ce:.3f}',15,PLUM,'middle',cls='mono')
    text(s,350,220,'Same entropy. Different loss. Target = B (green). Toy example, not model results.',12,MUTED,'middle')
    save('cross-entropy.svg',s)

architecture();architecture(True);block();block(True);entropy();entropy(True)
print('Generated 6 TinyStories diagrams.')
