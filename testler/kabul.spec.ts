// MTS-PRJ-2026-014, 10. bölümdeki kabul denemeleri (D1-D9, D12).
// D10 (sayfa denetim aracı) araclar/lighthouse.mjs, D11 araclar/d11.mjs ile yapılır.
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const KANIT = process.env.TABAN ? 'docs/kanit/canli' : 'docs/kanit';
const TABAN = new URL(process.env.TABAN ?? 'http://127.0.0.1:4321').origin;
const sayfalar = ['/', '/en/', '/proje/balon-takip/', '/en/project/isg-guard/'];
const cek = async (page: Page, ad: string, tam = false) => {
  const proje = test.info().project.name;
  await page.screenshot({ path: path.join(KANIT, `${ad}-${proje}.jpg`), fullPage: tam, type: "jpeg", quality: 70 });
};
const tasma = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const sonaKaydir = async (page: Page) => {
  // Fare tekeriyle adım adım, ziyaretçi gibi kaydır.
  const adimlar: number[] = [];
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(110);
    const y = await page.evaluate(() => Math.round(scrollY));
    adimlar.push(y);
    if (await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
  }
  return adimlar;
};

test.describe('D1 telefon genişliği', () => {
  for (const gen of [320, 390, 768, 1024, 1440]) {
    test(`${gen}px: yatay kaydırma yok`, async ({ page }) => {
      await page.setViewportSize({ width: gen, height: 800 });
      for (const yol of sayfalar) {
        await page.goto(yol);
        expect(await tasma(page), `${yol} @${gen}`).toBeLessThanOrEqual(0);
        // Görüş alanından taşan öğe var mı?
        const tasan = await page.evaluate(() =>
          [...document.querySelectorAll('main *, header *')]
            .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed'; })
            .map((e) => e.tagName + '.' + e.className).slice(0, 5));
        expect(tasan, `${yol} @${gen} taşan öğeler`).toEqual([]);
      }
    });
  }
  test('390px: düğmelere parmakla basılabiliyor (en az 44px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const kucuk = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.dugme, .dugme-ikon, .dil, .mobil-menu summary, .suzgec button, .geri a')]
        .filter((e) => e.offsetParent !== null)
        .map((e) => ({ ad: e.className + ':' + (e.textContent || '').trim().slice(0, 20), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }))
        .filter((e) => e.h < 44 || e.w < 44));
    expect(kucuk).toEqual([]);
    await cek(page, 'D1-telefon');
    // mobil menü açılıyor ve bölüme götürüyor
    await page.locator('.mobil-menu summary').click();
    await page.locator('.mobil-menu a').nth(1).click();
    await expect(page).toHaveURL(/#projeler$/);
  });
});

test('D2 baştan sona kaydırma: kartlar ve zaman çizgisi sırayla beliriyor, kaydırma takılmıyor', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'mouse.wheel Playwright WebKit masaüstünde güvenilir değil; elle kaydırma D2-webkit testinde');
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.classList.contains('anim'))).toBe(true);
  // Başlangıçta aşağıdaki kartlar gizli
  const basta = await page.evaluate(() => [...document.querySelectorAll('.kart')].map((k) => k.classList.contains('gorundu')));
  expect(basta.every((x) => !x)).toBe(true);
  const sira: string[] = [];
  await page.exposeFunction('belirdi', (id: string) => { sira.push(id); });
  await page.evaluate(() => {
    new MutationObserver((kayitlar) => {
      for (const k of kayitlar) {
        const e = k.target as HTMLElement;
        if (e.classList.contains('gorundu') && (e.matches('.kart') || e.matches('.durak'))) (window as any).belirdi(e.id || e.className.split(' ')[0] + ':' + e.querySelector('h3')?.textContent);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  const adimlar = await sonaKaydir(page);
  // Kaydırma takılmadı: konum hep ilerledi ve sona ulaştı
  for (let i = 1; i < adimlar.length; i++) expect(adimlar[i]).toBeGreaterThanOrEqual(adimlar[i - 1]);
  expect(await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)).toBe(true);
  // Hepsi belirdi (son öğelerin geçişi bitene kadar bekle)
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-belir]')].filter((e) => getComputedStyle(e).opacity !== '1').length), { timeout: 5000 }).toBe(0);
  // Kartlar belge sırasıyla belirdi
  const kartSirasi = sira.filter((s) => s.startsWith('kart-'));
  const belge = await page.evaluate(() => [...document.querySelectorAll('.kart')].map((k) => k.id));
  expect(kartSirasi).toEqual(belge);
  expect(sira.filter((s) => s.startsWith('durak')).length).toBeGreaterThanOrEqual(9);
  // Hareket düzeni kaydırmadı
  expect(await tasma(page)).toBeLessThanOrEqual(0);
  fs.mkdirSync(KANIT, { recursive: true });
  fs.writeFileSync(path.join(KANIT, `D2-belirme-sirasi-${test.info().project.name}.txt`), sira.join('\n'));
  await cek(page, 'D2-son');
});

test('D2-webkit kaydırınca içerik beliriyor', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit');
  await page.goto('/');
  const boy = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < boy; y += 400) { await page.evaluate((v) => scrollTo({ top: v, behavior: 'instant' as ScrollBehavior }), y); await page.waitForTimeout(90); }
  await page.waitForTimeout(900);
  const gizli = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('[data-belir]')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  expect(gizli).toBe(0);
});

