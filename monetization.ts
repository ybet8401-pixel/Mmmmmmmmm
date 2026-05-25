/**
 * نظام الاشتراكات والحصص
 * 
 * يدير:
 * - خطط الاشتراك (Free, Pro, Business)
 * - الحصص اليومية/الشهرية
 * - Rate Limiting
 * - حالة الاشتراك
 * 
 * ملاحظة:
 * هذا النظام يعمل محلياً في المتصفح. للتحقق الحقيقي من المدفوعات،
 * يجب إضافة backend webhook يستقبل إشعارات PayPal/Stripe.
 */

export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  nameAr: string;
  price: number; // دولار أمريكي / شهرياً
  priceYearly: number;
  currency: string;
  features: {
    dailyGenerations: number; // -1 = غير محدود
    monthlyGenerations: number;
    maxProjects: number;
    maxProjectSize: number; // MB
    providers: string[];
    exportFormats: string[];
    priority: "low" | "normal" | "high" | "ultra";
    removeAds: boolean;
    customDomain: boolean;
    apiAccess: boolean;
    supportLevel: "community" | "email" | "priority" | "dedicated";
  };
  color: string;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    nameAr: "مجاني",
    price: 0,
    priceYearly: 0,
    currency: "USD",
    color: "from-slate-500 to-slate-600",
    features: {
      dailyGenerations: 5,
      monthlyGenerations: 50,
      maxProjects: 10,
      maxProjectSize: 2,
      providers: ["pollinations"],
      exportFormats: ["webapp", "zip"],
      priority: "low",
      removeAds: false,
      customDomain: false,
      apiAccess: false,
      supportLevel: "community",
    },
  },
  {
    id: "pro",
    name: "Pro",
    nameAr: "احترافي",
    price: 19,
    priceYearly: 190, // ~17% خصم
    currency: "USD",
    color: "from-purple-500 to-pink-500",
    popular: true,
    features: {
      dailyGenerations: 100,
      monthlyGenerations: 2000,
      maxProjects: 100,
      maxProjectSize: 10,
      providers: ["pollinations", "openai", "groq", "gemini"],
      exportFormats: ["webapp", "zip", "pwa", "apk-config"],
      priority: "high",
      removeAds: true,
      customDomain: false,
      apiAccess: true,
      supportLevel: "priority",
    },
  },
  {
    id: "business",
    name: "Business",
    nameAr: "أعمال",
    price: 49,
    priceYearly: 490,
    currency: "USD",
    color: "from-orange-500 to-red-500",
    features: {
      dailyGenerations: -1, // غير محدود
      monthlyGenerations: -1,
      maxProjects: -1,
      maxProjectSize: 50,
      providers: ["pollinations", "openai", "groq", "gemini"],
      exportFormats: ["webapp", "zip", "pwa", "apk-config"],
      priority: "ultra",
      removeAds: true,
      customDomain: true,
      apiAccess: true,
      supportLevel: "dedicated",
    },
  },
];

export interface Subscription {
  planId: PlanId;
  status: "active" | "canceled" | "expired" | "trial";
  startDate: number;
  endDate?: number;
  autoRenew: boolean;
  paypalSubscriptionId?: string;
  paypalOrderId?: string;
  lastPayment?: number;
}

export interface UsageStats {
  generationsToday: number;
  generationsThisMonth: number;
  projectsCount: number;
  lastResetDay: number;
  lastResetMonth: number;
}

const SUBSCRIPTION_KEY = "appgenius-subscription";
const USAGE_KEY = "appgenius-usage";

/**
 * الحصول على الاشتراك الحالي
 */
export function getCurrentSubscription(): Subscription {
  try {
    const stored = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!stored) {
      return {
        planId: "free",
        status: "active",
        startDate: Date.now(),
        autoRenew: false,
      };
    }
    const sub: Subscription = JSON.parse(stored);
    
    // التحقق من انتهاء الاشتراك
    if (sub.endDate && sub.endDate < Date.now() && sub.status === "active") {
      sub.status = "expired";
      sub.planId = "free";
      saveSubscription(sub);
    }
    
    return sub;
  } catch {
    return {
      planId: "free",
      status: "active",
      startDate: Date.now(),
      autoRenew: false,
    };
  }
}

/**
 * حفظ الاشتراك
 */
export function saveSubscription(sub: Subscription): void {
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub));
}

/**
 * الحصول على الخطة الحالية
 */
export function getCurrentPlan(): Plan {
  const sub = getCurrentSubscription();
  return PLANS.find((p) => p.id === sub.planId) || PLANS[0];
}

/**
 * ترقية الاشتراك
 */
