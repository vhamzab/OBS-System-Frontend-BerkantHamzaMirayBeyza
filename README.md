# University OBS Frontend

Üniversite Öğrenci Bilgi Sistemi - Frontend React uygulaması.

## Teknolojiler

- **React 18** - UI Library
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Formik + Yup** - Form yönetimi ve validasyon
- **Docker** - Containerization

## Gereksinimler

- Docker & Docker Compose
- Node.js 18+ (lokal geliştirme için)

## Kurulum

### Docker ile Çalıştırma (Önerilen)

1. `.env` dosyasını oluşturun:
```bash
cp env.example .env
```

2. `.env` dosyasını düzenleyin ve backend API URL'ini girin.

3. Docker container'ı başlatın:
```bash
docker-compose up -d
```

4. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

### Lokal Geliştirme

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasını oluşturun:
```bash
cp env.example .env
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api/v1 |
| PORT | Frontend port | 3000 |

## Scripts

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview

# Testleri çalıştır
npm test

# Lint kontrolü
npm run lint
```

## Proje Yapısı

```
frontend/
├── public/                 # Statik dosyalar
├── src/
│   ├── components/         # React bileşenleri
│   │   ├── auth/          # Auth bileşenleri
│   │   ├── common/        # Ortak bileşenler
│   │   └── layout/        # Layout bileşenleri
│   ├── context/           # React context'leri
│   ├── pages/             # Sayfa bileşenleri
│   │   ├── auth/          # Auth sayfaları
│   │   ├── dashboard/     # Dashboard sayfaları
│   │   └── profile/       # Profil sayfaları
│   ├── services/          # API servisleri
│   ├── App.jsx            # Ana uygulama
│   ├── main.jsx           # Entry point
│   └── index.css          # Global stiller
├── Dockerfile
├── docker-compose.yml
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Sayfalar

### Auth Sayfaları
- `/login` - Giriş sayfası
- `/register` - Kayıt sayfası
- `/forgot-password` - Şifremi unuttum
- `/reset-password/:token` - Şifre sıfırlama
- `/verify-email/:token` - Email doğrulama

### Genel
- `/dashboard` - Ana panel
- `/profile` - Profil sayfası

### Academic Management (Part 2)
- `/courses` - Ders kataloğu
- `/courses/:id` - Ders detayları
- `/my-courses` - Kayıtlı derslerim
- `/grades` - Notlarım
- `/gradebook/:sectionId` - Not defteri (Faculty)
- `/schedule` - Ders programı

### GPS Attendance (Part 2)
- `/attendance/start` - Yoklama başlat (Faculty)
- `/attendance/give/:sessionId` - Yoklama ver (Student)
- `/my-attendance` - Yoklama durumum
- `/attendance/report/:sectionId` - Yoklama raporu (Faculty)
- `/excuse-requests` - Mazeret talepleri

## Part 2 Özellikleri

### Academic Management
- ✅ Ders kataloğu (arama, filtreleme, pagination)
- ✅ Ders detayları ve önkoşullar
- ✅ Derse kayıt (önkoşul ve çakışma kontrolü)
- ✅ Not görüntüleme ve transkript

### GPS Attendance
- ✅ Yoklama oturumu açma (Faculty)
- ✅ GPS tabanlı yoklama verme
- ✅ Geofence kontrolü
- ✅ Spoofing algılama
- ✅ Harita görünümü (Leaflet)
- ✅ Mazeret sistemi

### Yeni Componentler
- `components/gps/` - GPS bileşenleri
  - GPSPermissionHandler
  - LocationMap
  - DistanceCalculator
  - LocationAccuracyIndicator
- `components/charts/` - Grafik bileşenleri
  - AttendanceChart
  - GradeDistributionChart
  - GPATrendChart

## Docker Komutları

```bash
# Container'ı başlat
docker-compose up -d

# Container'ı durdur
docker-compose down

# Logları izle
docker-compose logs -f

# Container'a bağlan
docker exec -it obs_frontend sh

# Yeniden build et
docker-compose up -d --build
```

## Production Build

Production için build almak:

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşur. Bu klasörü Nginx veya başka bir web sunucusu ile serve edebilirsiniz.

### Nginx ile Serve Etme

1. Dockerfile.prod oluşturun (production için):

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Lisans

ISC