test.describe('D3 hareketi azalt', () => {
  test.use({ reducedMotion: 'reduce' });
  test('hiçbir hareket oynamıyor, içerik eksiksiz', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);
    const durum = await page.evaluate(() => ({
      anim: document.documentElement.classList.contains('anim'),
      gizli: [...document.querySelectorAll<HTMLElement>('[data-belir]')].filter((e) => getComputedStyle(e).opacity !== '1' || getComputedStyle(e).transform !== 'none').length,
      animasyon: document.getAnimations().length,
      ilerleme: getComputedStyle(document.querySelector('.ilerleme')!).display,
      kaydirma: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    expect(durum).toEqual({ anim: false, gizli: 0, animasyon: 0, ilerleme: 'none', kaydirma: 'auto' });
    // Kartın üstüne gelince de geçiş oynamıyor
    await page.locator('.kart').first().scrollIntoViewIfNeeded();
    await page.locator('.kart article').first().hover();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    // Benzetim tuvali durağan: iki an arasında değişmiyor
    await page.evaluate(() => scrollTo(0, 0));
    const tuval = page.locator('canvas[data-takip]');
    const a = await tuval.screenshot(); await page.waitForTimeout(500); const b = await tuval.screenshot();
    expect(a.equals(b)).toBe(true);
    await cek(page, 'D3-hareket-azalt', true);
  });
});

test('D4 kaydırma hareketi desteği olmayan tarayıcı: içerik eksiksiz ve düz', async ({ page, browserName }) => {
  // Destek yokmuş gibi davran: CSS.supports ve IntersectionObserver kapatılır.
  await page.addInitScript(() => {
    const asil = CSS.supports.bind(CSS);
    CSS.supports = ((...a: [string, string?]) => (String(a[0]).includes('animation-timeline') ? false : (asil as any)(...a))) as typeof CSS.supports;
    delete (window as any).IntersectionObserver;
  });
  await page.goto('/');
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => ({
    anim: document.documentElement.classList.contains('anim'),
    gizli: [...document.querySelectorAll<HTMLElement>('[data-belir]')].filter((e) => getComputedStyle(e).opacity !== '1').length,
    bolum: document.querySelectorAll('main > section').length,
    kart: document.querySelectorAll('.kart').length,
  }));
  expect(d).toEqual({ anim: false, gizli: 0, bolum: 7, kart: 8 });
  const gercek = await page.evaluate(() => ({ scroll: (CSS as any).supports('animation-timeline', 'scroll()') }));
  fs.mkdirSync(KANIT, { recursive: true });
  fs.writeFileSync(path.join(KANIT, `D4-${browserName}.txt`), `tarayıcı: ${browserName}\nbenzetilen durum: animation-timeline ve IntersectionObserver yok\nsonuç: ${JSON.stringify(d)}\n`);
  await cek(page, 'D4-desteksiz', true);
});

