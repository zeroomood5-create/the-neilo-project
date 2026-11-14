# Local Kokoro speech â€” installed 14 November 2026

This environment generates WAV voice-over locally on CPU. It uses no API key or per-request cloud service. The public NEILO game and its current recordings have not been changed.

## Installed environment

- Python 3.12.14 in `.venv/`, separate from the system Python 3.14.
- `kokoro-onnx==0.6.1`, ONNX Runtime CPU, SoundFile and bundled eSpeak NG phonemizer.
- Exact Python dependencies: `requirements.lock.txt`.
- Kokoro v1.0 INT8 model, 114,119,327 bytes; voice pack, 28,214,398 bytes; 54 installed voice entries.
- `download_models.py` downloads the upstream release and checks its published SHA-256 digests. Both assets were verified during setup.
- Runtime/models are ignored by Git; generation scripts and this documentation remain reviewable source.

## Generate from the project folder

```powershell
./tools/kokoro/generate.ps1 -Voice bm_george -Text 'You helped our garden grow.' -Output output/voiceover/kokoro/my-line.wav
```

For an existing script:

```powershell
./tools/kokoro/generate.ps1 -Voice am_michael -TextFile previews/garden/JAMES_SHORT_SCIENCE.txt -Output output/voiceover/kokoro/garden-master.wav
```

The input filename refers to the prepared text only; Kokoro does not reproduce James's voice. These are different model voices.

List installed voice IDs:

```powershell
./tools/kokoro/.venv/Scripts/python.exe tools/kokoro/generate.py --list-voices
```

Every generated WAV has adjacent JSON recording text, voice, speed, duration, generation time, sample rate, file hash and AI provenance. Default speed is 0.96. Output is 24 kHz PCM WAV, suitable for later conversion and cue-based assembly. Review pronunciation and delivery before replacing production clips.

## Verification samples

`output/voiceover/kokoro/george-sample.wav` (8.04 seconds) and `michael-sample.wav` (8.62 seconds) contain the same garden explanation. Both were successfully synthesized with finite, non-silent samples. Initial CPU runs took about 35â€“37 seconds each, including model startup while both jobs were active. This is generation latency, not playback latency.

Ahmed selected am_michael. It is now the default CLI voice, and four generated science recordings are installed in the local garden preview. The public game is unchanged. Existing supplied James/Valf recordings remain intact. Outputs are AI-generated speech.

## Recreate the environment

Use Python 3.12 to create `tools/kokoro/.venv`, then:

```powershell
./tools/kokoro/.venv/Scripts/python.exe -m pip install -r tools/kokoro/requirements.lock.txt
./tools/kokoro/.venv/Scripts/python.exe tools/kokoro/download_models.py
```

## Upstream and licenses

- [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx): MIT wrapper.
- [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M): Apache-2.0 model.
- Model and voices from [model-files-v1.1 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1).
- Dependency notices remain installed with each package. The source and model licenses are distinct; retain their attribution when redistributing relevant materials.

The unsuccessful full-precision download was stopped; the installed INT8 file is the verified model used by the scripts.
