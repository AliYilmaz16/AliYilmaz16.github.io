// İSG Guard benzetimi: çalışanın konumu tehlikeli bölgelerle karşılaştırılır, olaylar yönetici paneline düşer.
const kok = document.querySelector<HTMLElement>('[data-demo-isg]');
if (kok) {
  const m = kok.dataset;
  const saha = kok.querySelector<HTMLElement>('[data-saha]')!;
  const isci = kok.querySelector<HTMLButtonElement>('[data-isci]')!;
  const konumEl = kok.querySelector<HTMLElement>('[data-konum]')!;
  const alarmlar = kok.querySelector<HTMLElement>('[data-alarmlar]')!;
  const bolgeler = [...kok.querySelectorAll<HTMLElement>('[data-bolge]')];
  let x = 18;
  let y = 24;
  let icinde: string | null = null;
  const kayit: { saat: string; metin: string; risk: 'yuksek' | 'orta' | 'bilgi' }[] = [];

  const simdi = () => new Date().toLocaleTimeString('tr-TR');
  function alarm(metin: string, risk: 'yuksek' | 'orta' | 'bilgi') {
    kayit.unshift({ saat: simdi(), metin, risk });
    kayit.length = Math.min(kayit.length, 6);
    listele();
  }
  function listele() {
    const etiket = { yuksek: m.eYuksek, orta: m.eOrta, bilgi: m.eBilgi };
    alarmlar.innerHTML = kayit.length
      ? kayit.map((k) => `<li class="${k.risk}"><time>${k.saat}</time><span>${k.metin}</span><b>${etiket[k.risk]}</b></li>`).join('')
      : `<li class="bos">${m.eBos}</li>`;
  }

  function yerlestir() {
    x = Math.max(4, Math.min(96, x));
    y = Math.max(6, Math.min(94, y));
    isci.style.left = `${x}%`;
    isci.style.top = `${y}%`;
    // Bölgeler daire: merkez ve yarıçap sahanın genişliğine göre piksele çevrilir.
    const kutu = saha.getBoundingClientRect();
    const px = (x / 100) * kutu.width;
    const py = (y / 100) * kutu.height;
    let bulunan: string | null = null;
    for (const b of bolgeler) {
      const r = b.getBoundingClientRect();
      const mx = r.left - kutu.left + r.width / 2;
      const my = r.top - kutu.top + r.height / 2;
      if (Math.hypot(px - mx, py - my) <= r.width / 2) bulunan = b.dataset.bolge ?? null;
    }
    if (bulunan !== icinde) {
      if (icinde) alarm((m.mCikis ?? '').replace('{b}', icinde), 'bilgi');
      if (bulunan) alarm((m.mGiris ?? '').replace('{b}', bulunan), 'yuksek');
      icinde = bulunan;
    }
    isci.classList.toggle('tehlikede', !!icinde);
    for (const b of bolgeler) b.classList.toggle('etkin', b.dataset.bolge === icinde);
    konumEl.textContent = (icinde ? m.eTehlike : m.eGuvenli) ?? '';
    konumEl.dataset.durum = icinde ? 'tehlike' : 'guvenli';
  }

  const tasi = (e: PointerEvent) => {
    const kutu = saha.getBoundingClientRect();
    x = ((e.clientX - kutu.left) / kutu.width) * 100;
    y = ((e.clientY - kutu.top) / kutu.height) * 100;
    yerlestir();
  };
  let suruklenen = false;
  isci.addEventListener('pointerdown', (e) => {
    suruklenen = true;
    isci.setPointerCapture(e.pointerId);
  });
  isci.addEventListener('pointermove', (e) => suruklenen && tasi(e));
  const birak = () => (suruklenen = false);
  isci.addEventListener('pointerup', birak);
  isci.addEventListener('pointercancel', birak);
  saha.addEventListener('click', (e) => e.target !== isci && tasi(e as PointerEvent));
  isci.addEventListener('keydown', (e) => {
    const adim: Record<string, [number, number]> = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] };
    const a = adim[e.key];
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    x += a[0];
    y += a[1];
    yerlestir();
  });
  kok.querySelector('[data-dusme]')!.addEventListener('click', () => {
    isci.classList.remove('sarsil');
    void isci.offsetWidth;
    isci.classList.add('sarsil');
    alarm(m.mDusme ?? '', 'yuksek');
  });
  kok.querySelector('[data-gurultu]')!.addEventListener('click', () => alarm((m.mGurultu ?? '').replace('{d}', String(90 + Math.floor(Math.random() * 15))), 'orta'));
  new ResizeObserver(yerlestir).observe(saha);
  listele();
  yerlestir();
}
