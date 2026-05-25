/**
 * نظام التصدير الاحترافي
 * 
 * يدعم 4 صيغ تصدير حقيقية:
 * 1. ZIP - ملف مضغوط يحتوي على المشروع
 * 2. Web App - ملف HTML واحد جاهز للنشر
 * 3. PWA - Progressive Web App مع manifest و service worker
 * 4. APK Config - Capacitor config + تعليمات لبناء APK
 * 
 * كل شيء يعمل من المتصفح مباشرة بدون backend
 */

import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Project } from "./projects";

export type ExportFormat = "zip" | "webapp" | "pwa" | "apk-config";

export interface ExportProgress {
  step: string;
  progress: number; // 0-100
  status: "idle" | "building" | "success" | "error";
  message?: string;
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  filename?: string;
  size?: number;
  message?: string;
  downloadUrl?: string;
}

/**
 * تنظيف اسم الملف
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50)
    .trim() || "app";
}

/**
 * استخراج عنوان HTML من الكود
 */
function extractTitle(code: string, fallback: string): string {
  const match = code.match(/<title>(.*?)<\/title>/i);
  return match?.[1] || fallback;
}

/**
 * استخراج وصف HTML
 */
function extractDescription(code: string): string {
  const match = code.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
  return match?.[1] || "تطبيق تم إنشاؤه بواسطة AppGenius AI";
}

/**
 * تصدير كملف HTML واحد (Web App)
 */
export async function exportWebApp(
  project: Project,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({
      step: "جاري تحضير الملف...",
      progress: 30,
      status: "building",
    });

    const filename = `${sanitizeFilename(project.name)}.html`;
    const blob = new Blob([project.code], {
      type: "text/html;charset=utf-8",
    });

    onProgress?.({
      step: "جاري التحميل...",
      progress: 80,
      status: "building",
    });

    saveAs(blob, filename);

    onProgress?.({
      step: "تم التصدير بنجاح",
      progress: 100,
      status: "success",
    });

    return {
      success: true,
      format: "webapp",
      filename,
      size: blob.size,
      message: "تم تصدير التطبيق كملف HTML واحد",
    };
  } catch (error) {
    return {
      success: false,
      format: "webapp",
      message: error instanceof Error ? error.message : "فشل التصدير",
    };
  }
}

/**
 * تصدير كملف ZIP كامل
 */
export async function exportZip(
  project: Project,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({
      step: "إنشاء هيكل المشروع...",
      progress: 10,
      status: "building",
    });

    const zip = new JSZip();
    const folderName = sanitizeFilename(project.name);
    const folder = zip.folder(folderName);

    if (!folder) throw new Error("فشل إنشاء المجلد");

    onProgress?.({
      step: "إضافة الملفات الأساسية...",
      progress: 30,
      status: "building",
    });

    // ملف HTML الرئيسي
    folder.file("index.html", project.code);

    // ملف README
    folder.file(
      "README.md",
      `# ${project.name}

## الوصف
${project.description}

## معلومات المشروع
- **تاريخ الإنشاء**: ${new Date(project.createdAt).toLocaleDateString("ar-EG")}
- **المزود**: ${project.provider}
- **النموذج**: ${project.model}
- **تم إنشاؤه بواسطة**: AppGenius AI

## كيفية الاستخدام
1. افتح ملف \`index.html\` في أي متصفح حديث
2. التطبيق جاهز للاستخدام فوراً - لا يحتاج خادم

## الملفات
- \`index.html\` - التطبيق الكامل
- \`README.md\` - هذه الملف
- \`package.json\` - لتحويله لمشروع Node.js (اختياري)

## الترخيص
تم إنشاؤه باستخدام AppGenius AI - جميع الحقوق محفوظة لك
`
    );

    onProgress?.({
      step: "إضافة ملفات المشروع...",
      progress: 60,
      status: "building",
    });

    // package.json لتحويله لمشروع Node.js
    folder.file(
      "package.json",
      JSON.stringify(
        {
          name: folderName.toLowerCase(),
          version: "1.0.0",
          description: project.description,
          main: "index.html",
          scripts: {
            start: "npx serve .",
            dev: "npx serve . -l 3000",
          },
          keywords: ["appgenius", "ai-generated"],
          author: "AppGenius AI",
          license: "MIT",
          devDependencies: {
            serve: "^14.2.0",
          },
        },
        null,
        2
      )
    );

    // .gitignore
    folder.file(
      ".gitignore",
      `node_modules/
.DS_Store
*.log
.env
dist/
`
    );

    onProgress?.({
      step: "ضغط الملفات...",
      progress: 85,
      status: "building",
    });

    const content = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      },
      (metadata) => {
        onProgress?.({
          step: `ضغط الملفات... ${metadata.percent.toFixed(0)}%`,
          progress: 85 + metadata.percent * 0.1,
          status: "building",
        });
      }
    );

    const filename = `${folderName}.zip`;
    saveAs(content, filename);

    onProgress?.({
      step: "تم التصدير بنجاح",
      progress: 100,
      status: "success",
    });

    return {
      success: true,
      format: "zip",
      filename,
      size: content.size,
      message: "تم تصدير المشروع كملف ZIP كامل",
    };
  } catch (error) {
    return {
      success: false,
      format: "zip",
      message: error instanceof Error ? error.message : "فشل التصدير",
    };
  }
}

