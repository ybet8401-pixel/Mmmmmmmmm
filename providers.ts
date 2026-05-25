/**
 * تعريف مزودي الذكاء الاصطناعي والنماذج
 * 
 * لإضافة مزود جديد:
 * 1. أضف Provider جديد في PROVIDERS
 * 2. أضف دالة استدعاء في ai-service.ts
 * 3. سيتم دعمه تلقائياً في الواجهة
 */

export type ProviderId = "pollinations" | "openai" | "groq" | "gemini";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "ultra";
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  nameAr: string;
  description: string;
  icon: string;
  color: string;
  requiresKey: boolean;
  keyPlaceholder: string;
  keyHelp: string;
  docsUrl: string;
  models: AIModel[];
  free: boolean;
}

export const PROVIDERS: AIProvider[] = [
  {
    id: "pollinations",
    name: "Pollinations AI",
    nameAr: "Pollinations AI",
    description: "خدمة مجانية بالكامل بدون الحاجة لمفتاح API",
    icon: "⚡",
    color: "from-yellow-500 to-orange-500",
    requiresKey: false,
    keyPlaceholder: "",
    keyHelp: "يعمل تلقائياً بدون أي إعدادات",
    docsUrl: "https://pollinations.ai",
    free: true,
    models: [
      {
        id: "openai",
        name: "OpenAI (عبر Pollinations)",
        description: "نموذج GPT عبر Pollinations - مجاني",
        speed: "medium",
        quality: "high",
      },
      {
        id: "mistral",
        name: "Mistral (عبر Pollinations)",
        description: "نموذج Mistral - مجاني وسريع",
        speed: "fast",
        quality: "standard",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    nameAr: "أوبن إيه آي",
    description: "نماذج GPT-4 الرائدة في توليد الكود",
    icon: "🤖",
    color: "from-green-500 to-emerald-500",
    requiresKey: true,
    keyPlaceholder: "sk-proj-...",
    keyHelp: "احصل على مفتاح من platform.openai.com/api-keys",
    docsUrl: "https://platform.openai.com/api-keys",
    free: false,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "أحدث وأقوى نموذج - متعدد الوسائط",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "نموذج GPT-4 محسّن للسرعة",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "سريع واقتصادي",
        speed: "fast",
        quality: "standard",
      },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    nameAr: "جروك",
    description: "أسرع استدلال للذكاء الاصطناعي في العالم",
    icon: "🚀",
    color: "from-orange-500 to-red-500",
    requiresKey: true,
    keyPlaceholder: "gsk_...",
    keyHelp: "احصل على مفتاح من console.groq.com/keys",
    docsUrl: "https://console.groq.com/keys",
    free: false,
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "نموذج Llama الأحدث من Meta",
        speed: "fast",
        quality: "high",
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        description: "نموذج Mixtral من Mistral AI",
        speed: "fast",
        quality: "high",
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        description: "نموذج Gemma من Google",
        speed: "fast",
        quality: "standard",
      },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    nameAr: "جوجل جيميني",
    description: "نماذج Gemini من Google - قوية ومتعددة الوسائط",
    icon: "✨",
    color: "from-blue-500 to-indigo-500",
    requiresKey: true,
    keyPlaceholder: "AIza...",
    keyHelp: "احصل على مفتاح من aistudio.google.com/app/apikey",
    docsUrl: "https://aistudio.google.com/app/apikey",
    free: false,
    models: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "أقوى نموذج من Google",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "سريع ومجاني حتى حد معين",
        speed: "fast",
        quality: "high",
      },
    ],
  },
];

/**
 * الحصول على مزود بواسطة ID
 */
export function getProviderById(id: ProviderId): AIProvider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/**
 * الحصول على نموذج بواسطة ID ضمن مزود
 */
export function getModelById(providerId: ProviderId, modelId: string): AIModel | undefined {
  const provider = getProviderById(providerId);
  return provider?.models.find((m) => m.id === modelId);
}

/**
 * الحصول على النموذج الافتراضي لمزود
 */
export function getDefaultModel(providerId: ProviderId): string {
  const provider = getProviderById(providerId);
  return provider?.models[0]?.id || "";
}
