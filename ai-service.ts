/**
 * خدمة الذكاء الاصطناعي الموحدة
 * 
 * تدعم:
 * - Pollinations AI (مجاني بدون مفتاح)
 * - OpenAI GPT-4/3.5
 * - Groq (Llama, Mixtral, Gemma)
 * - Google Gemini
 * 
 * مميزات:
 * - Retry تلقائي عند الفشل
 * - Timeout قابل للتعديل
 * - معالجة أخطاء شاملة
 * - دعم CORS عبر fetch مباشر
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderId } from "./providers";
import { getProviderById, getDefaultModel } from "./providers";

export interface GenerationRequest {
  provider: ProviderId;
  model?: string;
  description: string;
  apiKey?: string;
  language?: string;
  style?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface GenerationResult {
  code: string;
  provider: ProviderId;
  model: string;
  duration: number;
  tokensUsed?: number;
}

export interface TestResult {
  success: boolean;
  message: string;
  duration: number;
  model: string;
  error?: string;
}

/**
 * بناء Prompt احترافي لتوليد تطبيق كامل
 */
function buildPrompt(description: string, language = "العربية", style = "حديث"): string {
  return `You are an expert web developer. Generate a COMPLETE, SELF-CONTAINED single HTML file for the following web application request.

REQUIREMENTS:
1. Return ONLY the HTML code, no explanations, no markdown, no code fences, no \`\`\` markers.
2. The HTML must be fully functional and include all CSS (in <style>) and JavaScript (in <script>).
3. Use modern, beautiful design with Tailwind CSS via CDN: https://cdn.tailwindcss.com
4. Make it responsive and mobile-friendly.
5. Support RTL direction (dir="rtl") and use ${language} language for all text.
6. Use a ${style} design style with smooth animations and gradients.
7. Include proper error handling and user feedback.
8. Add realistic dummy data where needed.
9. Make it feel like a production-ready application.
10. Use Google Fonts (Cairo or Tajawal) for Arabic typography.

APPLICATION REQUEST:
${description}

Remember: Return ONLY the complete HTML code starting with <!DOCTYPE html> and ending with </html>. No other text.`;
}

/**
 * تنظيف الكود من أي نصوص إضافية
 */
export function cleanGeneratedCode(code: string): string {
  if (!code) return "";

  let cleaned = code.trim();

  // إزالة علامات markdown
  cleaned = cleaned.replace(/^```html\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/```\s*$/, "");

  // البحث عن بداية HTML
  const htmlStart = cleaned.search(/<!DOCTYPE html>|<html/i);
  if (htmlStart > 0) {
    cleaned = cleaned.substring(htmlStart);
  } else if (htmlStart === -1) {
    if (!cleaned.startsWith("<!")) {
      cleaned = "<!DOCTYPE html>\n" + cleaned;
    }
  }

  // البحث عن نهاية HTML
  const htmlEnd = cleaned.lastIndexOf("</html>");
  if (htmlEnd > 0) {
    cleaned = cleaned.substring(0, htmlEnd + 7);
  }

  return cleaned.trim();
}

/**
 * استدعاء fetch مع timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * إعادة المحاولة مع تأخير
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("فشل الاتصال بعد عدة محاولات");
}

/**
 * استدعاء Pollinations AI (مجاني)
 */
async function callPollinations(
  prompt: string,
  model: string,
  timeout: number,
  maxRetries: number
): Promise<string> {
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const url = `https://text.pollinations.ai/${encodedPrompt}?model=${model}&seed=${seed}`;

  return withRetry(async () => {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: { Accept: "text/plain" },
      },
      timeout
    );

    if (!response.ok) {
      throw new Error(`Pollinations error: ${response.status}`);
    }

    const text = await response.text();
    if (!text || text.length < 100) {
      throw new Error("استجابة فارغة من Pollinations");
    }
    return text;
  }, maxRetries);
}

/**
 * استدعاء OpenAI API (متوافق مع OpenAI SDK)
 */
async function callOpenAI(
  prompt: string,
  apiKey: string,
  model: string,
  timeout: number,
  maxRetries: number
): Promise<string> {
  return withRetry(async () => {
    const response = await fetchWithTimeout(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert web developer that generates complete, self-contained HTML files. Return ONLY the HTML code, no explanations, no markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      },
      timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}`;
      
      if (response.status === 401) {
        throw new Error("مفتاح OpenAI غير صحيح. تحقق من المفتاح وحاول مرة أخرى.");
      }
      if (response.status === 429) {
        throw new Error("تم تجاوز حد الاستخدام. انتظر قليلاً وحاول مرة أخرى.");
      }
      if (response.status === 404) {
        throw new Error(`النموذج ${model} غير متوفر. اختر نموذجاً آخر.`);
      }
      throw new Error(`OpenAI: ${msg}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("استجابة فارغة من OpenAI");
    return content;
  }, maxRetries);
}

/**
 * استدعاء Groq API (نفس تنسيق OpenAI)
 */
