import * as THREE from 'three';
import { model, type ModelName } from './assets';
import { createStudio, type Studio } from './studio';
import { dalSurface, kachumber, macroRing, meterBar, riceMound, steelThali, streakCoin, weightTrend } from './procedural';
import { CH, CHAPTERS, blendAt, clamp01, weight } from '@/lib/story';

/**
 * The whole story as one 3D world. Every object and the camera have a state
 * per chapter; story time g blends neighbouring chapters, so scrolling moves
 * a single continuous camera through a single continuous scene.
 */

type S = { x: number; y: number; z: number; s: number; ry: number; v: number };
type Cam = { px: number; py: number; pz: number; tx: number; ty: number; tz: number };
export type WorldParams = { dalKatori: number; riceGrams: number };
export type AnchorKey = 'dal' | 'rice' | 'salad' | 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'wStart' | 'wEnd' | 'wGoal' | 'ring';

const st = (x: number, y: number, z: number, s = 1, ry = 0, v = 1): S => ({ x, y, z, s, ry, v });
const hide = (o: S): S => ({ ...o, v: 0 });
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const INGREDIENTS: { name: ModelName; at: S }[] = [
  { name: 'onion', at: st(-0.11, 0.0143, 0.035, 1, 0.4) },
  { name: 'tomato', at: st(-0.035, 0.0143, -0.05, 1, 1.2) },
  { name: 'garlic', at: st(0.035, 0.0143, 0.05, 1, 0.3) },
  { name: 'lime', at: st(0.1, 0.0143, -0.035, 1, 2.1) },
  { name: 'potato', at: st(0.15, 0.0143, 0.06, 1, 0.8) },
  { name: 'karela', at: st(0.02, 0, 0.16, 1, 0.25) },
  { name: 'baingan', at: st(-0.29, 0, 0.02, 1, -0.5) },
  { name: 'mango', at: st(0.29, 0, -0.01, 1, 0.9) },
];

const METER_Y = [0.245, 0.19, 0.135, 0.08, 0.025];
const METER_FILL = [0.78, 0.8, 0.72, 0.62, 0.57];
const METER_COLORS = [0xb4bac1, 0xff9230, 0x30d158, 0xffd600, 0x64d2ff];
const WEIGHTS = [84.0, 83.6, 83.1, 82.9, 82.2, 81.8, 81.5, 80.9, 80.4, 80.1, 79.6, 79.2];

/* camera per chapter, in metres */
const CAMS: Record<number, Cam> = {
  [CH.kitchen]: { px: 0.42, py: 0.66, pz: 1.12, tx: 0.0, ty: 0.02, tz: 0.0 },
  [CH.lunch]: { px: 0.3, py: 0.56, pz: 0.86, tx: 0.0, ty: 0.02, tz: 0.0 },
  [CH.gap]: { px: 0.38, py: 0.64, pz: 1.06, tx: 0.0, ty: 0.02, tz: 0.0 },
  [CH.capture]: { px: 0.0, py: 1.12, pz: 0.06, tx: 0.0, ty: 0.0, tz: 0.0 },
  [CH.split]: { px: 0.0, py: 0.34, pz: 1.02, tx: 0.0, ty: 0.06, tz: 0.0 },
  [CH.decide]: { px: -0.08, py: 0.32, pz: 0.98, tx: 0.0, ty: 0.06, tz: 0.0 },
  [CH.day]: { px: 0.0, py: 0.17, pz: 1.32, tx: 0.0, ty: 0.135, tz: 0.0 },
  [CH.week]: { px: 0.05, py: 0.19, pz: 1.32, tx: 0.0, ty: 0.15, tz: 0.0 },
  [CH.start]: { px: 0.0, py: 0.16, pz: 1.25, tx: 0.0, ty: 0.14, tz: 0.0 },
};

