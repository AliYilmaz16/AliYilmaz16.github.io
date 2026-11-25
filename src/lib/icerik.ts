// icerik.yaml dosyasını okur, biçimini denetler ve sayfalara verir.
// Biçim hatası olursa derleme, hangi alanın yanlış olduğunu söyleyerek durur.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';
import ham from '../../icerik.yaml?raw';

export type Dil = 'tr' | 'en';

const ikiDil = z.union([z.string(), z.object({ tr: z.string(), en: z.string() })]);
const ikiDilBos = ikiDil.optional().default('');
const ay = z.union([z.string(), z.number()]).transform(String);

const gorsel = z.object({ dosya: z.string(), alt: ikiDilBos });

const proje = z.object({
  kimlik: z.string().regex(/^[a-z0-9-]+$/, 'kimlik yalnızca küçük harf, rakam ve tire içerebilir'),
  ad: ikiDil,
  alan: z.string(),
  baglam: ikiDilBos,
  ozet: ikiDil,
  sorun: ikiDilBos,
  rol: ikiDilBos,
  araclar: z.array(z.string()).default([]),
  karar: ikiDilBos,
  sonuc: ikiDilBos,
  gorseller: z.array(gorsel).nullish().transform((v) => v ?? []),
  video: z.string().optional().default(''),
  video_baglanti: z.string().optional().default(''),
  depo: z.string().optional().default(''),
  etkilesim: z.enum(['stackout', 'randevu', 'hamming']).optional(),
});

const sema = z.object({
  site: z.object({ adres: z.string(), baslik: ikiDil, aciklama: ikiDil }),
  kisi: z.object({
    ad: z.string(),
    unvan: ikiDil,
    tanitim: ikiDil,
    konum: ikiDil,
    hakkimda: z.object({ tr: z.array(z.string()), en: z.array(z.string()) }),
    simdi: z.array(ikiDil).nullish().transform((v) => v ?? []),
    fotograf: z.string().nullish().transform((v) => v ?? ''),
    eposta: z.string().nullish().transform((v) => v ?? ''),
    ozgecmis: z.string().nullish().transform((v) => v ?? ''),
    linkedin: z.string().optional().default(''),
    github: z.string().optional().default(''),
    github_kullanici: z.string().optional().default(''),
  }),
  alanlar: z.record(z.string(), ikiDil),
  projeler: z.array(proje),
  diger_projeler: z
    .array(z.object({ depo_adi: z.string().optional().default(''), ozel: z.boolean().optional().default(false), ad: ikiDil, alan: z.string(), aciklama: ikiDilBos }))
    .nullish()
    .transform((v) => v ?? []),
  gizli_depolar: z.array(z.string()).nullish().transform((v) => v ?? []),
  deneyim: z.array(
    z.object({
      kurum: ikiDil,
      gorev: ikiDil,
      tur: z.enum(['staj', 'takim']).default('staj'),
      baslangic: ay,
      bitis: ay.optional(),
      maddeler: z.array(ikiDil).max(3, 'bir deneyim satırında en çok üç madde olur').nullish().transform((v) => v ?? []),
      proje: z.string().optional(),
    }),
  ),
  egitim: z.array(z.object({ kurum: ikiDil, bolum: ikiDil, baslangic: ay, bitis: ay.optional() })),
  programlar: z
    .array(z.object({ ad: ikiDil, tarih: ay.optional(), baglanti: z.string().optional() }))
    .nullish()
    .transform((v) => v ?? []),
  yetenekler: z.array(z.object({ grup: ikiDil, ogeler: z.array(z.string()) })),
  diller: z
    .array(z.object({ ad: ikiDil, duzey: ikiDilBos }))
    .nullish()
    .transform((v) => v ?? []),
});

const sonuc = sema.safeParse(parse(ham));
if (!sonuc.success) {
  const satirlar = sonuc.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`icerik.yaml biçim hatası:\n${satirlar}`);
}

export const icerik = sonuc.data;
export type Proje = (typeof icerik.projeler)[number];

for (const p of icerik.projeler) {
  if (!(p.alan in icerik.alanlar)) throw new Error(`icerik.yaml: "${p.kimlik}" projesinin alanı (${p.alan}) "alanlar" listesinde yok`);
}

/** İki dilli alandan istenen dili seçer. */
export function c(deger: string | { tr: string; en: string } | undefined, dil: Dil): string {
  if (!deger) return '';
  return typeof deger === 'string' ? deger : (deger[dil] ?? deger.tr ?? '');
}

// Proje görselleri: src/assets/projeler/<kimlik>/<dosya>
const dosyalar = import.meta.glob<{ default: ImageMetadata }>('../assets/projeler/**/*.{png,jpg,jpeg,webp,avif}', { eager: true });

export function projeGorseli(kimlik: string, dosya: string): ImageMetadata {
  const yol = `../assets/projeler/${kimlik}/${dosya}`;
  const m = dosyalar[yol];
  if (!m) throw new Error(`icerik.yaml: görsel bulunamadı: src/assets/projeler/${kimlik}/${dosya}`);
  return m.default;
}

const kisiDosyalari = import.meta.glob<{ default: ImageMetadata }>('../assets/*.{png,jpg,jpeg,webp,avif}', { eager: true });
export function kisiGorseli(dosya: string): ImageMetadata | undefined {
  return kisiDosyalari[`../assets/${dosya}`]?.default;
}