async function callGroq(
  prompt: string,
  apiKey: string,
  model: string,
  timeout: number,
  maxRetries: number
): Promise<string> {
  return withRetry(async () => {
    const response = await fetchWithTimeout(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert web developer that generates complete, self-contained HTML files. Return ONLY the HTML code, no explanations, no markdown.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      },
      timeout
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status}`;

      if (response.status === 401) {
        throw new Error("مفتاح Groq غير صحيح. تحقق من المفتاح وحاول مرة أخرى.");
      }
      if (response.status === 429) {
        throw new Error("تم تجاوز حد الاستخدام. انتظر قليلاً.");
      }
      if (response.status === 404) {
        throw new Error(`النموذج ${model} غير متوفر على Groq.`);
      }
      throw new Error(`Groq: ${msg}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("استجابة فارغة من Groq");
    return content;
  }, maxRetries);
}

/**
 * استدعاء Google Gemini API (عبر SDK الرسمي)
 */
async function callGemini(
  prompt: string,
  apiKey: string,
  model: string,
  timeout: number,
  maxRetries: number
): Promise<string> {
  return withRetry(async () => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });

    // استخدام AbortController للـ timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await genModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "You are an expert web developer. Generate only the HTML code, no explanations, no markdown, no code fences.\n\n" +
                  prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      });
      clearTimeout(timeoutId);

      const text = result.response.text();
      if (!text || text.length < 100) {
        throw new Error("استجابة فارغة من Gemini");
      }
      return text;
    } catch (error) {
      clearTimeout(timeoutId);
      const err = error as { message?: string; status?: number };
      if (err.message?.includes("API_KEY_INVALID") || err.message?.includes("401")) {
        throw new Error("مفتاح Gemini غير صحيح. تحقق من المفتاح.");
      }
      if (err.message?.includes("404")) {
        throw new Error(`النموذج ${model} غير متوفر على Gemini.`);
      }
      if (err.message?.includes("429")) {
        throw new Error("تم تجاوز حد الاستخدام في Gemini.");
      }
      throw new Error(`Gemini: ${err.message || "خطأ غير معروف"}`);
    }
  }, maxRetries);
}

/**
 * توليد تطبيق باستخدام AI
 */
export async function generateApp(request: GenerationRequest): Promise<GenerationResult> {
  const startTime = Date.now();
  const {
    provider,
    description,
    apiKey,
    language = "العربية",
    style = "حديث",
    timeout = 90000,
    maxRetries = 2,
  } = request;

  const providerInfo = getProviderById(provider);
  if (!providerInfo) {
    throw new Error("مزود غير معروف");
  }

  const model = request.model || getDefaultModel(provider);

  // التحقق من المفتاح إذا كان مطلوباً
  if (providerInfo.requiresKey && !apiKey) {
    throw new Error(`يرجى إدخال مفتاح ${providerInfo.nameAr} من الإعدادات`);
  }

  const prompt = buildPrompt(description, language, style);
  let rawCode = "";

  switch (provider) {
    case "pollinations":
      rawCode = await callPollinations(prompt, model, timeout, maxRetries);
      break;
    case "openai":
      rawCode = await callOpenAI(prompt, apiKey!, model, timeout, maxRetries);
      break;
    case "groq":
      rawCode = await callGroq(prompt, apiKey!, model, timeout, maxRetries);
      break;
    case "gemini":
      rawCode = await callGemini(prompt, apiKey!, model, timeout, maxRetries);
      break;
    default:
      throw new Error("مزود غير مدعوم");
  }

  const cleaned = cleanGeneratedCode(rawCode);
  if (!cleaned || cleaned.length < 100) {
    throw new Error("لم يتم توليد كود صالح. حاول مرة أخرى بوصف أكثر تفصيلاً.");
  }

  return {
    code: cleaned,
    provider,
    model,
    duration: Date.now() - startTime,
  };
}

/**
 * اختبار الاتصال بمزود AI
 */
export async function testConnection(
  provider: ProviderId,
  apiKey: string,
  model?: string
): Promise<TestResult> {
  const startTime = Date.now();
  const providerInfo = getProviderById(provider);

  if (!providerInfo) {
    return {
      success: false,
      message: "مزود غير معروف",
      duration: Date.now() - startTime,
      model: model || "",
      error: "Provider not found",
    };
  }

  const testModel = model || getDefaultModel(provider);
  const testPrompt = "Say 'OK' if you can hear me. Reply with only 'OK'.";

  try {
    let response = "";

    switch (provider) {
      case "pollinations":
        response = await callPollinations(testPrompt, testModel, 15000, 1);
        break;
      case "openai":
        response = await callOpenAI(testPrompt, apiKey, testModel, 15000, 1);
        break;
      case "groq":
        response = await callGroq(testPrompt, apiKey, testModel, 15000, 1);
        break;
      case "gemini":
        response = await callGemini(testPrompt, apiKey, testModel, 15000, 1);
        break;
    }

    if (response && response.length > 0) {
      return {
        success: true,
        message: "✅ الاتصال ناجح! المفتاح يعمل بشكل صحيح.",
        duration: Date.now() - startTime,
        model: testModel,
      };
    }

    throw new Error("استجابة فارغة");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `❌ فشل الاتصال: ${errorMessage}`,
      duration: Date.now() - startTime,
      model: testModel,
      error: errorMessage,
    };
  }
}
