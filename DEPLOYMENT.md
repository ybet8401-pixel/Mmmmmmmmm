# 🚀 دليل النشر - AppGenius AI

هذا الدليل يشرح كيفية نشر موقع **AppGenius AI** على استضافة حقيقية تقبلها Google AdSense و PayPal.

---

## 📋 المتطلبات

قبل البدء، تأكد من:
- ✅ Git مثبت على جهازك
- ✅ Node.js v18+ مثبت
- ✅ حساب GitHub (لربطه بـ Vercel/Netlify)
- ✅ حساب Vercel أو Netlify (مجاني)

---

## 🎯 خطوات النشر على Vercel (موصى به)

### الخطوة 1: رفع المشروع على GitHub

```bash
# داخل مجلد المشروع
git init
git add .
git commit -m "Initial commit: AppGenius AI"

# إنشاء repository على github.com ثم:
git remote add origin https://github.com/USERNAME/appgenius-ai.git
git branch -M main
git push -u origin main
```

### الخطوة 2: النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com) وسجل دخولك بحساب GitHub
2. اضغط **"Add New Project"**
3. اختر Repository من GitHub
4. الإعدادات الافتراضية ستعمل:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. اضغط **"Deploy"**
6. انتظر 2-3 دقائق

### الخطوة 3: الحصول على الدومين

بعد النشر، ستحصل على رابط مثل:
```
https://appgenius-ai.vercel.app
```

### الخطوة 4: تخصيص الدومين (اختياري)

للحصول على دومين مخصص:
1. اذهب إلى **Settings → Domains** في Vercel
2. أضف دومينك (مثل: `appgenius.ai`)
3. اتبع التعليمات لتحديث DNS

---

## 🎯 خطوات النشر على Netlify

### الطريقة 1: من GitHub

