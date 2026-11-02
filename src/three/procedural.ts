import * as THREE from 'three';

/** Small seeded PRNG so procedural detail is identical on every load. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A brushed-steel thali: flat well, gently raised rim. Radius in metres. */
export function steelThali(radius = 0.17) {
  const pts = [
    new THREE.Vector2(0, 0.003),
    new THREE.Vector2(radius * 0.8, 0.003),
    new THREE.Vector2(radius * 0.9, 0.007),
    new THREE.Vector2(radius * 0.97, 0.016),
    new THREE.Vector2(radius, 0.018),
    new THREE.Vector2(radius * 1.005, 0.0165),
    new THREE.Vector2(radius * 0.975, 0.0125),
    new THREE.Vector2(radius * 0.9, 0.0035),
    new THREE.Vector2(radius * 0.8, 0),
    new THREE.Vector2(0, 0),
  ];
  const geo = new THREE.LatheGeometry(pts, 160);
  // polished steel: smooth, softly reflective, a touch of clearcoat for the rim highlight
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xe3e6ea,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.5,
    clearcoatRoughness: 0.18,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** The surface of a katori of toor dal: golden, glossy, with tadka and coriander. */
export function dalSurface(radius: number) {
  const tex = canvasTexture(512, (ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.42, s * 0.4, s * 0.05, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#f7c75c');
    g.addColorStop(0.6, '#e3a02c');
    g.addColorStop(1, '#bb7716');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const r = rng(11);
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * s * 0.42;
      ctx.fillStyle = r() < 0.55 ? '#7a2810' : '#3c8a37';
      ctx.beginPath();
      ctx.ellipse(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, 3 + r() * 5, 2 + r() * 3, r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,236,170,0.35)';
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.arc(s * (0.2 + r() * 0.6), s * (0.2 + r() * 0.6), 4 + r() * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

/** A soft dome of steamed rice, textured with individual grains. */
export function riceMound(radius: number, height: number) {
  const tex = canvasTexture(1024, (ctx, s) => {
    ctx.fillStyle = '#efe6d2';
    ctx.fillRect(0, 0, s, s);
    const r = rng(29);
    for (let i = 0; i < 4200; i++) {
      const x = r() * s;
      const y = r() * s;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r() * Math.PI);
      ctx.fillStyle = r() < 0.75 ? '#fffdf6' : '#f4ead6';
      ctx.strokeStyle = 'rgba(150,130,90,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9 + r() * 4, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  const geo = new THREE.SphereGeometry(radius, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  geo.scale(1, height / radius, 1);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78 }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Kachumber: diced tomato, onion and cucumber, scattered in a bowl. */
export function kachumber(radius: number) {
  const group = new THREE.Group();
  const r = rng(53);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const kinds = [
    { color: 0xd8382a, rough: 0.35 },
    { color: 0xe6b7c8, rough: 0.4 },
    { color: 0xb6dc8a, rough: 0.45 },
    { color: 0x4f8a35, rough: 0.5 },
  ];
  kinds.forEach((k, ki) => {
    const n = 26;
    const inst = new THREE.InstancedMesh(cube, new THREE.MeshPhysicalMaterial({ color: k.color, roughness: k.rough, clearcoat: 0.3 }), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * radius * 0.85;
      const s = 0.009 + r() * 0.005;
      m.compose(
        new THREE.Vector3(Math.cos(a) * d, r() * 0.012 + ki * 0.001, Math.sin(a) * d),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3)),
        new THREE.Vector3(s, s * 0.8, s),
      );
      inst.setMatrixAt(i, m);
    }
    inst.castShadow = true;
    group.add(inst);
  });
  return group;
}

/* ---------------- data objects ---------------- */

const glossy = (color: THREE.ColorRepresentation) =>
  new THREE.MeshPhysicalMaterial({ color, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4 });

/**
 * A horizontal meter: a frosted track with a glossy capsule fill growing from
 * the left. setFill(0..1) moves the end cap and stretches the body.
 */
export function meterBar(length: number, radius: number, color: THREE.ColorRepresentation) {
  const group = new THREE.Group();
  const track = new THREE.Mesh(new THREE.CapsuleGeometry(radius * 0.92, length, 8, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.6, transparent: true, opacity: 0.55 }));
  track.rotation.z = Math.PI / 2;
  track.position.x = length / 2;
  track.receiveShadow = true;
  group.add(track);

  const mat = glossy(color);
  const capL = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), mat);
  const capR = capL.clone();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 1, 32, 1, true), mat);
  body.rotation.z = Math.PI / 2;
  for (const m of [capL, capR, body]) m.castShadow = true;
  group.add(capL, capR, body);

  const knob = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.25, 32, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1 }));
  knob.castShadow = true;
  group.add(knob);

  const setFill = (f: number) => {
    const len = Math.max(0.0001, length * f);
    capR.position.x = len;
    body.scale.y = len;
    body.position.x = len / 2;
    knob.position.x = len;
    const on = f > 0.001;
    capL.visible = capR.visible = body.visible = knob.visible = on;
  };
  setFill(0);
  return { group, setFill };
}

