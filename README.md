# 🚀 AppGenius AI

<div align="center">

![AppGenius AI](public/icon-512.png)

**منصة ذكية لإنشاء أي تطبيق في العالم باستخدام الذكاء الاصطناعي**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/appgenius-ai)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/appgenius-ai)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff)](https://vitejs.dev/)

</div>

---

## ✨ المميزات

### 🤖 ذكاء اصطناعي متعدد
- **4 مزودين**: Pollinations (مجاني)، OpenAI GPT-4، Google Gemini، Groq
- **11 نموذج** مختلف
- **توليد فوري** للتطبيقات بالعربية

### 📦 تصدير مرن
- **Web App**: ملف HTML واحد
- **ZIP**: مشروع كامل
- **PWA**: تطبيق قابل للتثبيت
- **APK Config**: Capacitor لبناء APK

### 💰 نظام أرباح متكامل
- **3 خطط اشتراك**: Free / Pro ($19) / Business ($49)
- **نظام إعلانات** ذكي مع AdSense
- **نظام إحالات** ونقاط
- **PayPal integration**

### 🎨 تصميم احترافي
- **Dark mode** عصري
- **متجاوب 100%** (موبايل + ديسكتوب)
- **Animations سلسة** (Framer Motion)
- **RTL كامل** للعربية

### 🔐 أمان وخصوصية
- **تشفير SHA-256** لكلمات المرور
- **LocalStorage** للبيانات
- **Supabase** اختياري للسحابة
- **Rate limiting** للحماية

---

## 🚀 النشر السريع (5 دقائق)

### الطريقة 1: Vercel (موصى به)

```bash
# 1. استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/appgenius-ai.git
cd appgenius-ai

# 2. ثبت الحزم
npm install

# 3. ابنِ المشروع
npm run build

# 4. انشر على Vercel
npx vercel --prod
```

أو اضغط على زر **Deploy to Vercel** أعلاه!

### الطريقة 2: Netlify

```bash
# 1. استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/appgenius-ai.git
cd appgenius-ai

# 2. ثبت الحزم
npm install

# 3. ابنِ المشروع
npm run build

# 4. انشر على Netlify
npx netlify deploy --prod --dir=dist
```

---

## 📦 التثبيت المحلي

```bash
# استنسخ المشروع
git clone https://github.com/YOUR_USERNAME/appgenius-ai.git
cd appgenius-ai

# ثبت الحزم
npm install

# شغّل التطوير
npm run dev

# افتح المتصفح على
# http://localhost:5173
```

---

## 🛠️ الأوامر المتاحة

```bash
npm run dev          # تشغيل التطوير
npm run build        # بناء الإنتاج
npm run preview      # معاينة البناء
npm run lint         # فحص الكود
```

---

## 📁 هيكل المشروع

```
appgenius-ai/
├── public/              # ملفات عامة
│   ├── ads.txt         # Google AdSense
│   ├── favicon.svg     # أيقونة
│   ├── manifest.json   # PWA
│   ├── robots.txt      # SEO
│   └── sitemap.xml     # خريطة الموقع
├── src/
│   ├── components/     # المكونات
│   │   ├── AdBanner.tsx
│   │   ├── AuthModal.tsx
│   │   ├── EarningsDashboard.tsx
│   │   ├── ExportModal.tsx
│   │   ├── LegalPage.tsx
│   │   ├── PaymentModal.tsx
│   │   ├── PricingModal.tsx
│   │   ├── ProjectsDashboard.tsx
│   │   ├── ReferralWidget.tsx
│   │   ├── SettingsModal.tsx
│   │   └── UpgradePrompt.tsx
│   ├── lib/            # المكتبات
│   │   ├── ads.ts
│   │   ├── ai-service.ts
│   │   ├── auth.ts
│   │   ├── export.ts
│   │   ├── monetization.ts
│   │   ├── paypal.ts
│   │   ├── projects.ts
│   │   ├── providers.ts
│   │   ├── referral.ts
│   │   ├── storage.ts
│   │   └── templates.ts
│   ├── App.tsx         # المكون الرئيسي
│   ├── index.css       # التنسيقات
│   └── main.tsx        # نقطة الدخول
├── .github/
│   └── workflows/
│       └── deploy.yml  # نشر تلقائي
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json         # إعدادات Vercel
└── netlify.toml        # إعدادات Netlify
```

---

## 🔧 التقنيات المستخدمة

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4, Google Gemini, Groq, Pollinations
- **Auth**: Supabase (اختياري) + Local
- **Payment**: PayPal SDK
- **Export**: JSZip, file-saver
- **Hosting**: Vercel / Netlify

---

## 📄 الصفحات القانونية

- ✅ [سياسة الخصوصية](#privacy)
- ✅ [شروط الخدمة](#terms)
- ✅ [من نحن](#about)
- ✅ [اتصل بنا](#contact)

جميع الصفحات متاحة من Footer الموقع.

---

## 🎯 خطط الاشتراك

### Free (مجاني)
- 5 عمليات يومياً
- 50 عملية شهرياً
- 10 مشاريع
- 1 مزود AI (Pollinations)
- تصدير Web App + ZIP
- مع إعلانات

### Pro ($19/شهر)
- 100 عملية يومياً
- 2000 عملية شهرياً
- 100 مشروع
- 4 مزودي AI
- جميع صيغ التصدير
- بدون إعلانات
- أولوية عالية

### Business ($49/شهر)
- عمليات غير محدودة
- مشاريع غير محدودة
- جميع المميزات
- بدون إعلانات
- أولوية فائقة
- دعم مخصص

---

## 🌍 الدعم

- 📧 Email: support@appgenius-ai.vercel.app
- 📖 Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🚀 Quick Deploy: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- ✅ Checklist: [PRODUCTION_READY.md](./PRODUCTION_READY.md)

---

## 🤝 المساهمة

المساهمات مرحب بها! يرجى:

1. Fork المشروع
2. إنشاء Branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## ⭐ النجوم والتاريخ

[![Star History Chart](https://api.star-history.com/svg?repos=YOUR_USERNAME/appgenius-ai&type=Date)](https://star-history.com/#YOUR_USERNAME/appgenius-ai&Date)

---

## 🙏 شكر وتقدير

- [OpenAI](https://openai.com) - GPT-4
- [Google](https://ai.google) - Gemini
- [Groq](https://groq.com) - Fast AI
- [Pollinations](https://pollinations.ai) - Free AI
- [Vercel](https://vercel.com) - Hosting
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

<div align="center">

**صُنع بـ ❤️ باستخدام الذكاء الاصطناعي**

© 2026 AppGenius AI. جميع الحقوق محفوظة.

</div>
