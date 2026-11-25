# Karar notu

MTS-PRJ-2026-014 belgesinin ajana bıraktığı seçimler ve gerekçeleri.

## Yapım aracı: Astro

Belge iki yol sunuyordu: düz HTML, CSS ve JavaScript ya da bir durağan site üreticisi. Astro seçildi.

- İçerik tek dosyada (`icerik.yaml`) duruyor ve derleme sırasında HTML'e dönüşüyor. Böylece betikler kapalıyken de bütün metin okunuyor (T5, D12). Düz HTML yolunda içeriği tek dosyada tutmak için sayfayı tarayıcıda betikle çizmek gerekirdi; bu T5'i bozardı.
- İki dil ve altı projenin on iki ayrıntı sayfası aynı şablondan üretiliyor; elle çoğaltma yok (İ1, İ4, D11).
- Görseller derlemede küçültülüyor ve ekrana göre boyutlanıyor (T4). Depolardaki ekran görüntüleri toplam 19 MB idi; ana sayfa görselleri birkaç yüz kB'a indi.
- Tarayıcıya giden betik az: arayüz çatısı yok, toplam yaklaşık 11 kB (sıkıştırılmamış) düz JavaScript.

Eksisi derleme adımıdır; bunu GitHub Actions üstleniyor, Ali'nin yapması gereken `git push`.

Sürüm: Astro 7.4. Ek bağımlılık: `yaml` (içerik dosyasını okumak için), `sharp` (görsel küçültme). Geliştirme bağımlılıkları: Playwright, Lighthouse.

## İçerik dosyası: YAML

Ali'nin elle değiştireceği dosya olduğu için yorum satırı yazılabilen, tırnak ve virgül hatası az olan bir biçim seçildi. Derleme sırasında şema denetimi yapılıyor; yanlış ya da eksik alan olduğunda derleme hangi alan olduğunu söyleyerek duruyor.

## Proje ayrıntısı: kendi sayfası

Belge panel ya da ayrı sayfa seçimini ajana bıraktı. Ayrı sayfa seçildi:

- Her projenin paylaşılabilir adresi kendiliğinden oluyor (`/proje/balon-takip/`, `/en/project/balon-takip/`) ve geri tuşu tarayıcının kendi davranışıyla çalışıyor (D9).
- Betik kapalıyken de açılıyor.
- Kart görseli, tarayıcının sayfalar arası geçiş özelliğiyle (cross-document view transitions) ayrıntı sayfasındaki görsele dönüşüyor; destek yoksa sayfa düz açılıyor.
- Esc listeye döndürür ve odağı açılan karta verir; ok tuşları önceki ve sonraki projeye geçer (E10).

## Hareket

| İş | Yöntem | Destek yoksa |
| --- | --- | --- |
| Proje satırlarının, zaman çizgisi duraklarının belirmesi | IntersectionObserver; öğe bir kez belirir, sınıf eklenir, izleme bırakılır | İçerik baştan görünür |
| İlerleme çubuğu | CSS `animation-timeline: scroll()` | Küçük bir kaydırma dinleyicisi |
| Zaman çizgisinin dolması | CSS `animation-timeline: view()` | Aynı dinleyici |
| Karttan ayrıntıya geçiş | CSS `@view-transition` | Düz sayfa geçişi |

Belirme için tarayıcının kaydırmaya bağlı animasyonu kullanılmadı, çünkü o yöntemde hareket yukarı kaydırınca geri oynar; belge ise bir öğenin bir kez belirmesini istiyor (7. bölüm). İlerleme çubuğu ve çizgi dolumu kaydırma konumuna doğrudan bağlı olduğu için tarayıcının kendi özelliğiyle yapıldı.

Güvenlik ağı: içerik yalnızca `html.anim` sınıfı varken gizlenir. Bu sınıf, kullanıcı "hareketi azalt" demediyse ve tarayıcı destekliyorsa eklenir; betik 2,5 saniye içinde hazır olmazsa geri alınır. Yalnızca `opacity` ve `transform` canlandırılır (E9).

