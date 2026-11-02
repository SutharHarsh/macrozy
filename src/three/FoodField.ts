import * as THREE from 'three';
import { model, type ModelName } from './assets';
import { createStudio, type Studio } from './studio';

export type FieldItem = {
  name: ModelName;
  /** horizontal and vertical position as a share of the canvas, 0..1 */
  x: number;
  y: number;
  /** on-screen size as a share of the canvas height */
  size: number;
  /** 0 = far and slow, 1 = near and lively */
  depth: number;
  tilt?: number;
};

/**
 * Real produce floating in a soft studio. Items are laid out in screen terms
 * (x, y, size) so the DOM can wrap text and buttons around them, then turned,
 * bobbed and parallaxed in 3D. One item can be brought into focus.
 */
export class FoodField {
  private studio: Studio;
  private nodes: { item: FieldItem; obj: THREE.Group; spin: number; focus: number; base: number }[] = [];
  private stopLoop: (() => void) | null = null;
  private w = 1;
  private h = 1;
  private pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  private focused = -1;
  private ready = false;
  private distance = 2;

  constructor(canvas: HTMLCanvasElement, private items: FieldItem[], private still = false) {
    this.studio = createStudio(canvas, { fov: 22, shadows: false });
    this.studio.ground.visible = false;
    this.studio.key.position.set(1.4, 2.2, 2.4);
  }

  async init() {
    await Promise.all(
      this.items.map(async (item, i) => {
        const obj = await model(item.name);
        // centre each model on its own middle so it spins in place
        const size = obj.userData.size as THREE.Vector3;
        const pivot = new THREE.Group();
        obj.position.y = -size.y / 2;
        pivot.add(obj);
        pivot.rotation.set(item.tilt ?? 0.35, i * 1.7, (i % 2 ? 1 : -1) * 0.12);
        this.studio.scene.add(pivot);
        this.nodes[i] = { item, obj: pivot, spin: (i % 2 ? 1 : -1) * (0.12 + item.depth * 0.18), focus: 0, base: Math.max(size.x, size.y, size.z) };
      }),
    );
    this.ready = true;
    this.layout();
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.studio.resize(this.w, this.h);
    this.layout();
  }

  /** Place each item so it appears at its (x, y) share of the canvas at its requested size. */
  private layout() {
    if (!this.ready) return;
    const cam = this.studio.camera;
    cam.position.set(0, 0, this.distance);
    cam.lookAt(0, 0, 0);
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * this.distance;
    const halfW = halfH * (this.w / this.h);
    for (const n of this.nodes) {
      if (!n) continue;
      const z = -0.4 + n.item.depth * 0.6;
      const k = (this.distance - z) / this.distance;
      n.obj.position.set((n.item.x * 2 - 1) * halfW * k, -(n.item.y * 2 - 1) * halfH * k, z);
      const worldSize = n.item.size * 2 * halfH * k;
      n.obj.userData.scale = worldSize / n.base;
    }
  }

  setPointer(nx: number, ny: number) {
    this.pointer.tx = nx;
    this.pointer.ty = ny;
  }

  setFocus(i: number) {
    this.focused = i;
  }

  /** Screen position (px) of each item's centre, for chips and hit areas. */
  anchors(): [number, number][] {
    const cam = this.studio.camera;
    return this.nodes.map((n) => {
      if (!n) return [0, 0];
      const p = n.obj.position.clone().project(cam);
      return [(p.x * 0.5 + 0.5) * this.w, (-p.y * 0.5 + 0.5) * this.h];
    });
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
    this.pointer.x += (this.pointer.tx - this.pointer.x) * 0.05;
    this.pointer.y += (this.pointer.ty - this.pointer.y) * 0.05;
    this.nodes.forEach((n, i) => {
      if (!n) return;
      const target = this.focused === i ? 1 : 0;
      n.focus += (target - n.focus) * (1 - Math.exp(-dt * 8));
      const s = (n.obj.userData.scale as number) * (1 + n.focus * 0.28);
      n.obj.scale.setScalar(s);
      if (!this.still) {
        n.obj.rotation.y += dt * (n.spin + n.focus * 1.4);
        n.obj.position.y += Math.sin(t * (0.6 + n.item.depth * 0.4) + i) * 0.0004 * (1 + n.item.depth);
      }
      // a focused item turns its face toward the viewer
      n.obj.rotation.x += ((n.item.tilt ?? 0.35) * (1 - n.focus) + 0.15 * n.focus - n.obj.rotation.x) * 0.08;
    });
    const cam = this.studio.camera;
    cam.position.x = this.pointer.x * 0.06;
    cam.position.y = -this.pointer.y * 0.04;
    cam.lookAt(0, 0, 0);
    return !this.still;
  }
}
