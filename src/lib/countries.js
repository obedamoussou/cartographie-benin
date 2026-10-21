import { norm } from './utils.js';

/* ---------- correspondance pays (ISO numérique → alpha-2) ---------- */
export const NUM2A2 = Object.fromEntries('004AF 008AL 010AQ 012DZ 024AO 031AZ 032AR 036AU 040AT 044BS 048BH 050BD 051AM 056BE 064BT 068BO 070BA 072BW 076BR 084BZ 090SB 096BN 100BG 104MM 108BI 112BY 116KH 120CM 124CA 132CV 140CF 144LK 148TD 152CL 156CN 158TW 170CO 174KM 178CG 180CD 188CR 191HR 192CU 196CY 203CZ 204BJ 208DK 214DO 218EC 222SV 226GQ 231ET 232ER 233EE 238FK 242FJ 246FI 250FR 260TF 262DJ 266GA 268GE 270GM 275PS 276DE 288GH 300GR 304GL 320GT 324GN 328GY 332HT 340HN 348HU 352IS 356IN 360ID 364IR 368IQ 372IE 376IL 380IT 384CI 388JM 392JP 398KZ 400JO 404KE 408KP 410KR 414KW 417KG 418LA 422LB 426LS 428LV 430LR 434LY 440LT 442LU 450MG 454MW 458MY 462MV 466ML 470MT 478MR 480MU 484MX 496MN 498MD 499ME 504MA 508MZ 512OM 516NA 524NP 528NL 540NC 548VU 554NZ 558NI 562NE 566NG 578NO 586PK 591PA 598PG 600PY 604PE 608PH 616PL 620PT 624GW 626TL 630PR 634QA 642RO 643RU 646RW 682SA 686SN 688RS 690SC 694SL 702SG 703SK 704VN 705SI 706SO 710ZA 716ZW 724ES 728SS 729SD 732EH 740SR 748SZ 752SE 756CH 760SY 762TJ 764TH 768TG 780TT 784AE 788TN 792TR 795TM 800UG 804UA 807MK 818EG 826GB 834TZ 840US 854BF 858UY 860UZ 862VE 887YE 894ZM'.split(' ').map(s => [s.slice(0, 3), s.slice(3)]));
const ALIASES = {
  rdc: 'CD', rdcongo: 'CD', republiquedemocratiqueducongo: 'CD', congokinshasa: 'CD',
  congo: 'CG', republiqueducongo: 'CG', congobrazzaville: 'CG',
  usa: 'US', etatsunis: 'US', etatsunisdamerique: 'US', amerique: 'US',
  angleterre: 'GB', grandebretagne: 'GB', royaumeuni: 'GB',
  palestine: 'PS', birmanie: 'MM', myanmar: 'MM', swaziland: 'SZ', eswatini: 'SZ',
  tchequie: 'CZ', republiquetcheque: 'CZ', macedoine: 'MK', macedoinedunord: 'MK',
  timororiental: 'TL', capvert: 'CV', caboverde: 'CV', cotedivoire: 'CI', coreedusud: 'KR', coreedunord: 'KP',
  chine: 'CN', taiwan: 'TW', vatican: 'VA', saintsiege: 'VA', kosovo: 'XK', emirats: 'AE', emiratsarabesunis: 'AE',
  turquie: 'TR', turkiye: 'TR', russie: 'RU', federationderussie: 'RU', iran: 'IR', syrie: 'SY', laos: 'LA', bolivie: 'BO', venezuela: 'VE', tanzanie: 'TZ', moldavie: 'MD', vietnam: 'VN', guineebissau: 'GW', saotomeetprincipe: 'ST', gambie: 'GM'
};
const DN = new Intl.DisplayNames(['fr'], { type: 'region', fallback: 'none' });
const NAME2A2 = {};
(() => {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (const a of L) for (const b of L) {
    const code = a + b; if (/^(Q[M-Z]|X[A-JL-Z]|Z[A-Z]|AA|EU|EZ|UN|FX|CS|YU|AN|BU|DD|NT|SU|TP|ZR|DY|HV|NH|RH|VD|YD|CP|DG|EA|IC|TA|AC|CQ)$/.test(code)) continue;
    let n; try { n = DN.of(code); } catch { continue; }
    if (n && n !== code && !NAME2A2[norm(n)]) NAME2A2[norm(n)] = code;
  }
  Object.assign(NAME2A2, ALIASES);
})();
export const a2FromName = name => NAME2A2[norm(name)] || null;
export const frName = (a2, fallback) => (a2 && DN.of(a2)) || fallback;
