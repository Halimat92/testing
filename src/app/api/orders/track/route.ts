import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { STATUS_LABELS } from "@/lib/order-status";

export const runtime = "nodejs";

// TODO: add rate limiting once a KV/Redis provider is provisioned on Vercel —
// this endpoint is public and order numbers, while non-sequential, are a
// bounded keyspace worth protecting against brute-force lookup attempts.

type OrderRow = {
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  fulfilment: string;
  order_summary: string;
  total_jars: number;
  timeline: unknown;
  customer_email: string;
  customer_phone: string;
};

function normaliseLookup(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function lookupMatches(order: OrderRow, lookup: string): boolean {
  const value = normaliseLookup(lookup);
  if (!value) return false;

  // Exact email match, or exact phone match on digits only. The previous
  // `endsWith` allowed a 1-digit phone suffix to authorise a lookup once an
  // order number was known — an enumeration hole. Require the full number.
  const email = normaliseLookup(order.customer_email);
  if (email && value === email) return true;

  const orderPhoneDigits = digitsOnly(order.customer_phone);
  const lookupDigits = digitsOnly(value);
  // Compare last 10 digits so +44 vs 0 prefixes still match, but require a
  // full national number, not an arbitrary short suffix.
  return orderPhoneDigits.length >= 10 && lookupDigits.length >= 10 && orderPhoneDigits.slice(-10) === lookupDigits.slice(-10);
}

function publicOrder(order: OrderRow) {
  return {
    orderNumber: order.order_number,
    status: order.status,
    statusLabel: STATUS_LABELS[order.status] || order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    fulfilment: order.fulfilment,
    orderSummary: order.order_summary,
    totalJars: order.total_jars,
    timeline: order.timeline || [],
  };
}

async function findOrder(reference: string): Promise<OrderRow | null> {
  const supabase = getSupabaseAdmin();
  const normalisedRef = String(reference || "").trim().toUpperCase();

  const { data: byOrderNumber } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", normalisedRef)
    .maybeSingle();

  if (byOrderNumber) return byOrderNumber as OrderRow;

  if (!reference.startsWith("cs_")) return null;

  const { data: bySessionId } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", reference)
    .maybeSingle();

  if (bySessionId) return bySessionId as OrderRow;

  // Webhook may not have landed yet (customer hitting the success page
  // moments after paying) — fall back to Stripe directly so tracking still
  // works before our own record exists.
  if (!process.env.STRIPE_SECRET_KEY) return null;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(reference);
    if (session.payment_status !== "paid") return null;

    return {
      order_number: `Pending — order is being confirmed`,
      status: "received",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      fulfilment: session.metadata?.fulfilment || "",
      order_summary: session.metadata?.order_summary || "",
      total_jars: Number.parseInt(session.metadata?.total_jars || "0", 10) || 0,
      timeline: [],
      customer_email: session.metadata?.customer_email || session.customer_details?.email || "",
      customer_phone: session.metadata?.customer_phone || session.customer_details?.phone || "",
    };
  } catch (error) {
    console.error("Could not retrieve Stripe session for tracking fallback.", error);
    return null;
  }
}

async function handleLookup(reference: string | null, lookup: string | null) {
  if (!reference || !lookup) {
    return NextResponse.json(
      { error: "Enter your order number and the email or phone used at checkout." },
      { status: 400 }
    );
  }

  const order = await findOrder(reference);

  if (!order || !lookupMatches(order, lookup)) {
    return NextResponse.json({ error: "We could not find an order with those details." }, { status: 404 });
  }

  return NextResponse.json({ order: publicOrder(order) });
}

// POST only — a GET form would place the customer's email/phone in the URL
// (server logs, browser history, referrer headers).
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const reference = payload.reference || payload.order || payload.session_id;
    const lookup = payload.lookup || payload.email || payload.phone;
    return await handleLookup(reference, lookup);
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "Order tracking is temporarily unavailable." }, { status: 500 });
  }
}
