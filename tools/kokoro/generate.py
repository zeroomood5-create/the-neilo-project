"""Local, offline Kokoro narration. Run with this folder's .venv Python."""
import argparse
import hashlib
import json
from pathlib import Path
import time

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

BASE = Path(__file__).resolve().parent
PROJECT = BASE.parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--voice', default='am_michael')
parser.add_argument('--speed', type=float, default=0.96)
parser.add_argument('--text', default='You helped our garden grow. Leaves use light, water and carbon dioxide to make sugars. This is photosynthesis.')
parser.add_argument('--text-file', type=Path)
parser.add_argument('--output', type=Path, default=PROJECT/'output/voiceover/kokoro/sample.wav')
parser.add_argument('--list-voices', action='store_true')
args = parser.parse_args()
model = BASE/'models/kokoro-v1.0.int8.onnx'
voices = BASE/'models/voices-v1.0.bin'
if args.list_voices:
    print('\n'.join(np.load(voices).files))
    raise SystemExit(0)
if not 0.5 <= args.speed <= 2:
    parser.error('Speed must be between 0.5 and 2.')
if args.voice not in np.load(voices).files:
    parser.error('Unknown voice. Run --list-voices to inspect installed voices.')
text = args.text_file.read_text(encoding='utf-8') if args.text_file else args.text
started = time.monotonic()
tts = Kokoro(str(model), str(voices))
audio, rate = tts.create(text, voice=args.voice, speed=args.speed,
                         lang='en-gb' if args.voice.startswith('b') else 'en-us')
if not len(audio) or not np.isfinite(audio).all() or np.max(np.abs(audio)) < 0.001:
    raise RuntimeError('Generated audio is empty, invalid or silent.')
args.output.parent.mkdir(parents=True, exist_ok=True)
sf.write(str(args.output), audio, rate, subtype='PCM_16')
metadata = {'generator':'Kokoro ONNX', 'voice':args.voice, 'speed':args.speed,
            'text':text, 'sample_rate':rate, 'duration_seconds':len(audio)/rate,
            'synthesis_seconds':round(time.monotonic()-started,2),
            'sha256':hashlib.sha256(args.output.read_bytes()).hexdigest(),
            'provenance':'AI-generated speech; local CPU inference. Not an ElevenLabs voice.',
            'model':'Kokoro v1.0 int8', 'model_license':'Apache-2.0'}
args.output.with_suffix('.json').write_text(json.dumps(metadata, indent=2), encoding='utf-8')
print(json.dumps({'output':str(args.output), **metadata}, indent=2))
