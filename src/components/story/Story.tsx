import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { StoryWorld, type AnchorKey } from '@/three/StoryWorld';
import { METER_ROWS } from '@/canvas/dataLayer';
import { Phone } from '../phone/Phone';
import { KatoriLoader } from '../Wordmark';
import { MealScreen } from '../phone/screens';
import { CHAPTER_COPY, CapturePhone, type DecideState } from './chapters';
import { mealItems, fmtKcal } from '@/data/meal';
import {
  CH,
  CHAPTERS,
  TOTAL,
  blendAt,
  cutStory,
  gToProgress,
  progressToG,
  setChase,
  setStoryTarget,
  subscribe,
  useActiveChapter,
  weight,
} from '@/lib/story';
import { ScrollTrigger, afterMotion, isTouch, scrollToY, useMediaQuery, useReducedMotion } from '@/lib/motion';

function useDecide(): DecideState {
  const [dal, setDal] = useState(1);
  const [rice, setRice] = useState(150);
  const [logged, setLogged] = useState(false);
  return { dal, rice, logged, setDal, setRice, setLogged };
}

const PHONE_CHAPTERS = [CH.capture, CH.split, CH.decide];

/* DOM labels that ride on 3D objects, grouped by the chapters that show them */
const LABEL_GROUPS: { keys: AnchorKey[]; chapters: number[] }[] = [
  { keys: ['dal', 'rice', 'salad'], chapters: [CH.split, CH.decide] },
  { keys: ['m0', 'm1', 'm2', 'm3', 'm4'], chapters: [CH.day] },
  { keys: ['wStart', 'wEnd', 'wGoal'], chapters: [CH.week] },
  { keys: ['ring'], chapters: [CH.start] },
];

/** Where the camera's target should land on screen: between the headline and the phone. */
function focusPoint(w: number, h: number, phoneW: number) {
  if (w < 900) return { x: w / 2, y: h * 0.4 };
  // clear of the glass card on the left; with the phone on stage, slide left and up between the two
  return { x: w * (0.62 - 0.12 * phoneW), y: h * (0.55 - 0.06 * phoneW) };
}

export function Story() {
  const reduced = useReducedMotion();
  return reduced ? <StaticStory /> : <PinnedStory />;
}

function PinnedStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const headRefs = useRef<(HTMLElement | null)[]>([]);
  const factRefs = useRef<(HTMLElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<(HTMLElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelEls = useRef<Partial<Record<AnchorKey, HTMLElement | null>>>({});
  const cardBodyRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<StoryWorld | null>(null);
  const [loading, setLoading] = useState(true);
  const decide = useDecide();
  const active = useActiveChapter();
  const wide = useMediaQuery('(min-width: 1100px)');

  useEffect(() => {
    const track = trackRef.current!;
    const stage = stageRef.current!;
    const canvas = canvasRef.current!;
    setChase(isTouch());
    let world: StoryWorld;
    try {
      world = new StoryWorld(canvas);
    } catch {
      setLoading(false);
      return;
    }
    worldRef.current = world;
    let alive = true;
    let inView = true;
    let size = { w: stage.clientWidth, h: stage.clientHeight };
    let lastG = 0;

    // meter labels sit left-aligned on their bar; the goal chip hangs off the line's right end
    const align = (key: AnchorKey) => (key[0] === 'm' ? 'translate(0, -100%)' : key === 'wGoal' ? 'translate(-100%, -50%)' : key === 'ring' ? 'translate(-50%, -50%)' : 'translate(-50%, -100%)');
    world.onFrame = () => {
      const a = world.anchors();
      for (const [key, el] of Object.entries(labelEls.current) as [AnchorKey, HTMLElement | null][]) {
        const p = a[key];
        if (el && p) el.style.transform = `translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0) ${align(key)}`;
      }
    };

    const apply = (g: number) => {
      lastG = g;
      const phoneW = window.innerWidth >= 1100 ? PHONE_CHAPTERS.reduce((s, k) => s + weight(k, g), 0) : 0;
      const f = focusPoint(size.w, size.h, phoneW);
      world.setFocus(f.x, f.y);
      world.setG(g);

      // "the gap": the same plate, seen the way a generic app sees it
      const wGap = weight(CH.gap, g);
      canvas.style.filter = wGap > 0.01 ? `grayscale(${wGap.toFixed(2)}) blur(${(wGap * 2.2).toFixed(2)}px)` : '';

      let r = 0;
      let gg = 0;
      let b = 0;
      CHAPTER_COPY.forEach((c, k) => {
        const w = weight(k, g);
        r += c.wash[0] * w;
        gg += c.wash[1] * w;
        b += c.wash[2] * w;
      });
      stage.style.setProperty('--wash', `${r | 0}, ${gg | 0}, ${b | 0}`);

      const { i, local } = blendAt(g);
      const fade = (els: (HTMLElement | null)[], dy: number) =>
        els.forEach((el, k) => {
          if (!el) return;
          const w = weight(k, g);
          el.style.opacity = w.toFixed(3);
          el.style.visibility = w < 0.002 ? 'hidden' : 'visible';
          el.style.transform = `translate3d(0, ${((1 - w) * (k <= i ? -dy : dy)).toFixed(1)}px, 0)`;
          el.inert = w < 0.5;
        });
      fade(headRefs.current, 14);
      fade(factRefs.current, 10);
      fade(bodyRefs.current, 8);

      if (phoneRef.current) {
        phoneRef.current.style.opacity = phoneW.toFixed(3);
        phoneRef.current.style.visibility = phoneW < 0.01 ? 'hidden' : 'visible';
        phoneRef.current.style.transform = `translate3d(${((1 - phoneW) * 60).toFixed(1)}px, -50%, 0)`;
      }
      screenRefs.current.forEach((el, n) => {
        if (!el) return;
        const w = weight(PHONE_CHAPTERS[n], g);
        el.style.opacity = w.toFixed(3);
        el.style.visibility = w < 0.002 ? 'hidden' : 'visible';
      });

      LABEL_GROUPS.forEach((grp, n) => {
        const el = groupRefs.current[n];
        if (!el) return;
        const w = grp.chapters.reduce((s, c) => s + weight(c, g), 0);
        el.style.opacity = w.toFixed(3);
        el.style.visibility = w < 0.01 ? 'hidden' : 'visible';
      });
      fillRefs.current.forEach((el, k) => {
        if (!el) return;
        const fill = k < i ? 1 : k === i ? local : 0;
        el.style.transform = `scaleX(${Math.min(1, fill).toFixed(3)})`;
      });
    };

    const place = () => {
      size = { w: stage.clientWidth, h: stage.clientHeight };
      world.resize(size.w, size.h);
      apply(lastG);
    };

    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => setStoryTarget(progressToG(self.progress)),
      onRefresh: (self) => cutStory(progressToG(self.progress)),
    });
    triggerRef.current = st;
    const unsubscribe = subscribe(apply);
    const ro = new ResizeObserver(place);
    ro.observe(stage);
    place();

    // models and first frames wait for the preloader / page transition to finish
    let armed = false;
    const cancelGate = afterMotion(() => {
      armed = true;
      world
        .init()
        .then(() => {
          if (!alive) return;
          setLoading(false);
          if (inView && !document.hidden) world.start();
        })
        .catch(() => alive && setLoading(false));
    });

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && armed && !document.hidden) world.start();
        else world.stop();
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(track);

    const onPointer = (ev: PointerEvent) => {
      if (ev.pointerType === 'mouse') world.setPointer((ev.clientX / window.innerWidth) * 2 - 1, (ev.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    const onVisibility = () => (document.hidden ? world.stop() : inView && armed && world.start());
    document.addEventListener('visibilitychange', onVisibility);

    ScrollTrigger.refresh();
    return () => {
      alive = false;
      cancelGate();
      unsubscribe();
      st.kill();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      world.onFrame = null;
      world.dispose();
      worldRef.current = null;
      setChase(false);
    };
  }, []);

  /* portions reshape the bowls live */
  useEffect(() => {
    worldRef.current?.setParams({ dalKatori: decide.dal, riceGrams: decide.rice });
  }, [decide.dal, decide.rice]);

  /* the card grows and shrinks to fit the chapter it is showing */
  useLayoutEffect(() => {
    const body = cardBodyRef.current;
    const layer = bodyRefs.current[active];
    if (!body || !layer) return;
    const fit = () => (body.style.height = `${layer.offsetHeight}px`);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(layer);
    return () => ro.disconnect();
  }, [active]);

  const goTo = (k: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = k + (k === 0 ? 0 : 0.02);
    const y = st.start + gToProgress(target) * (st.end - st.start) + 2;
    const stage = stageRef.current;
    stage?.classList.add('is-cutting');
    window.setTimeout(() => {
      scrollToY(y, true);
      cutStory(target);
      window.setTimeout(() => stage?.classList.remove('is-cutting'), 60);
    }, 180);
  };

  const items = mealItems(decide.dal, decide.rice);
  const readout = `${String(active + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')}`;
  const label = (key: AnchorKey) => (el: HTMLElement | null) => {
    labelEls.current[key] = el;
  };

  return (
    <section className="story" aria-label="One lunch, start to finish">
      <div ref={trackRef} className="story-track" style={{ '--story-len': TOTAL } as CSSProperties}>
        <div ref={stageRef} className={`story-stage ${loading ? 'is-loading' : ''}`}>
          <div className="story-wash" aria-hidden="true" />
          <canvas ref={canvasRef} className="story-canvas story-3d" aria-hidden="true" />
          {loading && (
            <div className="story-loader" aria-hidden="true">
              <KatoriLoader size={56} />
            </div>
          )}

          <div className="story-labels" aria-hidden="true">
            <div ref={(el) => (groupRefs.current[0] = el)} className="label-group">
              {items.map((it) => (
                <span key={it.id} ref={label(it.id as AnchorKey)} className={`food-label is-${it.id}`}>
                  <b>{it.name}</b>
                  <i className="tabular">
                    {it.qty} · {fmtKcal(it.m.kcal)} kcal
                  </i>
                </span>
              ))}
            </div>
            <div ref={(el) => (groupRefs.current[1] = el)} className="label-group">
              {METER_ROWS.map((row, r) => (
                <span key={row.name} ref={label(`m${r}` as AnchorKey)} className="meter-label">
                  <b>{row.name}</b>
                  <i className="tabular">
                    {row.now.toLocaleString('en-IN')} / {row.target.toLocaleString('en-IN')} {row.unit}
                  </i>
                </span>
              ))}
            </div>
            <div ref={(el) => (groupRefs.current[2] = el)} className="label-group">
              <span ref={label('wStart')} className="chip-label">
                84.0 kg
              </span>
              <span ref={label('wEnd')} className="chip-label is-dark">
                79.2 kg · −4.8
              </span>
              <span ref={label('wGoal')} className="chip-label is-goal">
                Goal 74 kg
              </span>
            </div>
            <div ref={(el) => (groupRefs.current[3] = el)} className="label-group">
              <span ref={label('ring')} className="ring-label">
                <b className="tabular">1,640</b>
                <i>of 2,100 kcal today</i>
              </span>
            </div>
          </div>

          <div className="story-head">
            {CHAPTERS.map((c, k) => {
              const copy = CHAPTER_COPY[k];
              return (
                <header key={c.id} ref={(el) => (headRefs.current[k] = el)} className={`story-head-layer ${k === 0 ? '' : 'is-pre'}`} aria-hidden={active !== k}>
                  <div className="story-kicker">
                    <span className="story-dot" style={{ background: copy.tone }} aria-hidden="true" />
                    <span>{c.label}</span>
                    <span className="story-kicker-sep" aria-hidden="true" />
                    <span className="story-kicker-muted">Illustrative example</span>
                  </div>
                  <h2 className="story-title">
                    <span>{copy.lines[0]}</span>
                    <span style={{ color: copy.tone }}>{copy.lines[1]}</span>
                  </h2>
                </header>
              );
            })}
          </div>

          <div className="story-facts">
            {CHAPTERS.map((c, k) => (
              <dl key={c.id} ref={(el) => (factRefs.current[k] = el)} className={`facts ${k === 0 ? '' : 'is-pre'}`} aria-hidden={active !== k}>
                {CHAPTER_COPY[k].facts(decide).map((f, n) => (
                  <div key={n} className="fact">
                    <dt>
                      <span className="fact-src">{f.src}</span>
                    </dt>
                    <dd>
                      <b className="tabular">{f.value}</b>
                      {f.unit && <span className="fact-unit"> {f.unit}</span>}
                      <span className="fact-cap">{f.caption}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>

          <div className="story-card">
            <nav className="story-progress" aria-label="Story chapters">
              {CHAPTERS.map((c, k) => (
                <button
                  key={c.id}
                  type="button"
                  className="story-seg"
                  style={{ flexGrow: c.len }}
                  aria-label={`Chapter ${k + 1}: ${c.label}`}
                  aria-current={active === k ? 'step' : undefined}
                  onClick={() => goTo(k)}
                >
                  <span ref={(el) => (fillRefs.current[k] = el)} className="story-seg-fill" style={{ background: CHAPTER_COPY[k].tone }} />
                </button>
              ))}
            </nav>
            <div className="story-card-meta">
              <span className="tabular">{readout}</span>
              <span>{CHAPTERS[active].label}</span>
            </div>
            <div ref={cardBodyRef} className="story-card-body">
              {CHAPTERS.map((c, k) => {
                const copy = CHAPTER_COPY[k];
                return (
                  <div key={c.id} ref={(el) => (bodyRefs.current[k] = el)} className={`story-card-layer ${k === 0 ? '' : 'is-pre'}`} aria-hidden={active !== k}>
                    <p className="story-body">{copy.body}</p>
                    {copy.figure && (
                      <div className="story-figure">
                        <b className="tabular" style={{ color: copy.tone }}>
                          {copy.figure.value}
                        </b>
                        <span>{copy.figure.caption}</span>
                      </div>
                    )}
                    {copy.extra?.(decide)}
                  </div>
                );
              })}
            </div>
          </div>

          {wide && (
            <div ref={phoneRef} className="story-phone" aria-hidden="true">
              <Phone>
                <div ref={(el) => (screenRefs.current[0] = el)} className="story-screen">
                  <CapturePhone />
                </div>
                <div ref={(el) => (screenRefs.current[1] = el)} className="story-screen">
                  <MealScreen analyzing />
                </div>
                <div ref={(el) => (screenRefs.current[2] = el)} className="story-screen">
                  <MealScreen dal={decide.dal} rice={decide.rice} logged={decide.logged} />
                </div>
              </Phone>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Reduced motion: the same story as normal, readable sections. No pin, no 3D. */
function StaticStory() {
  const decide = useDecide();
  return (
    <section className="story-static" aria-label="One lunch, start to finish">
      <div className="wrap">
        <span className="illustrative">Illustrative example</span>
      </div>
      {CHAPTERS.map((c, k) => {
        const copy = CHAPTER_COPY[k];
        return (
          <article key={c.id} className="story-static-ch wrap">
            <div className="story-static-copy">
              <span className="story-eyebrow">
                <span className="tabular">{String(k + 1).padStart(2, '0')}</span> {c.label}
              </span>
              <h2 className="story-title">
                <span>{copy.lines[0]}</span> <span style={{ color: copy.tone }}>{copy.lines[1]}</span>
              </h2>
              <p className="story-body">{copy.body}</p>
              {copy.extra?.(decide)}
            </div>
            <Phone className="story-static-phone">{copy.phone(decide)}</Phone>
          </article>
        );
      })}
    </section>
  );
}
