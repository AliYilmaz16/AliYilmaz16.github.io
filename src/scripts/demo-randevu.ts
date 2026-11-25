// Randevu gösterimi: müşteri ekranı ile berber paneli aynı takvimi paylaşır.
// Zaman, gece yarısından itibaren dakikadır. Çakışma denetimi: a.bas < b.bit && a.bit > b.bas
const kok = document.querySelector<HTMLElement>('[data-demo-randevu]');
if (kok) {
  type Hizmet = { ad: string; sure: number; ucret: number };
  type Randevu = { no: number; bas: number; bit: number; ad: string; hizmet: number; durum: 'onayli' | 'bekliyor'; benim?: boolean };
  const ACILIS = 9 * 60;
  const KAPANIS = 20 * 60;
  const MOLA = { bas: 13 * 60, bit: 14 * 60 };
  const ADIM = 15;
  const m = kok.dataset;
  const hizmetler: Hizmet[] = JSON.parse(m.hizmetler ?? '[]');
  const el = <T extends HTMLElement>(s: string) => kok.querySelector<T>(s)!;
  const serit = el('[data-serit]');
  const saatler = el('[data-saatler]');
  const musaitEl = el('[data-musait]');
  const benimEl = el('[data-benim]');
  const ozetEl = el('[data-ozet]');
  const listeEl = el('[data-liste]');
  const durum = el('[data-durum]');
  const secenekler = [...kok.querySelectorAll<HTMLButtonElement>('.secenek')];
  const lira = (n: number) => `${n.toLocaleString('tr-TR')} ₺`;
  const saat = (dk: number) => `${String(Math.floor(dk / 60)).padStart(2, '0')}.${String(dk % 60).padStart(2, '0')}`;
  const cakisir = (a: { bas: number; bit: number }, b: { bas: number; bit: number }) => a.bas < b.bit && a.bit > b.bas;

  let sayac = 0;
  const ornek = (): Randevu[] =>
    (
      [
        [9 * 60 + 30, 0, 'Emre', 'onayli'],
        [10 * 60 + 45, 2, 'Kerem', 'onayli'],
        [15 * 60, 2, 'Burak', 'onayli'],
        [17 * 60 + 15, 1, 'Mert', 'bekliyor'],
      ] as const
    ).map(([bas, h, ad, d]) => ({ no: ++sayac, bas, bit: bas + hizmetler[h].sure, ad, hizmet: h, durum: d }));
  let randevular = ornek();
  let secili = 0;
  let ileti = m.mBas ?? '';

  const dugme = (metin: string, sinif: string, tikla: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = sinif;
    b.textContent = metin;
    b.addEventListener('click', tikla);
    return b;
  };
  const doldur = (kalip: string | undefined, r: Randevu) =>
    (kalip ?? '').replace('{s}', `${saat(r.bas)} - ${saat(r.bit)}`).replace('{a}', r.ad);

  function ciz() {
    randevular.sort((a, b) => a.bas - b.bas);
    // Ortak takvim
    const yuzde = (dk: number) => ((dk - ACILIS) / (KAPANIS - ACILIS)) * 100;
    const parca = (a: { bas: number; bit: number }, sinif: string) => `<span class="${sinif}" style="left:${yuzde(a.bas)}%;width:${yuzde(a.bit) - yuzde(a.bas)}%"></span>`;
    serit.innerHTML =
      Array.from({ length: (KAPANIS - ACILIS) / 60 + 1 }, (_, i) => `<i style="left:${yuzde(ACILIS + i * 60)}%"><b>${String(9 + i).padStart(2, '0')}</b></i>`).join('') +
      parca(MOLA, 'mola') +
      randevular.map((r) => parca(r, r.durum === 'onayli' ? 'dolu' : 'bekleyen')).join('');

    // Müşteri: seçilen hizmet için müsait saatler
    const sure = hizmetler[secili].sure;
    const say = { musait: 0, dolu: 0, mola: 0, kapanis: 0 };
    saatler.textContent = '';
    for (let bas = ACILIS; bas < KAPANIS; bas += ADIM) {
      const aday = { bas, bit: bas + sure };
      if (aday.bit > KAPANIS) say.kapanis++;
      else if (randevular.some((r) => cakisir(aday, r))) say.dolu++;
      else if (cakisir(aday, MOLA)) say.mola++;
      else {
        say.musait++;
        const b = dugme(saat(bas), 'saat', () => {
          const r: Randevu = { no: ++sayac, ...aday, ad: m.sen ?? '', hizmet: secili, durum: 'bekliyor', benim: true };
          randevular.push(r);
          ileti = doldur(m.mAlindi, r);
          ciz();
        });
        b.setAttribute('aria-label', `${saat(bas)} - ${saat(aday.bit)}`);
        saatler.append(b);
      }
    }
    musaitEl.textContent = (m.mMusait ?? '').replace('{m}', String(say.musait)).replace('{d}', String(say.dolu)).replace('{o}', String(say.mola)).replace('{k}', String(say.kapanis));

    const benim = randevular.filter((r) => r.benim);
    benimEl.textContent = '';
    if (!benim.length) {
      const li = document.createElement('li');
      li.className = 'soluk';
      li.textContent = m.eYok ?? '';
      benimEl.append(li);
    }
    for (const r of benim) {
      const li = document.createElement('li');
      li.innerHTML = `<span>${saat(r.bas)} · ${hizmetler[r.hizmet].ad}</span><b class="rd-rozet ${r.durum}">${r.durum === 'onayli' ? m.eOnayli : m.eBekliyor}</b>`;
      benimEl.append(li);
    }

    // Berber paneli
    const onayli = randevular.filter((r) => r.durum === 'onayli');
    const bekleyen = randevular.length - onayli.length;
    ozetEl.innerHTML = `<div><dt>${m.eBugun}</dt><dd>${randevular.length}</dd></div><div><dt>${m.eBekleyen}</dt><dd>${bekleyen}</dd></div><div><dt>${m.eKazanc}</dt><dd>${lira(onayli.reduce((t, r) => t + hizmetler[r.hizmet].ucret, 0))}</dd></div>`;
    listeEl.textContent = '';
    for (const r of randevular) {
      const li = document.createElement('li');
      li.className = r.durum + (r.benim ? ' benim' : '');
      li.innerHTML = `<span class="rd-saat">${saat(r.bas)}</span><span class="rd-kim"><b>${r.ad}</b><small>${hizmetler[r.hizmet].ad} · ${lira(hizmetler[r.hizmet].ucret)}</small></span>`;
      if (r.durum === 'bekliyor') {
        const kutu = document.createElement('span');
        kutu.className = 'rd-islem';
        const onay = dugme(m.eOnayla ?? '', 'rd-onay', () => {
          r.durum = 'onayli';
          ileti = doldur(m.mOnay, r);
          ciz();
        });
        onay.setAttribute('aria-label', `${m.eOnayla}: ${r.ad}, ${saat(r.bas)}`);
        const red = dugme(m.eReddet ?? '', 'rd-red', () => {
          randevular = randevular.filter((x) => x !== r);
          ileti = doldur(m.mRed, r);
          ciz();
        });
        red.setAttribute('aria-label', `${m.eReddet}: ${r.ad}, ${saat(r.bas)}`);
        kutu.append(onay, red);
        li.append(kutu);
      } else {
        const rozet = document.createElement('b');
        rozet.className = 'rd-rozet onayli';
        rozet.textContent = m.eOnayli ?? '';
        li.append(rozet);
      }
      listeEl.append(li);
    }
    durum.textContent = ileti;
  }

  for (const s of secenekler) {
    s.addEventListener('click', () => {
      secili = Number(s.dataset.hizmet);
      secenekler.forEach((x) => x.setAttribute('aria-pressed', String(x === s)));
      ciz();
    });
  }
  el('[data-sifirla]').addEventListener('click', () => {
    randevular = ornek();
    ileti = m.mBas ?? '';
    ciz();
  });
  ciz();
}
