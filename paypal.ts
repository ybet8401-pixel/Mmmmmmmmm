/**
 * نظام الدفع عبر PayPal
 * 
 * يدعم:
 * - PayPal Smart Buttons (JavaScript SDK)
 * - اشتراكات شهرية وسنوية
 * - إلغاء الاشتراك
 * - حفظ تفاصيل الدفع
 * 
 * الإعداد:
 * 1. أنشئ حساب PayPal Business
 * 2. أنشئ تطبيق في developer.paypal.com
 * 3. احصل على Client ID
 * 4. أنشئ خطط اشتراك (plans) في PayPal
 * 5. أدخل Client ID في الإعدادات
 * 
 * ملاحظة مهمة:
 * التحقق من المدفوعات (webhook validation) يجب أن يتم في backend
 * لضمان الأمان. هذا النظام يحفظ حالة الاشتراك محلياً فقط.
 */

import { upgradeSubscription, type PlanId } from "./monetization";
import type { AuthSession } from "./auth";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (container: string | HTMLElement) => void;
      };
    };
  }
}

interface PayPalButtonsConfig {
  style?: {
    layout?: "vertical" | "horizontal";
    color?: "gold" | "blue" | "silver" | "white" | "black";
    shape?: "rect" | "pill";
    label?: "paypal" | "checkout" | "buynow" | "pay" | "subscribe";
  };
  createSubscription?: (
    data: unknown,
    actions: { subscription: { create: (config: unknown) => Promise<string> } }
  ) => Promise<string>;
  createOrder?: (
    data: unknown,
    actions: { order: { create: (config: unknown) => Promise<string> } }
  ) => Promise<string>;
  onApprove?: (
    data: { subscriptionID?: string; orderID?: string; payerID?: string },
    actions?: unknown
  ) => Promise<void>;
  onError?: (err: Error) => void;
  onCancel?: (data: unknown) => void;
}

export interface PayPalConfig {
  clientId?: string;
  environment: "sandbox" | "production";
  currency: string;
  planIds?: {
    pro_monthly?: string;
    pro_yearly?: string;
    business_monthly?: string;
    business_yearly?: string;
  };
}

const PAYPAL_CONFIG_KEY = "appgenius-paypal-config";
const PAYPAL_SCRIPT_ID = "paypal-sdk-script";

/**
 * الحصول على إعدادات PayPal
 */
export function getPayPalConfig(): PayPalConfig {
  try {
    const stored = localStorage.getItem(PAYPAL_CONFIG_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  return {
    environment: "sandbox",
    currency: "USD",
  };
}

/**
 * حفظ إعدادات PayPal
 */
export function savePayPalConfig(config: Partial<PayPalConfig>): void {
  const current = getPayPalConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(PAYPAL_CONFIG_KEY, JSON.stringify(updated));
}

/**
 * تحميل PayPal SDK
 */
export function loadPayPalSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = getPayPalConfig();
    
    if (!config.clientId) {
      reject(new Error("PayPal Client ID غير مُعد"));
      return;
    }
    
    // إزالة السكريبت القديم إن وجد
    const existingScript = document.getElementById(PAYPAL_SCRIPT_ID);
    if (existingScript) {
      if (window.paypal) {
        resolve();
        return;
      }
      existingScript.remove();
    }
    
    const script = document.createElement("script");
    script.id = PAYPAL_SCRIPT_ID;
    script.src = `https://www.paypal.com/sdk/js?client-id=${config.clientId}&currency=${config.currency}&intent=subscription&vault=true`;
    script.setAttribute("data-sdk-integration-source", "button-factory");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("فشل تحميل PayPal SDK"));
    document.head.appendChild(script);
  });
}

/**
 * إنشاء زر اشتراك PayPal
 */
