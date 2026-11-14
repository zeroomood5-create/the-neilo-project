"""Download the pinned upstream model and voice pack; verify release SHA-256 digests."""
import concurrent.futures
import hashlib
from pathlib import Path
import urllib.request

BASE = Path(__file__).resolve().parent/'models'
ROOT = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/'
ASSETS = {
 'kokoro-v1.0.int8.onnx': (114119327, 'ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c'),
 'voices-v1.0.bin': (28214398, 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'),
}

def digest(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()

def download(name, size, expected):
    target = BASE/name
    if target.exists() and digest(target) == expected:
        print(name, 'verified', flush=True)
        return
    chunk = 4*1024*1024
    chunks = BASE/(name+'.chunks')
    chunks.mkdir(parents=True, exist_ok=True)
    def get(i):
        start, end = i*chunk, min(size-1, (i+1)*chunk-1)
        path = chunks/str(i)
        for attempt in range(3):
            try:
                req = urllib.request.Request(ROOT+name, headers={'Range':f'bytes={start}-{end}'})
                with urllib.request.urlopen(req, timeout=45) as response:
                    if response.status != 206 or not response.headers.get('Content-Range','').startswith(f'bytes {start}-{end}/'):
                        raise RuntimeError('Server did not return the requested range')
                    data = response.read()
                if len(data) != end-start+1:
                    raise RuntimeError('Incomplete range')
                path.write_bytes(data)
                return path
            except Exception:
                if attempt == 2:
                    raise
    n = (size+chunk-1)//chunk
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        paths = list(pool.map(get, range(n)))
    temporary = BASE/(name+'.part')
    with temporary.open('wb') as out:
        for path in paths:
            out.write(path.read_bytes())
    if digest(temporary) != expected:
        raise RuntimeError('Model SHA-256 mismatch; not installing this download')
    temporary.replace(target)
    for path in paths:
        path.unlink()
    chunks.rmdir()
    print(name, 'downloaded and verified', flush=True)

if __name__ == '__main__':
    BASE.mkdir(parents=True, exist_ok=True)
    for name, (size, expected) in ASSETS.items():
        download(name, size, expected)
