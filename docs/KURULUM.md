# Kurulum notu · Ali Yılmaz kişisel web sitesi

Yayın adresi: <https://aliyilmaz16.github.io/> (İngilizce: <https://aliyilmaz16.github.io/en/>)

Tek sayfalık tanıtım sitesi ve her proje için bir ayrıntı sayfası. Türkçe ve İngilizce, koyu ve açık tema. Sunucu tarafı, veritabanı, çerez ve izleme aracı yok.

Sitenin bütün içeriği kökteki **`icerik.yaml`** dosyasındadır. Yeni proje ya da staj eklemek için yalnızca o dosya değişir.

## Yerelde çalıştırma

Node 22.23 ya da üstü gerekir.

```bash
npm install
npm run dev        # http://localhost:4321 adresinde açılır, dosya değişince yenilenir
```

Yayındaki hâlin aynısını görmek için:

```bash
npm run build      # dist/ klasörüne derler
npm run preview    # derlenmiş siteyi http://localhost:4321 adresinde sunar
npx astro preview stop   # önizlemeyi kapatır
```

## Yayına alma

`main` dalına gönderilen her değişiklik, `.github/workflows/yayin.yml` ile kendiliğinden derlenir ve GitHub Pages'e konur. Ayrıca bir şey yapmak gerekmez:

```bash
git add -A
git commit -m "Yeni staj açıklaması"
git push
```

Derlemenin durumu deponun **Actions** sekmesinde görünür; bir iki dakika sürer.

Kendi alan adını bağlamak için: `public/CNAME` dosyasına alan adını yaz (tek satır), `icerik.yaml` ve `astro.config.mjs` içindeki `https://aliyilmaz16.github.io` adresini değiştir, alan adı sağlayıcısında GitHub Pages kayıtlarını gir.

Eski site (2025) `eski-site-2025` dalında durur.

## Yeni proje ekleme

1. Görselleri `src/assets/projeler/<kimlik>/` klasörüne koy. Boyutlarını küçültmen gerekmez; derleme küçültür.
2. `icerik.yaml` içinde `projeler:` listesine bir kayıt ekle. Listedeki sıra, sitedeki sıradır.

```yaml
  - kimlik: yeni-proje            # adres olur: /proje/yeni-proje/
    ad: { tr: Yeni Proje, en: New Project }
    alan: web                     # "alanlar" listesindeki anahtarlardan biri
    yil: 2027                     # ya da "2026 - 2027"; boşsa gösterilmez
    baglam: { tr: Ders projesi, en: Course project }
    ozet: { tr: Tek cümlelik özet., en: One-sentence summary. }
    sorun: { tr: "...", en: "..." }
    rol: { tr: "...", en: "..." }
    araclar: [Python, OpenCV]
    karar: { tr: "...", en: "..." }
    sonuc: { tr: "...", en: "..." }
    gorseller:                    # ilki kartta görünür
      - dosya: ekran.png
        alt: { tr: Ana ekran, en: Main screen }
    video: /video/yeni-proje.mp4  # isteğe bağlı; dosya public/video/ altında, H.264
    video_baglanti: https://www.youtube.com/watch?v=...   # isteğe bağlı
    depo: https://github.com/AliYilmaz16/yeni-proje   # boş bırakılırsa "özel depo" yazar
```

Boş bırakılan alan sitede gösterilmez. Özel bir depoyu kısa listeye eklemek için `depo_adi` yerine `ozel: true` yaz; bağlantı verilmez.

Üç projenin sayfasında etkileşimli bir örnek var (`etkilesim: stackout | randevu | hamming`). Kodları `src/components/*Demo.astro` ve `src/scripts/demo-*.ts` dosyalarındadır; yeni bir örnek eklemek kod yazmayı gerektirir.

Boş bırakılan alan sitede gösterilmez. Görsel verilmezse kart, adın ilk harfleriyle çizilir. Kısa listeye (öteki projeler) eklemek için `diger_projeler:` altına `depo_adi`, `ad`, `alan`, `aciklama` yazman yeter.

GitHub'da açıklaması yazılmış yeni bir depo açarsan, öteki projeler listesinin sonunda kendiliğinden görünür. Görünmesini istemediğin depoyu `gizli_depolar:` listesine ekle.

## Yeni staj ya da görev ekleme

`icerik.yaml` içinde `deneyim:` listesinin başına ekle (en yeni en üstte):

```yaml
  - kurum: Kurum Adı
    gorev: { tr: Yazılım Stajyeri, en: Software Intern }
    tur: staj                     # staj | takim
    baslangic: 2027-01
    bitis: 2027-03                # yazılmazsa "sürüyor" görünür ve girişteki "şu an" satırına çıkar
    maddeler:                     # en çok üç madde; boş bırakılabilir
      - { tr: Ne yaptığın., en: What you did. }
```

Bir staj bittiğinde yalnızca `bitis` satırını eklemen yeter; "sürüyor" bilgisi ve girişteki "şu an" satırı buradan türetilir.

## Öteki sık işler

| İş | Yapılacak |
| --- | --- |
| Fotoğraf eklemek | Dosyayı `src/assets/ali.jpg` olarak koy, `kisi.fotograf: ali.jpg` yaz |
| E-posta göstermek | `kisi.eposta` alanına yaz |
| Özgeçmiş indirme düğmesi | PDF'i `public/` altına koy, `kisi.ozgecmis` alanına dosya adını yaz |
| Hakkımda yazısını değiştirmek | `kisi.hakkimda.tr` ve `kisi.hakkimda.en` |
| Paylaşım önizleme görselini yenilemek | `node araclar/og.mjs` (ad ya da unvan değişince) |
| Düğme ve başlık metinleri | `src/lib/i18n.ts` |
| Renkler ve yazı tipleri | `src/styles/global.css` dosyasının başı |

`icerik.yaml` içinde biçim hatası olursa derleme durur ve hangi alanın yanlış olduğunu söyler.

## Denemeler

```bash
npx playwright install chromium firefox webkit   # bir kez
npm run build && npx astro preview --background --host 127.0.0.1   # derle, önizlemeyi arka planda başlat
npm test                                         # D1-D9, D12: üç tarayıcıda
npx astro preview stop                           # önizlemeyi kapat
node araclar/lighthouse.mjs                      # D10: sayfa denetimi
node araclar/d11.mjs                             # D11: içerik dosyasına deneme projesi
```

Sonuçlar `docs/DENEME.md` dosyasında, kanıtları `docs/kanit/` klasöründedir.

## Klasörler

```
icerik.yaml            bütün içerik
src/assets/projeler/   proje görselleri
src/views/             ana sayfa ve proje sayfası
src/layouts/Base.astro üst menü, alt bilgi, komut paleti
src/scripts/           site.ts (etkileşimler), takip.ts (girişteki benzetim)
src/styles/global.css  bütün stiller
public/                yazı tipleri, video, paylaşım görselleri
testler/, araclar/     kabul denemeleri ve yardımcı betikler
docs/                  kurulum notu, karar notu, deneme tablosu, eksikler listesi
```
