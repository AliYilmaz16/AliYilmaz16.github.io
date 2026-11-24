import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
const yol = process.argv[2] ?? '/';
const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
for (let i = 0; i < 2; i++) {
  const s = await lighthouse('http://127.0.0.1:4321' + yol, { port: chrome.port, logLevel: 'error', onlyCategories: ['performance'] });
  const a = s.lhr.audits;
  console.log('başarım', Math.round(s.lhr.categories.performance.score * 100), 'TBT', a['total-blocking-time'].displayValue, 'LCP', a['largest-contentful-paint'].displayValue);
  console.log(' ana iş parçacığı:', a['mainthread-work-breakdown'].details?.items?.slice(0, 5).map((x) => `${x.groupLabel} ${Math.round(x.duration)}ms`).join(', '));
  console.log(' betikler:', a['bootup-time'].details?.items?.slice(0, 4).map((x) => `${x.url.slice(-40)} toplam ${Math.round(x.total)}ms betik ${Math.round(x.scripting)}ms`).join(' | '));
  console.log(' uzun görevler:', a['long-tasks']?.details?.items?.slice(0, 5).map((x) => `${x.url.slice(-30)} @${Math.round(x.startTime)} ${Math.round(x.duration)}ms`).join(' | '));
  console.log(' bfcache:', JSON.stringify(a['bf-cache']?.details?.items?.map((x) => x.reason)));
}
await chrome.kill();
