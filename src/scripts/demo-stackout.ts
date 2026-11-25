// Stackout benzetimi: dolu satır silinmez, beyaza döner ve top kazandırır; toplarla beyaz bloklar kırılır.
// Oyunun kendisi değildir; iki modu bağlayan kuralı gösteren küçük bir örnektir.
const kok = document.querySelector<HTMLElement>('[data-demo-stackout]');
if (kok) {
  const tuval = kok.querySelector('canvas')!;
  const ctx = tuval.getContext('2d')!;
  const m = kok.dataset;
  const el = <T extends HTMLElement>(s: string) => kok.querySelector<T>(s)!;
  const durum = el('[data-durum]');
  const puanEl = el('[data-puan]');
  const topEl = el('[data-top]');
  const modEl = el('[data-mod]');
  const parcaKap = el('[data-parcalar]');
  const modDugme = el<HTMLButtonElement>('[data-mod-degis]');
  const yigDenetim = el('[data-yig-denetim]');
  const modAdi = { yig: modEl.textContent ?? '', kir: (m.eKir ?? '').replace(/[→\s]/g, '') };

  const S = 8;
  const R = 12;
  const BEYAZ = 9;
  const RENK = ['', '#E74C3C', '#2ECC71', '#3498DB', '#F1C40F', '#9B59B6', '#1ABC9C', '#E67E22'];
  const SEKIL: number[][][] = [
    [[1, 1]],
    [[1, 1, 1]],
    [[1, 0], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1, 1]],
    [[1]],
  ];
  type Parca = { s: number[][]; renk: number };
  type Top = { x: number; y: number; dx: number; dy: number; aktif: boolean };

  let izgara: number[][] = [];
  let sira: (Parca | null)[] = [];
  let secili = -1;
  let px = 0; // seçili parçanın sütunu
  let mod: 'yig' | 'kir' = 'yig';
  let puan = 0;
  let toplar = 0;
  let seri = 1;
  let top: Top | null = null;
  let platform = 0.5; // 0-1, platformun merkezi
  let yon = 0;
  let kare = 0;
  let W = 0;
  let H = 0;
  let hc = 0;

  const rastgele = (): Parca => ({ s: SEKIL[Math.floor(Math.random() * SEKIL.length)], renk: 1 + Math.floor(Math.random() * 7) });
  const dondur = (s: number[][]) => s[0].map((_, x) => s.map((satir) => satir[x]).reverse());
  const sigar = (s: number[][], x: number, y: number) =>
    s.every((satir, dy) => satir.every((v, dx) => !v || (x + dx >= 0 && x + dx < S && y + dy < R && y + dy >= 0 && !izgara[y + dy][x + dx])));
  const inis = (s: number[][], x: number) => {
    if (!sigar(s, x, 0)) return -1;
    let y = 0;
    while (sigar(s, x, y + 1)) y++;
    return y;
  };
  const beyazVar = () => izgara.some((satir) => satir.includes(BEYAZ));
  const de = (ileti: string | undefined) => (durum.textContent = ileti ?? '');

  function doldur() {
    sira = [rastgele(), rastgele(), rastgele()];
    sec(0);
  }
  function sec(i: number) {
    if (!sira[i]) i = sira.findIndex(Boolean);
    secili = i;
    const p = sira[i];
    if (p) px = Math.max(0, Math.min(S - p.s[0].length, px));
    parcalariCiz();
  }
  function parcalariCiz() {
    parcaKap.textContent = '';
    sira.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'so-parca';
      b.disabled = !p;
      b.setAttribute('aria-pressed', String(i === secili));
      b.setAttribute('aria-label', `${m.eParca} ${i + 1}`);
      if (p) {
        const g = document.createElement('span');
        g.style.setProperty('--k', String(p.s[0].length));
        for (const satir of p.s) for (const v of satir) {
          const h = document.createElement('i');
          if (v) h.style.background = RENK[p.renk];
          g.append(h);
        }
        b.append(g);
      }
      b.addEventListener('click', () => {
        sec(i);
        ciz();
        tuval.focus({ preventScroll: true });
      });
      parcaKap.append(b);
    });
  }

  function birak() {
    const p = sira[secili];
    if (mod !== 'yig' || !p) return;
    const y = inis(p.s, px);
    if (y < 0) {
      baslat();
      de(m.mDoldu);
      return;
    }
    p.s.forEach((satir, dy) => satir.forEach((v, dx) => v && (izgara[y + dy][px + dx] = p.renk)));
    let kazanilan = 0;
    for (const satir of izgara) {
      if (satir.every((v) => v && v !== BEYAZ)) {
        satir.fill(BEYAZ);
        kazanilan++;
      }
    }
    if (kazanilan) {
      toplar += kazanilan;
      puan += kazanilan * 100;
      de(m.mSatir);
    }
    sira[secili] = null;
    if (sira.some(Boolean)) sec(sira.findIndex(Boolean));
    else doldur();
    // Hiçbir parça hiçbir yere sığmıyorsa tahta dolmuştur.
    const yerVar = sira.some((q) => q && Array.from({ length: S }, (_, x) => x).some((x) => x + q.s[0].length <= S && inis(q.s, x) >= 0));
    if (!yerVar && !(toplar > 0 && beyazVar())) {
      baslat();
      de(m.mDoldu);
    }
    guncelle();
  }

  function modDegis() {
    if (mod === 'yig') {
      if (!(toplar > 0 && beyazVar())) return;
      mod = 'kir';
      seri = 1;
      topHazirla();
      de(m.mKir);
      dongu();
    } else {
      if (top?.aktif) return;
      yigaDon();
    }
    guncelle();
  }
  function yigaDon(ileti?: string) {
    mod = 'yig';
    top = null;
    cancelAnimationFrame(kare);
    de(ileti ?? m.mSec);
    guncelle();
  }
  const platformGen = () => W * 0.26;
  const platformY = () => H - hc * 0.55;
  function topHazirla() {
    top = { x: platform * W, y: platformY() - hc * 0.2, dx: 0, dy: 0, aktif: false };
  }
  function firlat() {
    if (mod !== 'kir' || !top || top.aktif) return;
    const hiz = H * 0.011;
    const aci = (Math.random() - 0.5) * 0.7;
    top.dx = Math.sin(aci) * hiz;
    top.dy = -Math.cos(aci) * hiz;
    top.aktif = true;
    guncelle();
  }

  function adim(k: number) {
    const gen = platformGen();
    if (yon) platform = Math.max(gen / 2 / W, Math.min(1 - gen / 2 / W, platform + yon * 0.02 * k));
    if (!top) return;
    const r = hc * 0.2;
    if (!top.aktif) {
      top.x = platform * W;
      top.y = platformY() - r;
      return;
    }
    top.x += top.dx * k;
    top.y += top.dy * k;
    if (top.x - r < 0 || top.x + r > W) {
      top.dx = -top.dx;
      top.x = Math.max(r, Math.min(W - r, top.x));
    }
    if (top.y - r < 0) {
      top.dy = Math.abs(top.dy);
      top.y = r;
    }
    const sol = platform * W - gen / 2;
    if (top.dy > 0 && top.y + r > platformY() && top.y - r < platformY() + hc * 0.3 && top.x > sol && top.x < sol + gen) {
      const hiz = Math.hypot(top.dx, top.dy);
      const aci = ((top.x - sol) / gen - 0.5) * Math.PI * (2 / 3);
      top.dx = Math.sin(aci) * hiz;
      top.dy = -Math.cos(aci) * hiz;
      top.y = platformY() - r;
    }
    // Kırma modunda tahta baş aşağı çizilir: yığın yukarıda, platform aşağıda.
    dis: for (let y = 0; y < R; y++) {
      for (let x = 0; x < S; x++) {
        const v = izgara[y][x];
        if (!v) continue;
        const bx = x * hc;
        const by = (R - 1 - y) * hc;
        if (top.x + r > bx && top.x - r < bx + hc && top.y + r > by && top.y - r < by + hc) {
          izgara[y][x] = 0;
          if (v === BEYAZ) puan += seri++;
          const sl = top.x + r - bx;
          const sg = bx + hc - (top.x - r);
          const us = top.y + r - by;
          const al = by + hc - (top.y - r);
          const en = Math.min(sl, sg, us, al);
          if (en === sl) (top.dx = -Math.abs(top.dx)), (top.x = bx - r);
          else if (en === sg) (top.dx = Math.abs(top.dx)), (top.x = bx + hc + r);
          else if (en === us) (top.dy = -Math.abs(top.dy)), (top.y = by - r);
          else (top.dy = Math.abs(top.dy)), (top.y = by + hc + r);
          guncelle();
          break dis;
        }
      }
    }
    if (top.y - r > H) {
      toplar = Math.max(0, toplar - 1);
      seri = 1;
      if (toplar > 0 && beyazVar()) topHazirla();
      else return yigaDon(toplar > 0 ? m.mSec : m.mTopBitti);
      guncelle();
    } else if (!izgara.some((satir) => satir.some(Boolean))) {
      yigaDon();
    }
  }

  function dongu() {
    cancelAnimationFrame(kare);
    let once = 0;
    const tur = (t: number) => {
      if (mod !== 'kir') return;
      adim(once ? Math.min(2.5, (t - once) / 16.7) : 1);
      once = t;
      ciz();
      if (mod === 'kir') kare = requestAnimationFrame(tur);
    };
    kare = requestAnimationFrame(tur);
  }

  function guncelle() {
    puanEl.textContent = String(puan);
    topEl.textContent = String(toplar);
    modEl.textContent = modAdi[mod];
    modDugme.textContent = (mod === 'yig' ? m.eKir : m.eYig) ?? '';
    modDugme.disabled = mod === 'yig' ? !(toplar > 0 && beyazVar()) : !!top?.aktif;
    yigDenetim.hidden = mod !== 'yig';
    if (mod === 'yig') ciz();
  }

  function boyut() {
    const kutu = tuval.getBoundingClientRect();
    if (!kutu.width) return;
    const oran = Math.min(window.devicePixelRatio || 1, 2);
    W = kutu.width;
    H = (W / S) * R;
    hc = W / S;
    tuval.width = Math.round(W * oran);
    tuval.height = Math.round(H * oran);
    ctx.setTransform(oran, 0, 0, oran, 0, 0);
    ciz();
  }

  function hucre(x: number, y: number, renk: string, saydam = 1, cizgi = '') {
    const b = Math.max(1, hc * 0.06);
    ctx.globalAlpha = saydam;
    ctx.fillStyle = renk;
    ctx.beginPath();
    ctx.roundRect(x * hc + b, y * hc + b, hc - 2 * b, hc - 2 * b, hc * 0.18);
    ctx.fill();
    if (cizgi) {
      ctx.strokeStyle = cizgi;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function ciz() {
    if (!W) return;
    const stil = getComputedStyle(kok!);
    const cizgi = stil.getPropertyValue('--cizgi').trim();
    const metin = stil.getPropertyValue('--metin').trim();
    const vurgu = stil.getPropertyValue('--vurgu').trim();
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cizgi;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (let x = 1; x < S; x++) {
      ctx.beginPath();
      ctx.moveTo(x * hc, 0);
      ctx.lineTo(x * hc, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const kir = mod === 'kir';
    for (let y = 0; y < R; y++) for (let x = 0; x < S; x++) {
      const v = izgara[y][x];
      if (v) hucre(x, kir ? R - 1 - y : y, v === BEYAZ ? '#ffffff' : RENK[v], 1, v === BEYAZ ? metin : '');
    }
    if (!kir) {
      const p = sira[secili];
      if (p) {
        const y = inis(p.s, px);
        p.s.forEach((satir, dy) => satir.forEach((v, dx) => {
          if (!v) return;
          hucre(px + dx, dy, RENK[p.renk]);
          if (y > 0) hucre(px + dx, y + dy, RENK[p.renk], 0.28);
        }));
      }
    } else {
      const gen = platformGen();
      ctx.fillStyle = metin;
      ctx.beginPath();
      ctx.roundRect(platform * W - gen / 2, platformY(), gen, hc * 0.3, hc * 0.15);
      ctx.fill();
      if (top) {
        ctx.fillStyle = vurgu;
        ctx.beginPath();
        ctx.arc(top.x, top.y, hc * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function baslat() {
    cancelAnimationFrame(kare);
    izgara = Array.from({ length: R }, () => new Array<number>(S).fill(0));
    // Başlangıçta tabanda neredeyse dolu iki satır: kuralı ilk hamlede görmek için.
    for (let y = R - 2; y < R; y++) for (let x = 0; x < S; x++) if (x < S - 2) izgara[y][x] = 1 + ((x + y) % 7);
    mod = 'yig';
    puan = 0;
    toplar = 0;
    top = null;
    px = S - 2;
    sira = [{ s: SEKIL[3], renk: 3 }, rastgele(), rastgele()];
    sec(0);
    de(m.mSec);
    guncelle();
  }

  // ── Girdi ──
  const sutun = (e: PointerEvent) => (e.clientX - tuval.getBoundingClientRect().left) / hc;
  tuval.addEventListener('pointermove', (e) => {
    if (mod === 'yig') {
      const p = sira[secili];
      if (!p) return;
      const yeni = Math.max(0, Math.min(S - p.s[0].length, Math.round(sutun(e) - p.s[0].length / 2)));
      if (yeni !== px) {
        px = yeni;
        ciz();
      }
    } else {
      const yari = platformGen() / 2 / W;
      platform = Math.max(yari, Math.min(1 - yari, sutun(e) / S));
    }
  });
  tuval.addEventListener('pointerup', (e) => {
    if (mod === 'yig') {
      const p = sira[secili];
      if (p) px = Math.max(0, Math.min(S - p.s[0].length, Math.round(sutun(e) - p.s[0].length / 2)));
      birak();
    } else firlat();
  });
  tuval.addEventListener('keydown', (e) => {
    const k = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'Enter', '1', '2', '3'].includes(k)) return;
    e.preventDefault();
    e.stopPropagation();
    if (mod === 'yig') {
      const p = sira[secili];
      if (k === 'ArrowLeft' && p) px = Math.max(0, px - 1);
      else if (k === 'ArrowRight' && p) px = Math.min(S - p.s[0].length, px + 1);
      else if (k === 'ArrowUp') cevir();
      else if (k === ' ' || k === 'Enter') return birak();
      else if ('123'.includes(k)) sec(Number(k) - 1);
      ciz();
    } else {
      if (k === 'ArrowLeft') yon = -1;
      else if (k === 'ArrowRight') yon = 1;
      else if (k === ' ' || k === 'Enter') firlat();
    }
  });
  tuval.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') yon = 0;
  });
  tuval.addEventListener('blur', () => (yon = 0));
  function cevir() {
    const p = sira[secili];
    if (mod !== 'yig' || !p) return;
    const yeni = dondur(p.s);
    p.s = yeni;
    px = Math.max(0, Math.min(S - yeni[0].length, px));
    parcalariCiz();
    ciz();
  }
  el('[data-don]').addEventListener('click', cevir);
  el('[data-birak]').addEventListener('click', birak);
  el('[data-yeniden]').addEventListener('click', baslat);
  modDugme.addEventListener('click', modDegis);
  new ResizeObserver(boyut).observe(tuval);
  new MutationObserver(ciz).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // Sayfa görünmüyorken döngü durur; dönünce sürer.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(kare);
    else if (mod === 'kir') dongu();
  });
  baslat();
  boyut();
}
