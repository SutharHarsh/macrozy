"""
Convert a SimReady asset (USD + OmniPBR textures) into a web-ready GLB.

- Geometry: every visible Mesh (through instance proxies), baked to world space,
  triangulated, converted from Z-up to glTF's Y-up, kept in real-world metres.
- Materials: the asset's albedo / normal / ORM maps become glTF PBR textures
  (ORM channel order R=occlusion, G=roughness, B=metallic already matches glTF).
- Textures are downscaled and re-encoded as JPEG to keep the download small.
"""
import io
import json
import sys
from pathlib import Path

import numpy as np
import pygltflib as g
from PIL import Image
from pxr import Gf, Sdf, Usd, UsdGeom, UsdShade

ROLE_SUFFIX = {'_alb': 'albedo', '_nor': 'normal', '_orm': 'orm'}


def texture_bytes(path: str, max_size: int, quality: int) -> bytes:
    im = Image.open(path)
    im = im.convert('RGB')
    if max(im.size) > max_size:
        im.thumbnail((max_size, max_size), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format='JPEG', quality=quality, optimize=True, progressive=False)
    return buf.getvalue()


def material_textures(mesh_prim) -> tuple[str, dict]:
    mat, _ = UsdShade.MaterialBindingAPI(mesh_prim).ComputeBoundMaterial()
    if not mat:
        return 'default', {}
    found = {}
    for p in Usd.PrimRange(mat.GetPrim()):
        shader = UsdShade.Shader(p)
        if not shader:
            continue
        for inp in shader.GetInputs():
            v = inp.Get()
            if isinstance(v, Sdf.AssetPath) and (v.resolvedPath or v.path):
                path = v.resolvedPath or v.path
                stem = Path(path).stem.lower()
                for suffix, role in ROLE_SUFFIX.items():
                    if stem.endswith(suffix) and role not in found and Path(path).exists():
                        found[role] = path
    return str(mat.GetPath()), found


def mesh_arrays(prim, xf_cache):
    mesh = UsdGeom.Mesh(prim)
    points = np.asarray(mesh.GetPointsAttr().Get(), dtype=np.float64)
    counts = np.asarray(mesh.GetFaceVertexCountsAttr().Get(), dtype=np.int64)
    idx = np.asarray(mesh.GetFaceVertexIndicesAttr().Get(), dtype=np.int64)
    n_corners = len(idx)

    normals = mesh.GetNormalsAttr().Get()
    n_interp = mesh.GetNormalsInterpolation()
    if normals is not None and len(normals):
        normals = np.asarray(normals, dtype=np.float64)
        corner_n = normals if n_interp == 'faceVarying' else normals[idx]
    else:
        corner_n = None

    st_pv = UsdGeom.PrimvarsAPI(prim).GetPrimvar('st')
    corner_uv = None
    if st_pv and st_pv.HasValue():
        st = np.asarray(st_pv.ComputeFlattened(), dtype=np.float64)
        interp = st_pv.GetInterpolation()
        if interp == 'faceVarying' and len(st) == n_corners:
            corner_uv = st
        elif interp in ('vertex', 'varying') and len(st) == len(points):
            corner_uv = st[idx]

    # fan-triangulate every face into corner indices
    starts = np.concatenate([[0], np.cumsum(counts)[:-1]])
    tris = []
    for s, c in zip(starts, counts):
        for k in range(1, c - 1):
            tris.append((s, s + k, s + k + 1))
    tris = np.asarray(tris, dtype=np.int64).reshape(-1)

    pos = points[idx[tris]]
    # world transform
    m = np.array(xf_cache.GetLocalToWorldTransform(prim), dtype=np.float64)  # row-vector convention
    pos = np.c_[pos, np.ones(len(pos))] @ m
    pos = pos[:, :3]
    nrm = None
    if corner_n is not None:
        # normals use the inverse-transpose; with row vectors that is v @ inv(M3).T
        nrm = corner_n[tris] @ np.linalg.inv(m[:3, :3]).T
        nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-12)
    uv = corner_uv[tris] if corner_uv is not None else None
    return pos, nrm, uv


def z_up_to_y_up(v):
    return np.c_[v[:, 0], v[:, 2], -v[:, 1]]


