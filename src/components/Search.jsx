import { useEffect, useRef, useState } from 'react';
import { norm } from '../lib/utils.js';
import { Flag, ICON } from './ui.jsx';

/* ---------- recherche ---------- */
export default function Search({ partners, features, onPick, onEscape }) {
  const input = useRef(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  const show = r => { setResults(r); setOpen(r.length > 0); };
  const all = () => {
    const seen = new Set(partners.map(p => p.a2).filter(Boolean));
    return [...partners.map(p => ({ p, name: p.name, a2: p.a2, partner: true })),
      ...features.filter(f => f.a2 && !seen.has(f.a2)).map(f => ({ name: f.name, a2: f.a2, partner: false }))];
  };
  const go = r => {
    if (!r) return;
    setQ(''); show([]); input.current.blur();
    onPick(r);
  };

  const onChange = e => {
    const v = e.target.value; setQ(v);
    const n = norm(v); setIdx(0);
    show(n ? all().filter(r => norm(r.name).includes(n)).sort((a, b) => (b.partner - a.partner) || (norm(a.name).indexOf(n) - norm(b.name).indexOf(n))).slice(0, 8) : []);
  };
  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { setIdx(Math.min(idx + 1, results.length - 1)); setOpen(results.length > 0); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setIdx(Math.max(idx - 1, 0)); setOpen(results.length > 0); e.preventDefault(); }
    else if (e.key === 'Enter') go(results[idx]);
    else if (e.key === 'Escape') { setQ(''); show([]); }
  };

  // raccourcis : Échap ferme la fiche, « / » place le curseur dans la recherche
  const escape = useRef(onEscape); escape.current = onEscape;
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape' && document.activeElement !== input.current) escape.current();
      if (e.key === '/' && document.activeElement !== input.current) { e.preventDefault(); input.current.focus(); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="search">
      {ICON.search}
      <input id="q" ref={input} placeholder="Rechercher un pays…" autoComplete="off" value={q}
        onChange={onChange} onKeyDown={onKeyDown} onBlur={() => setTimeout(() => setOpen(false), 100)} />
      <div className={`suggest glass${open ? ' open' : ''}`} id="suggest">
        {results.map((r, i) => (
          <button key={i} className={i === idx ? 'active' : ''} onMouseDown={e => { e.preventDefault(); go(r); }}>
            <Flag a2={r.a2} />{r.name}<em>{r.partner ? 'Partenaire' : 'Non recensé'}</em>
          </button>
        ))}
      </div>
    </div>
  );
}
