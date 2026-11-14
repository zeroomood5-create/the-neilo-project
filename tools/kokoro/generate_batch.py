"""Generate one reviewed manifest using a single local model session."""
import argparse
import hashlib
import json
from pathlib import Path
import time

import numpy as np
import onnxruntime as ort
import soundfile as sf
from kokoro_onnx import Kokoro

base = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('manifest', type=Path)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
pack = json.loads(args.manifest.read_text(encoding='utf-8'))
options = ort.SessionOptions()
options.intra_op_num_threads = 4
options.inter_op_num_threads = 1
session = ort.InferenceSession(str(base/'models/kokoro-v1.0.int8.onnx'),
                              sess_options=options, providers=['CPUExecutionProvider'])
tts = Kokoro.from_session(session, str(base/'models/voices-v1.0.bin'))
args.output.mkdir(parents=True, exist_ok=True)
results = []
for line in pack['lines']:
    start = time.monotonic()
    clip_id, text = line['id'], line['text']
    if not clip_id or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in clip_id):
        raise ValueError('Invalid clip filename')
    audio, rate = tts.create(text, voice=pack['voice'], speed=pack['speed'], lang='en-us')
    if not len(audio) or not np.isfinite(audio).all() or np.max(np.abs(audio)) < .001:
        raise RuntimeError('Invalid or silent clip: '+clip_id)
    target = args.output/(clip_id+'.wav')
    sf.write(str(target), audio, rate, subtype='PCM_16')
    result = {**line, 'file':target.name, 'duration':len(audio)/rate,
              'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),
              'seconds_to_generate':round(time.monotonic()-start, 2)}
    results.append(result)
    print(json.dumps(result), flush=True)
args.output.joinpath('manifest.json').write_text(json.dumps({
    'voice':pack['voice'], 'speed':pack['speed'], 'generator':'Kokoro v1.0 INT8 / ONNX CPU',
    'provenance':'AI-generated local speech. User selected Michael on 2026-11-14.',
    'model_license':'Apache-2.0', 'clips':results,
}, indent=2), encoding='utf-8')
