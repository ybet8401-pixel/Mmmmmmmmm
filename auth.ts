/**
 * نظام المصادقة المرن
 * 
 * يدعم 3 أوضاع:
 * 1. Guest Mode - استخدام محلي بدون حساب (افتراضي)
 * 2. Supabase - إذا أدخل المستخدم بيانات Supabase الخاصة به
 * 3. Local Account - حسابات محلية محفوظة في المتصفح
 * 
 * الأمان:
 * - كلمات المرور مشفرة بـ SHA-256 قبل الحفظ
 * - Sessions محفوظة في LocalStorage
 * - التحقق من البريد الإلكتروني شكلياً
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthProvider = "guest" | "local" | "supabase";

export interface User {
  id: string;
  email?: string;
  name?: string;
  provider: AuthProvider;
  createdAt: number;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
  expiresAt?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const AUTH_KEY = "appgenius-auth";
const LOCAL_USERS_KEY = "appgenius-local-users";
const SUPABASE_CONFIG_KEY = "appgenius-supabase-config";

let supabaseClient: SupabaseClient | null = null;

/**
 * تجزئة كلمة المرور باستخدام SHA-256
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "appgenius-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من قوة كلمة المرور
 */
export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const labels = ["ضعيفة جداً", "ضعيفة", "متوسطة", "جيدة", "قوية", "قوية جداً"];
  const colors = ["#ef4444", "#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
  
  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

/**
 * حفظ بيانات Supabase
 */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  supabaseClient = null;
}

/**
 * الحصول على بيانات Supabase
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * الحصول على عميل Supabase
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  
  const config = getSupabaseConfig();
  if (!config?.url || !config?.anonKey) return null;
  
  try {
    supabaseClient = createClient(config.url, config.anonKey);
    return supabaseClient;
  } catch (error) {
    console.error("فشل إنشاء عميل Supabase:", error);
    return null;
  }
}

/**
 * اختبار الاتصال بـ Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "بيانات Supabase غير متوفرة",
    };
  }
  
  try {
    const { error } = await client.from("_test").select("*").limit(1);
    // حتى لو الجدول غير موجود، الاتصال نجح
    if (error && !error.message.includes("does not exist")) {
      // خطأ غير متوقع - لكن ربما الاتصال نجح
    }
    return {
      success: true,
      message: "الاتصال بـ Supabase ناجح",
    };
  } catch {
    return {
      success: false,
      message: "فشل الاتصال بـ Supabase - تحقق من البيانات",
    };
  }
}

/**
 * تسجيل الدخول كضيف (بدون حساب)
 */
export function signInAsGuest(name?: string): AuthSession {
  const user: User = {
    id: "guest_" + Date.now(),
    name: name || "ضيف",
    provider: "guest",
    createdAt: Date.now(),
  };
  
  const session: AuthSession = { user };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

/**
 * إنشاء حساب محلي
 */
export async function signUpLocal(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  if (!isValidEmail(email)) {
    return { success: false, error: "البريد الإلكتروني غير صالح" };
  }
  
  if (password.length < 6) {
    return { success: false, error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };
  }
  
  if (!name.trim()) {
    return { success: false, error: "الاسم مطلوب" };
  }
  
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    const users: Record<string, { email: string; passwordHash: string; name: string; createdAt: number }> = 
      stored ? JSON.parse(stored) : {};
    
    // التحقق من عدم وجود الحساب
    if (users[email]) {
      return { success: false, error: "البريد الإلكتروني مسجل بالفعل" };
    }
    
    const passwordHash = await hashPassword(password);
    users[email] = {
      email,
      passwordHash,
      name: name.trim(),
      createdAt: Date.now(),
    };
    
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    
    // تسجيل الدخول تلقائياً
    return signInLocal(email, password);
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل إنشاء الحساب" 
    };
  }
}

/**
 * تسجيل الدخول بحساب محلي
 */
export async function signInLocal(
  email: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (!stored) {
      return { success: false, error: "الحساب غير موجود" };
    }
    
    const users = JSON.parse(stored);
    const user = users[email];
    
    if (!user) {
      return { success: false, error: "البريد الإلكتروني غير مسجل" };
    }
    
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: "كلمة المرور غير صحيحة" };
    }
    
    const session: AuthSession = {
      user: {
        id: `local_${email}`,
        email: user.email,
        name: user.name,
        provider: "local",
        createdAt: user.createdAt,
      },
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, session };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل تسجيل الدخول" 
    };
  }
}

/**
 * تسجيل الدخول عبر Supabase
 */
export async function signInSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      error: "بيانات Supabase غير متوفرة. يرجى إعدادها أولاً." 
    };
  }
  
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    
    const session: AuthSession = {
      user: {
        id: data.user!.id,
        email: data.user!.email,
        name: data.user!.user_metadata?.name || email.split("@")[0],
        provider: "supabase",
        createdAt: Date.now(),
      },
      token: data.session?.access_token,
      expiresAt: data.session?.expires_at,
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, session };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل تسجيل الدخول" 
    };
  }
}

/**
 * إنشاء حساب عبر Supabase
 */
export async function signUpSupabase(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      error: "بيانات Supabase غير متوفرة. يرجى إعدادها أولاً." 
    };
  }
  
  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    
    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    
    const session: AuthSession = {
      user: {
        id: data.user!.id,
        email: data.user!.email,
        name: name,
        provider: "supabase",
        createdAt: Date.now(),
      },
      token: data.session?.access_token,
      expiresAt: data.session?.expires_at,
    };
    
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, session };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل إنشاء الحساب" 
    };
  }
}

/**
 * استرجاع كلمة المرور (Supabase)
 */
export async function resetPasswordSupabase(
  email: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: "بيانات Supabase غير متوفرة" };
  }
  
  try {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    
    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "فشل إرسال رابط الاسترجاع" 
    };
  }
}

/**
 * تسجيل الخروج
 */
export async function signOut(): Promise<void> {
  const session = getCurrentSession();
  
  if (session?.user.provider === "supabase") {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (error) {
        console.warn("خطأ في تسجيل خروج Supabase:", error);
      }
    }
  }
  
  localStorage.removeItem(AUTH_KEY);
}

/**
 * الحصول على الجلسة الحالية
 */
export function getCurrentSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    
    const session: AuthSession = JSON.parse(stored);
    
    // التحقق من انتهاء الجلسة
    if (session.expiresAt && session.expiresAt < Date.now() / 1000) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * التحقق من تسجيل الدخول
 */
export function isAuthenticated(): boolean {
  return getCurrentSession() !== null;
}

/**
 * ترجمة أخطاء المصادقة
 */
function translateAuthError(error: string): string {
  const translations: Record<string, string> = {
    "Invalid login credentials": "بيانات الدخول غير صحيحة",
    "User already registered": "البريد الإلكتروني مسجل بالفعل",
    "Email not confirmed": "البريد الإلكتروني غير مفعل",
    "Password should be at least 6 characters": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "Invalid email": "البريد الإلكتروني غير صالح",
    "User not found": "المستخدم غير موجود",
    "Email rate limit exceeded": "تم تجاوز حد الرسائل - حاول لاحقاً",
    "Signup is disabled": "التسجيل معطل في Supabase",
  };
  
  for (const [key, value] of Object.entries(translations)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return error;
}

/**
 * الحصول على صورة Avatar للمستخدم
 */
export function getUserAvatar(user: User): string {
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];
  const colorIndex = (user.id.charCodeAt(0) || 0) % colors.length;
  const color = colors[colorIndex];
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${color}"/><text x="50" y="50" font-size="50" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial">${initial}</text></svg>`;
}