/** A streak coin: a thick glossy disc with a flame on its face. */
export function streakCoin(radius: number, kind: 'on' | 'rest' | 'off') {
  const group = new THREE.Group();
  if (kind === 'rest') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, radius * 0.08, 16, 64), new THREE.MeshPhysicalMaterial({ color: 0xb98b62, roughness: 0.4 }));
    group.add(ring);
    return group;
  }
  if (kind === 'off') {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, radius * 0.22, 48), new THREE.MeshPhysicalMaterial({ color: 0xe9e9e9, roughness: 0.6 }));
    disc.rotation.x = Math.PI / 2;
    group.add(disc);
    return group;
  }
  const face = canvasTexture(256, (ctx, s) => {
    const g = ctx.createRadialGradient(s * 0.35, s * 0.3, s * 0.05, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#ffc98a');
    g.addColorStop(0.6, '#ec8f3e');
    g.addColorStop(1, '#c9661c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    const x = s / 2;
    const y = s / 2 + s * 0.03;
    const r = s * 0.24;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.bezierCurveTo(x + r * 0.2, y - r * 0.45, x + r * 0.85, y - r * 0.2, x + r * 0.7, y + r * 0.35);
    ctx.bezierCurveTo(x + r * 0.6, y + r * 0.85, x - r * 0.6, y + r * 0.85, x - r * 0.7, y + r * 0.35);
    ctx.bezierCurveTo(x - r * 0.8, y - r * 0.05, x - r * 0.35, y - r * 0.1, x - r * 0.25, y - r * 0.45);
    ctx.bezierCurveTo(x - r * 0.05, y - r * 0.3, x - r * 0.1, y - r * 0.7, x, y - r);
    ctx.fill();
  });
  const faceMat = new THREE.MeshPhysicalMaterial({ map: face, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
  const sideMat = new THREE.MeshPhysicalMaterial({ color: 0xc9661c, roughness: 0.35, metalness: 0.2, clearcoat: 1 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, radius * 0.24, 64), [sideMat, faceMat, faceMat]);
  disc.rotation.x = Math.PI / 2;
  disc.castShadow = true;
  group.add(disc);
  return group;
}

/** The day's ring: four macro arcs around a track, revealed with setSweep(0..1). */
export function macroRing(radius: number, tube: number) {
  const group = new THREE.Group();
  const track = new THREE.Mesh(new THREE.TorusGeometry(radius, tube * 0.9, 24, 160), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.55, transparent: true, opacity: 0.6 }));
  group.add(track);
  const segs = [
    { share: 0.18, color: 0xff9230 },
    { share: 0.3, color: 0x30d158 },
    { share: 0.1, color: 0xffd600 },
    { share: 0.12, color: 0x64d2ff },
  ];
  const total = segs.reduce((s, x) => s + x.share, 0);
  const meshes = segs.map((s) => {
    const m = new THREE.Mesh(new THREE.BufferGeometry(), glossy(s.color));
    m.castShadow = true;
    group.add(m);
    return m;
  });
  let last = -1;
  const setSweep = (p: number) => {
    if (Math.abs(p - last) < 0.004) return;
    last = p;
    const full = 0.72 * Math.PI * 2 * p;
    let a = 0;
    const gap = 0.05;
    segs.forEach((s, i) => {
      const span = (s.share / total) * full;
      const m = meshes[i];
      m.geometry.dispose();
      if (span > gap * 1.5) {
        m.geometry = new THREE.TorusGeometry(radius, tube, 24, 96, span - gap);
        m.rotation.z = Math.PI / 2 - a - span + gap / 2;
        m.visible = true;
      } else {
        m.geometry = new THREE.BufferGeometry();
        m.visible = false;
      }
      a += span;
    });
  };
  setSweep(0);
  return { group, setSweep };
}

/** A 12-week weight trend as a glossy tube with a soft area beneath. setProgress reveals it left to right. */
export function weightTrend(width: number, height: number, weights: number[], kgTop: number, kgBottom: number) {
  const group = new THREE.Group();
  const pts = weights.map((kg, i) => new THREE.Vector3(-width / 2 + (i / (weights.length - 1)) * width, ((kg - kgBottom) / (kgTop - kgBottom)) * height, 0));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
  const segs = 240;
  const tubeGeo = new THREE.TubeGeometry(curve, segs, 0.0055, 16, false);
  const tube = new THREE.Mesh(tubeGeo, new THREE.MeshPhysicalMaterial({ color: 0xffd600, roughness: 0.2, clearcoat: 1, emissive: 0x806500, emissiveIntensity: 0.25 }));
  tube.castShadow = true;
  group.add(tube);

  // area under the curve
  const areaPos: number[] = [];
  const samples = curve.getSpacedPoints(segs);
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i];
    const b = samples[i + 1];
    areaPos.push(a.x, a.y, -0.001, a.x, 0, -0.001, b.x, b.y, -0.001, b.x, b.y, -0.001, a.x, 0, -0.001, b.x, 0, -0.001);
  }
  const areaGeo = new THREE.BufferGeometry();
  areaGeo.setAttribute('position', new THREE.Float32BufferAttribute(areaPos, 3));
  const area = new THREE.Mesh(areaGeo, new THREE.MeshBasicMaterial({ color: 0xffd600, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
  group.add(area);

  // goal line, a row of short dashes
  const dash = new THREE.BoxGeometry(width / 40, 0.0025, 0.0025);
  const dashMat = new THREE.MeshBasicMaterial({ color: 0x64d2ff });
  for (let i = 0; i < 20; i++) {
    const d = new THREE.Mesh(dash, dashMat);
    d.position.set(-width / 2 + (i + 0.25) * (width / 20), 0, 0);
    group.add(d);
  }

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.011, 32, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 1 }));
  group.add(head);
  const startDot = head.clone();
  startDot.position.copy(pts[0]);
  group.add(startDot);

  const tubeIndexCount = tubeGeo.index!.count;
  const setProgress = (p: number) => {
    const k = Math.max(0, Math.min(1, p));
    tubeGeo.setDrawRange(0, Math.floor((tubeIndexCount * k) / 6) * 6);
    areaGeo.setDrawRange(0, Math.floor(segs * k) * 6);
    head.position.copy(curve.getPointAt(Math.max(0.0001, k)));
    head.visible = k > 0.01;
  };
  setProgress(0);
  return { group, setProgress, start: pts[0], end: pts[pts.length - 1], head };
}
