"""Recolour the existing film without changing scenes; FFmpeg applies the LUT.
Usage: python tools/poetexa-video-colors.py /path/to/intermediates [source.mp4 output.mp4]
Requires cairosvg and FFmpeg.
Original source video is retained in git history, SHA256 63a4f5a1….
"""
from pathlib import Path
import colorsys,sys
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
def smooth(a,b,x):
 t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def grade(r,g,b):
 h,s,v=colorsys.rgb_to_hsv(r,g,b);h*=360
 # Warm brand gold becomes cobalt/violet; preserve orange skin and green UI.
 weight=smooth(27,40,h)*(1-smooth(65,83,h))*smooth(.06,.18,s)
 # Dark brown backdrop also moves to navy; skin-tone highlights stay natural.
 dark=(1-smooth(.20,.43,v))*smooth(20,30,h)*(1-smooth(65,83,h))
 weight=max(weight,dark)
 target_h=(226+(h-43)*1.2)/360
 target_s=s*.85
 nr,ng,nb=colorsys.hsv_to_rgb(target_h%1,target_s,v)
 return tuple(a*(1-weight)+b*weight for a,b in zip((r,g,b),(nr,ng,nb)))
n=65
with (out/'poetexa.cube').open('w') as f:
 f.write('TITLE "POETEXA cobalt violet"\nLUT_3D_SIZE 65\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
 for b in range(n):
  for g in range(n):
   for r in range(n):f.write(' '.join(f'{v:.7f}' for v in grade(r/(n-1),g/(n-1),b/(n-1)))+'\n')
# New end card replaces only the old-brand final second.
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#15274d"/><stop offset="1" stop-color="#493b85"/></linearGradient><linearGradient id="a"><stop stop-color="#2458cb"/><stop offset="1" stop-color="#7550d4"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#bg)"/><circle cx="980" cy="160" r="390" fill="#7550d4" opacity=".15"/><circle cx="70" cy="1730" r="420" fill="#3258c5" opacity=".18"/><rect x="420" y="590" width="240" height="240" rx="74" fill="url(#a)"/><g fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"><path d="M499 662l-45 48 45 48M581 662l45 48-45 48"/></g><circle cx="540" cy="710" r="13" fill="#fff"/><text x="540" y="972" text-anchor="middle" fill="white" font-family="DejaVu Sans" font-weight="bold" font-size="126" letter-spacing="-5">POETEXA</text><text x="540" y="1050" text-anchor="middle" fill="#dce4ff" font-family="DejaVu Sans" font-size="30" letter-spacing="7">DIGITAL DESIGN STUDIO</text><rect x="300" y="1150" width="480" height="90" rx="45" fill="#fff" fill-opacity=".10" stroke="#fff" stroke-opacity=".25"/><text x="540" y="1208" text-anchor="middle" fill="#fff" font-family="DejaVu Sans" font-size="32">poetexa.pages.dev</text></svg>'''
(out/'end-card.svg').write_text(svg)
import cairosvg
cairosvg.svg2png(bytestring=svg.encode(),write_to=str(out/'end-card.png'))
# Optional rendering, with explicit source/output paths to avoid overwriting the source.
if len(sys.argv)==4:
 import subprocess
 source,destination=map(Path,sys.argv[2:4])
 if source.resolve()==destination.resolve():raise SystemExit('Use distinct source and output files')
 filters=f"[0:v]lut3d=file={out/'poetexa.cube'}:interp=tetrahedral[graded];[1:v]format=rgba,fade=t=in:st=27:d=0.35:alpha=1[card];[graded][card]overlay=0:0:enable='gte(t,27)':shortest=1[v]"
 try:
  subprocess.run(['ffmpeg','-i',str(source),'-loop','1','-i',str(out/'end-card.png'),'-filter_complex',filters,'-map','[v]','-t','28.3','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(destination),'-y'],check=True)
 except subprocess.CalledProcessError:
  # ffmpeg writes to destination incrementally, so a failed run can leave a
  # truncated, unplayable file behind instead of no file at all.
  destination.unlink(missing_ok=True)
  raise
