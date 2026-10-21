import { feature } from 'topojson-client';
import { geoArea, geoCentroid } from 'd3';
import { SHEET_ID, TABS, SNAPSHOT, WORLD_URL } from './config.js';
import { norm, isTbd, parseCSV, levelOf } from './utils.js';
import { NUM2A2, a2FromName, frName } from './countries.js';

/* ---------- lecture des données ---------- */
async function fetchTab(tab) {
  const urls = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${tab.gid}`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(tab.name)}`
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u + '&_=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) continue;
      const t = await r.text();
      if (t.trim().startsWith('<')) continue; // page de connexion → feuille privée
      return parseCSV(t);
    } catch { /* essai suivant */ }
  }
  throw new Error('inaccessible');
}

/* Transforme un tableau brut en objets, en repérant la ligne d'en-tête (celle qui contient « Pays ») */
function toRecords(rows) {
  const hi = rows.findIndex(r => r.some(c => norm(c) === 'pays'));
  if (hi < 0) return { headers: [], records: [] };
  const headers = rows[hi].map(h => h.trim());
  const pi = headers.findIndex(h => norm(h) === 'pays');
  const records = rows.slice(hi + 1)
    .filter(r => (r[pi] || '').trim())
    .map(r => { const o = { _cells: {} }; headers.forEach((h, i) => { if (h) o._cells[h] = (r[i] || '').trim(); }); o.pays = r[pi].trim(); return o; });
  return { headers: headers.filter(Boolean), records };
}
const PARTNER_FIELDS = {
  capitale: ['capitale'], type: ['typesderepresentation', 'typederepresentation'], residence: ['paysderesidence'],
  ambassadeur: ['nometprenom', 'nomsetprenomdelamb', 'ambassadeur'], nomination: ['datedenomination'],
  pfNoms: ['nomsetprenomsdespoints', 'nometprenomsdespoints', 'pointsfocaux'], pfEmail: ['emaildespoints', 'email'], pfTel: ['telephonedespoints', 'telephone'],
  site: ['siteofficiel'], agence: ['agencedecooperation', 'agence'], domaines: ['domainesdecooperation', 'domainedecooperation'], niveau: ['niveaudactivite', 'niveau'],
  projets: ['nombredeprojets'], montant: ['financement'], audience: ['datedeladerniereaudience'],
  actu: ['derniereactualite'], prochActu: ['prochaineactualite'], lastInt: ['datedeladerniereinteraction'], nextInt: ['datedelaprochaineinteraction'],
  actions: ['prochainesactions'], dossier: ['liendudossier']
};
const ACCORD_FIELDS = {
  institution: ['institution'], intitule: ['intitule'], domaine: ['domaine'], beneficiaire: ['entitebeneficiaire', 'beneficiaire'],
  debut: ['datededemarrage', 'datededebut'], fin: ['datedefin'], nature: ['nature'], montant: ['montant'], resultats: ['resultats'], statut: ['statut']
};
function mapFields(rec, spec) {
  const o = { pays: rec.pays, _cells: rec._cells, _used: new Set(Object.keys(rec._cells).filter(h => norm(h) === 'pays')) };
  for (const [k, prefixes] of Object.entries(spec)) {
    for (const [h, v] of Object.entries(rec._cells)) {
      const n = norm(h);
      if (!o._used.has(h) && prefixes.some(p => n.startsWith(p))) { o[k] = v; o._used.add(h); break; }
    }
    o[k] ??= '';
  }
  return o;
}

export async function loadData() {
  let p, a, live = true;
  try { [p, a] = await Promise.all([fetchTab(TABS.partners), fetchTab(TABS.accords)]); }
  catch { p = SNAPSHOT.partners; a = SNAPSHOT.accords; live = false; }
  const partners = toRecords(p).records.map(r => mapFields(r, PARTNER_FIELDS));
  const accords = toRecords(a).records.map(r => mapFields(r, ACCORD_FIELDS));
  partners.forEach(pt => {
    pt.a2 = a2FromName(pt.pays);
    pt.name = frName(pt.a2, pt.pays);
    pt.level = levelOf(pt.niveau);
    pt.accords = accords.filter(ac => (ac.a2 ??= a2FromName(ac.pays)) ? ac.a2 === pt.a2 : norm(ac.pays) === norm(pt.pays));
    pt.filled = Object.entries(pt._cells).some(([h, v]) => norm(h) !== 'pays' && v && !isTbd(v));
  });
  partners.sort((x, y) => x.name.localeCompare(y.name, 'fr'));
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return { partners, accords, sync: { live, time } };
}

/* ---------- fond de carte ---------- */
export async function loadWorld() {
  const topo = await (await fetch(WORLD_URL)).json();
  const byA2 = {};
  const features = feature(topo, topo.objects.countries).features.map(f => {
    f.a2 = NUM2A2[f.id] || ({ Kosovo: 'XK' })[f.properties.name] || null;
    f.name = frName(f.a2, f.properties.name);
    // centroïde du plus grand polygone (évite que la Guyane décale la France, etc.)
    let main = f.geometry;
    if (main.type === 'MultiPolygon') {
      const best = main.coordinates.map(c => ({ type: 'Polygon', coordinates: c })).sort((a, b) => geoArea(b) - geoArea(a))[0];
      main = best;
    }
    const [lng, lat] = geoCentroid(main);
    f.center = { lat, lng };
    if (f.a2) byA2[f.a2] = f;
    return f;
  });
  return { features, byA2 };
}
