"""Print what a converter needs to know about one SimReady root USD."""
import sys

from pxr import Sdf, Usd, UsdGeom, UsdShade

stage = Usd.Stage.Open(sys.argv[1], load=Usd.Stage.LoadAll)
print('upAxis', UsdGeom.GetStageUpAxis(stage), 'metersPerUnit', UsdGeom.GetStageMetersPerUnit(stage))
print('defaultPrim', stage.GetDefaultPrim().GetPath() if stage.GetDefaultPrim() else None)
for prim in stage.Traverse(Usd.TraverseInstanceProxies()):
    if prim.GetTypeName() == 'Mesh':
        m = UsdGeom.Mesh(prim)
        counts = m.GetFaceVertexCountsAttr().Get() or []
        pts = m.GetPointsAttr().Get() or []
        st = UsdGeom.PrimvarsAPI(prim).GetPrimvar('st')
        print('MESH', prim.GetPath(), 'points', len(pts), 'faces', len(counts), 'maxSides', max(counts) if counts else 0,
              'normals', m.GetNormalsInterpolation(), 'st', st.GetInterpolation() if st else None,
              'purpose', UsdGeom.Imageable(prim).ComputePurpose(), 'visible', UsdGeom.Imageable(prim).ComputeVisibility())
        mat, _ = UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()
        if mat:
            print('  material', mat.GetPath())
            for sh in Usd.PrimRange(mat.GetPrim()):
                shader = UsdShade.Shader(sh)
                if not shader:
                    continue
                for inp in shader.GetInputs():
                    v = inp.Get()
                    if isinstance(v, Sdf.AssetPath) and v.path:
                        print('   ', sh.GetName(), inp.GetBaseName(), '->', v.resolvedPath or v.path)
                    elif inp.GetBaseName() in ('diffuse_color_constant', 'albedo_add', 'metallic_constant', 'reflection_roughness_constant', 'diffuseColor', 'roughness', 'metallic', 'opacity_constant', 'enable_opacity'):
                        print('   ', sh.GetName(), inp.GetBaseName(), '=', v)
