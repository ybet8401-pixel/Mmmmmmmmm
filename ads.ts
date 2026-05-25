/**
 * نظام الإعلانات الذكي
 * 
 * يدعم:
 * - Google AdSense (يحتاج معرف ناشر)
 * - إعلانات مخصصة (روابط أفلييت، عروض داخلية)
 * - Lazy Loading مع Intersection Observer
 * - تتبع الأداء
 * - حماية من النقرات الوهمية
 * 
 * الإعداد:
 * 1. أضف AdSense Publisher ID في الإعدادات
 * 2. أو استخدم الإعلانات المخصصة
 */

import { shouldShowAds } from "./monetization";

export interface AdConfig {
  adsensePublisherId?: string; // ca-pub-XXXXXXXXXXXXXXXX
  adsenseEnabled: boolean;
  customAdsEnabled: boolean;
  showAds: boolean;
}

export type AdSlot =
  | "home-top"
  | "home-middle"
  | "home-bottom"
  | "builder-sidebar"
  | "builder-loading"
  | "builder-after"
  | "projects-inline"
  | "projects-native"
  | "export-before"
  | "export-after";

export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
  type: "banner" | "native" | "inline";
}

const AD_CONFIG_KEY = "appgenius-ad-config";

/**
 * الحصول على إعدادات الإعلانات
 */
