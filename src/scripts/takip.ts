// Giriş ekranındaki takip benzetimi.
// Balon-Takip deposundaki fikrin küçük bir canlandırması: hedefin "ham tespitleri"
// gürültülü ve arada bir kayıp gelir; takipçi bunları üstel hareketli ortalamayla
// yumuşatır, son 8 konumdan hız vektörü çıkarır ve kayıp karede konumu tahmin eder.
// Süs değildir ama içerik de değildir: tuval aria-hidden, yanında yazılı açıklaması var.

const tuval = document.querySelector<HTMLCanvasElement>('canvas[data-takip]');

if (tuval) {
  const ctx = tuval.getContext('2d')!;
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  const etiket = { takip: tuval.dataset.etiketTakip ?? '', tahmin: tuval.dataset.etiketTahmin ?? '', tespit: tuval.dataset.etiketTespit ?? '' };

  let en = 0, boy = 0, oran = 1;
  let renk = { vurgu: '#b8f04a', metin: '#e8ecef', soluk: '#9aa6b2', cizgi: '#222a32' };
  const renkleriOku = () => {
    const s = getComputedStyle(tuval);
    renk = {
      vurgu: s.getPropertyValue('--vurgu').trim() || renk.vurgu,
      metin: s.getPropertyValue('--metin').trim() || renk.metin,
      soluk: s.getPropertyValue('--soluk').trim() || renk.soluk,
      cizgi: s.getPropertyValue('--cizgi').trim() || renk.cizgi,
    };
  };
  const boyutla = () => {
    const r = tuval.getBoundingClientRect();
    oran = Math.min(devicePixelRatio || 1, 1.5);
    en = r.width;
    boy = r.height;
    tuval.width = Math.round(en * oran);
    tuval.height = Math.round(boy * oran);
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
  };

  // Durum
  const hedef = { x: 0, y: 0 };            // gerçek hedef
  const imlec = { x: 0, y: 0, var: false }; // ziyaretçi yönetiyorsa
  const iz = { x: 0, y: 0, vx: 0, vy: 0, kayip: 0, hazir: false }; // takipçi
  const gecmis: { x: number; y: number; t: number }[] = [];
  const tespitler: { x: number; y: number; omur: number }[] = [];
  let sonTespit = 0, kayipKalan = 0, t0 = 0;

  const gurultu = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2; // yaklaşık çan eğrisi

  function hedefiYurut(t: number) {
    let gx: number, gy: number;
    if (imlec.var) {
      gx = imlec.x; gy = imlec.y;
    } else {
      const s = t / 1000;
      gx = en * (0.5 + 0.34 * Math.sin(s * 0.55) * Math.cos(s * 0.21));
      gy = boy * (0.5 + 0.3 * Math.sin(s * 0.83 + 1.2));
    }
    hedef.x += (gx - hedef.x) * 0.14;
    hedef.y += (gy - hedef.y) * 0.14;
  }

  let sonKare = 0;
  function ilerlet(t: number) {
    // Kareler arasında takipçi hız vektörüyle ilerler; tespit gelince düzeltilir.
    const dt = Math.min(0.05, (t - sonKare) / 1000);
    sonKare = t;
    if (!iz.hazir) return;
    iz.x += iz.vx * dt;
    iz.y += iz.vy * dt;
  }

  function tespitEt(t: number) {
    // ~14 tespit/sn; arada bir 2-5 karelik kayıp
    if (t - sonTespit < 70) return;
    sonTespit = t;
    if (kayipKalan <= 0 && Math.random() < 0.07) kayipKalan = 2 + Math.floor(Math.random() * 4);
    if (kayipKalan > 0) {
      kayipKalan--;
      iz.kayip++;
      iz.vx *= 0.9;
      iz.vy *= 0.9;
      return;
    }
    const g = Math.max(5, en * 0.014);
    const ox = hedef.x + gurultu() * g, oy = hedef.y + gurultu() * g;
    tespitler.push({ x: ox, y: oy, omur: 1 });
    if (tespitler.length > 14) tespitler.shift();
    if (!iz.hazir) {
      iz.x = ox; iz.y = oy; iz.hazir = true;
    } else {
      const a = 0.42; // üstel hareketli ortalama
      iz.x += (ox - iz.x) * a;
      iz.y += (oy - iz.y) * a;
    }
    iz.kayip = 0;
    gecmis.push({ x: ox, y: oy, t });
    if (gecmis.length > 8) gecmis.shift();
    if (gecmis.length >= 3) {
      const ilk = gecmis[0], son = gecmis[gecmis.length - 1];
      const sure = (son.t - ilk.t) / 1000;
      if (sure > 0) {
        const vx = (son.x - ilk.x) / sure, vy = (son.y - ilk.y) / sure;
        iz.vx += (vx - iz.vx) * 0.5;
        iz.vy += (vy - iz.vy) * 0.5;
      }
    }
  }

  function ciz() {
    ctx.clearRect(0, 0, en, boy);
    const yaricap = Math.max(22, Math.min(en, boy) * 0.085);
    ctx.lineWidth = 1;

    // gerçek hedef (balon)
    ctx.fillStyle = renk.soluk;
    ctx.globalAlpha = 0.32;
    ctx.beginPath();
    ctx.ellipse(hedef.x, hedef.y, yaricap * 0.62, yaricap * 0.72, 0, 0, Math.PI * 2);
    ctx.fill();

    // ham tespitler
    ctx.fillStyle = renk.metin;
    for (const d of tespitler) {
      ctx.globalAlpha = 0.5 * d.omur;
      ctx.fillRect(d.x - 1.5, d.y - 1.5, 3, 3);
      d.omur *= 0.965;
    }
    ctx.globalAlpha = 1;
    if (!iz.hazir) return;

    const tahmin = iz.kayip > 0;
    // nişan çizgileri
    ctx.strokeStyle = renk.vurgu;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(iz.y) + 0.5); ctx.lineTo(en, Math.round(iz.y) + 0.5);
    ctx.moveTo(Math.round(iz.x) + 0.5, 0); ctx.lineTo(Math.round(iz.x) + 0.5, boy);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // takip çemberi
    ctx.lineWidth = 1.75;
    ctx.setLineDash(tahmin ? [5, 5] : []);
    ctx.beginPath();
    ctx.arc(iz.x, iz.y, yaricap, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = renk.vurgu;
    ctx.beginPath();
    ctx.arc(iz.x, iz.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // hız vektörü
    const hiz = Math.hypot(iz.vx, iz.vy);
    if (hiz > 12) {
      const ux = iz.vx / hiz, uy = iz.vy / hiz;
      const uz = Math.min(yaricap * 2.2, yaricap + hiz * 0.16);
      const bx = iz.x + ux * yaricap, by = iz.y + uy * yaricap;
      const sx = iz.x + ux * uz, sy = iz.y + uy * uz;
      ctx.beginPath();
      ctx.moveTo(bx, by); ctx.lineTo(sx, sy);
      ctx.moveTo(sx, sy); ctx.lineTo(sx - ux * 7 - uy * 4, sy - uy * 7 + ux * 4);
      ctx.moveTo(sx, sy); ctx.lineTo(sx - ux * 7 + uy * 4, sy - uy * 7 - ux * 4);
      ctx.stroke();
    }

    // etiket
    ctx.font = `500 ${Math.max(11, Math.min(13, en / 34))}px "JetBrains Mono Variable", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    const yazi = `${tahmin ? etiket.tahmin : etiket.takip} (${Math.round(iz.x)}, ${Math.round(iz.y)})`;
    const gen = ctx.measureText(yazi).width;
    let ex = iz.x + yaricap * 0.8, ey = iz.y - yaricap - 16;
    if (ex + gen > en - 8) ex = iz.x - yaricap * 0.8 - gen;
    if (ey < 8) ey = iz.y + yaricap + 8;
    ctx.fillText(yazi, Math.max(8, ex), ey);
  }

  let calisiyor = false, gorunur = false, kare = 0;
  // Telefonlarda saniyede 30 kare yeter; işlemciyi ve pili yormaz.
  const kareAraligi = matchMedia('(pointer: coarse)').matches ? 32 : 0;
  let sonCizim = 0;
  function dongu(t: number) {
    if (!calisiyor) return;
    kare = requestAnimationFrame(dongu);
    if (t - sonCizim < kareAraligi) return;
    sonCizim = t;
    if (!t0) { t0 = t; sonTespit = t; sonKare = t; }
    hedefiYurut(t - t0);
    ilerlet(t);
    tespitEt(t);
    ciz();
  }
  function durumuAyarla() {
    const olmali = gorunur && !document.hidden && !azalt.matches;
    if (olmali && !calisiyor) { calisiyor = true; kare = requestAnimationFrame(dongu); }
    else if (!olmali && calisiyor) { calisiyor = false; cancelAnimationFrame(kare); }
  }
  function duranKare() {
    // "Hareketi azalt" açıkken tek bir örnek kare çizilir.
    hedef.x = en * 0.58; hedef.y = boy * 0.46;
    iz.x = hedef.x + 4; iz.y = hedef.y - 3; iz.vx = 90; iz.vy = -40; iz.kayip = 0; iz.hazir = true;
    tespitler.length = 0;
    for (let i = 0; i < 9; i++) tespitler.push({ x: hedef.x - i * 9 + gurultu() * 7, y: hedef.y + i * 4 + gurultu() * 7, omur: 1 - i * 0.09 });
    ciz();
  }

  const baslat = () => {
    renkleriOku();
    boyutla();
    hedef.x = en / 2; hedef.y = boy / 2;
    if (azalt.matches) duranKare();
    new IntersectionObserver((k) => { gorunur = k[0].isIntersecting; durumuAyarla(); }).observe(tuval);
    document.addEventListener('visibilitychange', durumuAyarla);
    azalt.addEventListener('change', () => { durumuAyarla(); if (azalt.matches) duranKare(); });
    new ResizeObserver(() => { boyutla(); if (!calisiyor) azalt.matches ? duranKare() : ciz(); }).observe(tuval);
    document.addEventListener('tema', () => { renkleriOku(); if (!calisiyor) ciz(); });
    matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { renkleriOku(); if (!calisiyor) ciz(); });
    tuval.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return; // dokunmatikte kaydırmayı engelleme
      const r = tuval.getBoundingClientRect();
      imlec.x = e.clientX - r.left; imlec.y = e.clientY - r.top; imlec.var = true;
    });
    tuval.addEventListener('pointerleave', () => { imlec.var = false; });
  };
  // Sayfanın yüklenmesini geciktirmemek için yükleme bittikten sonra, boşta başlat.
  const bosta = () => ('requestIdleCallback' in window ? requestIdleCallback(baslat, { timeout: 1500 }) : setTimeout(baslat, 300));
  document.readyState === 'complete' ? bosta() : addEventListener('load', bosta, { once: true });
}
