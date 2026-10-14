"""Original conceptual loops. Requires Pillow and FFmpeg; no research data used."""
import math
import os
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, SECONDS = 768, 480, 24, 6
OUT = Path(__file__).resolve().parents[1] / 'public/media'
FONT = ImageFont.load_default(size=13)
SMALL = ImageFont.load_default(size=10)
TAU = math.tau


def base(label, color):
    im = Image.new('RGB', (W, H), '#172127')
    d = ImageDraw.Draw(im)
    for y in range(H):
        v = 1 - abs(y / H - .5) * 2
        d.line((0, y, W, y), fill=(23 + int(v * 6), 33 + int(v * 8), 39 + int(v * 8)))
    d.rectangle((25, 25, W-25, H-25), outline='#435254', width=1)
    return im, d


def draw(kind, phase):
    if kind == 'rl-path-signatures':
        im, d = base('PATH REPRESENTATIONS', '#abc1cc')
        for line in range(18):
            points = []
            for x in range(0, 660, 4):
                u = x/660
                y = 222 + line*5 + 40*math.sin(u*TAU + .12*line + .12*math.sin(phase)) + 18*math.sin(u*TAU*2 + line*.15)
                points.append((54+x, y))
            d.line(points, fill=('#c4a978' if line == 12 else '#6e909a'), width=2 if line == 12 else 1)
            j = int(((phase/TAU + line*.027) % 1) * (len(points)-1))
            px, py = points[j]
            d.ellipse((px-2, py-2, px+2, py+2), fill='#e9dec3')
    elif kind == 'signature-deep-hedging':
        im, d = base('SIGNATURE-BASED HEDGING', '#ccb583')
        def project(x,z):
            h = 50*math.exp(-(x*x+z*z)*1.8) + 12*math.sin(x*4 + .15*math.sin(phase))*math.cos(z*3)
            return (384 + x*215 + z*100, 288 + z*76 - h + x*12)
        for i in range(23):
            v = -1+i/11
            d.line([project(v,-1+j/25) for j in range(51)], fill='#9d906f', width=1)
            d.line([project(-1+j/25,v) for j in range(51)], fill='#627f87', width=1)
        for n in range(6):
            x, z = .78*math.cos(phase + n), .68*math.sin(phase + n)
            px, py = project(x,z)
            d.ellipse((px-3,py-3,px+3,py+3), fill='#ead8ab')
    else:
        im, d = base('LISTENING IN LATENT SPACE', '#b6cbb1')
        nodes = [(384+235*math.cos(n*2.399)*(.45+(n%4)*.13), 235+120*math.sin(n*2.399)) for n in range(22)]
        for n, (x,y) in enumerate(nodes):
            for m in [(n+3)%22, (n+7)%22]:
                d.line((x,y,*nodes[m]), fill='#3d5854', width=1)
            pulse = .5+.5*math.sin(phase+n*.4)
            r=2+2*pulse
            d.ellipse((x-r,y-r,x+r,y+r), fill='#b6cbb1')
        for n in range(76):
            x=210+n*4.6
            h=10+30*abs(math.sin(n*.28+phase))*math.sin(math.pi*n/76)
            d.line((x,235-h,x,235+h), fill='#c5c395', width=2)
    return im


for name in ['rl-path-signatures','signature-deep-hedging','music-recommendation']:
    destination = OUT / f'{name}.mp4'
    cmd = [os.environ.get('FFMPEG', 'ffmpeg'), '-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(destination)]
    process = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for frame in range(FPS*SECONDS):
        process.stdin.write(draw(name, TAU*frame/(FPS*SECONDS)).tobytes())
    process.stdin.close()
    if process.wait():
        raise RuntimeError(f'FFmpeg failed for {name}')
    print(f'{destination.name}: {destination.stat().st_size:,} bytes')
