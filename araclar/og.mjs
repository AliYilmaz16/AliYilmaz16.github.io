// Paylaşım önizleme görsellerini üretir: public/og-tr.png, public/og-en.png
// İçerik değişince yeniden çalıştır: node araclar/og.mjs
import { chromium } from '@playwright/test';
import { parse } from 'yaml';
import fs from 'node:fs';
import path from 'node:path';

const icerik = parse(fs.readFileSync('icerik.yaml', 'utf8'));
const yazi = (ad) => 'data:font/woff2;base64,' + fs.readFileSync(path.join('public/fonts', ad)).toString('base64');
const b = await chromium.launch();
for (const dil of ['tr', 'en']) {
  const s = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await s.setContent(`<!doctype html><meta charset="utf-8"><style>
    @font-face{font-family:IT;font-weight:100 900;src:url(${yazi('inter-tight-latin-wght-normal.woff2')})}
    @font-face{font-family:IT;font-weight:100 900;src:url(${yazi('inter-tight-latin-ext-wght-normal.woff2')});unicode-range:U+0100-02BA}
    @font-face{font-family:JM;font-weight:100 800;src:url(${yazi('jetbrains-mono-latin-wght-normal.woff2')})}
    @font-face{font-family:JM;font-weight:100 800;src:url(${yazi('jetbrains-mono-latin-ext-wght-normal.woff2')});unicode-range:U+0100-02BA}
    *{box-sizing:border-box;margin:0}
    body{width:1200px;height:630px;background:#0b0e11;color:#e8ecef;font-family:IT;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;
      background-image:linear-gradient(#161c22 1px,transparent 1px),linear-gradient(90deg,#161c22 1px,transparent 1px);background-size:60px 60px}
    .u{font-family:JM;font-size:24px;color:#9eaab6;display:flex;align-items:center;gap:16px}
    .u i{width:14px;height:14px;border-radius:50%;background:#b8f04a}
    h1{font-size:150px;line-height:.95;letter-spacing:-.04em;font-weight:650}
    p{font-size:36px;line-height:1.35;color:#9eaab6;max-width:900px;margin-top:28px}
    .a{font-family:JM;font-size:24px;color:#b8f04a}
    .k{position:absolute;width:44px;height:44px;border:0 solid #b8f04a}
    .k1{top:36px;left:36px;border-top-width:4px;border-left-width:4px}.k2{top:36px;right:36px;border-top-width:4px;border-right-width:4px}
    .k3{bottom:36px;right:36px;border-bottom-width:4px;border-right-width:4px}.k4{bottom:36px;left:36px;border-bottom-width:4px;border-left-width:4px}
    .h{position:absolute;right:150px;top:150px;width:170px;height:170px;border:4px solid #b8f04a;border-radius:50%}
    .h::after{content:'';position:absolute;inset:0;margin:auto;width:16px;height:16px;border-radius:50%;background:#b8f04a}
    .cx{position:absolute;top:235px;left:0;right:0;height:1px;background:#b8f04a55}.cy{position:absolute;right:235px;top:0;bottom:0;width:1px;background:#b8f04a55}
  </style><div class="cx"></div><div class="cy"></div><div class="h"></div>
  <span class="k k1"></span><span class="k k2"></span><span class="k k3"></span><span class="k k4"></span>
  <div class="u"><i></i>${icerik.kisi.unvan[dil]} · ${icerik.kisi.konum[dil]}</div>
  <div><h1>${icerik.kisi.ad}</h1><p>${dil === 'tr' ? 'Görüntü işleme, nesne tespiti ve takibi. Projeler, stajlar, eğitim.' : 'Computer vision, object detection and tracking. Projects, internships, education.'}</p></div>
  <div class="a">${icerik.site.adres.replace('https://', '')}${dil === 'en' ? '/en' : ''}</div>`);
  await s.evaluate(() => document.fonts.ready);
  await s.screenshot({ path: `public/og-${dil}.png` });
}
await b.close();
console.log('og görselleri yazıldı');
