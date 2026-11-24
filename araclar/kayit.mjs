// Adım 4 çıktısı: baştan sona kaydırmanın masaüstü ve telefon ekran kaydı (docs/kanit/adim4-kayit-*.webm)
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';
const taban = process.argv[2] ?? 'http://127.0.0.1:4321';
const b = await chromium.launch();
for (const [ad, ayar] of [['masaustu', { viewport: { width: 1280, height: 720 } }], ['telefon', { ...devices['Pixel 7'], deviceScaleFactor: 1 }]]) {
  const boyut = ayar.viewport;
  const c = await b.newContext({ ...ayar, colorScheme: 'dark', recordVideo: { dir: 'test-results/kayit', size: boyut } });
  const s = await c.newPage();
  await s.goto(taban + '/'); await s.waitForTimeout(2500);
  const boy = await s.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  // sabit hızla, ziyaretçi gibi kaydır
  await s.evaluate(async (boy) => { await new Promise((bitti) => { const t0 = performance.now(), sure = boy * 2.6; (function adim(t) { const p = Math.min(1, (t - t0) / sure); scrollTo({ top: boy * p, behavior: 'instant' }); p < 1 ? requestAnimationFrame(adim) : bitti(); })(t0); }); }, boy);
  await s.waitForTimeout(800);
  const v = s.video(); await c.close();
  fs.copyFileSync(await v.path(), `docs/kanit/adim4-kayit-${ad}.webm`);
}
await b.close();
