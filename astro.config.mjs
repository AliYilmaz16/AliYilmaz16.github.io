import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aliyilmaz16.github.io',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  // CSS küçültücü, animation-timeline'ı animation kısaltmasının içine taşıyıp
  // tarayıcıların tanımadığı bir bildirim üretiyordu; bu yüzden küçültme kapalı.
  vite: { build: { cssMinify: false } },
});