test('D4b tarayıcının gerçek desteği kaydedilir; desteksizse yedek çalışır', async ({ page, browserName }) => {
  await page.goto('/');
  const destek = await page.evaluate(() => CSS.supports('animation-timeline: scroll()'));
  const yedek = await page.evaluate(() => document.documentElement.classList.contains('kaydirma-yedek'));
  expect(yedek).toBe(!destek);
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: 'instant' as ScrollBehavior }));
  await page.waitForTimeout(400);
  const cubuk = await page.evaluate(() => document.querySelector('.ilerleme span')!.getBoundingClientRect().width / innerWidth);
  expect(cubuk).toBeGreaterThan(0.3);
  expect(cubuk).toBeLessThan(0.7);
  fs.mkdirSync(KANIT, { recursive: true });
  fs.writeFileSync(path.join(KANIT, `D4b-destek-${browserName}.txt`), `${browserName} ${page.context().browser()?.version()}: animation-timeline scroll() desteği = ${destek}; betik yedeği = ${yedek}; yarı yolda ilerleme çubuğu = ${cubuk.toFixed(2)}\n`);
});

test('D4c betik yedeği: CSS desteği yokken ilerleme ve çizgi dolumu betikle hesaplanıyor', async ({ page }) => {
  await page.addInitScript(() => {
    const asil = CSS.supports.bind(CSS);
    CSS.supports = ((...a: [string, string?]) => (String(a[0]).includes('animation-timeline') ? false : (asil as any)(...a))) as typeof CSS.supports;
  });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.classList.contains('kaydirma-yedek'))).toBe(true);
  await page.evaluate(() => scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) / 2, behavior: 'instant' as ScrollBehavior }));
  await expect.poll(() => page.evaluate(() => Number((document.querySelector('.ilerleme span') as HTMLElement).style.getPropertyValue('--p'))), { timeout: 3000 }).toBeCloseTo(0.5, 1);
  await page.locator('#deneyim .cizgi').evaluate((e) => scrollTo({ top: e.getBoundingClientRect().bottom + scrollY - innerHeight * 0.3, behavior: 'instant' as ScrollBehavior }));
  await expect.poll(() => page.evaluate(() => Number((document.querySelector('#deneyim .cizgi') as HTMLElement).style.getPropertyValue('--dolum'))), { timeout: 3000 }).toBe(1);
});

test('D5 fare kullanmadan gezinme', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'WebKit Tab ile bağlantılara odaklanmayı varsayılan olarak kapalı tutar (macOS ayarı); Alt+Tab ile D5-webkit testinde');
  await page.goto('/');
  // İlk Tab: içeriğe geç bağlantısı
  await page.keyboard.press('Tab');
  await expect(page.locator('.atla')).toBeFocused();
  // Her bağlantıya ve karta Tab ile ulaşılıyor, odak görünüyor
  const hedefler = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('a[href], button')].filter((e) => e.offsetParent !== null && !e.closest('dialog')).length);
  const gorulen: string[] = [];
  let kartOdak = false;
  for (let i = 0; i < hedefler + 5; i++) {
    await page.keyboard.press('Tab');
    const o = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement;
      if (!e || e === document.body) return null;
      const s = getComputedStyle(e);
      const kart = e.closest('.kart article');
      const cerceve = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
      const kartCerceve = kart ? getComputedStyle(kart).outlineStyle !== 'none' : false;
      return { ad: e.tagName + ':' + (e.getAttribute('href') || e.textContent || '').trim().slice(0, 40), gorunur: cerceve || kartCerceve, kart: !!kart };
    });
    if (!o) break;
    expect(o.gorunur, `odak görünmüyor: ${o.ad}`).toBe(true);
    if (o.ad.startsWith('A:#icerik') && gorulen.length > 2) break; // tur tamamlandı
    gorulen.push(o.ad);
    if (o.kart) kartOdak = true;
  }
  expect(kartOdak).toBe(true);
  expect(gorulen.length, gorulen.join(' | ')).toBeGreaterThanOrEqual(hedefler - 1);
  // Kart Enter ile açılıyor, Esc ile kapanıyor, odak karta dönüyor
  await page.locator('#kart-isg-guard a[data-proje]').focus();
  await cek(page, 'D5-kart-odak');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/proje\/isg-guard\/$/);
  await expect(page.locator('h1')).toHaveText('İSG Guard');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/(#.*)?$/);
  await expect(page.locator('#kart-isg-guard a[data-proje]')).toBeFocused();
  // Ok tuşlarıyla projeler arası geçiş
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/isg-guard/);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/stackout/);
  await page.waitForLoadState('load'); // ok tuşu dinleyicisi sayfa betiğiyle gelir
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/isg-guard/);
  // Komut paleti klavyeyle
  await page.keyboard.press('Control+k');
  await expect(page.locator('dialog.palet')).toBeVisible();
  await page.keyboard.type('hamming');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/proje\/sec-ded\/$/);
});

