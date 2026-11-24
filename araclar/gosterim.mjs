// Adım çıktıları için ekran görüntüleri: docs/kanit/adim-*.png
import { chromium, devices } from '@playwright/test';
const T = 'http://127.0.0.1:4321', K = 'docs/kanit/';
const b = await chromium.launch();
// masaüstü
let c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
let s = await c.newPage();
await s.goto(T + '/'); await s.waitForTimeout(2500);
await s.screenshot({ path: K + 'adim2-giris-koyu.jpg', type: 'jpeg', quality: 72 });
await s.locator('#projeler').scrollIntoViewIfNeeded(); await s.evaluate(() => scrollBy(0, 250)); await s.waitForTimeout(1200);
await s.locator('#kart-balon-takip article').hover(); await s.waitForTimeout(600);
await s.screenshot({ path: K + 'adim3-kart-ustune-gelme.jpg', type: 'jpeg', quality: 72 });
await s.locator('.suzgec button[data-alan="makine-ogrenmesi"]').click(); await s.waitForTimeout(400);
await s.screenshot({ path: K + 'adim5-suzgec.jpg', type: 'jpeg', quality: 72 });
await s.locator('.suzgec button[data-alan=""]').click();
await s.locator('#deneyim').scrollIntoViewIfNeeded(); await s.evaluate(() => scrollBy(0, 420)); await s.waitForTimeout(1500);
await s.screenshot({ path: K + 'adim4-zaman-cizgisi-masaustu.jpg', type: 'jpeg', quality: 72 });
await s.keyboard.press('Control+k'); await s.keyboard.type('is'); await s.waitForTimeout(300);
await s.screenshot({ path: K + 'adim5-komut-paleti.jpg', type: 'jpeg', quality: 72 });
await s.keyboard.press('Escape');
await s.emulateMedia({ media: 'print' }); 
await s.pdf({ path: K + 'adim5-yazdirma-gorunumu.pdf', format: 'A4' });
await c.close();
// açık tema, proje sayfası
c = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
s = await c.newPage();
await s.goto(T + '/#projeler'); await s.waitForTimeout(1800);
await s.screenshot({ path: K + 'adim2-projeler-acik.jpg', type: 'jpeg', quality: 72 });
await s.goto(T + '/proje/isg-guard/'); await s.waitForTimeout(800);
await s.screenshot({ path: K + 'adim3-ayrinti-isg-guard.jpg', type: 'jpeg', quality: 72, fullPage: true });
await c.close();
// telefon
c = await b.newContext({ ...devices['Pixel 7'], colorScheme: 'dark' });
s = await c.newPage();
await s.goto(T + '/'); await s.waitForTimeout(2200);
await s.screenshot({ path: K + 'adim2-giris-telefon.jpg', type: 'jpeg', quality: 72 });
await s.locator('#kart-balon-takip').scrollIntoViewIfNeeded(); await s.waitForTimeout(1200);
await s.screenshot({ path: K + 'adim3-kart-telefon.jpg', type: 'jpeg', quality: 72 });
await s.locator('#deneyim').scrollIntoViewIfNeeded(); await s.evaluate(() => scrollBy(0, 300)); await s.waitForTimeout(1500);
await s.screenshot({ path: K + 'adim4-zaman-cizgisi-telefon.jpg', type: 'jpeg', quality: 72 });
await s.goto(T + '/proje/balon-takip/'); await s.waitForTimeout(800);
await s.screenshot({ path: K + 'adim3-ayrinti-telefon.jpg', type: 'jpeg', quality: 72 });
await c.close(); await b.close();
