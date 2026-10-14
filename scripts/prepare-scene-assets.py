from pathlib import Path
import subprocess,json,os
p=Path(__file__).resolve().parents[1]
curves={}
for id in ['rl-path-signatures','signature-deep-hedging','music-recommendation']:
    data=subprocess.check_output([os.environ.get('FFMPEG','ffmpeg'),'-v','error','-i',str(p/f'public/media/{id}.mp4'),'-vf','fps=2,scale=32:20','-f','rawvideo','-pix_fmt','rgb24','-'])
    frames=[]
    for start in range(0,len(data),32*20*3):
        pixels=[tuple(data[j:j+3]) for j in range(start,min(len(data),start+32*20*3),3)]
        pixels=sorted(pixels,key=lambda c:sum(c),reverse=True)[:160]
        frames.append([round(sum(c[k] for c in pixels)/len(pixels)/255,5) for k in range(3)])
    curves[id]={'duration':len(frames)/2,'colors':frames}
(p/'src/data/media-colors.json').write_text(json.dumps(curves,indent=2)+'\n')

# Scene faces omit editorial annotations; the original study SVG remains untouched.
import xml.etree.ElementTree as ET
ET.register_namespace('', 'http://www.w3.org/2000/svg')
(p/'public/media/scene').mkdir(exist_ok=True)
for file in (p/'src/content/projects').glob('*.md'):
    root=ET.fromstring((p/f'public/media/{file.stem}.svg').read_text())
    for parent in root.iter():
        for element in list(parent):
            if element.tag=='{http://www.w3.org/2000/svg}text': parent.remove(element)
    (p/f'public/media/scene/{file.stem}.svg').write_bytes(ET.tostring(root))
