# Deneme tablosu

MTS-PRJ-2026-014, 10. bölümdeki kabul denemelerinin sonuçları. Denemeler 25.11.2026 gecesi hem yerel önizlemede hem yayındaki adreste (<https://aliyilmaz16.github.io/>) çalıştırıldı.

Ortam: Playwright 1.65 ile indirilen Chromium 159, Firefox 159 ve WebKit 27.2 (macOS). Lighthouse, Playwright'ın Chromium'uyla çalıştırıldı. Otomatik denemeler `testler/kabul.spec.ts` dosyasında; yerelde ve canlıda 52'si geçti, 8'i bilerek atlandı (aşağıda açıklanıyor).

## Sonuçlar

| No | Deneme | Sonuç | Nasıl denendi | Kanıt (`docs/kanit/`) |
| --- | --- | --- | --- | --- |
| D1 | Telefon genişliğinde açılır | Geçti | 320, 390, 768, 1024 ve 1440 px genişlikte dört sayfada yatay kaydırma ve taşan öğe arandı; 390 px'te bütün düğmelerin en az 44 px olduğu ölçüldü; mobil menü açılıp bölüme gidildi. Üç tarayıcı. | `D1-telefon-*.jpg`, `adim2-giris-telefon.jpg` |
| D2 | Baştan sona kaydırılır | Geçti | Fare tekeriyle adım adım kaydırıldı. Kartlar belge sırasıyla, zaman çizgisi durakları sırayla belirdi; kaydırma konumu hiç geri gitmedi ve sayfa sonuna ulaştı; sonda gizli öğe kalmadı. Chromium ve Firefox'ta tekerle, WebKit'te betikle kaydırılarak. | `D2-belirme-sirasi-*.txt`, `adim4-kayit-masaustu.webm`, `adim4-kayit-telefon.webm` |
| D3 | Hareketi azalt tercihi açılır | Geçti | Tercih açıkken: `anim` sınıfı yok, bütün öğeler baştan görünür, çalışan animasyon sayısı 0 (kartın üstüne gelince de), ilerleme çubuğu gizli, yumuşak kaydırma kapalı, benzetim tuvali yarım saniye arayla aynı. Üç tarayıcı. | `D3-hareket-azalt-*.jpg` |
| D4 | Kaydırma hareketini desteklemeyen tarayıcıda açılır | Geçti (benzetimle) | İndirilen üç tarayıcının üçü de `animation-timeline` desteği bildirdi; gerçek bir desteksiz tarayıcı elde yoktu. Bu yüzden özellik ve IntersectionObserver kapatılarak denendi: 7 bölüm, 6 kart, gizli öğe 0. Betik yedeğinin ilerlemeyi ve çizgi dolumunu doğru hesapladığı ayrıca denendi (D4c). | `D4-*.txt`, `D4b-destek-*.txt`, `D4-desteksiz-*.jpg` |
| D5 | Fare kullanılmadan gezilir | Geçti | Tab ile bütün bağlantı ve düğmelere ulaşıldı, her durakta odak çerçevesi ölçüldü. Kart Enter ile açıldı, Esc ile kapandı, odak açılan karta döndü. Ok tuşlarıyla projeler arasında geçildi. Komut paleti klavyeyle açılıp proje seçildi. Chromium ve Firefox'ta tam; WebKit'te açma, Esc ve odak dönüşü. | `D5-kart-odak-*.jpg` |
| D6 | Dil değiştirilir | Geçti | Deneyim bölümündeyken dil değiştirildi: adres `/en/#experience` oldu ve bölüm görüş alanında kaldı; geri değiştirilince `/#deneyim`. Yedi İngilizce sayfanın görünen metni, alt metinleri, başlığı ve açıklaması tarandı; özel adlar dışında Türkçe harf içeren sözcük bulunmadı. Üç tarayıcı. | `D6-en-experience-*.jpg` |
| D7 | Tema değiştirilir, sayfa yenilenir | Geçti | Tema değişti, yenilemeden ve başka sayfaya geçtikten sonra korundu; kayıt silinince cihaz tercihi uygulandı. Karşıtlık oranları ölçüldü: koyu temada en düşük 6,96, açık temada en düşük 6,05 (sınır 4,5). Üç tarayıcı. | `D7-karsitlik-*.txt`, `D7-koyu-*.jpg`, `D7-acik-*.jpg` |
| D8 | Bütün bağlantılar denenir | Geçti, bir bağlantı doğrulanamadı | Bütün sayfalar dolaşılıp iç adresler, görseller, sayfa içi çapalar ve dış bağlantılar istendi. 64 adresin 63'ü 200 döndü. LinkedIn profil bağlantısı otomatik isteği 999 ile geri çevirdi (LinkedIn bunu bütün otomatik isteklere yapar); elle açılıp bakılmalı. | `D8-baglantilar.txt`, `canli/D8-baglantilar.txt` |
| D9 | Bir proje adresi doğrudan açılır | Geçti | `/proje/sec-ded/` ve `/en/project/sec-ded/` doğrudan açıldı. Ana sayfadan karta girilip geri tuşuna basıldı: kaydırma konumu 80 px içinde aynı. "Projelere dön" bağlantısı da aynı yere döndürdü. Üç tarayıcı. | `D9-dogrudan-*.jpg` |
| D10 | Sayfa denetim aracı çalıştırılır | Geçti | Lighthouse, dört sayfa, mobil ve masaüstü, her biri üç koşu. Canlı sitede ortanca başarım 98 - 100, erişilebilirlik 100, iyi uygulamalar 100, SEO 100. Aşağıda ayrıntı. | `D10-lighthouse-canli.txt`, `D10-lighthouse-yerel.txt`, `D10-lighthouse-*.html` |
| D11 | İçerik dosyasına deneme projesi eklenir | Geçti | `icerik.yaml` dosyasına 6 satırlık görselsiz bir proje eklendi, başka dosyaya dokunulmadı. İki dilde ana sayfada kart, ayrıntı sayfası ve komut paleti satırı oluştu. Sonra geri alındı. | `D11-icerik-dosyasi.txt` |
| D12 | Betikler kapatılır | Geçti | Betikler kapalıyken bütün başlıklar, 6 kart, 9 zaman çizgisi durağı ve öteki projeler görünür; karta tıklanınca ayrıntı sayfası, oradan İngilizcesi açıldı. Üç tarayıcı. | `D12-betiksiz-*.jpg` |

## D10 ayrıntısı

Canlı site, ortanca (üç koşunun değerleri parantez içinde):

| Sayfa | Mobil başarım | Masaüstü başarım | Erişilebilirlik | İyi uygulamalar | SEO |
| --- | --- | --- | --- | --- | --- |
| `/` | 98 (97/98/99) | 100 | 100 | 100 | 100 |
| `/en/` | 98 (90/98/99) | 100 | 100 | 100 | 100 |
| `/proje/balon-takip/` | 100 (99/100/100) | 100 | 100 | 100 | 100 |
| `/proje/isg-guard/` | 100 (98/100/100) | 100 | 100 | 100 | 100 |

Ölçüm, makinenin o anki yüküne göre oynuyor. Yerel koşulardan birinde `/proje/balon-takip/` mobil başarımı 71 çıktı (öteki iki koşu 95 ve 96); geliştirme sırasında ana sayfada da 72 ve 77 görüldü, aynı sayfa hemen ardından 97 - 100 verdi. Düşük değerlerde süre "atfedilemeyen" işte geçiyordu, yani sayfanın kendi betiğinde değil. Yine de girişteki benzetim hafifletildi: ızgara CSS'e alındı, çözünürlük sınırlandı, telefonda saniyede 30 kareye indirildi ve yükleme bittikten sonra başlatıldı.

Lighthouse'un işaretlediği tek madde "bf-cache": neden olarak `CacheLimitPrunedOnCriticalMemoryPressure` verdi. Bu, başsız tarayıcının bellek durumuyla ilgili; sayfada geri önbelleğini engelleyen bir şey bildirilmedi. D9'daki geri dönüş denemesi üç tarayıcıda geçti.

## Denemelerin yakaladığı kusurlar

| Kusur | Yakalayan | Düzeltme |
| --- | --- | --- |
| CSS küçültücü `animation-timeline` bildirimini bozuyordu; ilerleme çubuğu derlenmiş sitede hiç dolmuyordu | D4b | CSS küçültme kapatıldı |
| GitHub'dan gelen "son güncelleme" satırları listeye sonradan eklenince alttaki bölümler yaklaşık 100 px aşağı kayıyor, `/#deneyim` gibi bağlantılar yanlış yere iniyordu. Yalnızca canlı sitede, ilk yayından sonra görüldü | D6 (canlı) | Tarih satırına baştan yer ayrıldı; kalıcı bir deneme eklendi |
| Dil değişiminde bölüm, kaydırma sürerken yanlış hesaplanabiliyordu | D6 | Bölüm, tıklama anındaki konumdan hesaplanıyor |

## Atlanan ve yapılamayan denemeler

| Konu | Durum |
| --- | --- |
| Atlanan 8 otomatik deneme | Hata değil, tarayıcıya göre ayrım: D8 tarayıcıdan bağımsız olduğu için yalnızca Chromium'da çalışıyor (2 atlama); D2 ve D5'in tam hâli WebKit'te, WebKit'e özel kısa hâlleri öteki iki tarayıcıda atlanıyor (6 atlama). |
| WebKit'te Tab ile tam tur (D5) | Yapılmadı. macOS'ta WebKit bağlantılara Tab ile odaklanmayı varsayılan olarak kapalı tutuyor (Option+Tab ya da Safari ayarı gerekir). WebKit'te yalnızca kart açma, Esc ve odak dönüşü denendi. |
| WebKit'te fare tekeriyle kaydırma (D2) | Yapılmadı; Playwright'ın WebKit'inde tekerlek olayı güvenilir değil. Betikle kaydırılarak içeriğin belirdiği denendi. |
| Gerçek telefon | Yapılmadı. Telefon denemeleri tarayıcıda ekran boyutu ve dokunmatik benzetimiyle yapıldı; gerçek bir iOS ya da Android cihazda açılıp bakılmalı. |
| Gerçek Safari, Chrome ve Edge | Yapılmadı. Playwright'ın kendi Chromium, Firefox ve WebKit derlemeleri kullanıldı; makinede Chrome kurulu değildi. |
| Ekran okuyucu | Yapılmadı. Lighthouse'un otomatik erişilebilirlik denetimi 100 verdi, ama VoiceOver ya da NVDA ile elle denenmedi. |
| Desteksiz tarayıcı (D4) | Gerçeği yok, benzetimle yapıldı (yukarıda). |
| LinkedIn bağlantısı (D8) | Otomatik doğrulanamadı; elle bakılmalı. |
| GitHub istek sınırı | Elle denenmedi. Kod, istek başarısız olursa içerik dosyasındaki listeyi olduğu gibi bırakıyor; D12'de betiksiz hâlde listenin göründüğü doğrulandı. |
| Paylaşım önizlemesi | `og:` etiketleri ve görseller (`/og-tr.png`, `/og-en.png`) yayında ve 200 dönüyor; LinkedIn ya da WhatsApp'ta gerçek bir paylaşımla bakılmadı. |

## Gereksinim karşılığı

| Gereksinim | Nerede denendi |
| --- | --- |
| İ1, D11 | `araclar/d11.mjs` |
| İ2, İ3 | D9, D12; boş alanların gizlendiği `docs/kanit/adim3-ayrinti-isg-guard.jpg` |
| İ4 | D6 |
| İ5 | Elle: sayılar README dosyalarından alındı (`docs/EKSIKLER.md`, "okunup onaylanacaklar") |
| E1, E5, E6 | D2, D4b, ekran kayıtları |
| E2, E3 | `adim3-kart-ustune-gelme.jpg`, D5, D9 |
| E4 | `adim3-kart-telefon.jpg`: özet ve araçlar kartta görünür |
| E7 | D3 |
| E8 | D4, D4c, D12 |
| E9 | D1 ve D2'de yatay taşma ölçümü; Lighthouse CLS 0 (bir masaüstü koşusunda 0,058); GitHub verisi gelince alttaki bölümün yerinin değişmediği ayrı bir denemeyle ölçülüyor |
| E10 | D5 |
| T1 | GitHub Pages, durağan çıktı |
| T2 | D1 |
| T3 | D7 |
| T4 | Görseller WebP, ekrana göre boyutlu, ilk ikisi dışında tembel yüklenir; video `preload="none"` ve sessiz |
| T5 | D12 |
| T6 | Başlık, açıklama, `og:` etiketleri ve görseller iki dilde; D6 başlık ve açıklamayı da tarar |
| T7 | Dış yazı tipi ve betik yok; tek dış istek `api.github.com` (`docs/KARAR.md`) |

## Denemeleri yeniden çalıştırma

```bash
npm run build && npx astro preview --background && npm test   # yerel
TABAN=https://aliyilmaz16.github.io npx playwright test     # canlı
node araclar/lighthouse.mjs https://aliyilmaz16.github.io   # D10
node araclar/d11.mjs                                        # D11
```