1. اذهب إلى [netlify.com](https://netlify.com) وسجل دخولك
2. اضغط **"Add new site" → "Import an existing project"**
3. اختر GitHub واختر Repository
4. الإعدادات:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. اضغط **"Deploy site"**

### الطريقة 2: باستخدام Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## 🔧 إعدادات Google AdSense

### الخطوة 1: التسجيل في AdSense

1. اذهب إلى [adsense.google.com](https://adsense.google.com)
2. سجل دخولك بحساب Google
3. اضغط **"Get started"**
4. أدخل رابط موقعك: `https://appgenius-ai.vercel.app`
5. أكمل عملية التسجيل

### الخطوة 2: إضافة كود AdSense

بعد الموافقة على حسابك، احصل على **Publisher ID** (يبدأ بـ `ca-pub-`)

عدّل `index.html`:

```html
<!-- استبدل السطر التالي بمعرفك الحقيقي -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID" crossorigin="anonymous"></script>
```

### الخطوة 3: تحديث ads.txt

عدّل `public/ads.txt`:

```
google.com, pub-YOUR_PUBLISHER_ID, DIRECT, f08c47fec0942fa0
```

### الخطوة 4: تأكيد الملكية

1. في AdSense، اذهب إلى **Sites → Add site**
2. اختر طريقة التحقق (Meta tag أو HTML file)
3. أضف Meta tag في `index.html`:

```html
<meta name="google-site-verification" content="YOUR_CODE" />
```

### الخطوة 5: الانتظار للموافقة

- عادةً من **يوم إلى أسبوعين**
- تأكد من:
  - ✅ محتوى كافي وأصلي
  - ✅ الصفحات القانونية موجودة
  - ✅ الموقع سريع ومتجاوب
  - ✅ لا يوجد محتوى ممنوع

---

## 💳 إعدادات PayPal

### الخطوة 1: إنشاء حساب PayPal Business

1. اذهب إلى [paypal.com/business](https://paypal.com/business)
2. أنشئ حساب Business (مجاني)
3. أكمل التحقق من الحساب

### الخطوة 2: إنشاء تطبيق في Developer Portal

1. اذهب إلى [developer.paypal.com](https://developer.paypal.com)
2. اضغط **"Apps & Credentials"**
3. أنشئ تطبيق جديد (REST API)
4. احصل على **Client ID**

### الخطوة 3: إنشاء خطط اشتراك

1. في PayPal Dashboard، اذهب إلى **Subscriptions Plans**
2. أنشئ 3 خطط:
   - Pro Monthly ($19)
   - Pro Yearly ($190)
   - Business Monthly ($49)
   - Business Yearly ($490)
3. احفظ **Plan IDs**

### الخطوة 4: إضافة Credentials للموقع

من الإعدادات داخل الموقع:
1. افتح الإعدادات → PayPal Settings
2. أدخل Client ID
3. أدخل Plan IDs
4. اختر Environment (Sandbox للاختبار، Production للنشر)

### الخطوة 5: إعداد Webhooks (للأمان)

للـ Production الحقيقي، تحتاج webhook للتحقق من المدفوعات:

1. في Developer Portal → Webhooks
2. أضف URL: `https://your-backend.com/webhooks/paypal`
3. اختر events: `PAYMENT.CAPTURE.COMPLETED`, `BILLING.SUBSCRIPTION.ACTIVATED`

---

## 🌐 دومين مخصص (Custom Domain)

### الحصول على دومين مجاني

**الخيارات المجانية:**
- Vercel: `yoursite.vercel.app` (مجاناً)
- Netlify: `yoursite.netlify.app` (مجاناً)
- GitHub Pages: `username.github.io` (مجاناً)

### الحصول على دومين مدفوع

**المواقع الموصى بها:**
- Namecheap: ~$8-15/سنة
- Cloudflare: ~$8-10/سنة
- Google Domains: ~$12/سنة

### ربط الدومين

**على Vercel:**
1. Settings → Domains → Add
2. أدخل الدومين
3. أضف DNS records في مزود الدومين:
   - A record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

**على Netlify:**
1. Domain settings → Add custom domain
2. اتبع التعليمات

---

## 📊 Google Search Console

لظهور موقعك في نتائج البحث:

1. اذهب إلى [search.google.com/search-console](https://search.google.com/search-console)
2. أضف موقعك
3. أكد الملكية (Meta tag أو DNS)
4. أرسل Sitemap: `https://appgenius-ai.vercel.app/sitemap.xml`

---

## 🔒 SSL/HTTPS

- ✅ Vercel: SSL تلقائي ومجاني
- ✅ Netlify: SSL تلقائي ومجاني
- ✅ يتم تجديد الشهادة تلقائياً

---

## 📈 تحسينات SEO إضافية

### 1. إنشاء OG Image

أنشئ صورة 1200×630 px وسمّها `og-image.png` في `public/`

### 2. تحديث robots.txt

تحقق من أن URL في Sitemap صحيح:
```
Sitemap: https://your-domain.com/sitemap.xml
```

### 3. إضافة Analytics

أضف Google Analytics في `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

---

## 🧪 اختبار قبل النشر

```bash
# بناء محلي
npm run build

# معاينة البناء
npm run preview

# اختبار Lighthouse
npx lighthouse http://localhost:4173 --view
```

---

## ⚠️ قائمة التحقق قبل التقديم لـ AdSense

- ✅ الموقع يعمل على HTTPS
- ✅ محتوى أصلي وذي قيمة
- ✅ صفحة سياسة الخصوصية
- ✅ صفحة شروط الخدمة
- ✅ صفحة من نحن
- ✅ صفحة اتصل بنا
- ✅ تصميم متجاوب
- ✅ سرعة جيدة (Core Web Vitals)
- ✅ لا يوجد محتوى ممنوع
- ✅ عمر الموقع 1-3 أشهر (موصى به)
- ✅ عدد كافٍ من الزيارات

---

## 🐛 حل المشاكل الشائعة

### 404 عند تحديث الصفحة

تأكد من أن `vercel.json` أو `netlify.toml` يحتوي على rewrites صحيحة.

### CORS errors

إعدادات CORS موجودة في APIs المستخدمة (Pollinations, OpenAI, Groq, Gemini).

### AdSense rejected

تأكد من:
- محتوى أصلي (ليس مولد بالكامل)
- صفحات قانونية كاملة
- لا يوجد محتوى مخالف
- تصميم احترافي

### PayPal errors

تحقق من:
- Client ID صحيح
- Environment مطابق (Sandbox vs Production)
- حساب PayPal Business نشط

---

## 📞 الدعم

للمساعدة في النشر:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- AdSense: [support.google.com/adsense](https://support.google.com/adsense)
- PayPal: [developer.paypal.com/support](https://developer.paypal.com/support)

---

## 🎉 الرابط النهائي

بعد النشر بنجاح، سيكون رابطك:

```
https://appgenius-ai.vercel.app
```

أو مع دومين مخصص:

```
https://appgenius.ai
```

---

**ملاحظة:** بعض الإعدادات مثل AdSense Publisher ID و PayPal Client ID يجب إدخالها يدوياً بعد الحصول عليها من الخدمات respective.
