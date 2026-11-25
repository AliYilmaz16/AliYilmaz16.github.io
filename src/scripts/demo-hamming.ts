// Hamming SEC-DED gösterimi. Konum 0 genel eşlik, 1-12 Hamming kodu (eşlik: 1, 2, 4, 8).
const kok = document.querySelector<HTMLElement>('[data-demo-hamming]');
if (kok) {
  const VERI_KONUM = [3, 5, 6, 7, 9, 10, 11, 12];
  const ESLIK_KONUM = [1, 2, 4, 8];
  const veri = [1, 0, 1, 1, 0, 0, 1, 0];
  const hata = new Set<number>();
  const m = kok.dataset;
  const veriKap = kok.querySelector<HTMLElement>('[data-veri]')!;
  const kodKap = kok.querySelector<HTMLElement>('[data-kod]')!;
  const durum = kok.querySelector<HTMLElement>('[data-durum]')!;
  const sendromEl = kok.querySelector<HTMLElement>('[data-sendrom]')!;
  const genelEl = kok.querySelector<HTMLElement>('[data-genel]')!;

  const kodla = (): number[] => {
    const k = new Array<number>(13).fill(0);
    VERI_KONUM.forEach((p, i) => (k[p] = veri[i]));
    for (const e of ESLIK_KONUM) {
      let x = 0;
      for (let p = 1; p <= 12; p++) if (p & e && p !== e) x ^= k[p];
      k[e] = x;
    }
    k[0] = k.slice(1).reduce((a, b) => a ^ b, 0);
    return k;
  };

  const dugme = (kap: HTMLElement, i: number, tikla: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bit';
    b.addEventListener('click', tikla);
    kap.append(b);
    return b;
  };
  let uyari = '';
  const veriDugme = veri.map((_, i) =>
    dugme(veriKap, i, () => {
      veri[i] ^= 1;
      uyari = '';
      ciz();
    }),
  );
  const kodDugme = Array.from({ length: 13 }, (_, p) =>
    dugme(kodKap, p, () => {
      uyari = '';
      if (hata.has(p)) hata.delete(p);
      else if (hata.size >= 2) uyari = m.mSinir ?? '';
      else hata.add(p);
      ciz();
    }),
  );
  kok.querySelector('[data-temizle]')!.addEventListener('click', () => {
    hata.clear();
    uyari = '';
    ciz();
  });

  function ciz() {
    const temiz = kodla();
    const alinan = temiz.map((b, p) => (hata.has(p) ? b ^ 1 : b));
    let s = 0;
    for (let p = 1; p <= 12; p++) if (alinan[p]) s ^= p;
    const genel = alinan.reduce((a, b) => a ^ b, 0);

    veriDugme.forEach((b, i) => {
      b.textContent = String(veri[i]);
      b.setAttribute('aria-label', `${m.eVeri} ${i + 1}: ${veri[i]}`);
      b.classList.add('veri');
    });
    kodDugme.forEach((b, p) => {
      const tur = p === 0 ? m.eGenel : ESLIK_KONUM.includes(p) ? m.eEslik : m.eVeriKisa;
      b.innerHTML = `<span>${alinan[p]}</span><small>${p}</small>`;
      b.setAttribute('aria-label', `${m.eKod} ${p} (${tur}): ${alinan[p]}`);
      b.setAttribute('aria-pressed', String(hata.has(p)));
      b.className = `bit ${p === 0 || ESLIK_KONUM.includes(p) ? 'eslik' : 'veri'}${hata.has(p) ? ' hatali' : ''}`;
    });

    const sIkili = s.toString(2).padStart(4, '0');
    sendromEl.textContent = `${sIkili} (${s})`;
    genelEl.textContent = String(genel);

    let ileti: string;
    let sinif = 'iyi';
    if (s === 0 && genel === 0) ileti = m.mYok ?? '';
    else if (genel === 1) {
      const duzeltilmis = alinan.slice();
      duzeltilmis[s] ^= 1;
      ileti = (m.mTek ?? '').replace('{k}', String(s)).replace('{v}', VERI_KONUM.map((p) => duzeltilmis[p]).join(''));
      sinif = 'duzeltildi';
    } else {
      ileti = (m.mCift ?? '').replace('{s}', sIkili);
      sinif = 'kotu';
    }
    durum.textContent = uyari ? `${ileti} ${uyari}` : ileti;
    durum.dataset.sonuc = sinif;
  }
  ciz();
}
