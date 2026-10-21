import { isTbd, LEVELS } from '../lib/utils.js';
import { Flag, Dot, ICON } from './ui.jsx';

function Filters({ partners, filter, onFilter }) {
  const counts = { all: partners.length };
  partners.forEach(p => counts[p.level] = (counts[p.level] || 0) + 1);
  const opts = [['all', 'Tous', null], ...Object.entries(LEVELS).map(([k, l]) => [k, l.label, l.color])];
  return (
    <div className="filters" id="filters">
      {opts.filter(([k]) => k === 'all' || counts[k]).map(([k, l, c]) => (
        <button key={k} className={`chip ${filter === k ? 'on' : ''}`} onClick={() => onFilter(k)}>
          {c ? <Dot color={c} /> : null}{l} <span style={{ opacity: .6 }}>{counts[k] || 0}</span>
        </button>
      ))}
    </div>
  );
}

function List({ partners, filter, selected, onSelect }) {
  const items = partners.filter(p => filter === 'all' || p.level === filter);
  return (
    <div className="list" id="list">
      {items.length ? items.map(p => {
        const sub = [p.type, p.capitale].filter(v => v && !isTbd(v)).join(' · ') || (p.filled ? '' : 'Fiche à compléter');
        return (
          <button key={partners.indexOf(p)}className={`item ${selected && selected.pays === p.pays ? 'sel' : ''}`} onClick={() => onSelect(p)}>
            <Flag a2={p.a2} /><span><span className="nm">{p.name}</span>{sub ? <span className="sub">{sub}</span> : null}</span>
            <Dot color={LEVELS[p.level].color} />
          </button>
        );
      }) : <div className="empty">Aucun partenaire pour ce filtre.</div>}
    </div>
  );
}

export default function SidePanel({ ready, open, partners, filter, selected, sync, spinning, onFilter, onSelect, onRefresh }) {
  return (
    <aside className={`side glass${open ? ' open' : ''}`} id="side">
      <header>
        <h2>Partenaires recensés</h2>
        {ready ? <Filters partners={partners} filter={filter} onFilter={onFilter} /> : <div className="filters" id="filters"></div>}
      </header>
      {ready ? <List partners={partners} filter={filter} selected={selected} onSelect={onSelect} /> : <div className="list" id="list"></div>}
      <footer>
        <span className={`sync${sync && !sync.live ? ' off' : ''}`} id="sync"><i></i>
          <span>{!sync ? 'Synchronisation…' : sync.live ? `Données à jour · ${sync.time}` : 'Hors ligne · copie locale'}</span>
        </span>
        <button className={`iconbtn${spinning ? ' spin' : ''}`} id="refresh" title="Recharger les données" onClick={onRefresh}>
          {ICON.refresh}Actualiser
        </button>
      </footer>
    </aside>
  );
}