Playwright ile indirilen Chromium, Firefox ve WebKit sürümlerinin üçü de `animation-timeline: scroll()` desteği bildirdi (`docs/kanit/D4b-destek-*.txt`). Bu yüzden desteksiz durum gerçek bir tarayıcıda denenemedi; özellik kapatılarak benzetildi (D4) ve betik yedeğinin kaydırma konumunu doğru hesapladığı ayrıca denendi (D4c).

## Tasarım yönü: koyu teknik

Belgenin varsayılanı. Motif Ali'nin kendi işinden alındı: Balon Takip'in çıktısındaki takip çemberi, nişan çizgileri ve koordinat etiketi. Aynı dil kartlarda (üstüne gelince köşe ayraçları kartı "kilitler"), bölüm başlıklarında ve girişteki benzetimde kullanıldı.

- Tek vurgu rengi: koyu temada `#b8f04a`, açık temada aynı tonun koyusu `#3b6600`. Bağlantılar, birincil düğme ve zaman çizgisi aynı rengi kullanır.
- İki yazı tipi: Inter Tight (metin) ve JetBrains Mono (etiketler). İkisi de Türkçe harfleri içerir, SIL Open Font License ile dağıtılır ve depoya gömülüdür.
- Karşıtlık oranları iki temada da 4,5'in üstünde (`docs/kanit/D7-karsitlik-*.txt`).
- Yetenek yüzdesi çubuğu ve sayaç yok.

## Ek özellikler

| Özellik | Durum | Not |
| --- | --- | --- |
| Proje süzgeci | Yapıldı | Alana göre; öteki projeler listesini de süzer |
| Özgeçmiş yazdırma görünümü | Yapıldı | Sayfa yazdırılınca sade, tek sütun özgeçmiş çıkar. İndirme düğmesi dosya verilince görünür |
| "Şu an" satırı | Yapıldı | Bitiş tarihi olmayan deneyim satırlarından türetilir |
| Komut paleti | Yapıldı | Ctrl K ya da `/`; bölüm, proje, tema, dil, yazdır |
| GitHub'dan canlı veri | Yapıldı | Öteki projelerin son güncelleme tarihi ve yeni depolar. Sonuç tarayıcıda 6 saat saklanır; istek başarısız olursa içerik dosyasındaki liste kalır |
| Projeler arası geçiş | Yapıldı | Kart görseli ayrıntıya dönüşür; ok tuşları |
| Girişte canlı gösterim | Yapıldı | Takip benzetimi. Ekran dışındayken ve "hareketi azalt" açıkken durur; telefonda saniyede 30 kareyle sınırlı; yükleme bittikten sonra başlar |
| Katkı grafiği | Yapılmadı | GitHub'ın katkı verisi kimlik doğrulaması ya da üçüncü taraf servis ister; ikisi de belgenin sınırlarına uymuyor |
| Mini terminal | Yapılmadı | Komut paleti aynı işi daha kısa yoldan görüyor; "yalnızca gösteriş" ölçüsüne takıldı |

## Dış kaynaklar (T7)

Sayfa yüklenirken dış kaynaktan yazı tipi ya da betik yüklenmez. Tek dış istek, ziyaretçi projeler bölümüne yaklaşınca `api.github.com` adresine yapılan depo listesi isteğidir (çerez ve kimlik bilgisi gönderilmez). Videolar YouTube'a gömülmedi, bağlantı olarak verildi.

## Yayın

Mevcut `AliYilmaz16.github.io` deposu kullanıldı. Eski site `eski-site-2025` dalında saklandı; yeni site `main` dalına normal commit olarak eklendi. Pages, GitHub Actions ile derleyecek şekilde ayarlandı.

## Karşılaşılan bir tuzak

CSS küçültücü (Lightning CSS), `animation-timeline` bildirimini `animation` kısaltmasının içine taşıyıp tarayıcıların tanımadığı bir satır üretiyordu; ilerleme çubuğu derlenmiş sitede hiç dolmuyordu. D4b denemesi bunu yakaladı. CSS küçültme kapatıldı (`astro.config.mjs`); stiller yaklaşık 32 kB (sıkıştırılmamış) olarak sayfanın içine gömülü.

## Kod alınan örnekler

Belgedeki örnek depolardan (Spacefolio, devportfolio, terminal-portfolio) kod alınmadı; yalnızca fikir olarak komut paleti ve zaman çizgisi düşünüldü.
