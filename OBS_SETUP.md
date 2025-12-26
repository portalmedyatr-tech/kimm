# 🎙️ OBS Setup Rehberi

## TikTok "Kim Milyoner Olmak İster" Oyunu - OBS Kurulumu

Bu rehber, oyunu TikTok canlı yayınına eklemek için gerekli adımları gösterir.

---

## 📋 Gereksinimler

- ✅ Node.js ve npm (geliştirme makinasında)
- ✅ OBS Studio (kurulu)
- ✅ TikTok Canlı Yayını (aktif)
- ✅ Aynı ağda bağlı bilgisayarlar (veya port forwarding)

---

## 🚀 Adım 1: Uygulamayı Başlat

### Windows/Mac/Linux'ta Terminal'de:

```bash
cd /path/to/project
npm install
npm run dev
```

**Çıktı:**
```
  VITE v7.3.0  ready in 163 ms
  ➜  Local:   http://localhost:5173/
```

---

## 🎥 Adım 2: OBS'de Browser Source Ekle

### 2.1 Yeni Scene Oluştur
1. **Sources** panelinde `+` butonuna tıkla
2. **Browser** seç

### 2.2 Browser Ayarları
| Ayar | Değer |
|------|-------|
| **URL** | `http://localhost:5173` |
| **Width (Genişlik)** | 1920 |
| **Height (Yükseklik)** | 1080 |
| **FPS** | 30 (veya yüksek) |

### 2.3 Gelişmiş Ayarlar (opsiyonel)
- ☑️ Refresh browser when scene becomes active (Sahne aktif olduğunda yenile)
- ☑️ Control audio via OBS (Ses kontrolünü OBS'ye bırak)

---

## 🎮 Adım 3: Oyun Ayarlarını Konfigüre Et

### TikTok Chat ID'nizi Alın

1. Verilen linki aç: `https://tikfinity.zerody.one/widget/chat?cid=1209191`
2. URL'den **cid** değerini al (örnek: `1209191`)

### Ayarları Değiştir

`src/config/index.ts` dosyasını aç:

```typescript
export const TIKTOK_CONFIG = {
  apiBaseUrl: 'https://tikfinity.zerody.one',
  cid: '1209191', // ← BURAYA SENİN ID'Nİ KOY
  pollInterval: 2000,
}
```

Dosyayı kaydet → Uygulama otomatik yenilenir

---

## 🔗 Bileşen Olarak Kullanım (React)
Eğer projede React kullanıyorsanız, yeni `TikfinityWidget` bileşenini aşağıdaki gibi kullanabilirsiniz:

```tsx
import TikfinityWidget from 'src/components/TikfinityWidget';

function MyStreamWidget() {
  return <TikfinityWidget cid={"1209191"} apiBaseUrl={"https://tikfinity.zerody.one"} />;
}
```

Bu bileşen iframe ile widget'ı embed eder ve widget'tan `postMessage` ile gelen veriyi otomatik olarak gösterir. Eğer iframe cevap vermezse kısa bir süre sonra direkt API üzerinden veri almaya çalışır.

---

## 📱 Adım 4: İki Ekran Kurulumu (Opsiyonel)

Oyun ekranı ve puan tablosunu ayrı ayrı göstermek istiyorsan:

### Scene 1: OYUN EKRANI
- Browser Source URL: `http://localhost:5173`

### Scene 2: PUAN TABLOSU
- Aynı URL kullan, uygulama otomatik 30 saniyede değişir
- Veya sağ üstteki "Puan Tablosu Ekranına Git" butonuna tıkla

---

## 🔧 Adım 5: Test & Ayarla

### 5.1 Demo Mode'da Test
1. Uygulama başlasın
2. Chat simulatörü otomatik olarak sahte mesajlar gönderecek
3. "Durdur" / "Başlat" butonuyla kontrol et

### 5.2 Gerçek Chat'te Canlı Yay Yap
1. Kullanıcılarından **A, B, C, D** yazmasını iste
2. Puan tablosu otomatik güncellenir
3. Top 10 oyuncu gösterilir

---

## 🌐 Eğer Farklı Bilgisayardan Erişmek İstersen

### Aynı Ağda (Ev, İşletme):

1. **Sunucunun IP'sini bul:**
   ```bash
   ipconfig         # Windows
   ifconfig         # Mac/Linux
   ```
   Örnek: `192.168.1.100`

2. **OBS'de URL'i değiştir:**
   ```
   http://192.168.1.100:5173
   ```

### İnternet Üzerinden (Evden Yayın Yapıyorsan):

**Kullan: ngrok (bedava)**

```bash
# Yükle
npm install -g ngrok

# Çalıştır (başka terminal'de)
ngrok http 5173
```

Çıktı:
```
Forwarding:  https://abc123.ngrok.io -> http://localhost:5173
```

OBS'de URL'i `https://abc123.ngrok.io` yap

---

## 🎨 Özelleştirme

### Renkler Değiştir
`src/App.css` dosyasında gradyanı değiştir:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Başka renkler dene: #ff6b6b, #4ecdc4, #45b7d1, vs. */
```

### Soruları Ekle
`src/services/QuestionManager.ts` dosyasında `questions` arrayına ekle:
```typescript
{
  id: 'unique-id',
  text: 'Sorunun metni?',
  options: [
    { label: 'A', text: 'Seçenek 1' },
    { label: 'B', text: 'Seçenek 2' },
    { label: 'C', text: 'Seçenek 3' },
    { label: 'D', text: 'Seçenek 4' }
  ],
  correctAnswer: 'B',
  difficulty: 1
}
```

### Puan Değiştir
```typescript
// src/config/index.ts
pointsPerCorrectAnswer: 500, // Değiştir
```

---

## 🐛 Sorunlar

### "Chat mesajları gelmiyor"
- [ ] TikTok API'nin çalışıp çalışmadığını kontrol et
- [ ] Chat ID'sinin doğru olduğundan emin ol
- [ ] Browser console'da hata var mı kontrol et (F12)
- [ ] Demo mode'da çalışıyor mu?

### "OBS'te görünmüyor"
- [ ] URL'i kopyala-yapıştır (elle yazma)
- [ ] Genişlik/Yüksekliği kontrol et
- [ ] `http://` yazıyor musun (https değil)
- [ ] Portu 5173 değiştirdiysen ayarla

### "Oyun başlamıyor"
- [ ] `npm run dev` komutu hata veriyor mu?
- [ ] Tüm paketler kurulu mu (`npm install`)?
- [ ] Başka bir şey port 5173 kullanıyor mu?

---

## 🎯 CANLIYAYIN ÖNCESİ CHECKLIST

- [ ] Uygulamayı lokal'de test ettim
- [ ] OBS'de Browser source çalışıyor
- [ ] Soruları hazırladım
- [ ] Chat ID'sini ayarladım
- [ ] Demo mode'da oyun flow'u test ettim
- [ ] TikTok canlı yayın hazır

**Başarılı yayınlar! 🎉**

---

**Sorularınız?** Discord, GitHub Issues veya direct message gönderebilirsiniz!
