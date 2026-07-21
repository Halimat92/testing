import { getSupabaseAdmin } from "@/lib/supabase/admin";

type CouponConfig = {
  percent_off?: number;
  amount_off?: number;
  max_redemptions?: number;
  name?: string;
};

export type ResolvedDiscount = {
  type: "local_coupon" | "generated_coupon";
  code: string;
  amount: number; // pence
  name: string;
};

function parseCouponJson(envName: string): Record<string, CouponConfig> {
  const raw = process.env[envName];
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`${envName} is not valid JSON.`, error);
    return {};
  }
}

function getAllowedCoupons(): Record<string, CouponConfig> {
  return parseCouponJson("STRIPE_COUPONS_JSON");
}

function getLocalCoupons(): Record<string, CouponConfig> {
  const configuredCoupons = parseCouponJson("LOCAL_COUPONS_JSON");
  const leemah5MaxUses = Number.parseInt(process.env.LEEMAH5_MAX_USES || "10", 10);

  return {
    LEEMAH5: {
      percent_off: 5,
      max_redemptions: Number.isInteger(leemah5MaxUses) && leemah5MaxUses > 0 ? leemah5MaxUses : 10,
      name: "LEEMAH5 discount",
    },
    ...configuredCoupons,
  };
}

export function normaliseCouponCode(code: unknown): string {
  return String(code || "").trim().toUpperCase();
}

async function getRedeemedCount(normalisedCode: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("coupon_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("code", normalisedCode);

  if (error) {
    console.error("Could not read coupon usage. Checkout will continue without blocking the customer.", error);
    return 0;
  }

  return count ?? 0;
}

function calculateDiscountAmount(coupon: CouponConfig, productSubtotal: number): number {
  if (typeof coupon.percent_off === "number") {
    return Math.round(productSubtotal * (coupon.percent_off / 100));
  }

  if (typeof coupon.amount_off === "number") {
    return Math.round(coupon.amount_off);
  }

  throw new Error("That coupon code is not configured correctly.");
}

export async function calculateProductDiscount(
  couponCode: unknown,
  productSubtotal: number
): Promise<ResolvedDiscount | null> {
  const normalisedCode = normaliseCouponCode(couponCode);
  if (!normalisedCode || productSubtotal <= 0) return null;

  const localCoupon = getLocalCoupons()[normalisedCode];
  if (localCoupon) {
    const maxRedemptions = Number.parseInt(String(localCoupon.max_redemptions), 10);
    const redeemedCount = await getRedeemedCount(normalisedCode);

    if (Number.isInteger(maxRedemptions) && maxRedemptions > 0 && redeemedCount >= maxRedemptions) {
      throw new Error("That coupon code is expired.");
    }

    let amount = calculateDiscountAmount(localCoupon, productSubtotal);
    amount = Math.max(0, Math.min(amount, productSubtotal));

    if (amount <= 0) return null;

    return {
      type: "local_coupon",
      code: normalisedCode,
      amount,
      name: localCoupon.name || `${normalisedCode} discount`,
    };
  }

  const coupon = getAllowedCoupons()[normalisedCode];
  if (!coupon) {
    throw new Error("That coupon code is not valid.");
  }

  let amount = calculateDiscountAmount(coupon, productSubtotal);
  amount = Math.max(0, Math.min(amount, productSubtotal));

  if (amount <= 0) return null;

  return {
    type: "generated_coupon",
    code: normalisedCode,
    amount,
    name: coupon.name || `${normalisedCode} discount`,
  };
}

/**
 * Records a redemption once a webhook confirms payment. Unique constraint on
 * (code, stripe_session_id) makes this safe to call more than once for the
 * same session — Stripe webhooks are at-least-once delivery.
 */
export async function recordCouponRedemption(code: string, stripeSessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("coupon_redemptions")
    .upsert(
      { code, stripe_session_id: stripeSessionId },
      { onConflict: "code,stripe_session_id", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Could not record coupon redemption.", error);
  }
}
