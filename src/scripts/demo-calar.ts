// Müzik çalar örneği: üç kısa ezgi Web Audio ile üretilir. Duraklatma, asıl projedeki süreç sinyali gibi
// ses bağlamını askıya alır (zaman da durur). Parça bitince sıradakine geçer.
const kok = document.querySelector<HTMLElement>('[data-demo-calar]');
if (kok) {
  const m = kok.dataset;
  const adlar: string[] = JSON.parse(m.parcalar ?? '[]');
  const el = <T extends HTMLElement>(s: string) => kok.querySelector<T>(s)!;
  const cubuklar = [...el('[data-cubuklar]').children] as HTMLElement[];
  const tui = el('[data-tui]'), gui = el('[data-gui]');
  const durumEl = el('[data-durum]'), zamanEl = el('[data-zaman]'), ilerleme = el('[data-ilerleme]');
  const calDugme = el<HTMLButtonElement>('[data-cal]');
  const ses = el<HTMLInputElement>('[data-ses]');
  const satirlar = [...kok.querySelectorAll<HTMLButtonElement>('[data-parca]')];

  // Ezgiler: [gam derecesi, vuruş] çiftleri. Dereceler aşağıdaki gamlara göre frekansa çevrilir.
  type Parca = { dalga: OscillatorType; vurus: number; kok: number; gam: number[]; notalar: [number, number][] };
  const tekrar = (kalip: number[], kez: number, kaydir: number[]) => kaydir.slice(0, kez).flatMap((k) => kalip.map((d) => [d + k, 1] as [number, number]));
  const parcalar: Parca[] = [
    { dalga: 'triangle', vurus: 0.22, kok: 261.63, gam: [0, 2, 4, 5, 7, 9, 11], notalar: [...tekrar([0, 2, 4, 7, 4, 2], 8, [0, 3, 4, 0, 5, 3, 4, 0]), [0, 4]] },
    { dalga: 'sine', vurus: 0.3, kok: 220, gam: [0, 3, 5, 7, 10], notalar: [...tekrar([0, 2, 3, 2, 4, 3, 1, 0], 5, [0, 1, 0, 2, 0]), [0, 4]] },
    { dalga: 'sawtooth', vurus: 0.62, kok: 146.83, gam: [0, 2, 3, 5, 7, 8, 10], notalar: [[0, 2], [4, 2], [2, 2], [5, 2], [3, 2], [6, 2], [4, 2], [7, 3], [4, 2], [2, 2], [0, 4]] },
  ];
  const sureler = parcalar.map((p) => p.notalar.reduce((t, [, v]) => t + v, 0) * p.vurus + 0.4);
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  kok.querySelectorAll<HTMLElement>('[data-sure]').forEach((e, i) => (e.textContent = mmss(sureler[i])));

  let ctx: AudioContext | null = null, ana: GainNode, cozumleyici: AnalyserNode, veri: Uint8Array<ArrayBuffer>;
  let sesler: OscillatorNode[] = [];
  let secili = 0, durum: 'durdu' | 'caliyor' | 'durakladi' = 'durdu', baslangic = 0, gorunum: 'gui' | 'tui' = 'gui', kare = 0;

  function hazirla() {
    if (ctx) return;
    ctx = new AudioContext();
    ana = ctx.createGain(); cozumleyici = ctx.createAnalyser();
    cozumleyici.fftSize = 128; veri = new Uint8Array(cozumleyici.frequencyBinCount);
    ana.gain.value = (Number(ses.value) / 100) ** 2 * 0.5;
    ana.connect(cozumleyici).connect(ctx.destination);
  }
  function sustur() { for (const o of sesler) { try { o.stop(); } catch {} o.disconnect(); } sesler = []; }
  function cal(i: number) {
    hazirla(); sustur();
    secili = (i + parcalar.length) % parcalar.length;
    const p = parcalar[secili]; let t = ctx!.currentTime + 0.06; baslangic = t;
    for (const [derece, vurus] of p.notalar) {
      const oktav = Math.floor(derece / p.gam.length), yarim = p.gam[((derece % p.gam.length) + p.gam.length) % p.gam.length] + oktav * 12;
      const o = ctx!.createOscillator(), g = ctx!.createGain(), uz = vurus * p.vurus;
      o.type = p.dalga; o.frequency.value = p.kok * 2 ** (yarim / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p.dalga === 'sawtooth' ? 0.22 : 0.5, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + uz * 0.96);
      o.connect(g).connect(ana); o.start(t); o.stop(t + uz); sesler.push(o);
      t += uz;
    }
    durum = 'caliyor'; void ctx!.resume(); ciz(); dongu();
  }
  const gecen = () => (ctx && durum !== 'durdu' ? Math.max(0, ctx.currentTime - baslangic) : 0);
  function duraklat() { if (durum === 'caliyor') { void ctx!.suspend(); durum = 'durakladi'; } else if (durum === 'durakladi') { void ctx!.resume(); durum = 'caliyor'; dongu(); } else cal(secili); ciz(); }
  function dur() { sustur(); durum = 'durdu'; ciz(); }

  function ciz() {
    const s = gecen(), top = sureler[secili];
    durumEl.textContent = `${durum === 'caliyor' ? m.eCaliyor : durum === 'durakladi' ? m.eDurakladi : m.eDurdu}: ${adlar[secili]}`;
    zamanEl.textContent = `${mmss(s)} / ${mmss(top)}`;
    ilerleme.style.transform = `scaleX(${Math.min(1, s / top)})`;
    calDugme.textContent = durum === 'caliyor' ? '⏸' : '▶';
    calDugme.setAttribute('aria-label', (durum === 'caliyor' ? m.eDuraklat : m.eCal) ?? '');
    satirlar.forEach((b, i) => b.setAttribute('aria-current', String(i === secili)));
    if (gorunum === 'tui') {
      const dolu = Math.round(Math.min(1, s / top) * 28);
      const satir = (x: string) => `│ ${x.padEnd(38)} │`;
      tui.textContent = [
        `┌${'─'.repeat(14)} ${m.eListe} ${'─'.repeat(Math.max(0, 24 - (m.eListe ?? '').length))}┐`,
        ...adlar.map((a, i) => satir(`${i === secili ? (durum === 'caliyor' ? '▶' : durum === 'durakladi' ? '‖' : '■') : ' '} ${i + 1}  ${a.padEnd(22)} ${mmss(sureler[i])}`)),
        satir(''),
        satir(`[${'#'.repeat(dolu)}${'.'.repeat(28 - dolu)}] ${mmss(s)}`),
        satir(`${m.eSecim}: _`),
        `└${'─'.repeat(40)}┘`,
      ].join('\n');
    }
  }
  function dongu() {
    cancelAnimationFrame(kare);
    const adim = () => {
      if (durum === 'caliyor' && gecen() >= sureler[secili]) { cal(secili + 1); return; } // bitince sıradaki
      if (ctx) {
        cozumleyici.getByteFrequencyData(veri);
        cubuklar.forEach((c, i) => (c.style.transform = `scaleY(${durum === 'caliyor' ? Math.max(0.04, (veri[i + 1] / 255) ** 1.4) : 0.04})`));
      }
      ciz();
      if (durum === 'caliyor') kare = requestAnimationFrame(adim);
    };
    kare = requestAnimationFrame(adim);
  }

  calDugme.addEventListener('click', duraklat);
  el('[data-dur]').addEventListener('click', dur);
  el('[data-sonraki]').addEventListener('click', () => (durum === 'durdu' ? ((secili = (secili + 1) % parcalar.length), ciz()) : cal(secili + 1)));
  el('[data-onceki]').addEventListener('click', () => (durum === 'durdu' ? ((secili = (secili + parcalar.length - 1) % parcalar.length), ciz()) : cal(secili - 1)));
  satirlar.forEach((b, i) => b.addEventListener('click', () => cal(i)));
  ses.addEventListener('input', () => { if (ctx) ana.gain.value = (Number(ses.value) / 100) ** 2 * 0.5; });
  kok.querySelectorAll<HTMLButtonElement>('[data-gorunum]').forEach((b) => b.addEventListener('click', () => {
    gorunum = b.dataset.gorunum as 'gui' | 'tui';
    kok.querySelectorAll('[data-gorunum]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    gui.hidden = gorunum !== 'gui'; tui.hidden = gorunum !== 'tui'; ciz();
  }));
  // Ekrandan çıkınca ya da sekme gizlenince çalmayı duraklat: ziyaretçi kaynağını bulamadığı bir sesle kalmasın.
  const sus = () => { if (durum === 'caliyor') duraklat(); };
  new IntersectionObserver(([g]) => !g.isIntersecting && sus()).observe(kok);
  document.addEventListener('visibilitychange', () => document.hidden && sus());
  addEventListener('pagehide', dur);
  ciz();
}