test('D5-webkit klavye ile kart açma ve Esc', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit');
  await page.goto('/');
  await page.locator('#kart-isg-guard a[data-proje]').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/proje\/isg-guard\/$/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#kart-isg-guard a[data-proje]')).toBeFocused();
});

test('D6 dil değişimi: bölüm korunuyor, çevrilmemiş metin yok', async ({ page }) => {
  await page.goto('/#deneyim');
  // Sayfa bölüme kayana kadar bekle (yumuşak kaydırma)
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('deneyim')!.getBoundingClientRect().top) < 120), { timeout: 8000 }).toBe(true);
  await page.waitForTimeout(300);
  // Playwright'ın tıklaması yapışkan üst menüdeki öğe için sayfayı kendisi kaydırabiliyor;
  // ziyaretçinin konumunu bozmamak için düğme klavyeyle (odak + Enter) tetiklenir.
  const dilDugmesi = async () => { await page.locator('[data-dil-degistir]').focus({ timeout: 5000 }); await page.keyboard.press('Enter'); };
  await dilDugmesi();
  await expect(page).toHaveURL(/\/en\/#experience$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => page.evaluate(() => { const r = document.getElementById('experience')!.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > 0; }), { timeout: 5000 }).toBe(true);
  await cek(page, 'D6-en-experience');
  await page.waitForTimeout(300);
  await dilDugmesi();
  await expect(page).toHaveURL(/\/#deneyim$/);
  // İngilizce sayfalarda özel adlar dışında Türkçe harf kalmamalı
  const ozelAdlar = ['Ali Yılmaz', 'ali-yılmaz', 'Türkiye', 'BİRSAV Bilişim ve Savunma Sanayi', 'Sefir-i Gök', 'Türkçeye geç', 'İSG'];
  for (const yol of ['/en/', '/en/project/balon-takip/', '/en/project/isg-guard/', '/en/project/pardus-muzik-calar/', '/en/project/sec-ded/', '/en/project/c-syntax-highlighter/', '/en/project/hayvanat-bahcesi/']) {
    await page.goto(yol);
    let metin = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt],[aria-label],[title],[placeholder]')].map((e) => ['alt', 'aria-label', 'title', 'placeholder'].map((a) => e.getAttribute(a) || '').join(' ')).join(' ') + ' ' + document.title + ' ' + document.querySelector('meta[name=description]')!.getAttribute('content'));
    for (const a of ozelAdlar) metin = metin.split(a).join('');
    const kalan = metin.match(/\S*[çğıöşüÇĞİÖŞÜ]\S*/g) ?? [];
    expect(kalan, `${yol} çevrilmemiş`).toEqual([]);
  }
  // Türkçe sayfada arayüz Türkçe
  await page.goto('/');
  await expect(page.locator('.menu')).toContainText('Hakkımda');
});

