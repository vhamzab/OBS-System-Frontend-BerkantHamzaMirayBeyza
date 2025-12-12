# 🔍 Production Debug Rehberi

## Browser Console'da Görmeniz Gereken Log'lar

### 1. Sayfa Yüklendiğinde (CourseCatalogPage açıldığında):

```
🔗 API URL: https://obs-api-214391529742.europe-west1.run.app/api/v1
🌍 Environment: production
📦 VITE_API_URL: https://obs-api-214391529742.europe-west1.run.app/api/v1
```

**Eğer bu log'lar görünmüyorsa:**
- Frontend yeniden build edilmemiş olabilir
- Environment variable'lar set edilmemiş olabilir

---

### 2. API Connection Test (Sayfa açıldığında otomatik):

**Başarılı durum:**
```
🧪 Testing API connection...
📤 Request: GET /api/v1/health
📥 Response: 200 /api/v1/health
✅ API connection test successful: {success: true, message: "API is running", ...}
```

**Hata durumu:**
```
🧪 Testing API connection...
📤 Request: GET /api/v1/health
❌ API Error: {
  url: "/api/v1/health",
  method: "get",
  status: 404,  // veya 500, CORS error, Network error
  message: "Not Found",  // veya başka hata mesajı
  ...
}
❌ API connection test failed: Error: ...
```

---

### 3. Departments Fetch (Bölümler yüklenirken):

**Başarılı:**
```
🏢 Fetching departments...
🏢 CourseService: Fetching departments...
📤 Request: GET /api/v1/courses/departments
📥 Response: 200 /api/v1/courses/departments
🏢 CourseService: Departments response: {success: true, data: [...]}
🏢 Departments response: {success: true, data: [...]}
```

**Hata:**
```
🏢 Fetching departments...
🏢 CourseService: Fetching departments...
📤 Request: GET /api/v1/courses/departments
❌ API Error: {...}
❌ CourseService: Error fetching departments: Error: ...
❌ Error fetching departments: Error: ...
```

---

### 4. Courses Fetch (Dersler yüklenirken):

**Başarılı:**
```
📚 Fetching courses with params: {page: 1, limit: 12}
📚 CourseService: Fetching courses with params: {page: 1, limit: 12}
📤 Request: GET /api/v1/courses?page=1&limit=12
📥 Response: 200 /api/v1/courses
📚 CourseService: Response received: {success: true, data: {...}}
📚 Courses response: {success: true, data: {...}}
```

**Hata:**
```
📚 Fetching courses with params: {page: 1, limit: 12}
📚 CourseService: Fetching courses with params: {page: 1, limit: 12}
📤 Request: GET /api/v1/courses?page=1&limit=12
❌ API Error: {
  url: "/api/v1/courses",
  method: "get",
  status: 404,  // veya 500, 401, CORS error
  message: "Not Found",
  ...
}
❌ CourseService: Error fetching courses: Error: ...
❌ Courses fetch error: Error: ...
```

---

## Yaygın Hata Senaryoları ve Çözümleri

### Senaryo 1: Network Error / Connection Refused
```
❌ API Error: {
  message: "Network Error",
  status: undefined,
  ...
}
```
**Sorun:** Backend sunucusuna ulaşılamıyor
**Çözüm:** Backend'in Cloud Run'da çalıştığından emin olun

---

### Senaryo 2: CORS Error
```
❌ API Error: {
  message: "CORS policy violation",
  status: undefined,
  ...
}
```
**Sorun:** Backend CORS ayarları frontend URL'ini kabul etmiyor
**Çözüm:** Backend'de CORS ayarlarını kontrol edin

---

### Senaryo 3: 404 Not Found
```
❌ API Error: {
  status: 404,
  message: "Not Found",
  ...
}
```
**Sorun:** Endpoint yanlış veya backend'de route tanımlı değil
**Çözüm:** Backend route'larını kontrol edin

---

### Senaryo 4: 500 Internal Server Error
```
❌ API Error: {
  status: 500,
  message: "Internal Server Error",
  ...
}
```
**Sorun:** Backend'de bir hata var (veritabanı, kod hatası, vb.)
**Çözüm:** Backend loglarını kontrol edin

---

### Senaryo 5: API URL Yanlış
```
🔗 API URL: http://localhost:5000/api/v1  // ❌ YANLIŞ (production'da)
```
**Sorun:** Production'da localhost URL'i kullanılıyor
**Çözüm:** VITE_API_URL environment variable'ını set edin veya build sırasında geçin

**Doğru olması gereken:**
```
🔗 API URL: https://obs-api-214391529742.europe-west1.run.app/api/v1  // ✅ DOĞRU
```

---

## Network Tab'inde Kontrol Edilecekler

1. **Request URL:** Doğru backend URL'ine gidiyor mu?
2. **Request Method:** GET, POST, vb. doğru mu?
3. **Status Code:** 
   - 200 = Başarılı ✅
   - 404 = Endpoint bulunamadı ❌
   - 500 = Server hatası ❌
   - CORS error = CORS sorunu ❌
4. **Response:** JSON response geliyor mu?
5. **Request Headers:** Authorization header var mı? (Gerekliyse)

---

## Hızlı Test Komutları

Browser console'da şunları çalıştırabilirsiniz:

```javascript
// API URL'i kontrol et
console.log('API URL:', import.meta.env.VITE_API_URL);

// Health check test
fetch('https://obs-api-214391529742.europe-west1.run.app/api/v1/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Courses test
fetch('https://obs-api-214391529742.europe-west1.run.app/api/v1/courses?limit=1')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

