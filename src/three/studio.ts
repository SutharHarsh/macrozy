import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type Studio = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  key: THREE.DirectionalLight;
  ground: THREE.Mesh;
  resize: (w: number, h: number) => void;
  /** Run `tick` every frame while visible. Returns a stop function. */
  loop: (tick: (t: number, dt: number) => boolean | void) => () => void;
  /** Shift the image so the camera target lands at screen (x, y) px instead of the centre. */
  setFocus: (px: number, py: number) => void;
  dispose: () => void;
};

/**
 * A product-photography studio: soft image-based light from a virtual room,
 * one warm key light for shape and a shadow-catching floor that disappears into
 * the page background. Filmic tone mapping keeps highlights from clipping.
 */
export function createStudio(canvas: HTMLCanvasElement, opts: { fov?: number; shadows?: boolean } = {}): Studio {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = opts.shadows !== false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  scene.environment = env;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(opts.fov ?? 28, 1, 0.01, 50);

  const key = new THREE.DirectionalLight(0xfff3e6, 1.6);
  key.position.set(1.2, 2.4, 1.4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 6;
  const sc = key.shadow.camera as THREE.OrthographicCamera;
  sc.left = -0.8;
  sc.right = 0.8;
  sc.top = 0.8;
  sc.bottom = -0.8;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  // the steel thali is a shallow dish that shadows itself; normal bias stops striping in its well
  key.shadow.normalBias = 0.0025;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dde6, 0.35));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  let w = 1;
  let h = 1;
  let focusX = 0.5;
  let focusY = 0.5;
  const applyView = () => {
    camera.aspect = w / h;
    const sx = (0.5 - focusX) * w;
    const sy = (0.5 - focusY) * h;
    if (Math.abs(sx) > 0.5 || Math.abs(sy) > 0.5) camera.setViewOffset(w, h, sx, sy, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };

  const resize = (nw: number, nh: number) => {
    w = Math.max(1, nw);
    h = Math.max(1, nh);
    renderer.setSize(w, h, false);
    applyView();
  };

  const setFocus = (px: number, py: number) => {
    const fx = px / w;
    const fy = py / h;
    if (Math.abs(fx - focusX) < 0.0005 && Math.abs(fy - focusY) < 0.0005) return;
    focusX = fx;
    focusY = fy;
    applyView();
  };

  const loop = (tick: (t: number, dt: number) => boolean | void) => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const keep = tick(now / 1000, dt);
      renderer.render(scene, camera);
      raf = keep === false ? 0 : requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  };

  const dispose = () => {
    env.dispose();
    renderer.dispose();
  };

  return { renderer, scene, camera, key, ground, resize, loop, setFocus, dispose };
}
