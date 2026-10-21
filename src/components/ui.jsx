import { isTbd, flagUrl } from '../lib/utils.js';

export const Flag = ({ a2, className = 'flag' }) =>
  a2 ? <img className={className} src={flagUrl(a2)} alt="" loading="lazy" /> : <span className={className}></span>;

export const Val = ({ v }) => isTbd(v) ? <span className="tbd">À préciser</span> : v;

export const Dot = ({ color }) => <i className="dot" style={{ color, background: color }}></i>;

const svg = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };
export const ICON = {
  mail: <svg width="15" height="15" {...svg}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>,
  phone: <svg width="15" height="15" {...svg}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>,
  user: <svg width="15" height="15" {...svg}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>,
  ext: <svg width="14" height="14" {...svg}><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>,
  folder: <svg width="14" height="14" {...svg}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
  close: <svg width="16" height="16" {...svg}><path d="M6 6l12 12M18 6 6 18" /></svg>,
  search: <svg width="16" height="16" {...svg}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  menu: <svg width="18" height="18" {...svg}><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  refresh: <svg width="13" height="13" {...svg} strokeWidth="2.2"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
};