test('D7 tema: seçim korunuyor, iki temada da metin okunaklı', async ({ page }) => {
  const parlaklik = (r: number, g: number, b: number) => { const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const olc = async () => {
    const renkler = await page.evaluate(() => {
      const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
      const rgb = (v: string) => { c.clearRect(0, 0, 1, 1); c.fillStyle = v; c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); };
      const s = getComputedStyle(document.documentElement);
      const al = (ad: string) => rgb(s.getPropertyValue(ad).trim());
      return { zemin: al('--zemin'), yuzey: al('--yuzey'), yuzey2: al('--yuzey2'), metin: al('--metin'), soluk: al('--soluk'), vurgu: al('--vurgu'), vurguUstu: al('--vurgu-ustu') };
    });
    const k = (a: number[], b: number[]) => { const [x, y] = [parlaklik(a[0], a[1], a[2]), parlaklik(b[0], b[1], b[2])]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    return {
      'metin/zemin': k(renkler.metin, renkler.zemin), 'soluk/zemin': k(renkler.soluk, renkler.zemin), 'soluk/yuzey': k(renkler.soluk, renkler.yuzey), 'soluk/yuzey2': k(renkler.soluk, renkler.yuzey2),
      'vurgu/zemin': k(renkler.vurgu, renkler.zemin), 'vurgu/yuzey': k(renkler.vurgu, renkler.yuzey), 'düğme yazısı/vurgu': k(renkler.vurguUstu, renkler.vurgu),
    };
  };
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const ilk = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const satirlar: string[] = [];
  for (const [ad, v] of Object.entries(await olc())) { satirlar.push(`koyu  ${ad}: ${v.toFixed(2)}`); expect(v, `koyu ${ad}`).toBeGreaterThanOrEqual(4.5); }
  await cek(page, 'D7-koyu');
  await page.locator('[data-tema]').click();
  const sonra = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(sonra).not.toBe(ilk);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(sonra);
  for (const [ad, v] of Object.entries(await olc())) { satirlar.push(`açık  ${ad}: ${v.toFixed(2)}`); expect(v, `açık ${ad}`).toBeGreaterThanOrEqual(4.5); }
  await cek(page, 'D7-acik');
  // Seçim başka sayfada da geçerli
  await page.goto('/proje/sec-ded/');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
  // İlk açılışta cihaz tercihi
  await page.evaluate(() => localStorage.clear());
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(sonra);
  fs.mkdirSync(KANIT, { recursive: true });
  fs.writeFileSync(path.join(KANIT, `D7-karsitlik-${test.info().project.name}.txt`), satirlar.join('\n') + '\n');
});

test('D8 bütün bağlantılar', async ({ page, request, browserName }) => {
  test.skip(browserName !== 'chromium', 'bağlantı denetimi tarayıcıdan bağımsız; bir kez yapılır');
  test.setTimeout(180_000);
  const ic = new Set<string>(), dis = new Set<string>(), bakilacak = ['/', '/en/'], bakildi = new Set<string>();
  while (bakilacak.length) {
    const yol = bakilacak.pop()!;
    if (bakildi.has(yol)) continue;
    bakildi.add(yol);
    await page.goto(yol);
    const hepsi = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => a.href).concat([...document.querySelectorAll<HTMLElement>('img[src],source[src],video[poster],link[href]')].map((e) => (e as any).src || (e as any).poster || (e as any).href)));
    for (const h of hepsi) {
      if (!h || h.startsWith('mailto:')) continue;
      const u = new URL(h);
      if (u.origin === TABAN) { ic.add(u.pathname); if (u.pathname.endsWith('/') && !bakildi.has(u.pathname)) bakilacak.push(u.pathname); }
      else if (u.origin !== 'https://aliyilmaz16.github.io' && u.origin !== 'http://127.0.0.1:4321') dis.add(u.href.split('#')[0]);
    }
    // sayfa içi çapalar
    const kirik = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].map((a) => a.getAttribute('href')!).filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
    expect(kirik, `${yol} kırık çapa`).toEqual([]);
  }
  const satirlar: string[] = [];
  for (const yol of ic) { const y = await request.get(yol); satirlar.push(`${y.status()} ${yol}`); expect(y.status(), yol).toBe(200); }
  const sorunlu: string[] = [];
  for (const adres of dis) {
    let durum = 0;
    try { durum = (await request.get(adres, { timeout: 20_000, headers: { 'user-agent': 'Mozilla/5.0 (link-check)' } })).status(); } catch { durum = -1; }
    satirlar.push(`${durum} ${adres}`);
    // LinkedIn otomatik istekleri 999 ile geri çevirir; kırık sayılmaz, tabloda not edilir.
    if (!(durum >= 200 && durum < 400) && !(adres.includes('linkedin.com') && [999, 429, 403].includes(durum))) sorunlu.push(`${durum} ${adres}`);
  }
  fs.mkdirSync(KANIT, { recursive: true });
  fs.writeFileSync(path.join(KANIT, 'D8-baglantilar.txt'), satirlar.sort().join('\n') + '\n');
  expect(sorunlu).toEqual([]);
});

