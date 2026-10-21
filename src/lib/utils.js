/* ---------- utilitaires ---------- */
export const norm = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const esc = s => (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const isTbd = v => !v || /^(a|à)\s*preciser$/i.test(v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim()) || /^(n\/?a|-|—|nd)$/i.test(v.trim());

export function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export function parseDate(v) {
  if (isTbd(v)) return null;
  const m = v.trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1]); }
  const iso = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  return null;
}
export function fmtDate(v) {
  const d = parseDate(v);
  if (!d) return isTbd(v) ? null : v;
  return `${d.getDate() === 1 ? '1er' : d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function since(v) {
  const d = parseDate(v); if (!d) return '';
  const months = Math.round((Date.now() - d) / 2.63e9);
  if (months < 0) return 'à venir';
  if (months < 1) return 'ce mois-ci';
  if (months < 12) return `il y a ${months} mois`;
  const y = Math.floor(months / 12);
  return `il y a ${y} an${y > 1 ? 's' : ''}`;
}
export function fmtNum(v) {
  if (isTbd(v)) return null;
  const n = Number(v.toString().replace(/[\s ]/g, '').replace(',', '.'));
  if (!isFinite(n)) return v;
  if (n >= 1e9) return (n / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' Md';
  if (n >= 1e6) return (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M';
  return n.toLocaleString('fr-FR');
}
export const fullNum = v => { const n = Number((v || '').replace(/[\s ]/g, '')); return isFinite(n) && n ? n.toLocaleString('fr-FR') : ''; };
export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
export const flagUrl = a2 => a2 ? `https://flagcdn.com/w80/${a2.toLowerCase()}.png` : '';
export const link = v => !isTbd(v) && /^https?:\/\//i.test(v) ? v : null;

/* ---------- niveaux d'activité ---------- */
export const LEVELS = {
  high: { label: 'Élevé', color: '#2fd08a' },
  mid: { label: 'Moyen', color: '#f4c542' },
  low: { label: 'Faible', color: '#ff7a59' },
  none: { label: 'Non renseigné', color: '#6d8bd6' }
};
export function levelOf(v) {
  const n = norm(v);
  if (!n || isTbd(v)) return 'none';
  if (/^(eleve|fort|haut|tres|intense|strategique)/.test(n)) return 'high';
  if (/^(moyen|modere|intermediaire)/.test(n)) return 'mid';
  if (/^(faible|bas|limite|dormant|inactif)/.test(n)) return 'low';
  return 'none';
}
export function statusStyle(s) {
  const n = norm(s);
  if (/cours|actif|execution/.test(n)) return { background: 'rgba(47,208,138,.15)', color: '#7ff0bc' };
  if (/termine|cloture|acheve/.test(n)) return { background: 'rgba(109,139,214,.18)', color: '#b3c6f5' };
  if (/negoc|prepar|attente|signature/.test(n)) return { background: 'rgba(244,197,66,.15)', color: '#f8d97a' };
  if (/suspend|annul/.test(n)) return { background: 'rgba(255,122,89,.15)', color: '#ffab95' };
  return { background: 'rgba(255,255,255,.07)', color: 'var(--muted)' };
}
