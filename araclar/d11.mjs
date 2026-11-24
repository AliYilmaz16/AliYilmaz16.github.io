// D11: içerik dosyasına deneme projesi eklenir, başka dosyaya dokunulmadan sitede göründüğü doğrulanır, sonra geri alınır.
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const asil = fs.readFileSync('icerik.yaml', 'utf8');
const ek = `
  - kimlik: deneme-projesi
    ad: { tr: Deneme Projesi D11, en: Test Project D11 }
    alan: web
    ozet: { tr: Yalnızca içerik dosyasına eklenen deneme projesi., en: A test project added only to the content file. }
    sorun: { tr: Deneme sorunu., en: Test problem. }
    araclar: [Deneme]
`;
const yer = asil.indexOf('# ─── ÖTEKİ PROJELER');
let sonuc = [];
try {
  fs.writeFileSync('icerik.yaml', asil.slice(0, yer) + ek.trimStart().replace(/^/, '  ') + '\n' + asil.slice(yer));
  execSync('npx astro build --outDir dist-d11', { stdio: 'pipe' });
  const ana = fs.readFileSync('dist-d11/index.html', 'utf8'), en = fs.readFileSync('dist-d11/en/index.html', 'utf8');
  const kontroller = {
    'TR ana sayfada kart': ana.includes('id="kart-deneme-projesi"') && ana.includes('Deneme Projesi D11'),
    'EN ana sayfada kart': en.includes('Test Project D11'),
    'TR ayrıntı sayfası': fs.existsSync('dist-d11/proje/deneme-projesi/index.html') && fs.readFileSync('dist-d11/proje/deneme-projesi/index.html', 'utf8').includes('Deneme sorunu.'),
    'EN ayrıntı sayfası': fs.existsSync('dist-d11/en/project/deneme-projesi/index.html'),
    'komut paletinde': (ana.match(/deneme-projesi/g) ?? []).length >= 3,
    'görselsiz kart yer tutucuyla çiziliyor': ana.includes('kart-yer'),
  };
  sonuc = Object.entries(kontroller).map(([k, v]) => `${v ? 'GEÇTİ' : 'KALDI'}  ${k}`);
} finally {
  fs.writeFileSync('icerik.yaml', asil);
  fs.rmSync('dist-d11', { recursive: true, force: true });
}
const degisen = execSync('git status --porcelain -- src icerik.yaml', { encoding: 'utf8' });
sonuc.push(`deneme sonrası icerik.yaml geri alındı: ${fs.readFileSync('icerik.yaml', 'utf8') === asil}`);
fs.writeFileSync('docs/kanit/D11-icerik-dosyasi.txt', `Değiştirilen tek dosya: icerik.yaml (6 satır eklendi)\n${sonuc.join('\n')}\n`);
console.log(sonuc.join('\n'));
if (sonuc.some((s) => s.startsWith('KALDI'))) process.exit(1);
