"""Generate narrator MP3s from lines.json with the Kokoro voice model.
Usage: python3 scripts/voice/generate.py MODEL.onnx VOICES.bin [voice]   (default voice af_heart)
Only lines whose text changed are re-recorded."""
import json, sys, os, hashlib, subprocess, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

model, voices = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else 'af_heart'
here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.join(here, '..', '..', 'public', 'assets', 'voice')
os.makedirs(outdir, exist_ok=True)
lines = json.load(open(os.path.join(here, 'lines.json')))
manifest_path = os.path.join(here, 'manifest.json')
manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
k = Kokoro(model, voices)
for key, text in lines.items():
    sig = hashlib.sha1(f'{voice}|{text}'.encode()).hexdigest()
    mp3 = os.path.join(outdir, f'{key}.mp3')
    if manifest.get(key) == sig and os.path.exists(mp3):
        continue
    samples, sr = k.create(text, voice=voice, speed=1.05, lang='en-us')
    with tempfile.NamedTemporaryFile(suffix='.wav') as w:
        sf.write(w.name, samples, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', w.name, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '64k', mp3], check=True)
    manifest[key] = sig
    print(key, round(len(samples) / sr, 1), 's', flush=True)
json.dump(manifest, open(manifest_path, 'w'), indent=1)