def convert(root_usd: Path, out_glb: Path, tex_size: int):
    stage = Usd.Stage.Open(str(root_usd), load=Usd.Stage.LoadAll)
    up = UsdGeom.GetStageUpAxis(stage)
    mpu = UsdGeom.GetStageMetersPerUnit(stage) or 1.0
    xf_cache = UsdGeom.XformCache(Usd.TimeCode.Default())

    groups: dict[str, dict] = {}
    for prim in stage.Traverse(Usd.TraverseInstanceProxies()):
        if prim.GetTypeName() != 'Mesh':
            continue
        img = UsdGeom.Imageable(prim)
        if img.ComputeVisibility() == UsdGeom.Tokens.invisible:
            continue
        if img.ComputePurpose() not in (UsdGeom.Tokens.default_, UsdGeom.Tokens.render):
            continue
        pos, nrm, uv = mesh_arrays(prim, xf_cache)
        if len(pos) == 0:
            continue
        key, tex = material_textures(prim)
        grp = groups.setdefault(key, {'tex': tex, 'pos': [], 'nrm': [], 'uv': []})
        grp['pos'].append(pos)
        grp['nrm'].append(nrm if nrm is not None else np.zeros_like(pos))
        grp['uv'].append(uv if uv is not None else np.zeros((len(pos), 2)))

    gltf = g.GLTF2(asset=g.Asset(generator='macrozy usd2glb', version='2.0'))
    gltf.scenes = [g.Scene(nodes=[0])]
    gltf.scene = 0
    blob = bytearray()

    def add_view(data: bytes, target=None) -> int:
        while len(blob) % 4:
            blob.append(0)
        off = len(blob)
        blob.extend(data)
        gltf.bufferViews.append(g.BufferView(buffer=0, byteOffset=off, byteLength=len(data), target=target))
        return len(gltf.bufferViews) - 1

    tex_cache: dict[str, int] = {}

    def add_texture(path: str, quality: int) -> int:
        if path in tex_cache:
            return tex_cache[path]
        bv = add_view(texture_bytes(path, tex_size, quality))
        gltf.images.append(g.Image(bufferView=bv, mimeType='image/jpeg'))
        gltf.textures.append(g.Texture(source=len(gltf.images) - 1, sampler=0))
        tex_cache[path] = len(gltf.textures) - 1
        return tex_cache[path]

    gltf.samplers = [g.Sampler(magFilter=9729, minFilter=9987, wrapS=10497, wrapT=10497)]
    primitives = []
    lo = np.array([np.inf] * 3)
    hi = np.array([-np.inf] * 3)
    for key, grp in groups.items():
        pos = np.concatenate(grp['pos']) * mpu
        nrm = np.concatenate(grp['nrm'])
        uv = np.concatenate(grp['uv'])
        if up == 'Z':
            pos, nrm = z_up_to_y_up(pos), z_up_to_y_up(nrm)
        uv = np.c_[uv[:, 0], 1.0 - uv[:, 1]]
        # weld identical corners
        verts = np.c_[pos, nrm, uv].astype(np.float32)
        uniq, inverse = np.unique(np.round(verts, 6), axis=0, return_inverse=True)
        inverse = inverse.reshape(-1)
        p32, n32, t32 = uniq[:, 0:3].copy(), uniq[:, 3:6].copy(), uniq[:, 6:8].copy()
        lo, hi = np.minimum(lo, p32.min(0)), np.maximum(hi, p32.max(0))
        index_type = np.uint16 if len(uniq) < 65535 else np.uint32
        ind = inverse.astype(index_type)

        def acc(arr, ctype, typ, target, minmax=False):
            bv = add_view(arr.tobytes(), target)
            a = g.Accessor(bufferView=bv, componentType=ctype, count=len(arr), type=typ)
            if minmax:
                a.min, a.max = arr.min(0).tolist(), arr.max(0).tolist()
            gltf.accessors.append(a)
            return len(gltf.accessors) - 1

        attrs = g.Attributes(
            POSITION=acc(p32, g.FLOAT, g.VEC3, g.ARRAY_BUFFER, True),
            NORMAL=acc(n32, g.FLOAT, g.VEC3, g.ARRAY_BUFFER),
            TEXCOORD_0=acc(t32, g.FLOAT, g.VEC2, g.ARRAY_BUFFER),
        )
        indices = acc(ind, g.UNSIGNED_SHORT if index_type == np.uint16 else g.UNSIGNED_INT, g.SCALAR, g.ELEMENT_ARRAY_BUFFER)

        tex = grp['tex']
        pbr = g.PbrMetallicRoughness(baseColorFactor=[1, 1, 1, 1], metallicFactor=1.0, roughnessFactor=1.0)
        mat = g.Material(name=key.rsplit('/', 1)[-1], pbrMetallicRoughness=pbr, doubleSided=False)
        if 'albedo' in tex:
            pbr.baseColorTexture = g.TextureInfo(index=add_texture(tex['albedo'], 86))
        if 'orm' in tex:
            orm = add_texture(tex['orm'], 88)
            pbr.metallicRoughnessTexture = g.TextureInfo(index=orm)
            mat.occlusionTexture = g.OcclusionTextureInfo(index=orm, strength=1.0)
        else:
            pbr.metallicFactor, pbr.roughnessFactor = 0.0, 0.6
        if 'normal' in tex:
            mat.normalTexture = g.NormalMaterialTexture(index=add_texture(tex['normal'], 92))
        gltf.materials.append(mat)
        primitives.append(g.Primitive(attributes=attrs, indices=indices, material=len(gltf.materials) - 1))

    gltf.meshes = [g.Mesh(name=out_glb.stem, primitives=primitives)]
    gltf.nodes = [g.Node(name=out_glb.stem, mesh=0)]
    gltf.buffers = [g.Buffer(byteLength=len(blob))]
    gltf.set_binary_blob(bytes(blob))
    gltf.save_binary(str(out_glb))
    tris = sum(len(np.concatenate(gr['pos'])) for gr in groups.values()) // 3
    return {'triangles': int(tris), 'size_m': [round(float(x), 4) for x in (hi - lo)], 'bytes': out_glb.stat().st_size}


if __name__ == '__main__':
    raw_root, out_dir, spec = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for item in spec.split(','):
        asset, short, size = item.split(':')
        root = raw_root / asset / 'simready_usd' / f'sm_{asset}_01.usd'
        info = convert(root, out_dir / f'{short}.glb', int(size))
        info['source'] = f'nvidia/simready-assets/{asset}'
        manifest[short] = info
        print(short, info)
    (out_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2))
