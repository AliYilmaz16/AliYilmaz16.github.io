// Sayfanın üstünde süzülen sürü: küçük İHA'lar ekranda rastgele dolaşır, birkaç saniyede bir sıradaki formasyona geçer.
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
    if (bicim === 1) { const a = (i / N) * Math.PI * 2 + t / 2600; return [Math.cos(a) * 2.6, Math.sin(a) * 2.6]; } // halka: ağır ağır döner
    if (bicim === 2) return [-Math.abs(k) * 0.12, yan * k * 1.05]; // çizgi: hafif yay
    if (bicim === 3) return ELMAS[i] ?? [0, 0];
    if (bicim === 4) return [-i * 0.95, Math.sin(i * 0.9 + t / 500) * 0.35]; // kol: tek sıra, hafif dalgalı
    if (bicim === 5) return i <= 6 ? [-k * 0.9, yan * k * 0.85] : [-(i - 6) * 0.95, 0]; // ok başı: önde V uç, ortada gövde
    if (bicim === 6) { // ikili: sürü iki küçük V'ye ayrılır, açılır, sonra yeniden birleşir
      const g = Math.floor(i / 2), gk = Math.ceil(g / 2), gy = g % 2 ? 1 : -1;
      const aralik = 0.7 + Math.sin(Math.PI * Math.min(1, (t - sonDegisim) / SURE)) * 5.5;
      return [-gk * 1.05, (i % 2 ? 1 : -1) * aralik + (g ? gy * gk * 0.8 : 0)];
    }
    return [-k, yan * k * 0.9]; // dağıl: toplanırken V
  };

  const ihalar = Array.from({ length: N }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, aci: 0, sx: 0, sy: 0, i, yelken: 0.35 + Math.random() * 0.5 }));
  const hedef = { x: 0, y: 0 };
  const nokta = { x: 0, y: 0, son: 0 };
  const imlec = { x: -999, y: -999, var: false }; // drone'lar imleçten kaçar
  const cagri = { x: 0, y: 0, t: -9999 };        // boş yere tıklayınca sürü oraya çağrılır
  let bicim = 0, yon = 0, hiz = 120, basladi = false, sonDegisim = 0, sonKayma = scrollY;
  const SURE = 7000;
  const dagiliyor = (t: number) => bicim === 7 && t - sonDegisim < SURE * 0.5;

  function adim(t: number, dt: number) {
    // Lider ekranda rastgele seçilen noktalara doğru uçar. Dönüş hızı sınırlı olduğu için rota yumuşak kavisler çizer.
    const uzaklik = Math.hypot(nokta.x - hedef.x, nokta.y - hedef.y);
    if (uzaklik < 70 || t > nokta.son) {
      // Çoğu zaman yakına süzülür, arada bir ekranın öbür ucuna atılır.
      const atilis = Math.random() < 0.35;
      let x = 0, y = 0;
      for (let k = 0; k < 6; k++) {
        x = en * (0.08 + Math.random() * 0.84); y = boy * (0.14 + Math.random() * 0.74);
        const m = Math.hypot(x - hedef.x, y - hedef.y);
        if (atilis ? m > Math.min(en, boy) * 0.55 : m > 160 && m < 520) break;
      }
      nokta.x = x; nokta.y = y; nokta.son = t + 8000;
    }
    let fark = Math.atan2(nokta.y - hedef.y, nokta.x - hedef.x) - yon;
    while (fark > Math.PI) fark -= 2 * Math.PI; while (fark < -Math.PI) fark += 2 * Math.PI;
    yon += Math.max(-1.7 * dt, Math.min(1.7 * dt, fark));
    // Gidecek yol uzunsa hızlanır, hedefe yaklaşırken ve keskin dönerken yavaşlar.
    const istenen = Math.max(60, Math.min(340, uzaklik * 0.75)) * (Math.abs(fark) > 0.7 ? 0.5 : 1);
    hiz += (istenen - hiz) * Math.min(1, dt * (istenen > hiz ? 1.4 : 2.6));
    hedef.x += Math.cos(yon) * hiz * dt; hedef.y += Math.sin(yon) * hiz * dt;
    // Sayfa kayınca rüzgâr: sürü kaydırmanın tersine savrulur, her İHA başka kadar. Sonra yerine toplanır.
    const kayma = Math.max(-140, Math.min(140, scrollY - sonKayma)); sonKayma = scrollY;
    if (kayma) {
      hedef.y -= kayma * 0.3;
      for (const u of ihalar) { u.y -= kayma * u.yelken; u.vx += (Math.random() - 0.5) * Math.abs(kayma) * 9; u.vy -= kayma * 3 * u.yelken; }
    }
    hedef.x = Math.max(30, Math.min(en - 30, hedef.x)); hedef.y = Math.max(70, Math.min(boy - 30, hedef.y));
    if (t - sonDegisim > SURE) {
      // Sıradaki formasyon rastgele seçilir, aynısı üst üste gelmez.
      bicim = (bicim + 1 + Math.floor(Math.random() * (adlar.length - 1))) % adlar.length; sonDegisim = t;
      tuval!.dataset.bicim = String(bicim);
      // Dağıl: her İHA ekranda kendine ayrı bir nokta seçer, yarı sürede oraya gider, sonra sürüye döner.
      if (bicim === 7) for (const u of ihalar) { u.sx = en * (0.06 + Math.random() * 0.88); u.sy = boy * (0.12 + Math.random() * 0.8); }
    }
    const dagil = dagiliyor(t);
    const birim = Math.max(24, Math.min(38, en / 28));
    const c = Math.cos(yon), s = Math.sin(yon);
    for (const u of ihalar) {
      const [ileri, yan] = yuva(bicim, u.i, t);
      const hx = dagil ? u.sx : hedef.x + (ileri * c - yan * s) * birim, hy = dagil ? u.sy : hedef.y + (ileri * s + yan * c) * birim;
      // Arkadakiler biraz daha gevşek izler: dönüşlerde sürü kamçı gibi açılır, sonra toplanır.
      // Dağılırken ve yeni toplanırken yay yumuşaktır, yoksa ekranın öbür ucuna ışınlanır gibi giderler.
      const sertlik = bicim === 7 ? (dagil ? 3.2 : 4.5) : 15 - Math.min(6, u.i * 0.5);
      let ax = (hx - u.x) * sertlik, ay = (hy - u.y) * sertlik;
      if (imlec.var) { // imleç yaklaşınca kaçar: ne kadar yakınsa o kadar sert
        const ex = u.x - imlec.x, ey = u.y - imlec.y, m = Math.hypot(ex, ey) || 1, alan = 120;
        if (m < alan) { const g = (1 - m / alan) ** 2 * 5200; ax += (ex / m) * g; ay += (ey / m) * g; }
      }
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
    const faz = performance.now() / 45;
    ctx.clearRect(0, 0, en, boy);
    ctx.lineWidth = 1; ctx.strokeStyle = vurgu; ctx.globalAlpha = 0.16;
    ctx.beginPath(); // haberleşme bağları: her İHA bir öndekine bağlı
    if (!dagiliyor(performance.now())) for (const u of ihalar) { const o = ihalar[bicim === 1 || bicim === 4 ? (u.i + N - 1) % N : Math.max(0, u.i - 2)]; if (o === u || (bicim === 4 && !u.i) || (bicim === 6 && u.i === 1)) continue; ctx.moveTo(u.x, u.y); ctx.lineTo(o.x, o.y); }
    ctx.stroke();
    for (const u of ihalar) {
      const hiz = Math.hypot(u.vx, u.vy);
      ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.aci);
      if (hiz > 30) { // hız izi
        const iz = ctx.createLinearGradient(-8 - Math.min(26, hiz * 0.07), 0, -8, 0);
        iz.addColorStop(0, 'transparent'); iz.addColorStop(1, vurgu);
        ctx.globalAlpha = 0.35; ctx.strokeStyle = iz; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8 - Math.min(26, hiz * 0.07), 0); ctx.lineTo(-8, 0); ctx.stroke();
      }
      // Dört pervaneli gövde, üstten görünüş: çapraz kollar, uçlarda dönen pervaneler, önde burun işareti.
      const a = u.i ? 0.62 : 0.95, kol = 5.2, pr = 3;
      ctx.globalAlpha = a; ctx.strokeStyle = vurgu; ctx.fillStyle = vurgu; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-kol, -kol); ctx.lineTo(kol, kol); ctx.moveTo(-kol, kol); ctx.lineTo(kol, -kol); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(-2.6, -2, 5.2, 4, 1.2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2.6, -1.4); ctx.lineTo(5, 0); ctx.lineTo(2.6, 1.4); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 4; k++) {
        const px = k < 2 ? kol : -kol, py = k % 2 ? kol : -kol;
        ctx.globalAlpha = a * 0.45; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.stroke();
        // Pervane kanadı: komşu pervaneler ters yöne döner
        const d = (k === 0 || k === 3 ? 1 : -1) * faz + u.i;
        ctx.globalAlpha = a; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px - Math.cos(d) * pr, py - Math.sin(d) * pr); ctx.lineTo(px + Math.cos(d) * pr, py + Math.sin(d) * pr); ctx.stroke();
      }
      ctx.restore();
    }
    const gecen = performance.now() - cagri.t;
    if (gecen < 900) { // çağrı işareti: tıklanan yerde açılan halka
      const o = gecen / 900;
      ctx.strokeStyle = vurgu; ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - o) * 0.8;
      ctx.beginPath(); ctx.arc(cagri.x, cagri.y, 6 + o * 34, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = (1 - o) * 0.9; ctx.beginPath(); ctx.moveTo(cagri.x - 5, cagri.y); ctx.lineTo(cagri.x + 5, cagri.y); ctx.moveTo(cagri.x, cagri.y - 5); ctx.lineTo(cagri.x, cagri.y + 5); ctx.stroke();
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = soluk; ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'right';
    ctx.globalAlpha = 0.7; ctx.fillText(`${(tuval!.dataset.etiket ?? 'sürü').toUpperCase()} · ${N} · ${adlar[bicim].toUpperCase()}`, en - 12, boy - 12);
    ctx.globalAlpha = 1;
  }

  function yerlestir() { // ilk kare: sürü hedefin çevresinde hazır dursun
    hedef.x = en * 0.8; hedef.y = boy * 0.75; yon = Math.PI; nokta.x = en * 0.3; nokta.y = boy * 0.4; nokta.son = 9000;
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
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') { imlec.x = e.clientX; imlec.y = e.clientY; imlec.var = true; } }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => (imlec.var = false));
  // Boş bir yere tıklamak sürüyü oraya çağırır. Bağlantı, düğme ve örneklerin üstündeki tıklamalara karışmaz.
  addEventListener('click', (e) => {
    if (!kare || (e.target as HTMLElement).closest('a, button, input, textarea, select, label, video, canvas, summary, dialog, [role="button"]')) return;
    if (getSelection()?.toString()) return;
    nokta.x = cagri.x = e.clientX; nokta.y = cagri.y = e.clientY; nokta.son = performance.now() + 6000; cagri.t = performance.now();
    if (bicim === 7) sonDegisim = -1e9; // dağılmışlarsa hemen toplanıp gelsinler
  });
  azalt.addEventListener('change', baslat);
  new MutationObserver(() => basladi && boyutla()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  baslat();
}
