/**
 * نظام التخزين الآمن للمفاتيح
 * يقوم بحفظ وإدارة مفاتيح API في LocalStorage مع تشفير بسيط
 */

// مفتاح التشفير البسيط (في الإنتاج يجب استخدام تشفير أقوى)
const ENCRYPTION_KEY = "appgenius-secure-key-2024";

/**
 * تشفير نص بسيط باستخدام XOR
 * ملاحظة: هذا تشفير بسيط لإخفاء المفاتيح من العرض المباشر
 * في الإنتاج الحقيقي، استخدم تشفير أقوى مثل AES
 */
function simpleEncrypt(text: string): string {
  if (!text) return "";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

/**
 * فك تشفير النص
 */
function simpleDecrypt(encrypted: string): string {
  if (!encrypted) return "";
  try {
    const decoded = atob(encrypted);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return "";
  }
}

export interface StoredKeys {
  openai?: string;
  groq?: string;
  gemini?: string;
  selectedProvider?: string;
  selectedModels?: {
    openai?: string;
    groq?: string;
    gemini?: string;
  };
}

const STORAGE_KEY = "appgenius-ai-keys";

/**
 * حفظ المفاتيح في LocalStorage
 */
export function saveKeys(keys: StoredKeys): void {
  try {
    const encrypted: Record<string, string> = {};
    
    // تشفير المفاتيح فقط، ليس الإعدادات الأخرى
    if (keys.openai) encrypted.openai = simpleEncrypt(keys.openai);
    if (keys.groq) encrypted.groq = simpleEncrypt(keys.groq);
    if (keys.gemini) encrypted.gemini = simpleEncrypt(keys.gemini);
    
    // حفظ الإعدادات بدون تشفير
    if (keys.selectedProvider) encrypted.selectedProvider = keys.selectedProvider;
    if (keys.selectedModels) encrypted.selectedModels = JSON.stringify(keys.selectedModels);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(encrypted));
  } catch (error) {
    console.error("فشل حفظ المفاتيح:", error);
  }
}

/**
 * استرجاع المفاتيح من LocalStorage
 */
export function loadKeys(): StoredKeys {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    const keys: StoredKeys = {};
    
    // فك تشفير المفاتيح
    if (parsed.openai) keys.openai = simpleDecrypt(parsed.openai);
    if (parsed.groq) keys.groq = simpleDecrypt(parsed.groq);
    if (parsed.gemini) keys.gemini = simpleDecrypt(parsed.gemini);
    
    // استرجاع الإعدادات
    if (parsed.selectedProvider) keys.selectedProvider = parsed.selectedProvider;
    if (parsed.selectedModels) {
      try {
        keys.selectedModels = JSON.parse(parsed.selectedModels);
      } catch {
        keys.selectedModels = {};
      }
    }
    
    return keys;
  } catch (error) {
    console.error("فشل تحميل المفاتيح:", error);
    return {};
  }
}

/**
 * حفظ مفتاح واحد لمزود محدد
 */
export function saveProviderKey(provider: string, key: string): void {
  const keys = loadKeys();
  (keys as Record<string, unknown>)[provider] = key;
  saveKeys(keys);
}

/**
 * الحصول على مفتاح مزود محدد
 */
export function getProviderKey(provider: string): string {
  const keys = loadKeys();
  return (keys as Record<string, string>)[provider] || "";
}

/**
 * حفظ المزود المختار
 */
export function saveSelectedProvider(provider: string): void {
  const keys = loadKeys();
  keys.selectedProvider = provider;
  saveKeys(keys);
}

/**
 * الحصول على المزود المختار
 */
export function getSelectedProvider(): string {
  const keys = loadKeys();
  return keys.selectedProvider || "pollinations";
}

/**
 * حفظ النموذج المختار لمزود محدد
 */
export function saveSelectedModel(provider: string, model: string): void {
  const keys = loadKeys();
  if (!keys.selectedModels) keys.selectedModels = {};
  (keys.selectedModels as Record<string, string>)[provider] = model;
  saveKeys(keys);
}

/**
 * الحصول على النموذج المختار لمزود محدد
 */
export function getSelectedModel(provider: string): string {
  const keys = loadKeys();
  return keys.selectedModels?.[provider as keyof typeof keys.selectedModels] || "";
}

/**
 * حذف جميع المفاتيح
 */
export function clearAllKeys(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * إخفاء جزء من المفتاح للعرض
 */
export function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "•".repeat(key.length);
  return key.substring(0, 4) + "•".repeat(Math.min(20, key.length - 8)) + key.substring(key.length - 4);
}
