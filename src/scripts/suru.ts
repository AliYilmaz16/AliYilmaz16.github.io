// Sayfanın üstünde süzülen sürü: küçük İHA'lar ekranda rastgele dolaşır, birkaç saniyede bir sıradaki formasyona geçer.
// Süs amaçlıdır: tuval aria-hidden, tıklamaları yutmaz, hareket azaltma açıksa tek kare çizilir.
const tuval = document.querySelector<HTMLCanvasElement>('canvas[data-suru]');
if (tuval) {
  const ctx = tuval.getContext('2d')!;
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  const adlar = (tuval.dataset.formasyonlar ?? 'V,halka,çizgi,elmas').split(',');
  const N = 13;
  let en = 0, boy = 0, oran = 1, vurgu = '#b8f04a', soluk = '#9aa6b2', yabanci = '#ff6b5e';
  const boyutla = () => {
    oran = Math.min(devicePixelRatio || 1, 1.5);
    en = innerWidth; boy = innerHeight;
    tuval.width = Math.round(en * oran); tuval.height = Math.round(boy * oran);
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
    const s = getComputedStyle(tuval);
    vurgu = s.getPropertyValue('--vurgu').trim() || vurgu;
    soluk = s.getPropertyValue('--soluk').trim() || soluk;
    yabanci = s.getPropertyValue('--yabanci').trim() || yabanci;
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

  const ihalar = Array.from({ length: N }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, aci: 0, sx: 0, sy: 0, st: 0, i, yelken: 0.35 + Math.random() * 0.5 }));
  const hedef = { x: 0, y: 0 };
  const nokta = { x: 0, y: 0, son: 0 };
  const imlec = { x: -999, y: -999, var: false }; // drone'lar imleçten kaçar
  const cagri = { x: 0, y: 0, t: -9999 };        // boş yere tıklayınca sürü oraya çağrılır
  let bicim = 0, yon = 0, hiz = 120, basladi = false, sonDegisim = 0, sonKayma = scrollY;
  const SURE = 7000;
  // Rahatsızlık: imleçle üstlerine çok gidilirse ya da art arda çağrılırlarsa birikir, eşiği aşınca sürü tek tek dağılır.
  let rahatsiz = 0;
  // Yabancı sürü: arada bir ekrana girer. Bizim sürü önlemeye kalkar, hepsini düşürür ve yoluna devam eder.
  type Yabanci = { x: number; y: number; vx: number; vy: number; aci: number; gx: number; gy: number };
  const yabancilar: Yabanci[] = [];
  const patlamalar: { x: number; y: number; t: number }[] = [];
  const FARK = 2400; // yabancılar ekrana girdikten bu kadar sonra fark edilir
  let onleme = false, onlemeBas = 0, sonrakiBaskin = performance.now() + 15000 + Math.random() * 12000;
  // Dağılmışken her İHA kendi noktasına gider, varınca ya da bir süre sonra yenisini seçer: tek başına dolaşır.
  const yeniNokta = (u: (typeof ihalar)[number], t: number) => {
    // Üçte biri görüş alanının dışına çıkar (çoğu aşağıya doğru), kalanı ekranın kenarlarına yayılır: ortada toplanmazlar.
    if (Math.random() < 0.34) {
      const z = Math.random();
      if (z < 0.5) { u.sx = en * Math.random(); u.sy = boy * (1.08 + Math.random() * 0.25); }
      else if (z < 0.75) { u.sx = -en * (0.05 + Math.random() * 0.12); u.sy = boy * Math.random(); }
      else { u.sx = en * (1.05 + Math.random() * 0.12); u.sy = boy * Math.random(); }
    } else {
      do { u.sx = en * (0.03 + Math.random() * 0.94); u.sy = boy * (0.1 + Math.random() * 0.86); }
      while (Math.abs(u.sx / en - 0.5) < 0.27 && Math.abs(u.sy / boy - 0.5) < 0.27);
    }
    u.st = t + 2600 + Math.random() * 2400;
  };
  const dagit = (t: number) => {
    bicim = 7; sonDegisim = t; tuval!.dataset.bicim = '7';
    for (const u of ihalar) yeniNokta(u, t);
  };
  function baskin(t: number) {
    // Dört kenardan ya da köşelerden herhangi birinden girer, ekranın içinden geçip karşı tarafa doğru V düzeninde uçar.
    const aci = Math.random() * Math.PI * 2, yari = Math.hypot(en, boy) / 2 + 80;
    const bx = Math.max(-70, Math.min(en + 70, en / 2 + Math.cos(aci) * yari)), by = Math.max(-70, Math.min(boy + 70, boy / 2 + Math.sin(aci) * yari));
    // Hedef tam karşısı değil, biraz sapmış: her seferinde başka bir hat izler.
    const karsi = aci + Math.PI + (Math.random() - 0.5) * 1.2;
    const gx = en / 2 + Math.cos(karsi) * yari * 1.3, gy = boy / 2 + Math.sin(karsi) * yari * 1.3;
    const a = Math.atan2(gy - by, gx - bx), sayi = 5 + Math.floor(Math.random() * 3);
    for (let i = 0; i < sayi; i++) {
      const k = Math.ceil(i / 2), yan = i % 2 ? 1 : -1;
      const x = bx + (-k * Math.cos(a) - yan * k * 0.9 * -Math.sin(a)) * 30, y = by + (-k * Math.sin(a) + yan * k * 0.9 * Math.cos(a)) * 30;
      yabancilar.push({ x, y, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, aci: a, gx, gy });
    }
    onleme = true; onlemeBas = t; tuval!.dataset.onleme = '1';
  }
  function onlemeAdimi(t: number, dt: number) {
    for (const y of yabancilar) {
      // Yoluna devam etmeye çalışır, bizimkiler yaklaşınca kaçar.
      const m = Math.hypot(y.gx - y.x, y.gy - y.y) || 1;
      let ax = ((y.gx - y.x) / m) * 110, ay = ((y.gy - y.y) / m) * 110;
      if (t - onlemeBas > FARK) for (const u of ihalar) { const ex = y.x - u.x, ey = y.y - u.y, r = Math.hypot(ex, ey) || 1; if (r < 140) { ax += (ex / r) * (1 - r / 140) * 900; ay += (ey / r) * (1 - r / 140) * 900; } }
      if (t - onlemeBas > 2200) { // ekrana girdikten sonra kenardan kaçamaz
        if (y.x < 30) ax += 700; if (y.x > en - 30) ax -= 700; if (y.y < 80) ay += 700; if (y.y > boy - 30) ay -= 700;
      }
      y.vx += ax * dt; y.vy += ay * dt;
      const h = Math.hypot(y.vx, y.vy), sinir = 170;
      if (h > sinir) { y.vx *= sinir / h; y.vy *= sinir / h; }
      y.x += y.vx * dt; y.y += y.vy * dt; y.aci = Math.atan2(y.vy, y.vx);
    }
    // Yakalanan düşer
    if (t - onlemeBas > FARK) for (let i = yabancilar.length - 1; i >= 0; i--) {
      const y = yabancilar[i];
      if (ihalar.some((u) => Math.hypot(u.x - y.x, u.y - y.y) < 15)) { patlamalar.push({ x: y.x, y: y.y, t }); yabancilar.splice(i, 1); }
    }
    if (t - onlemeBas > 16000) yabancilar.length = 0; // emniyet: takılırsa bırak
    if (!yabancilar.length) { onleme = false; tuval!.dataset.onleme = '0'; sonDegisim = t - SURE * 0.6; sonrakiBaskin = t + 40000 + Math.random() * 30000; }
  }
  const DAGIL = 9000; // tek tek dolaşma süresi, ardından toplanma gelir
  const dagiliyor = (t: number) => bicim === 7 && t - sonDegisim < DAGIL;

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
    if (!onleme && t > sonrakiBaskin && !dagiliyor(t) && !document.hidden) baskin(t);
    if (onleme) { onlemeAdimi(t, dt); if (onleme && bicim !== 7) sonDegisim = Math.max(sonDegisim, t - SURE + 1); }
    rahatsiz = Math.max(0, rahatsiz - dt * 0.35);
    if (rahatsiz > 4 && !onleme && !dagiliyor(t)) { rahatsiz = 0; dagit(t); }
    if (t - sonDegisim > (bicim === 7 ? DAGIL + 3500 : SURE)) {
      // Sıradaki formasyon rastgele seçilir, aynısı üst üste gelmez.
      // Ağırlıklı seçim: tek tek dağılma en sık, ikiye bölünme ondan sonra gelir.
      const agirlik = adlar.map((_, k) => (k === bicim ? 0 : k === 7 ? 5 : k === 6 ? 3 : 1));
      let zar = Math.random() * agirlik.reduce((x, y) => x + y, 0);
      bicim = agirlik.findIndex((g) => (zar -= g) < 0); sonDegisim = t;
      tuval!.dataset.bicim = String(bicim);
      // Dağıl: her İHA ekranda kendine ayrı bir nokta seçer, yarı sürede oraya gider, sonra sürüye döner.
      if (bicim === 7) dagit(t);
    }
    const dagil = dagiliyor(t) && !onleme;
    const birim = Math.max(24, Math.min(38, en / 28));
    const c = Math.cos(yon), s = Math.sin(yon);
    for (const u of ihalar) {
      if (dagil && (t > u.st || Math.hypot(u.sx - u.x, u.sy - u.y) < 40)) yeniNokta(u, t);
      const [ileri, yan] = yuva(bicim, u.i, t);
      const hx = dagil ? u.sx : hedef.x + (ileri * c - yan * s) * birim, hy = dagil ? u.sy : hedef.y + (ileri * s + yan * c) * birim;
      // Arkadakiler biraz daha gevşek izler: dönüşlerde sürü kamçı gibi açılır, sonra toplanır.
      // Dağılırken ve yeni toplanırken yay yumuşaktır, yoksa ekranın öbür ucuna ışınlanır gibi giderler.
      const sertlik = bicim === 7 ? (dagil ? 2.8 : 4.5) : 15 - Math.min(6, u.i * 0.5);
      let ax = (hx - u.x) * sertlik, ay = (hy - u.y) * sertlik;
      if (onleme && yabancilar.length && t - onlemeBas > FARK) { // önleme: her İHA bir yabancıyı kovalar, yaklaştıkça da hız kesmez
        const y = yabancilar[u.i % yabancilar.length], ex = y.x - u.x, ey = y.y - u.y, m = Math.hypot(ex, ey) || 1;
        ax = (ex / m) * (1050 + m * 2); ay = (ey / m) * (1050 + m * 2);
      }
      if (imlec.var) { // imleç yaklaşınca kaçar: ne kadar yakınsa o kadar sert
        const ex = u.x - imlec.x, ey = u.y - imlec.y, m = Math.hypot(ex, ey) || 1, alan = 120;
        if (m < alan) { const g = (1 - m / alan) ** 2 * 5200; ax += (ex / m) * g; ay += (ey / m) * g; rahatsiz += dt * (1 - m / alan) * 0.9; }
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

  // Dört pervaneli gövde, üstten görünüş: çapraz kollar, uçlarda dönen pervaneler, önde burun işareti.
  function govde(x: number, y: number, aci: number, hiz: number, renk: string, a: number, faz: number) {
    const kol = 5.2, pr = 3;
    ctx.save(); ctx.translate(x, y); ctx.rotate(aci);
    if (hiz > 30) { // hız izi
      const iz = ctx.createLinearGradient(-8 - Math.min(26, hiz * 0.07), 0, -8, 0);
      iz.addColorStop(0, 'transparent'); iz.addColorStop(1, renk);
      ctx.globalAlpha = 0.35; ctx.strokeStyle = iz; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8 - Math.min(26, hiz * 0.07), 0); ctx.lineTo(-8, 0); ctx.stroke();
    }
    ctx.globalAlpha = a; ctx.strokeStyle = renk; ctx.fillStyle = renk; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-kol, -kol); ctx.lineTo(kol, kol); ctx.moveTo(-kol, kol); ctx.lineTo(kol, -kol); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(-2.6, -2, 5.2, 4, 1.2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(2.6, -1.4); ctx.lineTo(5, 0); ctx.lineTo(2.6, 1.4); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++) {
      const px = k < 2 ? kol : -kol, py = k % 2 ? kol : -kol;
      ctx.globalAlpha = a * 0.45; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.stroke();
      const d = (k === 0 || k === 3 ? 1 : -1) * faz; // komşu pervaneler ters yöne döner
      ctx.globalAlpha = a; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px - Math.cos(d) * pr, py - Math.sin(d) * pr); ctx.lineTo(px + Math.cos(d) * pr, py + Math.sin(d) * pr); ctx.stroke();
    }
    ctx.restore();
  }

  function ciz() {
    const faz = performance.now() / 45;
    ctx.clearRect(0, 0, en, boy);
    ctx.lineWidth = 1; ctx.strokeStyle = vurgu; ctx.globalAlpha = 0.16;
    ctx.beginPath(); // haberleşme bağları: her İHA bir öndekine bağlı
    if (!(onleme && performance.now() - onlemeBas > FARK) && !dagiliyor(performance.now())) for (const u of ihalar) { const o = ihalar[bicim === 1 || bicim === 4 ? (u.i + N - 1) % N : Math.max(0, u.i - 2)]; if (o === u || (bicim === 4 && !u.i) || (bicim === 6 && u.i === 1)) continue; ctx.moveTo(u.x, u.y); ctx.lineTo(o.x, o.y); }
    ctx.stroke();
    for (const u of ihalar) govde(u.x, u.y, u.aci, Math.hypot(u.vx, u.vy), vurgu, u.i ? 0.62 : 0.95, faz + u.i);
    for (const y of yabancilar) govde(y.x, y.y, y.aci, 0, yabanci, 0.8, -faz);
    const simdi = performance.now();
    for (let i = patlamalar.length - 1; i >= 0; i--) { // düşen yabancının yerinde kısa bir parlama
      const p = patlamalar[i], o = (simdi - p.t) / 600;
      if (o >= 1) { patlamalar.splice(i, 1); continue; }
      ctx.strokeStyle = yabanci; ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - o) * 0.9;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 + o * 20, 0, Math.PI * 2);
      for (let k = 0; k < 6; k++) { const a = k * 1.047 + p.x; ctx.moveTo(p.x + Math.cos(a) * (6 + o * 14), p.y + Math.sin(a) * (6 + o * 14)); ctx.lineTo(p.x + Math.cos(a) * (10 + o * 30), p.y + Math.sin(a) * (10 + o * 30)); }
      ctx.stroke();
    }
    const gecen = performance.now() - cagri.t;
    if (gecen < 900) { // çağrı işareti: tıklanan yerde açılan halka
      const o = gecen / 900;
      ctx.strokeStyle = vurgu; ctx.lineWidth = 1.5; ctx.globalAlpha = (1 - o) * 0.8;
      ctx.beginPath(); ctx.arc(cagri.x, cagri.y, 6 + o * 34, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = (1 - o) * 0.9; ctx.beginPath(); ctx.moveTo(cagri.x - 5, cagri.y); ctx.lineTo(cagri.x + 5, cagri.y); ctx.moveTo(cagri.x, cagri.y - 5); ctx.lineTo(cagri.x, cagri.y + 5); ctx.stroke();
    }
    ctx.globalAlpha = 0.9; ctx.fillStyle = soluk; ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'right';
    ctx.globalAlpha = 0.7; ctx.fillText(`${(tuval!.dataset.etiket ?? 'sürü').toUpperCase()} · ${N} · ${(onleme && performance.now() - onlemeBas > FARK ? tuval!.dataset.onlemeAdi ?? 'önleme' : adlar[bicim]).toUpperCase()}`, en - 12, boy - 12);
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
    rahatsiz += 1.1; // art arda çağrılmak da rahatsız eder
  });
  azalt.addEventListener('change', baslat);
  new MutationObserver(() => basladi && boyutla()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  baslat();
}
