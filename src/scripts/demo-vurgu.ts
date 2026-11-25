// C belirteç ayırıcı: düzenli ifadeyle sırayla eşleştirir, her belirteci türüne göre renklendirir.
const kok = document.querySelector<HTMLElement>('[data-demo-vurgu]');
if (kok) {
  type Tur = 'anahtar' | 'tanimlayici' | 'sayi' | 'metin' | 'islec' | 'ayrac' | 'yorum' | 'onislemci';
  const ANAHTAR = new Set('auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while'.split(' '));
  const KALIP = /(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|(^[ \t]*#[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\d+(?:\.\d+)?[uUlLfF]*)|([A-Za-z_]\w*)|(&&|\|\||\+\+|--|->|<<=?|>>=?|[=!<>+\-*/%&|^]=?|[~?:])|([{}()[\];,.])|(\s+)|([\s\S])/gm;
  const adlar: Record<Tur, string> = JSON.parse(kok.dataset.adlar ?? '{}');
  const kod = kok.querySelector<HTMLTextAreaElement>('[data-kod]')!;
  const cikti = kok.querySelector<HTMLElement>('[data-cikti]')!;
  const sayim = kok.querySelector<HTMLElement>('[data-sayim]')!;
  const liste = kok.querySelector<HTMLElement>('[data-liste]')!;
  const toplam = kok.querySelector<HTMLElement>('[data-toplam]')!;
  const kacis = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function ayir(metin: string): { tur: Tur | ''; deger: string }[] {
    const sonuc: { tur: Tur | ''; deger: string }[] = [];
    for (const e of metin.matchAll(KALIP)) {
      const tur: Tur | '' = e[1] ? 'yorum' : e[2] ? 'onislemci' : e[3] ? 'metin' : e[4] ? 'sayi' : e[5] ? (ANAHTAR.has(e[5]) ? 'anahtar' : 'tanimlayici') : e[6] ? 'islec' : e[7] ? 'ayrac' : '';
      sonuc.push({ tur, deger: e[0] });
    }
    return sonuc;
  }

  function ciz() {
    const belirtecler = ayir(kod.value);
    cikti.innerHTML = belirtecler.map((b) => (b.tur ? `<span class="tk-${b.tur}">${kacis(b.deger)}</span>` : kacis(b.deger))).join('') + '\n';
    const gercek = belirtecler.filter((b) => b.tur);
    const say = new Map<Tur, number>();
    for (const b of gercek) say.set(b.tur as Tur, (say.get(b.tur as Tur) ?? 0) + 1);
    toplam.textContent = (kok!.dataset.mToplam ?? '').replace('{n}', String(gercek.length));
    sayim.innerHTML = [...say].map(([t, n]) => `<li><span class="tk-${t}">${adlar[t]}</span> ${n}</li>`).join('');
    liste.innerHTML = gercek.slice(0, 28).map((b) => `<li><code class="tk-${b.tur}">${kacis(b.deger.trim().slice(0, 22))}</code><small>${adlar[b.tur as Tur]}</small></li>`).join('');
  }
  kod.addEventListener('input', ciz);
  // Yükseklik CSS'te: renkli katman akışta durur ve boyu belirler, yazı alanı onun üstünü kaplar.
  // Sekme tuşu odağı kaçırmasın diye yakalanmaz: klavyeyle gezinen biri alandan çıkabilmeli.
  ciz();
}