test('E9 GitHub verisi gelince sayfa düzeni kaymıyor', async ({ page }) => {
  // GitHub yanıtı geciktirilir; yanıt gelmeden ve geldikten sonra alttaki bölümün konumu aynı olmalı.
  let birak: () => void = () => {};
  const bekle = new Promise<void>((r) => { birak = r; });
  await page.route('https://api.github.com/**', async (rota) => {
    await bekle;
    await rota.fulfill({ json: [{ name: 'mucars-random-forest-classification', description: 'x', html_url: 'https://github.com/AliYilmaz16/mucars-random-forest-classification', pushed_at: '2026-06-07T10:00:00Z', fork: false }, { name: 'SmartHome-Energy-Classifier', description: 'x', html_url: 'https://github.com/AliYilmaz16/SmartHome-Energy-Classifier', pushed_at: '2026-01-22T10:00:00Z', fork: false }] });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.diger-liste').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const konum = () => page.evaluate(() => Math.round(document.getElementById('deneyim')!.getBoundingClientRect().top + scrollY));
  const once = await konum();
  birak();
  await expect(page.locator('.diger-liste [data-tarih]').first()).toContainText('2026');
  expect(await konum()).toBe(once);
});

test('D9 proje adresi doğrudan açılıyor, geri tuşu çalışıyor', async ({ page }) => {
  await page.goto('/proje/sec-ded/');
  await expect(page.locator('h1')).toHaveText('Hamming SEC-DED Simülatörü');
  await expect(page.locator('.anlatim')).toContainText('Hamming');
  await cek(page, 'D9-dogrudan');
  await page.goto('/en/project/sec-ded/');
  await expect(page.locator('h1')).toHaveText('Hamming SEC-DED Simulator');
  // Ana sayfadan aç, geri dön: kaldığı yere döner
  await page.goto('/');
  await page.locator('#kart-sec-ded').scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const once = await page.evaluate(() => Math.round(scrollY));
  expect(once).toBeGreaterThan(500);
  await page.locator('#kart-sec-ded a[data-proje]').click();
  await expect(page).toHaveURL(/\/proje\/sec-ded\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(async () => Math.abs((await page.evaluate(() => Math.round(scrollY))) - once), { timeout: 5000 }).toBeLessThan(80);
  // Sayfadaki "Projelere dön" bağlantısı da aynı yere döndürür
  // Tıklama kartı görüş alanına kaydırabilir; dönülecek konum tıklama anında ölçülür.
  await page.locator('#kart-sec-ded a[data-proje]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const once2 = await page.evaluate(() => Math.round(scrollY));
  await page.locator('#kart-sec-ded a[data-proje]').click();
  await expect(page).toHaveURL(/\/proje\/sec-ded\/$/);
  await page.locator('[data-geri-bag]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(async () => Math.abs((await page.evaluate(() => Math.round(scrollY))) - once2), { timeout: 5000 }).toBeLessThan(80);
});

test.describe('D12 betikler kapalı', () => {
  test.use({ javaScriptEnabled: false });
  test('metin içeriği okunuyor', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    for (const id of ['hakkimda', 'projeler', 'deneyim', 'egitim', 'yetenekler', 'iletisim']) await expect(page.locator(`#${id} > h2`)).toBeVisible();
    await expect(page.locator('.kart h3')).toHaveCount(8);
    for (const k of await page.locator('.kart h3').all()) await expect(k).toBeVisible();
    await expect(page.locator('.durak')).toHaveCount(9);
    await expect(page.locator('#deneyim')).toContainText('Crowtec Software');
    await expect(page.locator('.diger-liste li')).toHaveCount(6);
    await cek(page, 'D12-betiksiz', true);
    // Bağlantılar betiksiz de çalışıyor
    await page.locator('#kart-balon-takip a[data-proje]').click();
    await expect(page.locator('h1')).toHaveText('Balon Takip');
    await expect(page.locator('.anlatim')).toContainText('DeepSORT');
    await page.locator('[data-dil-degistir]').click();
    await expect(page.locator('h1')).toHaveText('Balloon Tracker');
  });
});
