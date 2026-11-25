# Eksikler listesi

Ali'nin doldurması ya da onaylaması gereken alanlar. Hepsi `icerik.yaml` dosyasında `EKSIK:` ya da `TASLAK:` notuyla işaretli. Boş alanlar sitede görünmez; site bu hâliyle de düzgün durur.

## Doldurulacaklar

| Alan | `icerik.yaml` içindeki yeri | Şu anki durum |
| --- | --- | --- |
| İki stajın açıklaması (BİRSAV, Derin Teknoloji) | `deneyim[].maddeler` | Boş; özgeçmişte de yoklar. Satırlar kurum, görev ve tarihle görünüyor. En çok üç madde. Kurumun iç işlerine, müşterilerine ya da yayımlanmamış ürünlerine dair ayrıntı yazma. |
| E-posta | `kisi.eposta` | Yok. Özgeçmişinde yazıyor ama siteye koymak için açık onayın gerekiyor; "ekle" dersen eklenir. İletişimde yalnızca LinkedIn ve GitHub var. |
| Özgeçmiş dosyası | `kisi.ozgecmis` | Yok. Verdiğin PDF telefon numarası ve ilçe içerdiği için siteye konmadı; bunlar çıkarılmış bir sürüm verirsen indirme düğmesi açılır. "Özgeçmiş olarak yazdır" düğmesi çalışıyor. |
| Yedi projedeki rolün | `projeler[].rol` | Yalnızca Balon Takip'te dolu (özgeçmişteki Sefir-i Gök satırından). Stackout, Berber Randevu Sistemi, isg-guard, Pardus Müzik Çalar, SEC-DED, C Sözdizimi Vurgulayıcı ve Hayvanat Bahçesi'nde tek başına mı takımla mı çalıştığın kaynaklarda yazmıyor. |
| Berber Randevu Sistemi ekran görüntüsü | `projeler[].gorseller` | Yok; depoda görsel bulunmuyor. Kart adın baş harfleriyle çiziliyor. Görsel verirsen eklenir. |
| Stackout ekran görüntüsü | `projeler[].gorseller` | Yalnızca uygulama simgesi var. Oyun içi ekran görüntüsü verirsen eklenir. |
| SEC-DED projesinde verilen önemli karar | `projeler[3].karar` | Boş; README'de bir karar anlatılmıyor. |
| Sertifikalar | `programlar` | İki eğitim programı depolardan eklendi. SmartHome-Energy-Classifier deposunda iki sertifika görseli var; siteye konmadı, istersen eklenir. |

## Okunup onaylanacaklar

