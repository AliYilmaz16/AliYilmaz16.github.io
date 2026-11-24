// Kullanım: node araclar/cek.mjs <yol> <dosya> [genislik] [yukseklik] [tema] [tam]
import { chromium } from '@playwright/test';
const [yol = '/', dosya = 'cikti.png', gen = '1440', yuk = '900', tema = 'dark', tam = '1'] = process.argv.slice(2);
const b = await chromium.launch();
const s = await b.newPage({ viewport: { width: +gen, height: +yuk }, colorScheme: tema, reducedMotion: tam === '1' ? 'reduce' : 'no-preference', deviceScaleFactor: 1 });
const hatalar = [];
s.on('console', (m) => m.type() === 'error' && hatalar.push(m.text()));
s.on('pageerror', (e) => hatalar.push(String(e)));
await s.goto('http://127.0.0.1:4321' + yol, { waitUntil: 'networkidle' });
await s.waitForTimeout(900);
await s.screenshot({ path: dosya, fullPage: tam === '1' });
console.log(dosya, 'yatay taşma:', await s.evaluate(() => document.documentElement.scrollWidth - innerWidth), hatalar.length ? hatalar : '');
await b.close();
