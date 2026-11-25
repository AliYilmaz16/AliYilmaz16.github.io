// Yetenek ve proje ağı: bir yeteneğin üstüne gelince kullanıldığı projeler yanar ve çizgiyle bağlanır.
// Proje adının üstüne gelince tersine, o projede kullanılan yetenekler yanar.
const ag = document.querySelector<HTMLElement>('[data-ag]');
if (ag) {
  const svg = ag.querySelector<SVGSVGElement>('svg')!;
  const yetenekler = [...ag.querySelectorAll<HTMLElement>('[data-yp]')];
  const projeler = [...ag.querySelectorAll<HTMLElement>('[data-ag-proje]')];
  const azalt = matchMedia('(prefers-reduced-motion: reduce)');
  let sabit: HTMLElement | null = null;

  const temizle = () => {
    ag.classList.remove('secili');
    for (const e of [...yetenekler, ...projeler]) e.classList.remove('yanik');
    svg.textContent = '';
  };
  function goster(kaynak: HTMLElement) {
    temizle();
    const yetenekMi = kaynak.hasAttribute('data-yp');
    const eslesen = yetenekMi
      ? projeler.filter((p) => kaynak.dataset.yp!.split(',').includes(p.dataset.agProje!))
      : yetenekler.filter((y) => y.dataset.yp!.split(',').includes(kaynak.dataset.agProje!));
    if (!eslesen.length) return;
    ag.classList.add('secili');
    kaynak.classList.add('yanik');
    const kutu = ag.getBoundingClientRect();
    const orta = (e: HTMLElement) => { const r = e.getBoundingClientRect(); return { x: r.left - kutu.left + r.width / 2, y: r.top - kutu.top + r.height / 2, r }; };
    const a = orta(kaynak);
    eslesen.forEach((h, i) => {
      h.classList.add('yanik');
      const b = orta(h);
      // Yan yanaysa kenardan kenara yatay, alt altaysa dikey eğri
      const yatay = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
      const [x1, y1, x2, y2] = yatay
        ? [a.x + (Math.sign(b.x - a.x) * a.r.width) / 2, a.y, b.x - (Math.sign(b.x - a.x) * b.r.width) / 2, b.y]
        : [a.x, a.y + (Math.sign(b.y - a.y) * a.r.height) / 2, b.x, b.y - (Math.sign(b.y - a.y) * b.r.height) / 2];
      const yol = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      yol.setAttribute('d', yatay ? `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}` : `M${x1} ${y1} C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`);
      yol.setAttribute('pathLength', '1');
      if (!azalt.matches) yol.style.animationDelay = `${i * 50}ms`;
      svg.append(yol);
    });
  }
  for (const e of [...yetenekler, ...projeler]) {
    e.addEventListener('pointerenter', (o) => o.pointerType !== 'touch' && goster(e));
    e.addEventListener('pointerleave', (o) => o.pointerType !== 'touch' && (sabit ? goster(sabit) : temizle()));
    e.addEventListener('focus', () => goster(e));
    e.addEventListener('blur', () => (sabit ? goster(sabit) : temizle()));
  }
  // Dokunmatikte ve klavyede: yeteneğe basınca seçim sabitlenir, yeniden basınca kalkar.
  for (const y of yetenekler) {
    const sec = () => { sabit = sabit === y ? null : y; yetenekler.forEach((x) => x.setAttribute('aria-pressed', String(x === sabit))); sabit ? goster(sabit) : temizle(); };
    y.addEventListener('click', sec);
  }
  addEventListener('resize', () => (sabit ? goster(sabit) : temizle()));
}
