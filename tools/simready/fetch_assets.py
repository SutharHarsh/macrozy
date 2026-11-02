"""Download only what each SimReady asset needs to render: USD layers, textures and its licence."""
import json
import sys
import urllib.request
from pathlib import Path

dest_root = Path(sys.argv[1])
names = sys.argv[2].split(',')
API = 'https://huggingface.co/api/datasets/nvidia/simready-assets/tree/main/{}?recursive=true'
RAW = 'https://huggingface.co/datasets/nvidia/simready-assets/resolve/main/{}'


def wanted(path: str) -> bool:
    if '/.thumbs/' in path or '/source_assets/' in path:
        return False
    if path.endswith('.metadata/LICENSE.txt'):
        return True
    return '/simready_usd/' in path and path.rsplit('.', 1)[-1] in ('usd', 'usda', 'usdc', 'png', 'jpg')


for name in names:
    with urllib.request.urlopen(API.format(name)) as r:
        tree = json.load(r)
    files = [f for f in tree if f.get('type') == 'file' and wanted(f['path'])]
    total = 0
    for f in files:
        out = dest_root / f['path']
        out.parent.mkdir(parents=True, exist_ok=True)
        if not out.exists() or out.stat().st_size != f['size']:
            urllib.request.urlretrieve(RAW.format(f['path']), out)
        total += f['size']
    print(f'{name}: {len(files)} files, {total / 1e6:.1f} MB')