export class StoryWorld {
  private studio: Studio;
  private items = new Map<string, { obj: THREE.Object3D; states: (k: number, p: WorldParams) => S; base: number }>();
  private meters: ReturnType<typeof meterBar>[] = [];
  private meterGroup = new THREE.Group();
  private trend!: ReturnType<typeof weightTrend>;
  private weekGroup = new THREE.Group();
  private coins: THREE.Object3D[] = [];
  private ring!: ReturnType<typeof macroRing>;
  private ringGroup = new THREE.Group();
  private scanGroup = new THREE.Group();
  private scanLine!: THREE.Mesh;
  private g = 0;
  private params: WorldParams = { dalKatori: 1, riceGrams: 150 };
  private shown: WorldParams = { dalKatori: 1, riceGrams: 150 };
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private narrow = false;
  private stopLoop: (() => void) | null = null;
  private ready = false;
  private anchorPts: Record<AnchorKey, THREE.Vector3> = {} as Record<AnchorKey, THREE.Vector3>;
  onFrame: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.studio = createStudio(canvas, { fov: 26 });
    this.studio.key.position.set(0.9, 1.6, 1.1);
  }

  async init() {
    const { scene } = this.studio;
    const add = (key: string, obj: THREE.Object3D, states: (k: number, p: WorldParams) => S) => {
      scene.add(obj);
      this.items.set(key, { obj, states, base: 1 });
    };

    /* the kitchen */
    const board = await model('board', new THREE.Euler(0, 0, Math.PI / 2));
    add('board', board, (k) => (k === CH.kitchen ? st(0, 0, 0, 1, 0.12) : hide(st(-0.5, 0, 0.1, 1, 0.12))));
    await Promise.all(
      INGREDIENTS.map(async ({ name, at }, i) => {
        const m = await model(name);
        add(name, m, (k) => {
          if (k === CH.kitchen) return at;
          // ingredients slide off to the sides and settle out of frame
          const dir = at.x >= 0 ? 1 : -1;
          return hide({ ...at, x: at.x + dir * (0.35 + i * 0.02), y: 0, ry: at.ry + 1.2 });
        });
      }),
    );
    const kettle = await model('kettle');
    add('kettle', kettle, (k) => (k <= CH.capture ? st(0.33, 0, -0.27, 1, -0.6) : hide(st(0.6, 0, -0.4, 1, -0.6))));
    const cup = await model('cup');
    add('cup', cup, (k) => (k <= CH.capture ? st(k === CH.kitchen ? 0.18 : 0.27, 0, k === CH.kitchen ? -0.2 : -0.17, 1, 0.5) : hide(st(0.55, 0, -0.2, 1, 0.5))));

    /* the plate */
    const thali = steelThali(0.17);
    const thaliGroup = new THREE.Group();
    thaliGroup.add(thali);
    add('thali', thaliGroup, (k) => (k === CH.kitchen ? hide(st(0, -0.05, 0, 0.8)) : k <= CH.capture ? st(0, 0, 0) : hide(st(0, -0.05, 0, 0.9))));

    const bowlWith = async (name: ModelName, fill: THREE.Object3D, fillY: number) => {
      const b = await model(name);
      fill.position.y = fillY;
      b.add(fill);
      return b;
    };
    const dal = await bowlWith('bowl_terracotta', dalSurface(0.064), 0.048);
    const rice = await bowlWith('bowl_white', riceMound(0.052, 0.026), 0.042);
    const salad = await bowlWith('bowl_white', kachumber(0.048), 0.03);
    salad.scale.setScalar(0.85);

    const onPlate = { dal: st(-0.068, 0.003, -0.035, 0.72), rice: st(0.066, 0.003, -0.045, 0.72), salad: st(0.0, 0.003, 0.072, 0.62) };
    const lifted = (p: WorldParams) => ({
      dal: st(-0.13, 0.03, 0, 0.82 * Math.min(1.35, Math.sqrt(p.dalKatori))),
      rice: st(0, 0.03, 0, 0.82 * Math.min(1.35, Math.sqrt(p.riceGrams / 150))),
      salad: st(0.13, 0.03, 0, 0.72),
    });
    const intoMeter = (row: number): S => hide(st(-0.21, METER_Y[row], 0.02, 0.15));
    const foodState = (key: 'dal' | 'rice' | 'salad', row: number) => (k: number, p: WorldParams) => {
      if (k === CH.kitchen) return hide({ ...onPlate[key], y: 0.25 });
      if (k <= CH.capture) return onPlate[key];
      if (k === CH.split) return lifted({ dalKatori: 1, riceGrams: 150 })[key];
      if (k === CH.decide) return lifted(p)[key];
      return intoMeter(row);
    };
    add('dal', dal, foodState('dal', 1));
    add('rice', rice, foodState('rice', 2));
    add('salad', salad, foodState('salad', 4));

    /* the camera's frame and scan line, seen from above */
    const bracketMat = new THREE.MeshBasicMaterial({ color: 0xffd600, toneMapped: false });
    const bw = 0.2;
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.002, 0.004), bracketMat);
      h.position.set(sx * bw - sx * 0.025, 0, sz * bw);
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.002, 0.05), bracketMat);
      v.position.set(sx * bw, 0, sz * bw - sz * 0.025);
      this.scanGroup.add(h, v);
    }
    this.scanLine = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.006), new THREE.MeshBasicMaterial({ color: 0xffe14d, transparent: true, opacity: 0.9, toneMapped: false }));
    this.scanLine.rotation.x = -Math.PI / 2;
    this.scanGroup.add(this.scanLine);
    this.scanGroup.position.y = 0.075;
    scene.add(this.scanGroup);

    /* the day: five meters */
    this.meterGroup.position.set(-0.21, 0, 0);
    METER_Y.forEach((y, i) => {
      const m = meterBar(0.42, 0.011, METER_COLORS[i]);
      m.group.position.y = y;
      this.meterGroup.add(m.group);
      this.meters.push(m);
    });
    scene.add(this.meterGroup);

    /* the week: a trend and seven coins */
    this.trend = weightTrend(0.44, 0.15, WEIGHTS, 85.5, 73.5);
    this.trend.group.position.set(0, 0.09, 0);
    this.weekGroup.add(this.trend.group);
    for (let d = 0; d < 7; d++) {
      const c = streakCoin(0.017, d < 5 ? 'on' : d === 5 ? 'rest' : 'off');
      c.position.set(-0.18 + d * 0.06, 0.04, 0.02);
      this.weekGroup.add(c);
      this.coins.push(c);
    }
    scene.add(this.weekGroup);

    /* the finale: the ring */
    this.ring = macroRing(0.115, 0.017);
    this.ringGroup.add(this.ring.group);
    this.ringGroup.position.set(0, 0.14, 0);
    scene.add(this.ringGroup);

    this.ready = true;
  }

  resize(w: number, h: number) {
    this.narrow = w < 900;
    this.studio.resize(w, h);
  }

  setFocus(px: number, py: number) {
    this.studio.setFocus(px, py);
  }

  setG(g: number) {
    this.g = g;
  }

  setParams(p: WorldParams) {
    this.params = p;
  }

  setPointer(nx: number, ny: number) {
    this.pointer.tx = nx;
    this.pointer.ty = ny;
  }

  /** Screen positions (px) for DOM labels that follow 3D objects. */
  anchors(): Record<AnchorKey, [number, number]> {
    const out = {} as Record<AnchorKey, [number, number]>;
    const { camera, renderer } = this.studio;
    const size = renderer.getSize(new THREE.Vector2());
    for (const [k, v] of Object.entries(this.anchorPts) as [AnchorKey, THREE.Vector3][]) {
      const p = v.clone().project(camera);
      out[k] = [(p.x * 0.5 + 0.5) * size.x, (-p.y * 0.5 + 0.5) * size.y];
    }
    return out;
  }

  start() {
    if (this.stopLoop) return;
    this.stopLoop = this.studio.loop((t, dt) => this.frame(t, dt));
  }

  stop() {
    this.stopLoop?.();
    this.stopLoop = null;
  }

  dispose() {
    this.stop();
    this.studio.dispose();
  }

  private frame(t: number, dt: number) {
    if (!this.ready) return;
    const { i, j, e } = blendAt(this.g);
    const te = ease(e);
    const k = 1 - Math.exp(-dt * 8);
    this.shown.dalKatori += (this.params.dalKatori - this.shown.dalKatori) * k;
    this.shown.riceGrams += (this.params.riceGrams - this.shown.riceGrams) * k;

    /* objects */
    let n = 0;
    for (const [key, it] of this.items) {
      const A = it.states(i, this.shown);
      const B = it.states(j, this.shown);
      // a small per-object delay so things move as a choreography, not in lockstep
      const d = (n++ % 6) * 0.05;
      const tt = ease(clamp01((e - d) / (1 - d)));
      const x = mix(A.x, B.x, tt);
      const y = mix(A.y, B.y, tt);
      const z = mix(A.z, B.z, tt);
      const v = mix(A.v, B.v, tt);
      const s = mix(A.s, B.s, tt) * (0.001 + 0.999 * v);
      const bob = key === 'dal' || key === 'rice' || key === 'salad' ? Math.sin(t * 1.4 + x * 20) * 0.004 * clamp01((y - 0.01) / 0.04) : 0;
      it.obj.position.set(x, y + bob, z);
      it.obj.rotation.y = mix(A.ry, B.ry, tt) + (INGREDIENTS.some((g) => g.name === key) ? Math.sin(t * 0.6 + x * 9) * 0.04 : 0);
      it.obj.scale.setScalar(s);
      it.obj.visible = v > 0.01;
    }

    /* the floor only catches shadows while food is on the table */
    let plateW = 0;
    for (let c = 0; c <= CH.capture; c++) plateW += weight(c, this.g);
    const liftedW = weight(CH.split, this.g) + weight(CH.decide, this.g);
    // grounded objects cast a firm contact shadow; floating bowls only a faint one
    (this.studio.ground.material as THREE.ShadowMaterial).opacity = 0.16 * plateW + 0.07 * liftedW;

    /* the scan, only while capturing */
    const wCap = weight(CH.capture, this.g);
    this.scanGroup.visible = wCap > 0.02;
    this.scanGroup.scale.setScalar(0.85 + 0.15 * wCap);
    (this.scanLine.material as THREE.MeshBasicMaterial).opacity = 0.9 * wCap;
    this.scanLine.position.z = Math.sin(t * 1.6) * 0.17;

    /* data chapters: appear by weight, animate by their own local progress */
    const localOf = (c: number) => (i === c ? clamp01(blendAt(this.g).local / CHAPTERS[c].ts) : i > c ? 1 : 0);
    const wDay = weight(CH.day, this.g);
    const wWeek = weight(CH.week, this.g);
    const wStart = weight(CH.start, this.g);

    this.meterGroup.visible = wDay > 0.01;
    this.meterGroup.scale.setScalar(0.001 + wDay * 0.999);
    this.meterGroup.position.x = -0.21 * this.meterGroup.scale.x;
    const pDay = localOf(CH.day);
    this.meters.forEach((m, r) => {
      const tr = 1 - Math.pow(1 - clamp01((pDay - r * 0.07) / 0.5), 3);
      m.setFill(METER_FILL[r] * tr);
    });

    this.weekGroup.visible = wWeek > 0.01;
    this.weekGroup.scale.setScalar(0.001 + wWeek * 0.999);
    const pWeek = localOf(CH.week);
    this.trend.setProgress(1 - Math.pow(1 - clamp01(pWeek / 0.6), 3));
    this.coins.forEach((c, d) => {
      const tc = clamp01((pWeek - 0.15 - d * 0.05) / 0.2);
      const back = tc <= 0 ? 0 : 1 + 2.6 * Math.pow(tc - 1, 3) + 1.6 * Math.pow(tc - 1, 2);
      c.scale.setScalar(Math.max(0.0001, back));
      c.rotation.y = (1 - tc) * Math.PI;
    });

    this.ringGroup.visible = wStart > 0.01;
    this.ringGroup.scale.setScalar(0.001 + wStart * 0.999);
    this.ring.setSweep(1 - Math.pow(1 - clamp01(localOf(CH.start) / 0.7), 3));
    this.ringGroup.rotation.y = Math.sin(t * 0.5) * 0.18;
    this.ringGroup.rotation.x = Math.sin(t * 0.37) * 0.08;

    /* camera */
    const A = CAMS[i];
    const B = CAMS[j];
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.05;
    const far = this.narrow ? 1.45 : 1;
    const cam = this.studio.camera;
    const tx = mix(A.tx, B.tx, te);
    const ty = mix(A.ty, B.ty, te);
    const tz = mix(A.tz, B.tz, te);
    cam.position.set(
      tx + (mix(A.px, B.px, te) - tx) * far + this.pointer.x * 0.03,
      ty + (mix(A.py, B.py, te) - ty) * far - this.pointer.y * 0.02,
      tz + (mix(A.pz, B.pz, te) - tz) * far,
    );
    cam.lookAt(tx, ty, tz);

    /* label anchors */
    const top = (key: string, lift: number) => {
      const o = this.items.get(key)!.obj;
      return new THREE.Vector3(o.position.x, o.position.y + lift * o.scale.x, o.position.z);
    };
    this.anchorPts.dal = top('dal', 0.11);
    this.anchorPts.rice = top('rice', 0.11);
    this.anchorPts.salad = top('salad', 0.11);
    METER_Y.forEach((y, r) => {
      this.anchorPts[`m${r}` as AnchorKey] = new THREE.Vector3(-0.21, y + 0.015, 0);
    });
    this.anchorPts.wStart = this.trend.start.clone().add(new THREE.Vector3(0, 0.09 + 0.025, 0));
    this.anchorPts.wEnd = this.trend.end.clone().add(new THREE.Vector3(0, 0.09 + 0.028, 0));
    this.anchorPts.wGoal = new THREE.Vector3(0.22, 0.09 + 0.014, 0);
    this.anchorPts.ring = new THREE.Vector3(0, 0.14, 0);
    this.onFrame?.();
    return true;
  }
}