export function getAdConfig(): AdConfig {
  try {
    const stored = localStorage.getItem(AD_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  return {
    adsenseEnabled: false,
    customAdsEnabled: true,
    showAds: shouldShowAds(),
  };
}

/**
 * حفظ إعدادات الإعلانات
 */
export function saveAdConfig(config: Partial<AdConfig>): void {
  const current = getAdConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(updated));
}

/**
 * إعلانات مخصصة (أفلييت، عروض داخلية)
 * هذه إعلانات حقيقية يمكن للمستخدم تعديلها
 */
export const CUSTOM_ADS: Record<string, AdData[]> = {
  "home-top": [
    {
      id: "pro-upgrade-1",
      title: "🚀 ترقية إلى Pro",
      description: "احصل على وصول غير محدود + بدون إعلانات + تصدير APK",
      ctaText: "ترقية الآن",
      ctaUrl: "#pricing",
      bgColor: "from-purple-600 to-pink-600",
      textColor: "text-white",
      type: "banner",
    },
  ],
  "home-middle": [
    {
      id: "ai-course",
      title: "📚 تعلم الذكاء الاصطناعي",
      description: "دورة احترافية لبناء تطبيقات AI من الصفر",
      ctaText: "سجّل الآن",
      ctaUrl: "https://example.com/ai-course",
      bgColor: "from-blue-600 to-cyan-600",
      textColor: "text-white",
      type: "native",
    },
  ],
  "home-bottom": [
    {
      id: "business-plan",
      title: "💼 خطة الأعمال",
      description: "للشركات والفرق - إنشاء غير محدود + دعم مخصص",
      ctaText: "تعرف أكثر",
      ctaUrl: "#pricing",
      bgColor: "from-orange-600 to-red-600",
      textColor: "text-white",
      type: "banner",
    },
  ],
  "builder-sidebar": [
    {
      id: "pro-tools",
      title: "⚡ أدوات Pro",
      description: "افتح جميع المزودين والنماذج",
      ctaText: "ترقية",
      ctaUrl: "#pricing",
      bgColor: "from-purple-600 to-pink-600",
      textColor: "text-white",
      type: "native",
    },
  ],
  "builder-loading": [
    {
      id: "loading-tip",
      title: "💡 نصيحة",
      description: "كلما كان الوصف أكثر تفصيلاً، كانت النتيجة أفضل",
      ctaText: "اقرأ المزيد",
      ctaUrl: "#tips",
      bgColor: "from-indigo-600 to-purple-600",
      textColor: "text-white",
      type: "inline",
    },
  ],
  "builder-after": [
    {
      id: "export-feature",
      title: "📦 صدّر تطبيقك الآن",
      description: "ZIP، PWA، أو Capacitor لبناء APK",
      ctaText: "تصدير",
      ctaUrl: "#export",
      bgColor: "from-green-600 to-emerald-600",
      textColor: "text-white",
      type: "banner",
    },
  ],
  "projects-inline": [
    {
      id: "projects-storage",
      title: "☁️ مساحة أكبر",
      description: "قم بالترقية لتخزين عدد غير محدود من المشاريع",
      ctaText: "ترقية",
      ctaUrl: "#pricing",
      bgColor: "from-cyan-600 to-blue-600",
      textColor: "text-white",
      type: "inline",
    },
  ],
  "projects-native": [
    {
      id: "native-promo",
      title: "🎯 عروض خاصة",
      description: "خصم 50% على الخطة السنوية",
      ctaText: "احصل على العرض",
      ctaUrl: "#pricing",
      bgColor: "from-pink-600 to-rose-600",
      textColor: "text-white",
      type: "native",
    },
  ],
  "export-before": [
    {
      id: "export-ads-1",
      title: "📱 حوّل تطبيقك إلى APK",
      description: "تعليمات مفصلة لبناء APK في 5 دقائق",
      ctaText: "ابدأ الآن",
      ctaUrl: "#apk-guide",
      bgColor: "from-orange-600 to-red-600",
      textColor: "text-white",
      type: "banner",
    },
  ],
  "export-after": [
    {
      id: "share-feature",
      title: "🔗 شارك تطبيقك",
      description: "أنشئ رابط مشاركة وشاركه مع العالم",
      ctaText: "مشاركة",
      ctaUrl: "#share",
      bgColor: "from-purple-600 to-indigo-600",
      textColor: "text-white",
      type: "inline",
    },
  ],
};

/**
 * الحصول على إعلان مخصص لعرضه
 */
export function getCustomAd(slot: AdSlot): AdData | null {
  const config = getAdConfig();
  if (!config.customAdsEnabled || !shouldShowAds()) return null;
  
  const ads = CUSTOM_ADS[slot];
  if (!ads || ads.length === 0) return null;
  
  // اختيار عشوائي (للاختبار) - في الإنتاج استخدم نظام rotation حقيقي
  return ads[Math.floor(Math.random() * ads.length)];
}

/**
 * تحميل سكريبت AdSense
 */
export function loadAdSenseScript(publisherId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src*="adsbygoogle"]`)) {
      resolve();
      return;
    }
    
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("فشل تحميل AdSense"));
    document.head.appendChild(script);
  });
}

/**
 * تهيئة إعلان AdSense
 */
export function initAdSenseAd(container: HTMLElement): void {
  try {
    const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || [];
    adsbygoogle.push({});
  } catch (error) {
    console.warn("AdSense init failed:", error);
  }
}

/**
 * Rate Limiting للحماية من النقرات الوهمية
 */
interface ClickRecord {
  adId: string;
  timestamp: number;
  count: number;
}

const CLICK_RECORDS_KEY = "appgenius-ad-clicks";

export function recordAdClick(adId: string): boolean {
  try {
    const stored = localStorage.getItem(CLICK_RECORDS_KEY);
    const records: ClickRecord[] = stored ? JSON.parse(stored) : [];
    
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;
    
    // تنظيف السجلات القديمة
    const recent = records.filter((r) => r.timestamp > hourAgo);
    const existing = recent.find((r) => r.adId === adId);
    
    if (existing) {
      if (existing.count >= 3) {
        // حماية: منع النقرات المتكررة
        return false;
      }
      existing.count++;
      existing.timestamp = now;
    } else {
      recent.push({ adId, timestamp: now, count: 1 });
    }
    
    localStorage.setItem(CLICK_RECORDS_KEY, JSON.stringify(recent));
    return true;
  } catch {
    return true;
  }
}

/**
 * Lazy Loading Observer
 */
export function createLazyObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    },
    {
      rootMargin: "100px",
      threshold: 0.1,
    }
  );
}

/**
 * تتبع عرض الإعلان (impression)
 */
export function trackAdImpression(adId: string, slot: AdSlot): void {
  try {
    const key = "appgenius-ad-impressions";
    const stored = localStorage.getItem(key);
    const impressions: Record<string, number> = stored ? JSON.parse(stored) : {};
    
    impressions[`${adId}_${slot}`] = (impressions[`${adId}_${slot}`] || 0) + 1;
    
    // تحديد السجلات (آخر 1000)
    const keys = Object.keys(impressions);
    if (keys.length > 1000) {
      const sorted = keys.sort();
      sorted.slice(0, 500).forEach((k) => delete impressions[k]);
    }
    
    localStorage.setItem(key, JSON.stringify(impressions));
  } catch {
    // تجاهل الأخطاء
  }
}

/**
 * الحصول على إحصائيات الإعلانات
 */
export function getAdStats(): { impressions: number; clicks: number } {
  try {
    const impressionsData = localStorage.getItem("appgenius-ad-impressions");
    const clicksData = localStorage.getItem(CLICK_RECORDS_KEY);
    
    const impressions: Record<string, number> = impressionsData ? JSON.parse(impressionsData) : {};
    const clicks: ClickRecord[] = clicksData ? JSON.parse(clicksData) : [];
    
    const totalImpressions = Object.values(impressions).reduce((a, b) => a + b, 0);
    const totalClicks = clicks.reduce((a, b) => a + b.count, 0);
    
    return { impressions: totalImpressions, clicks: totalClicks };
  } catch {
    return { impressions: 0, clicks: 0 };
  }
}