| Konu | Not |
| --- | --- |
| Hakkımda yazısı | Özgeçmişindeki profil özetinden derlendi; kendi sözlerinle düzeltebilirsin. |
| Deneyim açıklamaları | Spikedge, Crowtec, Matris, Huawei Student Developers ve Sefir-i Gök satırları özgeçmişindeki cümlelerden yazıldı. Spikedge ve Crowtec satırlarının kurum açısından paylaşılabilir olduğunu sen onayla. |
| Tarihler | LinkedIn ile özgeçmiş ayrıştığı yerde özgeçmiş esas alındı: Crowtec Eylül-Ekim 2025 (LinkedIn: Ocak 2026'ya kadar), Matris üyeliği Eylül 2026'da bitiyor ve kaptanlık Eylül 2026'da başlıyor (LinkedIn: Ekim). |
| Sefir-i Gök görevi | "Takım Üyesi" yerine özgeçmişteki "Software Team Lead" (Yazılım Takım Lideri) yazıldı. |
| LinkedIn adresi | Sitedeki adres ile özgeçmişteki (`linkedin.com/in/alii-yilmazz`) farklı. Sitedeki değiştirilmedi; ikisi de otomatik denetlenemiyor. Hangisi geçerliyse `kisi.linkedin` alanına yaz. |
| Fotoğraf | Verdiğin kare, yanda duran kişi dışarıda kalacak biçimde kare kırpıldı. |
| İngilizce metinlerin tamamı | Depo açıklamaları Türkçeydi, çeviriyi ajan yaptı. Okuyup düzelt. |
| Proje metinleri (sorun, karar, sonuç) | README dosyalarından özetlendi; README'de olmayan başarı ya da ölçüm eklenmedi. Yanlış anlaşılmış bir yer varsa düzelt. |
| Balon Takip'teki rol cümlesi | Özgeçmişteki tek satırdan yazıldı; takımdaki payını sen bilirsin. |
| Öne çıkan altı proje ve sırası | Belgedeki varsayılan: Balon Takip ve isg-guard üstte. |
| Görev adlarının Türkçesi | Kaynaklarda İngilizce yazıyordu. Türkçeleri: Yazılım Stajyeri, Görüntü İşleme Stajyeri, Çekirdek Ekip Üyesi, Takım Kaptanı, Yazılım Takım Lideri. |
| Topluluk adının İngilizcesi | "Machine Technologies, Robotics and Automation Society" olarak çevrildi; resmî bir İngilizce adı varsa değiştir. |
| Bölüm adı | "Bilgisayar Mühendisliği" (LinkedIn tanıtım satırı "Computer Science" diyor). |
| C Sözdizimi Vurgulayıcı için Medium yazısı | README'de bağlantısı var; adresi e-posta adının ilk kısmını içerdiği için siteye konmadı. İstersen eklenir. |
| Hayvanat Bahçesi canlı bağlantısı | README'deki sunucu adresi doğrulanamadığı için siteye konmadı. |
| Özel depolardan eklenenler | Stackout ve Berber Randevu Sistemi öne çıkanlara, MatDrone tek cümleyle kısa listeye eklendi. Depolar özel kaldığı için bağlantı yok, "özel depo" yazıyor. Berber dükkânının ve sahibinin adı sitede geçmiyor. |
| Stackout'un mağaza durumu | Depodaki yayın listesi işaretlenmemiş olduğu için "mağazada yayında" yazılmadı. Yayındaysa bağlantısını ver. |
| Etkileşimli örnekler | Stackout, Berber Randevu Sistemi ve SEC-DED sayfalarındaki örnekleri ajan yazdı; projelerin kendi kodu değil, aynı kuralı gösteren küçük benzetimler. Sayfada da böyle yazıyor. |
| Siteye alınmayan özel depolar | Firma-Katalog (senin isteğinle), BirBebek, Crowtec-Staj ve pan-tilt-arayuz (staj işi göründükleri için), ortofoto (MatDrone ile aynı iş), GUI-with-Python, leetcode-solutions-java, Warrior-Game-with-Python. |
| Takım arkadaşları ve kurum çalışanları | Hiçbirinin adı sitede geçmiyor. |

## Kararını bekleyenler

| Konu | Uygulanan varsayılan |
| --- | --- |
| Yayın yeri | Mevcut `AliYilmaz16.github.io` deposu. Kendi alan adını alırsan docs/KURULUM.md içindeki adımlarla bağlanır. |
| Eski site | `eski-site-2025` dalında saklandı. Gerekmiyorsa dalı silebilirsin. |
| Tasarım yönü | Koyu teknik; açık tema da var. |
| Ek özellikler | Belgedeki ilk üçü (süzgeç, yazdırma görünümü, "şu an" satırı) ve ayrıca komut paleti, GitHub'dan canlı liste, projeler arası geçiş, girişte takip benzetimi. Katkı grafiği ve mini terminal yapılmadı. |
| Ziyaret sayımı | Yok. İstersen çerez kullanmayan bir yöntem seçilir. |
| Belgenin numarası | MTS-PRJ-2026-014 olarak kaldı; belge depoya konmadı (TAKIM İÇİ). |
