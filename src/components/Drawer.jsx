import { Fragment, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { color as d3color } from 'd3';
import { norm, isTbd, parseDate, fmtDate, since, fmtNum, fullNum, initials, link, LEVELS, statusStyle } from '../lib/utils.js';
import { Flag, Val, Dot, ICON } from './ui.jsx';

function Hero({ p, lvl, onClose }) {
  return (
    <div className="hero">
      <button className="close" aria-label="Fermer" onClick={onClose}>{ICON.close}</button>
      <Flag a2={p.a2} />
      <h2>{p.name}</h2>
      <div className="cap">{p.capitale && !isTbd(p.capitale) ? 'Capitale · ' + p.capitale : p.home ? 'Porto-Novo · Cotonou' : ' '}</div>
      {p.ghost || p.home ? null : <div className="badges">
        <span className="badge"><Dot color={lvl.color} />Activité · {lvl.label}</span>
        {p.type && !isTbd(p.type) ? <span className="badge">{p.type}</span> : null}
        {/* {p.accords.length ? <span className="badge">{p.accords.filter(a => a.intitule).length} accord{p.accords.length > 1 ? 's' : ''}</span> : null} */}
      </div>}
    </div>
  );
}

function Representation({ p }) {
  const nomin = fmtDate(p.nomination);
  return (
    <div className="card"><h3>Représentation diplomatique</h3>
      <div className="amb"><div className="avatar">{!isTbd(p.ambassadeur) && p.ambassadeur ? initials(p.ambassadeur) : ICON.user}</div>
        <div><b><Val v={p.ambassadeur} /></b><span>Ambassadeur(e){nomin ? ` · nommé(e) le ${nomin}` : ''}{since(p.nomination) ? <> <span style={{ color: 'var(--faint)' }}>({since(p.nomination)})</span></> : null}</span></div></div>
      <div className="grid2">
        <div className="kv"><span>Type de représentation</span><b><Val v={p.type} /></b></div>
        <div className="kv"><span>Résidence de l'ambassadeur(e)</span><b><Val v={p.residence} /></b></div>
      </div></div>
  );
}

function Cooperation({ p }) {
  const doms = (p.domaines || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  return (
    <div className="card"><h3>Coopération <span className="n">{doms.length ? doms.length + ' domaines' : ''}</span></h3>
      <div className="kv" style={{ marginBottom: 12 }}><span>Agence de coopération</span><b><Val v={p.agence} /></b></div>
      {doms.length && !isTbd(p.domaines) ? <div className="tags">{doms.map((t, i) => <span className="tag" key={i}>{t}</span>)}</div> : <Val v="" />}
      <div className="grid2">
        <div className="kv kpi"><span>Projets financés</span><b>{fmtNum(p.projets) ? fmtNum(p.projets) : <Val v="" />}</b></div>
        <div className="kv kpi"><span>Montant mobilisé</span><b title={fullNum(p.montant)}>{fmtNum(p.montant) ? fmtNum(p.montant) : <Val v="" />}</b></div>
      </div></div>
  );
}

function Agenda({ p }) {
  const tl = [
    ['Dernière actualité commune', p.actu, null, 'var(--lvl-high)'],
    ['Dernière audience', null, p.audience, 'var(--lvl-none)'],
    ['Dernière interaction', null, p.lastInt, 'var(--lvl-none)'],
    ['Prochaine actualité à suivre', p.prochActu, null, 'var(--yellow)'],
    ['Prochaine interaction', null, p.nextInt, 'var(--yellow)'],
    ['Prochaines actions', p.actions, null, 'var(--lvl-low)']
  ];
  return (
    <div className="card"><h3>Actualité &amp; agenda</h3><div className="tl">{tl.map(([t, txt, date, c]) => (
      <div className="tl-i" style={{ '--c': c }} key={t}><small>{t}</small>
        {txt !== null
          ? <p><Val v={txt} /></p>
          : <><p>{fmtDate(date) ? fmtDate(date) : <Val v="" />}</p>{since(date) ? <time>{since(date)}</time> : null}</>}
      </div>
    ))}</div></div>
  );
}

function Accord({ a }) {
  const s = parseDate(a.debut), e = parseDate(a.fin);
  const pct = s && e ? Math.max(0, Math.min(100, (Date.now() - s) / (e - s) * 100)) : null;
  return (
    <div className="acc"><div className="acc-t"><b>{a.intitule}</b>{a.statut ? <span className="status" style={statusStyle(a.statut)}>{a.statut}</span> : null}</div>
      <div className="acc-m">
        {a.institution ? <span>Partenaire <b>{a.institution}</b></span> : null}
        {a.nature ? <span>Nature <b>{a.nature}</b></span> : null}
        {fmtNum(a.montant) ? <span title={fullNum(a.montant)}>Montant <b>{fmtNum(a.montant)}</b></span> : null}
        {a.domaine ? <span>Domaine <b>{a.domaine}</b></span> : null}
        {a.beneficiaire ? <span>Bénéficiaire <b>{a.beneficiaire}</b></span> : null}
      </div>
      {a.resultats ? <div className="acc-m" style={{ marginTop: 8, lineHeight: 1.5 }}>{a.resultats}</div> : null}
      {pct !== null ? <><div className="prog"><i style={{ width: `${pct.toFixed(1)}%` }}></i></div><div className="prog-l"><span>{fmtDate(a.debut)}</span><span>{Math.round(pct)} %</span><span>{fmtDate(a.fin)}</span></div></> : null}
    </div>
  );
}

/* Fenêtre centrale listant tous les accords d'un partenaire */
function AccordsModal({ p, accs, onClose }) {
  useEffect(() => {
    // Échap ferme la fenêtre sans fermer la fiche
    const onKey = e => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose(); } };
    addEventListener('keydown', onKey, true);
    return () => removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return createPortal(
    <div className="modal-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-label={`Accords de coopération · ${p.name}`}>
        <header>
          <Flag a2={p.a2} />
          <div><h2>Accords de coopération</h2><small>{p.name} · {accs.length} accords</small></div>
          <button className="close" aria-label="Fermer" onClick={onClose}>{ICON.close}</button>
        </header>
        <div className="modal-body">{accs.map((a, i) => <Accord a={a} key={i} />)}</div>
      </div>
    </div>,
    document.body
  );
}

function Accords({ p }) {
  const [all, setAll] = useState(false);
  const close = useCallback(() => setAll(false), []);
  const accs = p.accords.filter(a => a.intitule && !isTbd(a.intitule));
  return (
    <div className="card"><h3>Accords de coopération en cours <span className="n">{accs.length || ''}</span></h3>
      {accs.length ? <Accord a={accs[0]} /> : <div style={{ color: 'var(--faint)', fontSize: 13 }}>Aucun accord renseigné.</div>}
      {accs.length > 1 ? <button className="more" onClick={() => setAll(true)}>Tout voir <span>{accs.length}</span></button> : null}
      {all ? <AccordsModal p={p} accs={accs} onClose={close} /> : null}
    </div>
  );
}

function Contacts({ p }) {
  const emails = (p.pfEmail || '').split(/[,;\s]+/).filter(e => /@/.test(e));
  const tels = isTbd(p.pfTel) ? [] : (p.pfTel || '').split(/[,;\/]+/).map(s => s.trim()).filter(Boolean);
  return (
    <div className="card"><h3>Points focaux</h3><div className="contact">
      <div>{ICON.user}<span><Val v={p.pfNoms} /></span></div>
      {emails.length ? emails.map((e, i) => <a href={`mailto:${e}`} key={i}>{ICON.mail}{e}</a>) : <div>{ICON.mail}<Val v="" /></div>}
      {tels.length ? tels.map((t, i) => <a href={`tel:${t.replace(/[^\d+]/g, '')}`} key={i}>{ICON.phone}{t}</a>) : <div>{ICON.phone}<Val v="" /></div>}
    </div></div>
  );
}

/* Colonnes ajoutées plus tard : affichées automatiquement */
function Extra({ p }) {
  const extra = Object.entries(p._cells).filter(([h, v]) => !p._used.has(h) && norm(h) && v);
  if (!extra.length) return null;
  return (
    <div className="card"><h3>Autres informations</h3><div className="grid2" style={{ marginTop: 0 }}>{extra.map(([h, v]) => (
      <div className="kv" key={h}><span>{h}</span><b>{link(v) ? <a href={v} target="_blank" rel="noopener">{v}</a> : <Val v={v} />}</b></div>
    ))}</div></div>
  );
}

const ExtLink = ({ href, className, children }) => href
  ? <a className={className} href={href} target="_blank" rel="noopener">{children}</a>
  : <a className={className} aria-disabled="true">{children}</a>;

export default function Drawer({ p, open, version, partnersCount, onClose }) {
  const lvl = p ? LEVELS[p.level || 'none'] : null;
  const accent = !p ? undefined : p.home ? 'rgba(252,209,22,.35)' : p.ghost ? 'rgba(109,139,214,.25)' : d3color(lvl.color).copy({ opacity: .35 }).formatRgb();

  let content = null;
  if (p && (p.ghost || p.home)) {
    content = <>
      <Hero p={p} lvl={lvl} onClose={onClose} />
      <div className="body"><div className="card nodata">{p.home
        ? <><b>Point de départ du réseau</b>Les arcs lumineux relient le Bénin à chacun des {partnersCount} partenaires recensés.</>
        : <><b>Pas encore recensé</b>Ce pays ne figure pas encore parmi les partenaires recensés.</>}</div></div>
    </>;
  } else if (p) {
    content = <>
      <Hero p={p} lvl={lvl} onClose={onClose} />
      <div className="body">
        <Representation p={p} />
        <Cooperation p={p} />
        <Agenda p={p} />
        <Accords p={p} />
        <Contacts p={p} />
        <Extra p={p} />
      </div>
      <div className="actions">
        <ExtLink className="btn" href={link(p.site)}>{ICON.ext} Site officiel</ExtLink>
        <ExtLink className="btn primary" href={link(p.dossier)}>{ICON.folder} Dossier complet</ExtLink>
      </div>
    </>;
  }

  return (
    <aside className={`drawer glass${open ? ' open' : ''}`} id="drawer" aria-live="polite" style={accent ? { '--accent': accent } : undefined}>
      {/* la clé force un rendu neuf (animations, défilement en haut) à chaque ouverture */}
      <Fragment key={version}>{content}</Fragment>
    </aside>
  );
}
