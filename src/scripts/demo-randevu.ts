// Müsaitlik motoru gösterimi. Zaman, gece yarısından itibaren dakika olarak tutulur;
// çakışma denetimi tek satırdır: a.bas < b.bit && a.bit > b.bas
const kok = document.querySelector<HTMLElement>('[data-demo-randevu]');
if (kok) {
  type Aralik = { bas: number; bit: number };
  const ACILIS = 9 * 60;
  const KAPANIS = 20 * 60;
  const MOLA: Aralik = { bas: 13 * 60, bit: 14 * 60 };
  const ADIM = 15;
  const ORNEK: Aralik[] = [
    { bas: 9 * 60 + 30, bit: 10 * 60 },
    { bas: 10 * 60 + 45, bit: 11 * 60 + 30 },
    { bas: 15 * 60, bit: 15 * 60 + 45 },
    { bas: 17 * 60 + 15, bit: 17 * 60 + 30 },
  ];
  const m = kok.dataset;
  const serit = kok.querySelector<HTMLElement>('[data-serit]')!;
  const saatler = kok.querySelector<HTMLElement>('[data-saatler]')!;
  const durum = kok.querySelector<HTMLElement>('[data-durum]')!;
  const secenekler = [...kok.querySelectorAll<HTMLButtonElement>('.secenek')];
  let sure = Number(secenekler[0].dataset.sure);
  let benim: Aralik[] = [];
  let sonIleti = '';

  const cakisir = (a: Aralik, b: Aralik) => a.bas < b.bit && a.bit > b.bas;
  const saat = (dk: number) => `${String(Math.floor(dk / 60)).padStart(2, '0')}.${String(dk % 60).padStart(2, '0')}`;

  function ciz() {
    const dolu = [...ORNEK, ...benim];
    const yuzde = (dk: number) => ((dk - ACILIS) / (KAPANIS - ACILIS)) * 100;
    const parca = (a: Aralik, sinif: string) =>
      `<span class="${sinif}" style="left:${yuzde(a.bas)}%;width:${yuzde(a.bit) - yuzde(a.bas)}%"></span>`;
    const cizgiler = Array.from({ length: (KAPANIS - ACILIS) / 60 + 1 }, (_, i) => {
      const dk = ACILIS + i * 60;
      return `<i style="left:${yuzde(dk)}%"><b>${String(dk / 60).padStart(2, '0')}</b></i>`;
    }).join('');
    serit.innerHTML = cizgiler + parca(MOLA, 'mola') + ORNEK.map((a) => parca(a, 'dolu')).join('') + benim.map((a) => parca(a, 'bekleyen')).join('');

    const say = { musait: 0, dolu: 0, mola: 0, kapanis: 0, toplam: 0 };
    saatler.textContent = '';
    for (let bas = ACILIS; bas < KAPANIS; bas += ADIM) {
      const aday = { bas, bit: bas + sure };
      let neden = '';
      if (aday.bit > KAPANIS) neden = 'kapanis';
      else if (dolu.some((d) => cakisir(aday, d))) neden = 'dolu';
      else if (cakisir(aday, MOLA)) neden = 'mola';
      say.toplam++;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'saat';
      b.textContent = saat(bas);
      if (neden) {
        say[neden as 'dolu' | 'mola' | 'kapanis']++;
        b.disabled = true;
        const etiket = neden === 'dolu' ? m.eDolu : neden === 'mola' ? m.eMola : m.eKapanis;
        b.title = etiket ?? '';
        b.setAttribute('aria-label', `${saat(bas)}, ${etiket}`);
        b.dataset.neden = neden;
      } else {
        say.musait++;
        b.setAttribute('aria-label', `${saat(bas)} - ${saat(aday.bit)}`);
        b.addEventListener('click', () => {
          benim.push(aday);
          sonIleti = (m.mAlindi ?? '').replace('{s}', `${saat(aday.bas)} - ${saat(aday.bit)}`);
          ciz();
        });
      }
      saatler.append(b);
    }
    const ozet = (m.mOzet ?? '')
      .replace('{t}', String(say.toplam))
      .replace('{m}', String(say.musait))
      .replace('{d}', String(say.dolu))
      .replace('{o}', String(say.mola))
      .replace('{k}', String(say.kapanis));
    durum.textContent = sonIleti ? `${sonIleti} ${ozet}` : ozet;
  }

  for (const s of secenekler) {
    s.addEventListener('click', () => {
      sure = Number(s.dataset.sure);
      secenekler.forEach((x) => x.setAttribute('aria-pressed', String(x === s)));
      sonIleti = '';
      ciz();
    });
  }
  kok.querySelector('[data-sifirla]')!.addEventListener('click', () => {
    benim = [];
    sonIleti = '';
    ciz();
  });
  ciz();
}
