// Sitenin bütün etkileşimleri. Betik çalışmasa da içerik okunur; burada yalnızca
// kolaylıklar var: belirme hareketi, menü vurgusu, tema, dil, süzgeç, komut paleti,
// GitHub'dan canlı liste, klavye kısayolları.

const kok = document.documentElement;
const govde = document.body;
const dil = (govde.dataset.dil ?? 'tr') as 'tr' | 'en';
const $ = <T extends Element = HTMLElement>(s: string, e: ParentNode = document) => e.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, e: ParentNode = document) => [...e.querySelectorAll<T>(s)];
const hareketVar = () => kok.classList.contains('anim');
const yaziAlani = (e: EventTarget | null) =>
  e instanceof HTMLElement && (e.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.tagName));

/* ── 1. Belirme: öğe görüş alanına girince bir kez belirir ─────────────────── */
function belirmeKur(kapsam: ParentNode = document) {
  const ogeler = $$('[data-belir]:not(.gorundu)', kapsam);
  if (!hareketVar()) {
    ogeler.forEach((o) => o.classList.add('gorundu'));
    return;
  }
  const izleyici = new IntersectionObserver(
    (kayitlar) => {
      for (const k of kayitlar) {
        if (!k.isIntersecting) continue;
        k.target.classList.add('gorundu');
        izleyici.unobserve(k.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  ogeler.forEach((o) => izleyici.observe(o));
}
belirmeKur();
(window as any).__hazir = true;

/* ── 2. Menü: bulunulan bölümü göster ──────────────────────────────────────── */
let suankiBolum: HTMLElement | null = null;
const bolumler = $$('main > section[id]');
if (govde.dataset.sayfa === 'ana' && 'IntersectionObserver' in window) {
  const baglar = $$<HTMLAnchorElement>('.menu a[data-bolum]');
  const izleyici = new IntersectionObserver(
    (kayitlar) => {
      for (const k of kayitlar) {
        if (!k.isIntersecting) continue;
        suankiBolum = k.target as HTMLElement;
        for (const b of baglar) {
          if (b.dataset.bolum === suankiBolum.id) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        }
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  bolumler.forEach((b) => izleyici.observe(b));
}

// Mobil menü: bağlantıya basınca ya da dışarı tıklayınca kapanır.
const mobilMenu = $<HTMLDetailsElement>('.mobil-menu');
if (mobilMenu) {
  mobilMenu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) mobilMenu.open = false;
  });
  document.addEventListener('click', (e) => {
    if (mobilMenu.open && !mobilMenu.contains(e.target as Node)) mobilMenu.open = false;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobilMenu.open) {
      mobilMenu.open = false;
      $('summary', mobilMenu)?.focus();
    }
  });
}

/* ── 3. Tema ───────────────────────────────────────────────────────────────── */
function temaDegistir() {
  const simdiki = kok.dataset.theme ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const yeni = simdiki === 'dark' ? 'light' : 'dark';
  kok.dataset.theme = yeni;
  try {
    localStorage.setItem('tema', yeni);
  } catch {}
  document.dispatchEvent(new CustomEvent('tema'));
}
$$('[data-tema]').forEach((d) => d.addEventListener('click', temaDegistir));

/* ── 4. Dil: bulunulan bölüm korunur ───────────────────────────────────────── */
function dilAdresi(bag: HTMLAnchorElement) {
  // Tıklama anındaki konuma bak: görüş alanının üst kısmındaki bölüm hangisi?
  const cizgi = innerHeight * 0.4;
  const bulunan = bolumler.find((b) => {
    const r = b.getBoundingClientRect();
    return r.top <= cizgi && r.bottom > cizgi;
  });
  const karsi = (bulunan ?? suankiBolum)?.dataset.karsi;
  const u = new URL(bag.getAttribute('href')!, location.href);
  u.hash = karsi ? `#${karsi}` : '';
  return u.pathname + u.hash;
}
$$<HTMLAnchorElement>('[data-dil-degistir], [data-komut="dil"]').forEach((bag) => {
  bag.addEventListener('click', () => {
    if (govde.dataset.sayfa === 'ana') bag.setAttribute('href', dilAdresi(bag));
  });
});

/* ── 5. Proje süzgeci ──────────────────────────────────────────────────────── */
const suzgec = $('[data-suzgec]');
if (suzgec) {
  const dugmeler = $$<HTMLButtonElement>('button', suzgec);
  const uygula = (alan: string) => {
    dugmeler.forEach((d) => d.setAttribute('aria-pressed', String((d.dataset.alan ?? '') === alan)));
    let kartSayisi = 0;
    let digerSayisi = 0;
    for (const o of $$('[data-kartlar] > li, .diger-liste > li')) {
      const uyar = !alan || o.dataset.alan === alan;
      o.hidden = !uyar;
      if (uyar) {
        o.classList.add('gorundu');
        if (o.closest('.diger-liste')) digerSayisi++;
        else kartSayisi++;
      }
    }
    const kartlar = $('[data-kartlar]');
    if (kartlar) kartlar.hidden = kartSayisi === 0;
    const diger = $('[data-diger]');
    if (diger) diger.hidden = digerSayisi === 0;
    const bos = $('[data-suzgec-bos]');
    if (bos) bos.hidden = kartSayisi + digerSayisi > 0;
  };
  suzgec.addEventListener('click', (e) => {
    const d = (e.target as HTMLElement).closest('button');
    if (d) uygula(d.dataset.alan ?? '');
  });
}

/* ── 6. Komut paleti ───────────────────────────────────────────────────────── */
const palet = $<HTMLDialogElement>('[data-palet]');
if (palet && typeof palet.showModal === 'function') {
  const girdi = $<HTMLInputElement>('input', palet)!;
  const satirlar = $$<HTMLLIElement>('li', palet);
  const bos = $('.palet-bos', palet)!;
  const duz = (s: string) => s.toLocaleLowerCase(dil).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  let secili = 0;
  const gorunen = () => satirlar.filter((s) => !s.hidden);
  const sec = (i: number) => {
    const g = gorunen();
    secili = g.length ? (i + g.length) % g.length : 0;
    satirlar.forEach((s) => s.setAttribute('aria-selected', 'false'));
    g[secili]?.setAttribute('aria-selected', 'true');
    g[secili]?.scrollIntoView({ block: 'nearest' });
  };
  const suz = () => {
    const q = duz(girdi.value.trim());
    for (const s of satirlar) {
      const a = $('a', s)!;
      s.hidden = !!q && !duz(`${a.textContent} ${a.dataset.ara ?? ''}`).includes(q);
    }
    bos.hidden = gorunen().length > 0;
    sec(0);
  };
  const ac = () => {
    if (palet.open) return;
    girdi.value = '';
    suz();
    palet.showModal();
    girdi.focus();
  };
  const calistir = (a: HTMLAnchorElement, olay?: Event) => {
    const komut = a.dataset.komut;
    if (komut === 'tema') {
      olay?.preventDefault();
      temaDegistir();
      palet.close();
    } else if (komut === 'yazdir') {
      olay?.preventDefault();
      palet.close();
      setTimeout(() => window.print(), 50);
    } else {
      palet.close();
      if (!olay) a.click();
    }
  };
  $$('[data-palet-ac]').forEach((d) => d.addEventListener('click', ac));
  $('[data-palet-kapat]', palet)?.addEventListener('click', () => palet.close());
  girdi.addEventListener('input', suz);
  palet.addEventListener('click', (e) => {
    if (e.target === palet) return palet.close(); // arka plana tıklama
    const a = (e.target as HTMLElement).closest('a');
    if (a) calistir(a as HTMLAnchorElement, e);
  });
  palet.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), sec(secili + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), sec(secili - 1));
    else if (e.key === 'Enter') {
      e.preventDefault();
      const a = $<HTMLAnchorElement>('a', gorunen()[secili]);
      if (a) calistir(a);
    }
  });
  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if ((k === 'k' && (e.metaKey || e.ctrlKey)) || (k === '/' && !yaziAlani(e.target) && !palet.open)) {
      e.preventDefault();
      palet.open ? palet.close() : ac();
    }
  });
}

