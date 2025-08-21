# Zeynep Balci - 3D CV Portfolio

Three.js ve Cannon.js kullanarak geliştirilmiş interaktif 3D CV/Portfolio uygulaması.

## 🏗️ Proje Yapısı

Bu uygulama 5 katmanlı bir bina yapısından oluşur:
- **Zemin Kat**: Hakkımda
- **1. Kat**: Deneyim
- **2. Kat**: Projeler  
- **3. Kat**: Eğitim
- **4. Kat**: Yetenekler
- **5. Kat**: İletişim

## 🚀 Özellikler

- **3D Interaktif Ortam**: Three.js ile gerçekçi 3D grafikler
- **Fizik Motoru**: Cannon.js ile gerçekçi fizik simülasyonu
- **Asansör Sistemi**: Katlar arası geçiş için animasyonlu asansör
- **Avatar Sistemi**: GLB formatında 3D avatar desteği
- **Responsive Tasarım**: Tüm cihazlarda uyumlu
- **Modern UI**: Şık ve kullanıcı dostu arayüz

## 🛠️ Teknolojiler

- **Three.js**: 3D grafik render etme
- **Cannon.js**: Fizik motoru
- **Vite**: Build tool ve development server
- **JavaScript (ES6+)**: Modern JavaScript özellikleri

## 📦 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Avatar dosyanızı ekleyin:**
   - `avatar.glb` dosyanızı `public/` klasörüne kopyalayın
   - Eğer avatar dosyanız yoksa, uygulama otomatik olarak basit bir avatar oluşturacaktır

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

4. **Tarayıcınızda açın:**
   - Uygulama otomatik olarak `http://localhost:3000` adresinde açılacaktır

## 🎮 Kullanım

- **Asansör Kontrolleri**: Alt kısımdaki butonları kullanarak katlar arası geçiş yapın
- **Kamera Kontrolü**: Mouse ile döndürme, zoom yapma
- **Kat Bilgisi**: Sağ üst köşede mevcut kat bilgisi görüntülenir

## 🏗️ Build

Production için build almak için:
```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 📁 Dosya Yapısı

```
zeynepCv/
├── src/
│   └── main.js          # Ana uygulama kodu
├── public/
│   ├── avatar.glb       # Avatar dosyası (siz ekleyeceksiniz)
│   └── README.md        # Avatar kurulum talimatları
├── index.html           # Ana HTML dosyası
├── package.json         # Proje bağımlılıkları
├── vite.config.js       # Vite konfigürasyonu
└── README.md           # Bu dosya
```

## 🎨 Özelleştirme

### Kat İçeriklerini Değiştirme
`src/main.js` dosyasında `floorNames` dizisini düzenleyerek kat isimlerini değiştirebilirsiniz.

### Renkleri Değiştirme
`floorColors` dizisini düzenleyerek kat renklerini değiştirebilirsiniz.

### Avatar Değiştirme
`public/avatar.glb` dosyasını kendi 3D modelinizle değiştirin.

## 🔧 Geliştirme

### Yeni Özellik Ekleme
- Her kat için özel içerik eklemek için `createFloors()` metodunu genişletin
- Yeni interaktif elementler için `setupEventListeners()` metodunu kullanın

### Performans Optimizasyonu
- Büyük modeller için LOD (Level of Detail) kullanın
- Texture'ları optimize edin
- Gereksiz fizik hesaplamalarını azaltın

## 📝 Lisans

MIT License

## 👤 Geliştirici

Zeynep Balci

---

**Not**: Bu proje modern web teknolojileri kullanılarak geliştirilmiştir. Tarayıcınızın WebGL desteği olduğundan emin olun.
