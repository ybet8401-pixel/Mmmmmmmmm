/**
 * نظام الإحالة والنقاط
 * 
 * - كود إحالة فريد لكل مستخدم
 * - نقاط للمستخدمين النشطين
 * - مكافآت يومية
 * - نظام مستويات
 */

import { getCurrentSession } from "./auth";

export interface ReferralData {
  code: string;
  referredBy?: string;
  referrals: string[]; // قائمة المستخدمين الذين أحالهم
  totalEarned: number;
}

export interface PointsData {
  total: number;
  dailyClaimDate?: number;
  history: {
    date: number;
    amount: number;
    reason: string;
  }[];
  level: number;
}

const REFERRAL_KEY = "appgenius-referral";
const POINTS_KEY = "appgenius-points";

/**
 * توليد كود إحالة فريد
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * الحصول على بيانات الإحالة
 */
export function getReferralData(): ReferralData {
  try {
    const stored = localStorage.getItem(REFERRAL_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  // إنشاء بيانات جديدة
  const session = getCurrentSession();
  const data: ReferralData = {
    code: generateReferralCode(),
    referrals: [],
    totalEarned: 0,
  };
  
  // إضافة user ID إذا كان موجوداً
  if (session?.user.id) {
    data.code = session.user.id.substring(0, 8).toUpperCase();
  }
  
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
  return data;
}

/**
 * استخدام كود إحالة
 */
export function useReferralCode(code: string): { success: boolean; message: string } {
  const myData = getReferralData();
  
  if (myData.referredBy) {
    return { success: false, message: "لقد استخدمت كود إحالة بالفعل" };
  }
  
  if (code === myData.code) {
    return { success: false, message: "لا يمكنك استخدام كودك الخاص" };
  }
  
  if (code.length !== 8) {
    return { success: false, message: "كود الإحالة غير صالح" };
  }
  
  myData.referredBy = code;
  localStorage.setItem(REFERRAL_KEY, JSON.stringify(myData));
  
  // إضافة نقاط للمستخدم الجديد
  addPoints(100, "استخدام كود إحالة");
  
  return { 
    success: true, 
    message: "تم استخدام كود الإحالة بنجاح! حصلت على 100 نقطة 🎉" 
  };
}

/**
 * الحصول على بيانات النقاط
 */
export function getPointsData(): PointsData {
  try {
    const stored = localStorage.getItem(POINTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  const data: PointsData = {
    total: 0,
    history: [],
    level: 1,
  };
  localStorage.setItem(POINTS_KEY, JSON.stringify(data));
  return data;
}

/**
 * إضافة نقاط
 */
export function addPoints(amount: number, reason: string): PointsData {
  const data = getPointsData();
  data.total += amount;
  data.history.unshift({
    date: Date.now(),
    amount,
    reason,
  });
  
  // تحديد السجل (آخر 50)
  if (data.history.length > 50) {
    data.history = data.history.slice(0, 50);
  }
  
  // حساب المستوى (كل 500 نقطة = مستوى)
  data.level = Math.floor(data.total / 500) + 1;
  
  localStorage.setItem(POINTS_KEY, JSON.stringify(data));
  return data;
}

/**
 * خصم نقاط
 */
export function subtractPoints(amount: number, reason: string): boolean {
  const data = getPointsData();
  if (data.total < amount) return false;
  
  data.total -= amount;
  data.history.unshift({
    date: Date.now(),
    amount: -amount,
    reason,
  });
  data.level = Math.floor(data.total / 500) + 1;
  
  localStorage.setItem(POINTS_KEY, JSON.stringify(data));
  return true;
}

/**
 * المطالبة بالمكافأة اليومية
 */
export function claimDailyReward(): { success: boolean; message: string; points?: number } {
  const data = getPointsData();
  const now = Date.now();
  const today = new Date().setHours(0, 0, 0, 0);
  
  if (data.dailyClaimDate && data.dailyClaimDate >= today) {
    const hoursRemaining = Math.ceil(
      (today + 24 * 60 * 60 * 1000 - now) / (60 * 60 * 1000)
    );
    return {
      success: false,
      message: `يمكنك المطالبة مرة أخرى بعد ${hoursRemaining} ساعة`,
    };
  }
  
  // حساب النقاط حسب السلسلة
  const lastClaim = data.dailyClaimDate || 0;
  const daysSince = Math.floor((today - lastClaim) / (24 * 60 * 60 * 1000));
  const streak = daysSince === 1 ? 1 : 0; // سلسلة يومية
  const reward = 10 + (streak * 5); // 10 نقاط + 5 لكل يوم متتالي
  
  data.dailyClaimDate = now;
  addPoints(reward, `مكافأة يومية${streak > 0 ? ` (${streak} أيام متتالية)` : ""}`);
  
  return {
    success: true,
    message: `حصلت على ${reward} نقطة! 🎁`,
    points: reward,
  };
}

/**
 * مكافآت النشاط
 */
export const ACTIVITY_REWARDS = {
  generateApp: { points: 10, name: "إنشاء تطبيق" },
  exportProject: { points: 20, name: "تصدير مشروع" },
  shareProject: { points: 15, name: "مشاركة مشروع" },
  signIn: { points: 5, name: "تسجيل دخول" },
  referral: { points: 50, name: "إحالة صديق" },
};

/**
 * الحصول على اسم المستوى
 */
export function getLevelName(level: number): string {
  if (level >= 10) return "أسطورة 👑";
  if (level >= 7) return "خبير 💎";
  if (level >= 5) return "محترف 🏆";
  if (level >= 3) return "متقدم ⭐";
  if (level >= 2) return "نشط 🔥";
  return "مبتدئ 🌱";
}

/**
 * الحصول على رابط الإحالة
 */
export function getReferralLink(): string {
  const data = getReferralData();
  return `${window.location.origin}${window.location.pathname}?ref=${data.code}`;
}

/**
 * التحقق من وجود كود إحالة في URL
 */
export function checkReferralInUrl(): string | null {
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref");
  if (ref && ref.length === 8) {
    // حفظ في sessionStorage لاستخدامه لاحقاً
    sessionStorage.setItem("pending_referral", ref);
    return ref;
  }
  return null;
}

/**
 * تطبيق كود الإحالة المعلق
 */
export function applyPendingReferral(): { success: boolean; message: string } | null {
  const pending = sessionStorage.getItem("pending_referral");
  if (!pending) return null;
  
  const result = useReferralCode(pending);
  if (result.success) {
    sessionStorage.removeItem("pending_referral");
  }
  return result;
}