export async function createSubscriptionButton(
  containerId: string,
  planId: PlanId,
  billingCycle: "monthly" | "yearly",
  user: AuthSession["user"],
  onSuccess: (subscriptionId: string) => void,
  onError: (error: Error) => void,
  onCancel?: () => void
): Promise<void> {
  const config = getPayPalConfig();
  
  if (!config.clientId) {
    throw new Error("PayPal Client ID غير مُعد. يرجى إدخاله في الإعدادات.");
  }
  
  await loadPayPalSDK();
  
  if (!window.paypal) {
    throw new Error("PayPal SDK غير متوفر");
  }
  
  // الحصول على PayPal Plan ID من الإعدادات
  const paypalPlanId = config.planIds?.[`${planId}_${billingCycle}`];
  
  if (!paypalPlanId) {
    // في حالة عدم وجود plan ID، نستخدم نظام الدفع المباشر
    await createOneTimePaymentButton(
      containerId,
      planId,
      billingCycle,
      user,
      onSuccess,
      onError,
      onCancel
    );
    return;
  }
  
  // إنشاء زر اشتراك
  window.paypal.Buttons({
    style: {
      shape: "rect",
      color: "gold",
      layout: "vertical",
      label: "subscribe",
    },
    createSubscription: async (data, actions) => {
      return actions.subscription.create({
        plan_id: paypalPlanId,
        subscriber: {
          name: {
            given_name: user.name || "User",
          },
          email_address: user.email,
        },
        custom_id: user.id,
      });
    },
    onApprove: async (data) => {
      if (data.subscriptionID) {
        // حفظ الاشتراك محلياً
        upgradeSubscription(planId, {
          paypalSubscriptionId: data.subscriptionID,
        });
        onSuccess(data.subscriptionID);
      }
    },
    onError: (err) => {
      console.error("PayPal Error:", err);
      onError(err);
    },
    onCancel: () => {
      onCancel?.();
    },
  }).render(`#${containerId}`);
}

/**
 * زر دفع لمرة واحدة (بديل للاشتراكات)
 */
async function createOneTimePaymentButton(
  containerId: string,
  planId: PlanId,
  billingCycle: "monthly" | "yearly",
  user: AuthSession["user"],
  onSuccess: (orderId: string) => void,
  onError: (error: Error) => void,
  onCancel?: () => void
): Promise<void> {
  const prices: Record<string, number> = {
    pro_monthly: 19,
    pro_yearly: 190,
    business_monthly: 49,
    business_yearly: 490,
  };
  
  const amount = prices[`${planId}_${billingCycle}`];
  if (!amount) throw new Error("خطة غير صالحة");
  
  if (!window.paypal) throw new Error("PayPal SDK غير متوفر");
  
  window.paypal.Buttons({
    style: {
      shape: "rect",
      color: "gold",
      layout: "vertical",
      label: "pay",
    },
    createOrder: async (data, actions) => {
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `AppGenius AI - ${planId.toUpperCase()} Plan (${billingCycle})`,
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
            custom_id: user.id,
          },
        ],
      });
    },
    onApprove: async (data) => {
      if (data.orderID) {
        // حفظ الاشتراك محلياً
        upgradeSubscription(planId, {
          paypalOrderId: data.orderID,
        });
        onSuccess(data.orderID);
      }
    },
    onError: (err) => {
      console.error("PayPal Error:", err);
      onError(err);
    },
    onCancel: () => {
      onCancel?.();
    },
  }).render(`#${containerId}`);
}

/**
 * التحقق من وجود PayPal
 */
export function isPayPalConfigured(): boolean {
  const config = getPayPalConfig();
  return !!config.clientId;
}

/**
 * إنشاء رابط إلغاء الاشتراك في PayPal
 */
export function getCancelSubscriptionUrl(subscriptionId: string): string {
  const config = getPayPalConfig();
  const baseUrl =
    config.environment === "production"
      ? "https://www.paypal.com"
      : "https://www.sandbox.paypal.com";
  return `${baseUrl}/myaccount/autopay/connect/${subscriptionId}/cancel`;
}

/**
 * حفظ سجل الدفع
 */
export interface PaymentRecord {
  id: string;
  planId: PlanId;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  paypalId: string;
  date: number;
  status: "completed" | "refunded" | "pending";
}

const PAYMENTS_KEY = "appgenius-payments";

export function savePaymentRecord(record: PaymentRecord): void {
  try {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    const payments: PaymentRecord[] = stored ? JSON.parse(stored) : [];
    payments.unshift(record);
    
    // تحديد السجلات (آخر 50)
    if (payments.length > 50) {
      payments.length = 50;
    }
    
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error("فشل حفظ سجل الدفع:", error);
  }
}

export function getPaymentHistory(): PaymentRecord[] {
  try {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
