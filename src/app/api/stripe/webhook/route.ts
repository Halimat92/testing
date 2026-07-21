import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normaliseCouponCode, recordCouponRedemption } from "@/lib/coupons";

export const runtime = "nodejs";

function getOrderNumber(sessionId: string): string {
  const cleanId = String(sessionId || "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();
  const suffix = cleanId.slice(-8) || String(Date.now()).slice(-8);
  return `LCM-${suffix}`;
}

function getInitialTimeline(now: string) {
  return [
    { status: "received", label: "Order received", at: now, complete: true },
    { status: "confirmed", label: "Confirmed by Leemah", at: null, complete: false },
    { status: "preparing", label: "Being prepared", at: null, complete: false },
    { status: "ready", label: "Ready for collection or delivery", at: null, complete: false },
    { status: "completed", label: "Completed", at: null, complete: false },
  ];
}

async function saveCompletedOrder(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();
  const metadata = session.metadata || {};
  const now = new Date().toISOString();
  const orderNumber = getOrderNumber(session.id);
  const customerEmail = String(
    metadata.customer_email || session.customer_details?.email || session.customer_email || ""
  ).trim();
  const customerPhone = String(metadata.customer_phone || session.customer_details?.phone || "").trim();

  // Idempotent: unique constraint on stripe_session_id means a re-delivered
  // webhook event just no-ops the insert rather than duplicating the order.
  const { error } = await supabase.from("orders").upsert(
    {
      order_number: orderNumber,
      stripe_session_id: session.id,
      payment_status: session.payment_status || "paid",
      status: "received",
      customer_name: metadata.customer_name || session.customer_details?.name || "",
      customer_email: customerEmail,
      customer_phone: customerPhone,
      fulfilment: metadata.fulfilment || "",
      delivery_address: metadata.delivery_address || "",
      order_summary: metadata.order_summary || "",
      order_note: metadata.order_note || "",
      total_jars: Number.parseInt(metadata.total_jars || "0", 10) || 0,
      estimated_weight_kg: Number.parseFloat(metadata.estimated_weight_kg || "0") || 0,
      amount_total: session.amount_total || 0,
      currency: session.currency || "gbp",
      timeline: getInitialTimeline(now),
      created_at: now,
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true }
  );

  if (error) {
    throw error;
  }

  return orderNumber;
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    // Hard-fail rather than attempting signature verification with a missing
    // secret — an empty/undefined secret must never be treated as "verified".
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Webhook signature verification failed.", error);
    return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
  }

  // `async_payment_succeeded` covers delayed payment methods (e.g. bank
  // debits) that confirm after the Checkout redirect completes.
  const handledEvents = ["checkout.session.completed", "checkout.session.async_payment_succeeded"];
  if (!handledEvents.includes(stripeEvent.type)) {
    return NextResponse.json({ received: true });
  }

  const session = stripeEvent.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const couponCode = normaliseCouponCode(metadata.coupon_code);

  // Only fulfil once the payment is actually settled. A pending/unpaid
  // session (delayed payment method still processing) is acknowledged but
  // not written — the async_payment_succeeded event will follow.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  try {
    const orderNumber = await saveCompletedOrder(session);
    console.log(`Saved order ${orderNumber}.`);
  } catch (error) {
    // Return a non-2xx so Stripe retries delivery. Returning 200 here would
    // permanently drop a paid order whose DB write happened to fail.
    console.error("Could not save completed order — asking Stripe to retry.", error);
    return NextResponse.json({ error: "Order could not be persisted." }, { status: 500 });
  }

  if (couponCode && couponCode !== "NONE" && metadata.coupon_type === "local_coupon") {
    await recordCouponRedemption(couponCode, session.id);
  }

  return NextResponse.json({ received: true });
}
