import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Globe from 'globe.gl';
import { color as d3color } from 'd3';
import { BENIN, SKY_URL } from '../lib/config.js';
import { esc, isTbd, flagUrl, LEVELS } from '../lib/utils.js';

const flagImg = a2 => a2 ? `<img class="flag" src="${flagUrl(a2)}" alt="" loading="lazy">` : '<span class="flag"></span>';

/* ---------- globe ---------- */
const GlobeView = forwardRef(function GlobeView({ features, partners, filter, selected, onCountryClick, onBackgroundClick }, ref) {
  const el = useRef(null);
  const globe = useRef(null);
  const hover = useRef(null);
  // valeurs courantes lues par les accesseurs du globe
  const live = useRef({});
  live.current = { partners, filter, selected, onCountryClick, onBackgroundClick };

  const partnerOf = f => f && live.current.partners.find(p => p.a2 && p.a2 === f.a2);
  const capColor = f => {
    const { filter, selected } = live.current;
    if (f.a2 === BENIN.a2) return 'rgba(252,209,22,.95)';
    const p = partnerOf(f);
    const sel = selected && selected.a2 === f.a2;
    if (p) {
      const dim = filter !== 'all' && p.level !== filter;
      const c = d3color(LEVELS[p.level].color);
      c.opacity = dim ? .15 : sel ? .95 : (hover.current === f ? .9 : .62);
      return c.formatRgb();
    }
    return sel || hover.current === f ? 'rgba(170,190,230,.35)' : 'rgba(150,170,210,.09)';
  };
  const altitude = f => {
    const { selected } = live.current;
    if (selected && selected.a2 === f.a2) return .05;
    if (hover.current === f) return .025;
    if (f.a2 === BENIN.a2) return .02;
    return partnerOf(f) ? .012 : .006;
  };
  const refreshPolygons = () => globe.current.polygonCapColor(capColor).polygonAltitude(altitude);
  const refreshArcs = () => {
    const { partners, filter, selected } = live.current;
    const byA2 = Object.fromEntries(features.filter(f => f.a2).map(f => [f.a2, f]));
    const arcs = partners
      .filter(p => p.a2 && p.a2 !== BENIN.a2 && byA2[p.a2])
      .filter(p => filter === 'all' || p.level === filter)
      .map(p => {
        const c = byA2[p.a2].center;
        return { startLat: BENIN.lat, startLng: BENIN.lng, endLat: c.lat, endLng: c.lng, color: LEVELS[p.level].color, sel: selected && selected.a2 === p.a2 };
      });
    globe.current.arcsData(arcs);
  };

  useEffect(() => {
    if (!features.length) return;
    const node = el.current;
    const g = globe.current = new Globe(node, { animateIn: true })
      .backgroundColor('rgba(0,0,0,0)')
      .backgroundImageUrl(SKY_URL)
      .showAtmosphere(true).atmosphereColor('#4f8cff').atmosphereAltitude(.2)
      .polygonsData(features)
      .polygonCapColor(capColor)
      .polygonSideColor(f => partnerOf(f) || f.a2 === BENIN.a2 ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,0)')
      .polygonStrokeColor(f => f.a2 === BENIN.a2 ? '#fff4b0' : partnerOf(f) ? 'rgba(255,255,255,.55)' : 'rgba(160,180,220,.22)')
      .polygonAltitude(altitude)
      .polygonsTransitionDuration(350)
      .polygonLabel(f => {
        const p = partnerOf(f);
        const sub = f.a2 === BENIN.a2 ? 'République du Bénin' : p ? `${esc(p.type && !isTbd(p.type) ? p.type : 'Partenaire')} · ${LEVELS[p.level].label}` : 'Non recensé';
        return `<div class="tip">${flagImg(f.a2)}<div><b>${esc(f.name)}</b><span>${sub}</span></div></div>`;
      })
      .onPolygonHover(f => { hover.current = f; node.style.cursor = f ? 'pointer' : 'grab'; refreshPolygons(); })
      .onPolygonClick(f => live.current.onCountryClick(f, partnerOf(f)))
      .onGlobeClick(() => live.current.onBackgroundClick())
      .arcColor(d => { const c = d3color(d.color); return [c.copy({ opacity: .05 }).formatRgb(), c.formatRgb(), c.copy({ opacity: .05 }).formatRgb()]; })
      .arcStroke(d => d.sel ? .9 : .45)
      .arcDashLength(.45).arcDashGap(.25).arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(2600).arcAltitudeAutoScale(.45)
      .arcsTransitionDuration(0)
      .ringsData([BENIN]).ringColor(() => t => `rgba(252,209,22,${(1 - t) * .9})`)
      .ringMaxRadius(4.5).ringPropagationSpeed(1.6).ringRepeatPeriod(1300)
      .pointsData([BENIN]).pointColor(() => '#fcd116').pointAltitude(.03).pointRadius(.35);

    const mat = g.globeMaterial();
    mat.color.set('#0b1630'); mat.emissive?.set('#06101f'); mat.shininess = 12;

    const controls = g.controls();
    controls.autoRotate = true; controls.autoRotateSpeed = .35; controls.enableDamping = true;
    let idle;
    const pause = () => { controls.autoRotate = false; clearTimeout(idle); idle = setTimeout(() => { if (!live.current.selected) controls.autoRotate = true; }, 15000); };
    node.addEventListener('pointerdown', pause);
    node.addEventListener('wheel', pause, { passive: true });

    g.pointOfView({ lat: 12, lng: 8, altitude: 2.3 }, 0);
    const resize = () => g.width(innerWidth).height(innerHeight);
    addEventListener('resize', resize); resize();

    return () => {
      clearTimeout(idle);
      removeEventListener('resize', resize);
      node.removeEventListener('pointerdown', pause);
      node.removeEventListener('wheel', pause);
      g._destructor?.();
      node.innerHTML = '';
      globe.current = null;
    };
  }, [features]);

  useEffect(() => {
    if (!globe.current) return;
    refreshPolygons(); refreshArcs();
  }, [partners, filter, selected]);

  useImperativeHandle(ref, () => ({
    focus(f) {
      const g = globe.current; if (!g) return;
      g.controls().autoRotate = false;
      if (f) g.pointOfView({ lat: f.center.lat - (innerWidth < 760 ? 18 : 0), lng: f.center.lng + (innerWidth >= 760 ? 18 : 0), altitude: 1.6 }, 1400);
    },
    zoomOut() { globe.current?.pointOfView({ altitude: 2.3 }, 1000); },
    autoRotate() { if (globe.current) globe.current.controls().autoRotate = true; }
  }), []);

  return <div id="globe" ref={el}></div>;
});

export default GlobeView;
