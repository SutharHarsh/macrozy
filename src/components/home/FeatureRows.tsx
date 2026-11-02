import type { ReactNode } from 'react';
import { Phone } from '../phone/Phone';
import { CaptureScreen, MealScreen } from '../phone/screens';
import { Reveal } from '../Reveal';

const ROWS: { title: [string, string]; text: string; screen: ReactNode }[] = [
  {
    title: ['Snap your', 'plate'],
    text: 'Point the camera at a single dish or a full thali. Macrozy names each part of the plate and matches it to Indian food data.',
    screen: <CaptureScreen mode={0} />,
  },
  {
    title: ['Say it', 'out loud'],
    text: '“Poha and chai.” “Two rotis and dal.” Your phone turns speech into text on the device, and the same search does the rest.',
    screen: <CaptureScreen mode={1} />,
  },
  {
    title: ['Set the', 'katori'],
    text: 'AI finds the foods; you set the portions. Katori, roti, glass, piece or grams. Every number updates before anything is logged.',
    screen: <MealScreen />,
  },
];

/** Title on the left, the real app screen in the middle, the explanation on the right. */
export function FeatureRows() {
  return (
    <section className="frows" aria-label="How logging works">
      {ROWS.map((r, i) => (
        <div key={i} className="frow wrap">
          <Reveal className="frow-title">
            <h2 className="title">
              {r.title[0]}
              <br />
              {r.title[1]}
            </h2>
          </Reveal>
          <Reveal className="frow-phone" delay={80}>
            <Phone>{r.screen}</Phone>
          </Reveal>
          <Reveal className="frow-text" delay={160}>
            <p>{r.text}</p>
          </Reveal>
        </div>
      ))}
    </section>
  );
}
