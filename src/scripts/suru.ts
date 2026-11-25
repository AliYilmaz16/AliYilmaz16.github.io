// Sayfanın üstünde süzülen sürü: küçük İHA'lar imleci izler, imleç durunca ya da bir süre geçince sıradaki formasyona geçer.
// Süs amaçlıdır: tuval aria-hidden, tıklamaları yutmaz, hareket azaltma açıksa tek kare çizilir.
const tuval = document.querySelector<HTMLCanvasElement>('canvas[data-suru]');
if (tuval) {
  const ctx = tuval.getContext('2d')!;
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  const adlar = (tuval.dataset.formasyonlar ?? 'V,halka,çizgi,elmas').split(',');
  const N = 13;
  let en = 0, boy = 0, oran = 1, vurgu = '#b8f04a', soluk = '#9aa6b2';
  const boyutla = () => {
    oran = Math.min(devicePixelRatio || 1, 1.5);
    en = innerWidth; boy = innerHeight;
    tuval.width = Math.round(en * oran); tuval.height = Math.round(boy * oran);
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
    const s = getComputedStyle(tuval);
    vurgu = s.getPropertyValue('--vurgu').trim() || vurgu;
    soluk = s.getPropertyValue('--soluk').trim() || soluk;
  };

  // Formasyon yuvaları: lidere göre (ileri, yan) birim uzaklıkları. Elmas 1-3-5-3-1 sıralıdır.
  const ELMAS: [number, number][] = [];
  [1, 3, 5, 3, 1].forEach((genislik, sira) => { for (let k = 0; k < genislik; k++) ELMAS.push([-sira * 1.15, (k - (genislik - 1) / 2) * 1.15]); });
  const yuva = (bicim: number, i: number, t: number): [number, number] => {
    const k = Math.ceil(i / 2), yan = i % 2 ? 1 : -1;
    if (bicim === 0) return [-k, yan * k * 0.9]; // V
    if (bicim === 1) { const a = (i / N) * Math.PI * 2 + t / 2600; return [Math.cos(a) * 2.6, Math.sin(a) * 2.6]; } // halka: imlecin çevresinde ağır ağır döner
    if (bicim === 2) return [-Math.abs(k) * 0.12, yan * k * 1.05]; // çizgi: hafif yay
    if (bicim === 3) return ELMAS[i] ?? [0, 0];
    return [-i * 0.95, Math.sin(i * 0.9 + t / 500) * 0.35]; // kol: tek sıra, hafif dalgalı
  };

  const ihalar = Array.from({ length: N }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, aci: 0, i }));
  const hedef = { x: 0, y: 0 };
  const imlec = { x: 0, y: 0, var: false, son: 0 };
  let bicim = 0, yon = 0, bekledi = false, basladi = false, sonDegisim = 0;

  function adim(t: number, dt: number) {
    let gx: number, gy: number;
    if (imlec.var) { gx = imlec.x; gy = imlec.y; }
    else { const s = t / 1000; gx = en * (0.5 + 0.38 * Math.sin(s * 0.33)); gy = boy * (0.5 + 0.3 * Math.sin(s * 0.57 + 1)); }
    const dx = gx - hedef.x, dy = gy - hedef.y;
    hedef.x += dx * Math.min(1, dt * 4); hedef.y += dy * Math.min(1, dt * 4);
    if (Math.hypot(dx, dy) > 6) {
      // Yön yumuşak döner, yoksa formasyon her titremede savrulur.
      const a = Math.atan2(dy, dx); let fark = a - yon;
      while (fark > Math.PI) fark -= 2 * Math.PI; while (fark < -Math.PI) fark += 2 * Math.PI;
      yon += fark * Math.min(1, dt * 3);
    }
    // İmleç bir süre durursa sıradaki formasyon
    // İmleç durunca ya da aynı formasyonda yedi saniye geçince sıradaki formasyon
    if (imlec.var && t - imlec.son > 900 && !bekledi) { bekledi = true; bicim = (bicim + 1) % adlar.length; sonDegisim = t; }
    else if (t - sonDegisim > 7000) { bicim = (bicim + 1) % adlar.length; sonDegisim = t; }
    const birim = Math.max(20, Math.min(34, en / 30));
    const c = Math.cos(yon), s = Math.sin(yon);
    for (const u of ihalar) {
      const [ileri, yan] = yuva(bicim, u.i, t);
      const hx = hedef.x + (ileri * c - yan * s) * birim, hy = hedef.y + (ileri * s + yan * c) * birim;
      // Arkadakiler biraz daha gevşek izler: dönüşlerde sürü kamçı gibi açılır, sonra toplanır.
      const sertlik = 15 - Math.min(6, u.i * 0.5);
      let ax = (hx - u.x) * sertlik, ay = (hy - u.y) * sertlik;
      for (const o of ihalar) { // ayrılma: birbirine fazla yaklaşan itilir
        if (o === u) continue;
        const ex = u.x - o.x, ey = u.y - o.y, m = Math.hypot(ex, ey);
        if (m > 0 && m < birim * 0.7) { ax += (ex / m) * (birim * 0.7 - m) * 40; ay += (ey / m) * (birim * 0.7 - m) * 40; }
      }
      u.vx = (u.vx + ax * dt) * Math.pow(0.012, dt); u.vy = (u.vy + ay * dt) * Math.pow(0.012, dt);
      u.x += u.vx * dt; u.y += u.vy * dt;
      if (Math.hypot(u.vx, u.vy) > 12) u.aci = Math.atan2(u.vy, u.vx);
    }
  }

  function ciz() {
    ctx.clearRect(0, 0, en, boy);
    ctx.lineWidth = 1; ctx.strokeStyle = vurgu; ctx.globalAlpha = 0.16;
    ctx.beginPath(); // haberleşme bağları: her İHA bir öndekine bağlı
    for (const u of ihalar) { const o = ihalar[bicim === 1 || bicim === 4 ? (u.i + N - 1) % N : Math.max(0, u.i - 2)]; if (o === u || (bicim === 4 && !u.i)) continue; ctx.moveTo(u.x, u.y); ctx.lineTo(o.x, o.y); }
    ctx.stroke();
    for (const u of ihalar) {
      const hiz = Math.hypot(u.vx, u.vy);
      ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.aci);
      if (hiz > 30) { // hız izi
        const iz = ctx.createLinearGradient(-4 - Math.min(26, hiz * 0.07), 0, -4, 0);
        iz.addColorStop(0, 'transparent'); iz.addColorStop(1, vurgu);
        ctx.globalAlpha = 0.35; ctx.strokeStyle = iz; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-4 - Math.min(26, hiz * 0.07), 0); ctx.lineTo(-4, 0); ctx.stroke();
      }
      ctx.globalAlpha = u.i ? 0.6 : 0.95; ctx.fillStyle = vurgu;
      ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-5, 4.5); ctx.lineTo(-2.5, 0); ctx.lineTo(-5, -4.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = soluk; ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'right';
    ctx.globalAlpha = 0.7; ctx.fillText(`${(tuval!.dataset.etiket ?? 'sürü').toUpperCase()} · ${N} · ${adlar[bicim].toUpperCase()}`, en - 12, boy - 12);
    ctx.globalAlpha = 1;
  }

  function yerlestir() { // ilk kare: sürü hedefin çevresinde hazır dursun
    hedef.x = en * 0.8; hedef.y = boy * 0.75; yon = Math.PI;
    const birim = Math.max(20, Math.min(34, en / 30));
    for (const u of ihalar) { const [ileri, yan] = yuva(bicim, u.i, 0); u.x = hedef.x - ileri * birim; u.y = hedef.y + yan * birim; u.aci = Math.PI; u.vx = u.vy = 0; }
  }

  let kare = 0, son = 0;
  const dongu = (t: number) => {
    const dt = Math.min(0.05, (t - son) / 1000 || 0.016); son = t;
    adim(t, dt); ciz();
    kare = !document.hidden && !azalt.matches ? requestAnimationFrame(dongu) : 0;
  };
  // Hareket azaltma açıksa sürü hiç çizilmez: sabit duran bir süs okumayı yalnızca zorlaştırır.
  const baslat = () => {
    if (azalt.matches) { ctx.clearRect(0, 0, en, boy); return; }
    if (!basladi) { boyutla(); yerlestir(); basladi = true; }
    if (!kare && !document.hidden) { son = performance.now(); kare = requestAnimationFrame(dongu); }
  };
  addEventListener('resize', () => basladi && boyutla());
  document.addEventListener('visibilitychange', baslat);
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (Math.hypot(e.clientX - imlec.x, e.clientY - imlec.y) < 2 && imlec.var) return;
    imlec.x = e.clientX; imlec.y = e.clientY; imlec.var = true; imlec.son = performance.now(); bekledi = false;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { imlec.var = false; bekledi = false; });
  azalt.addEventListener('change', baslat);
  new MutationObserver(() => basladi && boyutla()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  baslat();
}
