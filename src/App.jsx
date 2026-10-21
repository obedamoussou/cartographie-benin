import { useEffect, useRef, useState } from 'react';
import { BENIN, REFRESH_EVERY } from './lib/config.js';
import { isTbd, fmtNum, LEVELS } from './lib/utils.js';
import { loadData, loadWorld } from './lib/data.js';
import GlobeView from './components/GlobeView.jsx';
import SidePanel from './components/SidePanel.jsx';
import Search from './components/Search.jsx';
import Drawer from './components/Drawer.jsx';
import { Dot, ICON } from './components/ui.jsx';

// function Stats({ partners, accords }) {
//   const amb = partners.filter(p => /ambassade/i.test(p.type)).length;
//   const total = accords.reduce((s, a) => s + (Number((a.montant || '').replace(/[\s ]/g, '')) || 0), 0);
//   const accN = accords.filter(a => a.intitule && !isTbd(a.intitule)).length;
//   return [
//     [partners.length, 'Partenaires'], [amb, 'Ambassades'], [accN, 'Accords'], [total ? fmtNum(String(total)) : '—', 'Montant accords']
//   ].map(([b, s]) => <div className="stat" key={s}><b>{b}</b><span>{s}</span></div>);
// }

function Legend() {
  return <>
    {/* <span><Dot color="#fcd116" />Bénin</span> */}
    {Object.values(LEVELS).map(l => <span key={l.label}><Dot color={l.color} />{l.label}</span>)}
  </>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [world, setWorld] = useState({ features: [], byA2: {} });
  const [data, setData] = useState({ partners: [], accords: [], sync: null });
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [drawer, setDrawer] = useState({ p: null, version: 0 }); // dernière fiche affichée (reste visible pendant la fermeture)
  const [sideOpen, setSideOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const globe = useRef(null);

  // valeurs courantes pour les rappels asynchrones (minuteries, globe, clavier)
  const cur = useRef({});
  cur.current = { world, data, selected };
  const selectedRef = useRef(null);

  const showDrawer = p => setDrawer(d => ({ p, version: d.version + 1 }));
  const partnerOf = f => f && cur.current.data.partners.find(p => p.a2 && p.a2 === f.a2);

  const select = (p, feature) => {
    const { byA2 } = cur.current.world;
    if (p && p.a2 === BENIN.a2 && !partnerOf(byA2.BJ)) { p = { a2: 'BJ', name: 'Bénin', pays: 'Bénin', home: true }; }
    selectedRef.current = p;
    setSelected(p);
    globe.current.focus(feature || (p.a2 && byA2[p.a2]));
    showDrawer(p);
  };
  const closeDrawer = () => {
    if (!selectedRef.current) return;
    selectedRef.current = null;
    setSelected(null);
    globe.current.zoomOut();
    setTimeout(() => { if (!selectedRef.current) globe.current?.autoRotate(); }, 4000);
  };

  const refresh = async () => {
    setSpinning(true);
    const sel = selectedRef.current && selectedRef.current.pays;
    const next = await loadData();
    setData(next);
    if (sel) {
      const p = next.partners.find(x => x.pays === sel);
      // mise à jour sur place : la fiche garde son défilement et la fenêtre des accords reste ouverte
      if (p) { selectedRef.current = p; setSelected(p); setDrawer(d => ({ ...d, p })); }
    }
    setSpinning(false);
  };
  const refreshRef = useRef(refresh); refreshRef.current = refresh;

  /* ---------- démarrage ---------- */
  useEffect(() => {
    let timer;
    Promise.all([loadWorld(), loadData()]).then(([w, d]) => {
      setWorld(w); setData(d); setReady(true);
      timer = setInterval(() => refreshRef.current(), REFRESH_EVERY);
    });
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { document.body.classList.toggle('drawer-open', !!selected); }, [selected]);

  const onCountryClick = (f, partner) =>
    select(f.a2 ? (partner || { a2: f.a2, name: f.name, pays: f.name, ghost: true }) : { a2: null, name: f.name, pays: f.name, ghost: true }, f);
  const onPick = r => {
    if (r.partner) select(r.p);
    else select({ a2: r.a2, name: r.name, pays: r.name, ghost: true }, world.byA2[r.a2]);
  };
  const onListSelect = p => { select(p); if (innerWidth < 760) setSideOpen(false); };

  return <>
    <GlobeView ref={globe} features={world.features} partners={data.partners} filter={filter} selected={selected}
      onCountryClick={onCountryClick} onBackgroundClick={closeDrawer} />

    <div className={`loader${ready ? ' hide' : ''}`} id="loader"><div><div className="flagbar"></div>Chargement de la cartographie…</div></div>

    <div className="topbar">
      <div className="brand glass">
        <div className="flagbar"></div>
        <div><h1>Bénin · DGCI</h1></div>
        {/* <small>Cartographie de la coopération</small> */}
      </div>
      {/* <div className="stats glass" id="stats">{ready ? <Stats partners={data.partners} accords={data.accords} /> : null}</div> */}
      <div className="spacer"></div>
      <button className="toggle-side glass" id="toggleSide" aria-label="Liste des partenaires" onClick={() => setSideOpen(o => !o)}>
        {ICON.menu}
      </button>
      <Search partners={data.partners} features={world.features} onPick={onPick} onEscape={closeDrawer} />
    </div>

    <SidePanel ready={ready} open={sideOpen} partners={data.partners} filter={filter} selected={selected}
      sync={data.sync} spinning={spinning} onFilter={setFilter} onSelect={onListSelect}
      onRefresh={() => { if (ready) refresh(); }} />

    <div className="legend glass" id="legend">{ready ? <Legend /> : null}</div>

    <Drawer p={drawer.p} open={!!selected} version={drawer.version} partnersCount={data.partners.length} onClose={closeDrawer} />
  </>;
}
