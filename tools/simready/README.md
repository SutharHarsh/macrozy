# SimReady → web models

The 3D food and kitchenware in `public/models/` come from
[NVIDIA SimReady Assets](https://huggingface.co/datasets/nvidia/simready-assets) (CC BY 4.0).
The credit is shown in the site footer; keep it if you ship these models.

Pipeline (Python 3.11+, Node 18+):

```bash
python -m venv .venv && .venv/Scripts/pip install usd-core numpy pillow pygltflib
# 1. download only the USD layers, textures and licence for each asset
.venv/Scripts/python tools/simready/fetch_assets.py raw "food_produce_onion_a01,kitchenware_bowl_b01"
# 2. USD (Z-up, OmniPBR) -> glTF (Y-up, PBR), textures downscaled to JPEG
.venv/Scripts/python tools/simready/usd2glb.py raw glb "food_produce_onion_a01:onion:512,kitchenware_bowl_b01:bowl_white:1024"
# 3. simplify + meshopt-compress (texture compression is off: the sharp/WebP step fails on Windows)
npx @gltf-transform/cli@4.1.1 optimize glb/onion.glb public/models/onion.glb --compress meshopt --texture-compress false --simplify-ratio 0.6 --simplify-error 0.0008
```

`inspect_usd.py <file.usd>` prints a model's axis, units, meshes and texture bindings.
Model names used by the site are listed in `src/three/assets.ts`.