/* ── 7. Öteki projeler: GitHub'dan son güncelleme ve yeni depolar ──────────── */
const digerListe = $('.diger-liste[data-github]');
if (digerListe?.dataset.github) {
  type Depo = { name: string; description: string | null; html_url: string; pushed_at: string; fork: boolean };
  const ANAHTAR = 'gh-depolar';
  const SURE = 6 * 60 * 60 * 1000;
  const bicim = new Intl.DateTimeFormat(dil === 'tr' ? 'tr-TR' : 'en-GB', { month: 'short', year: 'numeric' });
  const yaz = (depolar: Depo[]) => {
    const etiket = digerListe.dataset.etiketGuncelleme ?? '';
    const gizli = new Set((digerListe.dataset.gizli ?? '').split(','));
    for (const li of $$('li[data-depo]', digerListe)) {
      const d = depolar.find((x) => x.name === li.dataset.depo);
      const hedef = $('[data-tarih]', li);
      if (d && hedef) hedef.textContent = `${etiket}: ${bicim.format(new Date(d.pushed_at))}`;
    }
    // İçerik dosyasında olmayan, açıklaması yazılmış yeni depolar listeye eklenir.
    for (const d of depolar) {
      if (d.fork || !d.description || gizli.has(d.name) || $(`li[data-depo="${CSS.escape(d.name)}"]`, digerListe)) continue;
      const li = document.createElement('li');
      li.dataset.depo = d.name;
      li.dataset.alan = '';
      li.className = 'gorundu';
      const a = document.createElement('a');
      a.href = d.html_url;
      for (const [sinif, metin] of [
        ['diger-ad', d.name.replace(/-/g, ' ')],
        ['diger-alan', 'GitHub'],
        ['diger-aciklama', d.description],
        ['diger-tarih', `${etiket}: ${bicim.format(new Date(d.pushed_at))}`],
      ]) {
        const s = document.createElement('span');
        s.className = sinif;
        s.textContent = metin;
        a.append(s);
      }
      li.append(a);
      digerListe.append(li);
    }
  };
  const getir = async () => {
    try {
      const kayit = JSON.parse(localStorage.getItem(ANAHTAR) ?? 'null');
      if (kayit && Date.now() - kayit.t < SURE) return yaz(kayit.v);
    } catch {}
    try {
      const y = await fetch(`https://api.github.com/users/${digerListe.dataset.github}/repos?per_page=100&sort=pushed`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!y.ok) return; // istek sınırı ya da hata: içerik dosyasındaki liste olduğu gibi kalır
      const v: Depo[] = (await y.json()).map((d: Depo) => ({
        name: d.name,
        description: d.description,
        html_url: d.html_url,
        pushed_at: d.pushed_at,
        fork: d.fork,
      }));
      try {
        localStorage.setItem(ANAHTAR, JSON.stringify({ t: Date.now(), v }));
      } catch {}
      yaz(v);
    } catch {}
  };
  if ('IntersectionObserver' in window) {
    const iz = new IntersectionObserver(
      (k) => {
        if (k.some((x) => x.isIntersecting)) {
          iz.disconnect();
          getir();
        }
      },
      { rootMargin: '600px' },
    );
    iz.observe(digerListe);
  } else getir();
}

