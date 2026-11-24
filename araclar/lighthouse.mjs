// D10: Lighthouse'u Playwright'ın Chromium'uyla çalıştırır, puanları docs/kanit altına yazar.
// Kullanım: node araclar/lighthouse.mjs [taban-adres]
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs';

const taban = process.argv[2] ?? 'http://127.0.0.1:4321';
const etiket = taban.includes('127.0.0.1') ? 'yerel' : 'canli';
const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
const satirlar = [];
for (const yol of ['/', '/en/', '/proje/balon-takip/', '/proje/isg-guard/']) {
  for (const bicim of ['mobile', 'desktop']) {
    const ayar = bicim === 'desktop'
      ? { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
      : {};
    // Ölçüm makinenin o anki yüküne göre oynar; üç kez çalıştırılır, başarım için ortanca alınır.
    const kosular = [];
    for (let i = 0; i < 3; i++) kosular.push(await lighthouse(taban + yol, { port: chrome.port, output: 'html', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, { extends: 'lighthouse:default', settings: ayar }));
    kosular.sort((x, y) => x.lhr.categories.performance.score - y.lhr.categories.performance.score);
    const s = kosular[1];
    const k = s.lhr.categories;
    const p = (x) => Math.round(k[x].score * 100);
    const uc = kosular.map((x) => Math.round(x.lhr.categories.performance.score * 100)).join('/');
    const satir = `${etiket} ${bicim.padEnd(7)} ${yol.padEnd(24)} başarım ${p('performance')} (üç koşu: ${uc})  erişilebilirlik ${p('accessibility')}  iyi uygulamalar ${p('best-practices')}  SEO ${p('seo')}  (LCP ${s.lhr.audits['largest-contentful-paint'].displayValue}, CLS ${s.lhr.audits['cumulative-layout-shift'].displayValue}, TBT ${s.lhr.audits['total-blocking-time'].displayValue})`;
    console.log(satir);
    satirlar.push(satir);
    const kalan = Object.values(s.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary').map((a) => `    - ${a.id}: ${a.displayValue ?? a.title}`);
    if (kalan.length) { console.log(kalan.join('\n')); satirlar.push(...kalan); }
    if (yol === '/' ) fs.writeFileSync(`docs/kanit/D10-lighthouse-${etiket}-${bicim}.html`, s.report);
  }
}
fs.writeFileSync(`docs/kanit/D10-lighthouse-${etiket}.txt`, satirlar.join('\n') + '\n');
await chrome.kill();
