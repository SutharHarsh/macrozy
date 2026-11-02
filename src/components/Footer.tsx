import { Link } from 'react-router-dom';
import { Wordmark } from './Wordmark';

const NOTES = [
  'Meals, portions and nutrition values shown on this site are illustrative. In the app, food data is reviewed by a nutritionist before it is published.',
  'Fifteen seconds is the design target for logging a meal you have logged before, using Recents or Usuals.',
  'Micronutrient tracking, progress photos, 90-day history, the calorie balance chart, badges and CSV export are part of Pro.',
  'The 14-day trial starts when you sign up and includes every Pro feature. No card is needed. You get a reminder three days before it ends. Pro is ₹299 a month or ₹1,999 a year.',
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <ol className="footnotes">
          {NOTES.map((n, i) => (
            <li key={i}>
              <sup>{i + 1}</sup>
              <span>{n}</span>
            </li>
          ))}
        </ol>
        <p className="footer-credit">
          3D food and kitchenware models from{' '}
          <a href="https://huggingface.co/datasets/nvidia/simready-assets" target="_blank" rel="noreferrer">
            NVIDIA SimReady Assets
          </a>
          , licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>
          . Converted from USD to glTF, simplified and re-textured for the web by Macrozy. The thali, dal, rice and kachumber are modelled by Macrozy.
        </p>
        <div className="footer-grid">
          <div className="footer-brand">
            <Wordmark size={22} />
            <p>A macro tracker for Indian home food. Built in Pune.</p>
          </div>
          <nav aria-label="Product" className="footer-col">
            <span>Product</span>
            <Link to="/features">Features</Link>
            <Link to="/food">Food explorer</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/download">Download</Link>
          </nav>
          <nav aria-label="Learn" className="footer-col">
            <span>Learn</span>
            <Link to="/science">How targets work</Link>
            <Link to="/science#bmi">Our BMI policy</Link>
            <Link to="/science#privacy">Privacy and data</Link>
            <Link to="/pricing#faq">FAQ</Link>
          </nav>
          <div className="footer-col">
            <span>Contact</span>
            <p className="footer-mail">hello@macrozy.app</p>
            <p>Placeholder address. Replace before launch.</p>
          </div>
        </div>
        <div className="footer-base">
          <span>Copyright © 2026 Macrozy. All rights reserved.</span>
          <span>Made for ghar ka khana.</span>
        </div>
      </div>
    </footer>
  );
}
