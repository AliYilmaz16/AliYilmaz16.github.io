// Hakkımda fotoğrafında nesne tespiti canlandırması: kare ızgaraya bölünür, hücreler sırayla taranır,
// birkaç aday kutu çıkar, en güçlüsü kalır (NMS) ve "ali 0.98" etiketi konur. Tamamen süs, gerçek bir model çalışmaz.
const kutu = document.querySelector<HTMLElement>('.foto-kutu');
if (kutu && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const S = 7;
  const m = kutu.dataset;
  const ekle = <K extends keyof HTMLElementTagNameMap>(tur: K, sinif: string, ust: HTMLElement = kutu) => { const e = document.createElement(tur); e.className = sinif; e.setAttribute('aria-hidden', 'true'); ust.append(e); return e; };
  const izgara = ekle('span', 'foto-izgara');
  const hucreler = Array.from({ length: S * S }, () => ekle('i', '', izgara));
  // Aday kutular: [üst, sağ, alt, sol] yüzde olarak ve güven değeri
  const adaylar = ([[4, 30, 34, 8, '0.41'], [20, 6, 8, 26, '0.67'], [12, 16, 20, 6, '0.83']] as const).map(([u, sa, a, so, g]) => {
    const e = ekle('span', 'foto-aday'); e.style.inset = `${u}% ${sa}% ${a}% ${so}%`;
    ekle('b', '', e).textContent = `ali ${g}`; return e;
  });
  const durum = ekle('span', 'foto-durum');
  // Son kutunun (CSS'teki .foto-tespit: üst %9, yan %12, alt %14) içinde kalan hücreler "nesne var" diye işaretli kalır.
  const icinde = (i: number) => { const x = ((i % S) + 0.5) / S, y = (Math.floor(i / S) + 0.5) / S; return x > 0.12 && x < 0.88 && y > 0.09 && y < 0.86; };
  const bekle = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let calisiyor = false;

  async function calistir() {
    if (calisiyor) return;
    calisiyor = true;
    kutu!.classList.add('analiz', 'tara');
    durum.textContent = m.mTara ?? '';
    for (let i = 0; i < hucreler.length; i++) {
      hucreler[i].className = 'yan';
      if (i) hucreler[i - 1].className = icinde(i - 1) ? 'dolu' : '';
      await bekle(26);
    }
    hucreler[hucreler.length - 1].className = '';
    await bekle(180);
    for (let i = 0; i < adaylar.length; i++) {
      adaylar[i].classList.add('gor');
      durum.textContent = (m.mAday ?? '').replace('{n}', String(i + 1));
      await bekle(260);
    }
    await bekle(420);
    // NMS: zayıf adaylar düşer, tek kutu kalır
    durum.textContent = m.mNms ?? '';
    adaylar[0].classList.remove('gor'); await bekle(170);
    adaylar[1].classList.remove('gor'); await bekle(170);
    adaylar[2].classList.remove('gor');
    kutu!.classList.remove('tara'); kutu!.classList.add('son');
    durum.textContent = m.mSon ?? '';
    await bekle(2600);
    kutu!.classList.remove('analiz', 'son');
    hucreler.forEach((h) => (h.className = ''));
    calisiyor = false;
  }
  // İlk kez görününce bir kez, sonra üstüne gelince ya da dokununca yeniden
  const gozcu = new IntersectionObserver(([g]) => { if (g.isIntersecting) { gozcu.disconnect(); setTimeout(calistir, 500); } }, { threshold: 0.7 });
  gozcu.observe(kutu);
  kutu.addEventListener('pointerenter', calistir);
  kutu.addEventListener('click', calistir);
}
