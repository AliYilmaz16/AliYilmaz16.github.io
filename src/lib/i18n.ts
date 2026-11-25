// Arayüz metinleri (düğme, başlık, etiket). Kişisel içerik icerik.yaml dosyasındadır.
import type { Dil } from './icerik';

export const diller: Dil[] = ['tr', 'en'];
export const digerDil = (dil: Dil): Dil => (dil === 'tr' ? 'en' : 'tr');

export const anaYol = (dil: Dil) => (dil === 'tr' ? '/' : '/en/');
export const projeYolu = (dil: Dil, kimlik: string) => (dil === 'tr' ? `/proje/${kimlik}/` : `/en/project/${kimlik}/`);

// Bölüm kimlikleri: adres çubuğunda görünür (#projeler / #projects).
export const bolumler = {
  hakkimda: { tr: 'hakkimda', en: 'about' },
  projeler: { tr: 'projeler', en: 'projects' },
  deneyim: { tr: 'deneyim', en: 'experience' },
  egitim: { tr: 'egitim', en: 'education' },
  yetenekler: { tr: 'yetenekler', en: 'skills' },
  iletisim: { tr: 'iletisim', en: 'contact' },
} as const;
export type Bolum = keyof typeof bolumler;

const metin = {
  icerigeGec: { tr: 'İçeriğe geç', en: 'Skip to content' },
  menu: { tr: 'Menü', en: 'Menu' },
  anaMenu: { tr: 'Bölümler', en: 'Sections' },
  hakkimda: { tr: 'Hakkımda', en: 'About' },
  projeler: { tr: 'Projeler', en: 'Projects' },
  deneyim: { tr: 'Deneyim', en: 'Experience' },
  egitim: { tr: 'Eğitim', en: 'Education' },
  yetenekler: { tr: 'Yetenekler', en: 'Skills' },
  iletisim: { tr: 'İletişim', en: 'Contact' },
  dilDegistir: { tr: 'Switch to English', en: 'Türkçeye geç' },
  temaDegistir: { tr: 'Temayı değiştir', en: 'Toggle theme' },
  ara: { tr: 'Ara ve git', en: 'Search and jump' },
  projeleriGor: { tr: 'Projeleri gör', en: 'View projects' },
  iletisimeGec: { tr: 'İletişime geç', en: 'Get in touch' },
  suAn: { tr: 'Şu an', en: 'Now' },
  suAnUzerinde: { tr: 'Şu an üzerinde çalıştığım konular', en: 'What I am working on now' },
  benzetimBaslik: { tr: 'Takip benzetimi', en: 'Tracking simulation' },
  benzetimAciklama: {
    tr: 'Balon Takip projesindeki mantığın küçük bir benzetimi: gürültülü tespitler yumuşatılır, kaçan karelerde konum hız vektöründen tahmin edilir. İmleci alanın içinde gezdirerek hedefi sen yönet.',
    en: 'A small simulation of the logic in the Balloon Tracker project: noisy detections are smoothed and, on missed frames, position is predicted from the velocity vector. Move the pointer inside the area to steer the target.',
  },
  benzetimProje: { tr: 'Projeyi oku', en: 'Read the project' },
  tespit: { tr: 'ham tespit', en: 'raw detection' },
  takip: { tr: 'takip', en: 'track' },
  tahmin: { tr: 'tahmin', en: 'predicted' },
  oneCikan: { tr: 'Öne çıkan projeler', en: 'Featured projects' },
  suz: { tr: 'Alana göre süz', en: 'Filter by area' },
  hepsi: { tr: 'Hepsi', en: 'All' },
  ayrinti: { tr: 'Ayrıntıyı aç', en: 'Open details' },
  digerProjeler: { tr: 'Öteki projeler', en: 'Other projects' },
  dene: { tr: 'Dene', en: 'Try it' },
  yil: { tr: 'Yıl', en: 'Year' },
  ozelDepo: { tr: 'Özel depo', en: 'Private repository' },
  demoNot_stackout: {
    tr: 'Oyunun kendisi değil; iki modu birbirine bağlayan kuralın tarayıcıda çalışan küçük bir benzetimi. Parçalar ve fizik sadeleştirildi.',
    en: 'Not the game itself, but a small in-browser simulation of the rule that ties its two modes together. Pieces and physics are simplified.',
  },
  demoNot_randevu: {
    tr: 'Projedeki müsaitlik hesabının aynı kuralla çalışan küçük bir örneği. Randevular örnek veridir ve hiçbir yere gönderilmez.',
    en: "A small example that follows the same rule as the project's availability calculation. The appointments are sample data and are not sent anywhere.",
  },
  demoNot_hamming: {
    tr: 'Simülatörün yaptığı işin tarayıcıda çalışan küçük bir örneği: 8 bit veri, 4 eşlik biti ve bir genel eşlik biti.',
    en: 'A small in-browser example of what the simulator does: 8 data bits, 4 parity bits and one overall parity bit.',
  },
  sonGuncelleme: { tr: 'son güncelleme', en: 'last updated' },
  suzgecBos: { tr: 'Bu alanda gösterilecek proje yok.', en: 'No projects in this area.' },
  deneyimGiris: { tr: 'Stajlar ve takım görevleri, yeniden eskiye.', en: 'Internships and team roles, newest first.' },
  staj: { tr: 'Staj', en: 'Internship' },
  takim: { tr: 'Takım', en: 'Team' },
  suruyor: { tr: 'sürüyor', en: 'present' },
  ilgiliProje: { tr: 'İlgili proje', en: 'Related project' },
  programlar: { tr: 'Eğitim programları', en: 'Training programmes' },
  konusulanDiller: { tr: 'Diller', en: 'Languages' },
  iletisimGiris: {
    tr: 'Staj, iş ya da proje için bana aşağıdaki adreslerden ulaşabilirsin.',
    en: 'For internships, jobs or projects, you can reach me at the links below.',
  },
  eposta: { tr: 'E-posta', en: 'Email' },
  ozgecmisIndir: { tr: 'Özgeçmişi indir', en: 'Download CV' },
  yazdir: { tr: 'Özgeçmiş olarak yazdır', en: 'Print as CV' },
  altBilgi: {
    tr: 'Bu site izleme aracı ve çerez kullanmaz.',
    en: 'This site uses no trackers and no cookies.',
  },
  kaynak: { tr: 'Kaynak kodu', en: 'Source code' },
  // proje sayfası
  tumProjeler: { tr: 'Projelere dön', en: 'Back to projects' },
  sorun: { tr: 'Sorun', en: 'Problem' },
  rol: { tr: 'Rolüm', en: 'My role' },
  karar: { tr: 'Önemli karar', en: 'Key decision' },
  sonuc: { tr: 'Sonuç', en: 'Outcome' },
  araclar: { tr: 'Araçlar', en: 'Tools' },
  alan: { tr: 'Alan', en: 'Area' },
  depo: { tr: 'Depo', en: 'Repository' },
  depoyuAc: { tr: "GitHub'da aç", en: 'Open on GitHub' },
  goruntuler: { tr: 'Görseller', en: 'Screenshots' },
  video: { tr: 'Video', en: 'Video' },
  videoyuIzle: { tr: "Tanıtım videosunu YouTube'da izle", en: 'Watch the demo video on YouTube' },
  onceki: { tr: 'Önceki proje', en: 'Previous project' },
  sonraki: { tr: 'Sonraki proje', en: 'Next project' },
  klavyeIpucu: {
    tr: 'Ok tuşlarıyla projeler arasında geçebilir, Esc ile listeye dönebilirsin.',
    en: 'Use the arrow keys to move between projects and Esc to return to the list.',
  },
  // komut paleti
  paletBaslik: { tr: 'Git ya da komut çalıştır', en: 'Go to or run a command' },
  paletYer: { tr: 'Bölüm, proje ya da komut ara…', en: 'Search sections, projects or commands…' },
  paletBolum: { tr: 'Bölüm', en: 'Section' },
  paletProje: { tr: 'Proje', en: 'Project' },
  paletKomut: { tr: 'Komut', en: 'Command' },
  paletBos: { tr: 'Sonuç yok', en: 'No results' },
  kapat: { tr: 'Kapat', en: 'Close' },
  bulunamadi: { tr: 'Sayfa bulunamadı', en: 'Page not found' },
  anaSayfa: { tr: 'Ana sayfaya dön', en: 'Back to home' },
} as const;

export type Anahtar = keyof typeof metin;
export const t = (anahtar: Anahtar, dil: Dil): string => metin[anahtar][dil];

/** "2026-10" → "Eki 2026" / "Oct 2026"; "2022" → "2022" */
export function tarih(deger: string | undefined, dil: Dil): string {
  if (!deger) return '';
  const [yil, ayNo] = deger.split('-');
  if (!ayNo) return yil;
  const d = new Date(Date.UTC(Number(yil), Number(ayNo) - 1, 1));
  return new Intl.DateTimeFormat(dil === 'tr' ? 'tr-TR' : 'en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function aralik(baslangic: string, bitis: string | undefined, dil: Dil): string {
  return `${tarih(baslangic, dil)} – ${bitis ? tarih(bitis, dil) : t('suruyor', dil)}`;
}