export function upgradeSubscription(
  planId: PlanId,
  paymentDetails?: {
    paypalOrderId?: string;
    paypalSubscriptionId?: string;
  }
): Subscription {
  const now = Date.now();
  const sub: Subscription = {
    planId,
    status: "active",
    startDate: now,
    endDate: now + 30 * 24 * 60 * 60 * 1000, // 30 يوم
    autoRenew: true,
    paypalOrderId: paymentDetails?.paypalOrderId,
    paypalSubscriptionId: paymentDetails?.paypalSubscriptionId,
    lastPayment: now,
  };
  saveSubscription(sub);
  return sub;
}

/**
 * إلغاء الاشتراك
 */
export function cancelSubscription(): void {
  const sub = getCurrentSubscription();
  sub.status = "canceled";
  sub.autoRenew = false;
  saveSubscription(sub);
}

/**
 * الحصول على إحصائيات الاستخدام
 */
export function getUsageStats(): UsageStats {
  try {
    const stored = localStorage.getItem(USAGE_KEY);
    const now = new Date();
    const today = now.getDate();
    const month = now.getMonth();
    
    if (!stored) {
      return {
        generationsToday: 0,
        generationsThisMonth: 0,
        projectsCount: 0,
        lastResetDay: today,
        lastResetMonth: month,
      };
    }
    
    const stats: UsageStats = JSON.parse(stored);
    
    // إعادة تعيين العداد اليومي
    if (stats.lastResetDay !== today) {
      stats.generationsToday = 0;
      stats.lastResetDay = today;
    }
    
    // إعادة تعيين العداد الشهري
    if (stats.lastResetMonth !== month) {
      stats.generationsThisMonth = 0;
      stats.lastResetMonth = month;
    }
    
    return stats;
  } catch {
    return {
      generationsToday: 0,
      generationsThisMonth: 0,
      projectsCount: 0,
      lastResetDay: new Date().getDate(),
      lastResetMonth: new Date().getMonth(),
    };
  }
}

/**
 * حفظ إحصائيات الاستخدام
 */
export function saveUsageStats(stats: UsageStats): void {
  localStorage.setItem(USAGE_KEY, JSON.stringify(stats));
}

/**
 * تسجيل استخدام جديد (توليد تطبيق)
 */
export function recordGeneration(): void {
  const stats = getUsageStats();
  stats.generationsToday++;
  stats.generationsThisMonth++;
  saveUsageStats(stats);
}

/**
 * التحقق من إمكانية التوليد
 */
export function canGenerate(): { allowed: boolean; reason?: string; upgrade?: boolean } {
  const plan = getCurrentPlan();
  const stats = getUsageStats();
  
  // تحقق من الحد اليومي
  if (plan.features.dailyGenerations !== -1 && 
      stats.generationsToday >= plan.features.dailyGenerations) {
    return {
      allowed: false,
      reason: `تجاوزت الحد اليومي (${plan.features.dailyGenerations} عملية). ${
        plan.id === "free" ? "قم بالترقية للحصول على المزيد." : "انتظر حتى الغد."
      }`,
      upgrade: plan.id === "free",
    };
  }
  
  // تحقق من الحد الشهري
  if (plan.features.monthlyGenerations !== -1 && 
      stats.generationsThisMonth >= plan.features.monthlyGenerations) {
    return {
      allowed: false,
      reason: `تجاوزت الحد الشهري (${plan.features.monthlyGenerations} عملية). ${
        plan.id === "free" ? "قم بالترقية للحصول على المزيد." : "انتظر حتى الشهر القادم."
      }`,
      upgrade: plan.id === "free",
    };
  }
  
  return { allowed: true };
}

/**
 * التحقق من إمكانية إنشاء مشروع
 */
export function canCreateProject(currentCount: number): { allowed: boolean; reason?: string; upgrade?: boolean } {
  const plan = getCurrentPlan();
  
  if (plan.features.maxProjects !== -1 && currentCount >= plan.features.maxProjects) {
    return {
      allowed: false,
      reason: `وصلت للحد الأقصى من المشاريع (${plan.features.maxProjects}). ${
        plan.id === "free" ? "قم بالترقية للحصول على مساحة أكبر." : "احذف بعض المشاريع أولاً."
      }`,
      upgrade: plan.id === "free",
    };
  }
  
  return { allowed: true };
}

/**
 * التحقق من إمكانية استخدام مزود
 */
export function canUseProvider(providerId: string): boolean {
  const plan = getCurrentPlan();
  return plan.features.providers.includes(providerId);
}

/**
 * التحقق من إمكانية استخدام صيغة تصدير
 */
export function canUseExportFormat(format: string): boolean {
  const plan = getCurrentPlan();
  return plan.features.exportFormats.includes(format);
}

/**
 * هل يجب عرض الإعلانات؟
 */
export function shouldShowAds(): boolean {
  const plan = getCurrentPlan();
  return !plan.features.removeAds;
}

/**
 * تنسيق السعر
 */
export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * الحصول على عدد الأيام المتبقية في الاشتراك
 */
export function getDaysRemaining(): number {
  const sub = getCurrentSubscription();
  if (!sub.endDate) return -1;
  const diff = sub.endDate - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}
