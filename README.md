# 🔐 Top Secret


[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.14-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://gsap.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=white)](https://berat054.github.io/topsecret-angular/)

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🎬 **Video Carousel** | Horizontal swipe ile fan videoları |
| 🖼️ **Before/After Slider** | Sürüklenebilir karşılaştırma |
| 🎁 **Flip Card** | 3D çevirme animasyonu ile hediye kartı |
| 🎊 **Confetti** | Kutlama efektleri |
| 📱 **Responsive** | Mobil & masaüstü uyumlu |
| ♿ **Accessible** | ARIA attributes ile erişilebilirlik |

---

## 🏗️ Mimari

```
src/app/
├── components/
│   ├── video-background/      # Arka plan videosu
│   ├── before-after-slider/   # Öncesi/sonrası karşılaştırma
│   ├── fan-video-carousel/    # Video carousel
│   └── gift-card/             # Hediye kartı
├── models/
│   └── fan-video.interface.ts # Tip tanımları
├── data/
│   └── videos.data.ts         # Video verileri
├── app.ts                     # Ana component (scroll yönetimi)
├── app.html
└── app.scss
```

---

## 🚀 Başlangıç

### Gereksinimler

- Node.js 20+
- npm 10+

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start
```

Tarayıcıda [http://localhost:4200](http://localhost:4200) adresini aç.

### Build

```bash
# Production build
npm run build

# GitHub Pages deploy
ng build --configuration production --base-href /topsecret-angular/
npx angular-cli-ghpages --dir=dist/top-secret/browser
```

---

## 🛠️ Teknolojiler

| Teknoloji | Kullanım |
|-----------|----------|
| **Angular 21** | Component framework |
| **GSAP** | Scroll & text animasyonları |
| **Canvas Confetti** | Kutlama efektleri |
| **Material Symbols** | İkonlar |
| **Cloudinary** | Video CDN |
| **GitHub Pages** | Hosting |

---

## 📝 Notlar

- Videolar Cloudinary CDN üzerinden sunuluyor
- `OnPush` change detection stratejisi ile optimize edildi
- Fullpage scroll ile section geçişleri

---

## 📄 Lisans

Bu proje özel kullanım içindir.