/**
 * تصدير كـ PWA (Progressive Web App)
 * يمكن تثبيته على الهاتف مثل التطبيق الأصلي
 */
export async function exportPWA(
  project: Project,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({
      step: "إنشاء ملفات PWA...",
      progress: 10,
      status: "building",
    });

    const zip = new JSZip();
    const folderName = sanitizeFilename(project.name);
    const folder = zip.folder(folderName);

    if (!folder) throw new Error("فشل إنشاء المجلد");

    const title = extractTitle(project.code, project.name);
    const description = extractDescription(project.code);

    onProgress?.({
      step: "إنشاء manifest.json...",
      progress: 30,
      status: "building",
    });

    // manifest.json
    folder.file(
      "manifest.json",
      JSON.stringify(
        {
          name: title,
          short_name: title.substring(0, 12),
          description,
          start_url: "./index.html",
          display: "standalone",
          background_color: "#020617",
          theme_color: "#a855f7",
          orientation: "any",
          lang: "ar",
          dir: "rtl",
          icons: [
            {
              src: "icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        null,
        2
      )
    );

    onProgress?.({
      step: "إنشاء Service Worker...",
      progress: 50,
      status: "building",
    });

    // Service Worker
    folder.file(
      "sw.js",
      `// Service Worker لـ ${title}
const CACHE_NAME = '${folderName}-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// التثبيت - تخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// التفعيل - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// جلب - استخدام الكاش عند عدم الاتصال
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
`
    );

    onProgress?.({
      step: "إنشاء أيقونات التطبيق...",
      progress: 70,
      status: "building",
    });

    // أيقونات SVG (تعمل كـ PNG في معظم المتصفحات)
    const iconSvg = generateIconSvg(title);
    folder.file("icon-192.png", iconSvg);
    folder.file("icon-512.png", iconSvg);

    onProgress?.({
      step: "تحديث HTML ليدعم PWA...",
      progress: 85,
      status: "building",
    });

    // HTML مع meta tags للتطبيق
    const pwaHtml = injectPWAMeta(project.code, title, description);
    folder.file("index.html", pwaHtml);

    // README خاص بـ PWA
    folder.file(
      "README-PWA.md",
      `# ${title} - Progressive Web App

## 📱 كيفية التثبيت على الهاتف

### على Android (Chrome):
1. افتح \`index.html\` عبر خادم محلي (ليس file://)
2. اضغط على القائمة (⋮) ثم "إضافة إلى الشاشة الرئيسية"
3. أو اضغط على زر التثبيت في شريط العنوان

### على iPhone (Safari):
1. افتح \`index.html\` عبر خادم محلي
2. اضغط على زر المشاركة (↑)
3. اختر "إضافة إلى الشاشة الرئيسية"

## 🚀 تشغيل الخادم المحلي

\`\`\`bash
# باستخدام Python
python -m http.server 8000

# باستخدام Node.js
npx serve .

# باستخدام PHP
php -S localhost:8000
\`\`\`

## ✨ المميزات
- يعمل بدون اتصال بالإنترنت
- يمكن تثبيته كتطبيق على الهاتف
- أداء سريع مع الكاش
- تجربة تطبيق أصلي

## 📦 الملفات
- \`index.html\` - التطبيق
- \`manifest.json\` - بيانات التطبيق
- \`sw.js\` - Service Worker للعمل بدون اتصال
- \`icon-*.png\` - أيقونات التطبيق

تم إنشاؤه بواسطة AppGenius AI
`
    );

    onProgress?.({
      step: "ضغط الملفات...",
      progress: 95,
      status: "building",
    });

    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const filename = `${folderName}-pwa.zip`;
    saveAs(content, filename);

    onProgress?.({
      step: "تم التصدير بنجاح",
      progress: 100,
      status: "success",
    });

    return {
      success: true,
      format: "pwa",
      filename,
      size: content.size,
      message: "تم تصدير التطبيق كـ PWA جاهز للتثبيت",
    };
  } catch (error) {
    return {
      success: false,
      format: "pwa",
      message: error instanceof Error ? error.message : "فشل التصدير",
    };
  }
}

/**
 * تصدير Capacitor Config لبناء APK
 * 
 * ملاحظة: بناء APK حقيقي يحتاج:
 * - Android Studio
 * - Java JDK
 * - جهاز حاسوب (لا يمكن من المتصفح)
 * 
 * نحن نزود المستخدم بكل ما يحتاجه لبناء APK محلياً
 */
export async function exportAPKConfig(
  project: Project,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  try {
    onProgress?.({
      step: "إنشاء مشروع Capacitor...",
      progress: 10,
      status: "building",
    });

    const zip = new JSZip();
    const folderName = sanitizeFilename(project.name);
    const packageName = `com.appgenius.${folderName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    const folder = zip.folder(folderName);

    if (!folder) throw new Error("فشل إنشاء المجلد");

    const title = extractTitle(project.code, project.name);
    const description = extractDescription(project.code);

    onProgress?.({
      step: "إنشاء Capacitor config...",
      progress: 30,
      status: "building",
    });

    // package.json
    folder.file(
      "package.json",
      JSON.stringify(
        {
          name: folderName.toLowerCase(),
          displayName: title,
          version: "1.0.0",
          description,
          main: "index.html",
          scripts: {
            start: "npx cap run android",
            "build:android": "npx cap build android",
            "sync": "npx cap sync",
            "open:android": "npx cap open android",
          },
          dependencies: {
            "@capacitor/core": "^5.7.0",
            "@capacitor/android": "^5.7.0",
          },
          devDependencies: {
            "@capacitor/cli": "^5.7.0",
          },
        },
        null,
        2
      )
    );

    // capacitor.config.json
    folder.file(
      "capacitor.config.json",
      JSON.stringify(
        {
          appId: packageName,
          appName: title,
          webDir: "www",
          server: {
            androidScheme: "https",
          },
          android: {
            buildOptions: {
              keystorePath: "",
              keystoreAlias: "",
            },
          },
          plugins: {
            SplashScreen: {
              launchShowDuration: 2000,
              backgroundColor: "#020617",
              showSpinner: false,
            },
            StatusBar: {
              style: "DARK",
              backgroundColor: "#020617",
            },
          },
        },
        null,
        2
      )
    );

    onProgress?.({
      step: "إضافة ملفات التطبيق...",
      progress: 60,
      status: "building",
    });

    // مجلد www (web files)
    const www = folder.folder("www");
    www?.file("index.html", project.code);

    onProgress?.({
      step: "إنشاء تعليمات البناء...",
      progress: 85,
      status: "building",
    });

    // BUILD.md - تعليمات مفصلة بالعربية
    folder.file(
      "BUILD.md",
      `# 📱 كيفية بناء APK لـ ${title}

## ✅ المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

1. **Node.js** (الإصدار 18+)
   - تحميل: https://nodejs.org/

2. **Android Studio**
   - تحميل: https://developer.android.com/studio
   - بعد التثبيت، افتح Android Studio وثبّت:
     - Android SDK (آخر إصدار)
     - Android SDK Build-Tools
     - Android SDK Platform-Tools

3. **Java JDK 17**
   - تحميل: https://adoptium.net/

## 🚀 خطوات البناء

### الخطوة 1: تثبيت الحزم

افتح Terminal في مجلد المشروع ونفّذ:

\`\`\`bash
npm install
\`\`\`

### الخطوة 2: تهيئة Capacitor

\`\`\`bash
npx cap init
npx cap add android
\`\`\`

### الخطوة 3: مزامنة الملفات

\`\`\`bash
npx cap sync android
\`\`\`

### الخطوة 4: فتح المشروع في Android Studio

\`\`\`bash
npx cap open android
\`\`\`

### الخطوة 5: بناء APK

في Android Studio:
1. انتظر حتى ينتهي Gradle من التحميل
2. من القائمة: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. انتظر حتى ينتهي البناء
4. اضغط على **locate** في الإشعار لفتح موقع APK

### الخطوة 6: موقع ملف APK

\`\`\`
android/app/build/outputs/apk/debug/app-debug.apk
\`\`\`

## 📲 تثبيت APK على الهاتف

1. انقل ملف \`app-debug.apk\` إلى هاتفك
2. على الهاتف، فعّل "تثبيت من مصادر غير معروفة"
3. افتح ملف APK وثبّته
4. استمتع بالتطبيق! 🎉

## 🔐 بناء APK موقع (للنشر على Google Play)

لبناء APK موقع للإنتاج:

1. أنشئ keystore:
\`\`\`bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
\`\`\`

2. في Android Studio: **Build → Generate Signed Bundle / APK**

3. اتبع التعليمات واختر keystore

4. سيتم إنشاء \`app-release.apk\` الموقع

## 🐛 حل المشاكل

### مشكلة: "SDK location not found"
**الحل**: أضف متغير بيئة \`ANDROID_HOME\`:
- Windows: \`C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk\`
- Mac/Linux: \`/Users/YourName/Library/Android/sdk\`

### مشكلة: "Java version error"
**الحل**: تأكد من تثبيت Java 17:
\`\`\`bash
java -version
\`\`\`

### مشكلة: Gradle build failed
**الحل**: 
\`\`\`bash
cd android
./gradlew clean
cd ..
npx cap sync
\`\`\`

## 📞 المساعدة

إذا واجهت مشكلة، تحقق من:
- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio Docs: https://developer.android.com/docs

---

تم إنشاء هذا المشروع بواسطة **AppGenius AI** 🤖
`
    );

    onProgress?.({
      step: "ضغط المشروع...",
      progress: 95,
      status: "building",
    });

    const content = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const filename = `${folderName}-apk-project.zip`;
    saveAs(content, filename);

    onProgress?.({
      step: "تم التصدير بنجاح",
      progress: 100,
      status: "success",
    });

    return {
      success: true,
      format: "apk-config",
      filename,
      size: content.size,
      message: `تم تصدير مشروع Capacitor. افتح الملف BUILD.md داخل ${filename} لمعرفة كيفية بناء APK`,
    };
  } catch (error) {
    return {
      success: false,
      format: "apk-config",
      message: error instanceof Error ? error.message : "فشل التصدير",
    };
  }
}

/**
 * إنشاء أيقونة SVG للتطبيق
 */
function generateIconSvg(title: string): string {
  const initial = title.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7"/>
      <stop offset="50%" style="stop-color:#ec4899"/>
      <stop offset="100%" style="stop-color:#f97316"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
</svg>`;
}

/**
 * حقن meta tags للـ PWA في HTML
 */
function injectPWAMeta(html: string, title: string, description: string): string {
  const pwaMeta = `
    <meta name="description" content="${description}">
    <meta name="theme-color" content="#a855f7">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="${title}">
    <link rel="manifest" href="./manifest.json">
    <link rel="apple-touch-icon" href="./icon-192.png">
    <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png">`;

  // حقن قبل </head>
  if (html.includes("</head>")) {
    return html.replace("</head>", `${pwaMeta}\n</head>`);
  }
  
  // حقن بعد <html>
  if (html.includes("<html")) {
    return html.replace(
      /<html[^>]*>/,
      (match) => `${match}\n<head>${pwaMeta}\n</head>`
    );
  }

  return pwaMeta + "\n" + html;
}

/**
 * تصدير بأي صيغة
 */
export async function exportProject(
  project: Project,
  format: ExportFormat,
  onProgress?: (p: ExportProgress) => void
): Promise<ExportResult> {
  switch (format) {
    case "webapp":
      return exportWebApp(project, onProgress);
    case "zip":
      return exportZip(project, onProgress);
    case "pwa":
      return exportPWA(project, onProgress);
    case "apk-config":
      return exportAPKConfig(project, onProgress);
    default:
      return {
        success: false,
        format,
        message: "صيغة تصدير غير مدعومة",
      };
  }
}

/**
 * إنشاء رابط معاينة مباشر (data URL)
 */
export function createPreviewUrl(code: string): string {
  const blob = new Blob([code], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
}

/**
 * إنشاء رابط مشاركة (base64 encoded)
 * ملاحظة: محدود بحجم URL في المتصفح (~2MB)
 */
export function createShareLink(project: Project): string {
  try {
    const data = {
      n: project.name,
      d: project.description,
      c: project.code,
    };
    
    const json = JSON.stringify(data);
    
    // ضغط باستخدام CompressionStream إن أمكن
    const encoded = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    
    return `${window.location.origin}${window.location.pathname}#share=${encoded}`;
  } catch {
    return "";
  }
}

/**
 * فك رابط المشاركة
 */
export function parseShareLink(hash: string): Omit<Project, "id" | "createdAt" | "updatedAt" | "size" | "status" | "provider" | "model"> | null {
  try {
    if (!hash.startsWith("#share=")) return null;
    
    const encoded = hash.substring(7);
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(encoded), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    
    const data = JSON.parse(json);
    
    return {
      name: data.n,
      description: data.d,
      code: data.c,
    };
  } catch {
    return null;
  }
}
