# Deployment Rehberi

Bu oyunu herkese açık şekilde deploy etmek istiyorsan, aşağıdaki adımları izle.

## Option 1: Netlify (Bedava & Kolay) ⭐ ÖNERİLİ

### 1.1 GitHub'a Push Et
```bash
git add .
git commit -m "TikTok oyunu"
git push origin main
```

### 1.2 Netlify'da Deploy Et
1. [netlify.com](https://netlify.com) git
2. GitHub ile giriş yap
3. "New site from Git" tıkla
4. Repository'ni seç
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy et!

URL örneği: `https://tiktok-oyunu.netlify.app`

## Option 2: Vercel (Bedava & Hızlı)

### 2.1 Vercel CLI Yükle
```bash
npm i -g vercel
```

### 2.2 Deploy Et
```bash
vercel
```

URL örneği: `https://tiktok-oyunu.vercel.app`

## Option 3: GitHub Pages (Bedava)

```bash
npm run build
git add dist/
git commit -m "Deploy"
git push origin main
```

Settings → Pages → Deploy from a branch → main/dist

## Option 4: Kendi Sunucunuzda

### Docker ile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t tiktok-oyunu .
docker run -p 3000:3000 tiktok-oyunu
```

## OBS'de Deployed URL Kullan

Deploy ettikten sonra OBS'de Browser Source URL'sini değiştir:
- ❌ Eski: `http://localhost:5173`
- ✅ Yeni: `https://tiktok-oyunu.netlify.app`

---

**Kaydedilmiş! 🎉**
