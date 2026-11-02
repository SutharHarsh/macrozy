import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

/**
 * Real-world food and kitchenware, converted from NVIDIA SimReady (CC BY 4.0)
 * to compressed glTF. Every model is in metres, Y-up.
 */
export type ModelName =
  | 'onion'
  | 'tomato'
  | 'garlic'
  | 'potato'
  | 'baingan'
  | 'karela'
  | 'lime'
  | 'mango'
  | 'naan'
  | 'bowl_white'
  | 'bowl_terracotta'
  | 'kettle'
  | 'cup'
  | 'board';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<ModelName, Promise<THREE.Group>>();

function load(name: ModelName): Promise<THREE.Group> {
  let p = cache.get(name);
  if (!p) {
    p = loader.loadAsync(`/models/${name}.glb`).then((gltf) => {
      const root = gltf.scene;
      root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
          const mat = m.material as THREE.MeshStandardMaterial;
          if (mat.map) mat.map.anisotropy = 4;
          mat.envMapIntensity = 1;
        }
      });
      return root;
    });
    cache.set(name, p);
  }
  return p;
}

/**
 * A fresh copy of a model, re-centred so its base sits on y = 0 and its middle
 * is on the vertical axis. Geometry and textures are shared between copies.
 */
export async function model(name: ModelName, rotate?: THREE.Euler): Promise<THREE.Group> {
  const src = await load(name);
  const copy = src.clone(true);
  if (rotate) {
    copy.rotation.copy(rotate);
    copy.updateMatrixWorld(true);
  }
  const box = new THREE.Box3().setFromObject(copy);
  const centre = box.getCenter(new THREE.Vector3());
  const holder = new THREE.Group();
  copy.position.set(-centre.x, -box.min.y, -centre.z);
  holder.add(copy);
  holder.name = name;
  holder.userData.size = box.getSize(new THREE.Vector3());
  return holder;
}

export function preload(names: ModelName[]) {
  return Promise.all(names.map(load));
}