/* ── 8. İlerleme çubuğu ve zaman çizgisi: CSS desteği yoksa betikle ────────── */
if (hareketVar() && !CSS.supports('animation-timeline: scroll()')) {
  kok.classList.add('kaydirma-yedek');
  const cubuk = $('.ilerleme span');
  const cizgiler = $$('[data-cizgi]');
  let bekliyor = false;
  const guncelle = () => {
    bekliyor = false;
    const boy = kok.scrollHeight - innerHeight;
    cubuk?.style.setProperty('--p', String(boy > 0 ? Math.min(1, scrollY / boy) : 0));
    for (const c of cizgiler) {
      const r = c.getBoundingClientRect();
      const d = (innerHeight * 0.62 - r.top) / r.height;
      c.style.setProperty('--dolum', String(Math.max(0, Math.min(1, d))));
    }
  };
  addEventListener('scroll', () => {
    if (!bekliyor) {
      bekliyor = true;
      requestAnimationFrame(guncelle);
    }
  }, { passive: true });
  addEventListener('resize', guncelle);
  guncelle();
}

/* ── 9. Yazdırma ───────────────────────────────────────────────────────────── */
$$('[data-yazdir]').forEach((d) => d.addEventListener('click', () => window.print()));

/* ── 10. Proje sayfası: ok tuşları, Esc, geri dönüş ────────────────────────── */
const projeSayfasi = $('[data-proje-sayfasi]');
if (projeSayfasi) {
  const { geri, onceki, sonraki, kimlik } = projeSayfasi.dataset;
  let listedenGeldi = false;
  try {
    listedenGeldi = sessionStorage.getItem('acilan') === kimlik;
    sessionStorage.setItem('sonProje', kimlik!);
  } catch {}
  const listeyeDon = (e?: Event) => {
    // Karttan açıldıysa tarayıcının geri tuşu gibi davran: ziyaretçi kaldığı yere döner.
    if (listedenGeldi && history.length > 1) {
      e?.preventDefault();
      history.back();
    } else if (!e) location.href = geri!;
  };
  $('[data-geri-bag]', projeSayfasi)?.addEventListener('click', listeyeDon);
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || yaziAlani(e.target) || palet?.open) return;
    if (e.target instanceof HTMLMediaElement) return;
    if (e.key === 'Escape') listeyeDon();
    else if (e.key === 'ArrowRight') location.href = sonraki!;
    else if (e.key === 'ArrowLeft') location.href = onceki!;
  });
}

/* ── 11. Ana sayfa: açılan kartı hatırla, dönünce odağı karta ver ──────────── */
if (govde.dataset.sayfa === 'ana') {
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-proje]');
    if (!a) return;
    try {
      sessionStorage.setItem('acilan', a.dataset.proje!);
    } catch {}
  });
  addEventListener('pageshow', () => {
    let son: string | null = null;
    try {
      son = sessionStorage.getItem('sonProje');
      sessionStorage.removeItem('sonProje');
    } catch {}
    const hedef = son ?? (location.hash.startsWith('#kart-') ? location.hash.slice(6) : null);
    if (!hedef) return;
    const kart = document.getElementById(`kart-${hedef}`);
    kart?.classList.add('gorundu');
    $<HTMLAnchorElement>('a[data-proje]', kart ?? undefined)?.focus({ preventScroll: !location.hash.startsWith('#kart-') });
  });
}
