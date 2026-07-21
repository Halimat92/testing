const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
}

function normaliseCouponCode(code) {
  return String(code || "").trim().toUpperCase();
}

async function getCouponStore() {
  const { getStore } = await import("@netlify/blobs");
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) {
    return getStore("leemah-coupon-usage", { siteID, token });
  }

  return getStore("leemah-coupon-usage");
}

async function getOrderStore() {
  const { getStore } = await import("@netlify/blobs");
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;

  if (siteID && token) {
    return getStore("leemah-orders", { siteID, token });
  }

  return getStore("leemah-orders");
}

function getOrderNumber(sessionId) {
  const cleanId = String(sessionId || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  const suffix = cleanId.slice(-8) || String(Date.now()).slice(-8);
  return `LCM-${suffix}`;
}

function getInitialTimeline(now) {
  return [
    { status: "received", label: "Order received", at: now, complete: true },
    { status: "confirmed", label: "Confirmed by Leemah", at: null, complete: false },
    { status: "preparing", label: "Being prepared", at: null, complete: false },
    { status: "ready", label: "Ready for collection or delivery", at: null, complete: false },
    { status: "completed", label: "Completed", at: null, complete: false }
  ];
}

function buildOrderRecord(session) {
  const metadata = session.metadata || {};
  const now = new Date().toISOString();
  const orderNumber = getOrderNumber(session.id);
  const customerEmail = String(metadata.customer_email || session.customer_details?.email || session.customer_email || "").trim();
  const customerPhone = String(metadata.customer_phone || session.customer_details?.phone || "").trim();

  return {
    orderNumber,
    stripeSessionId: session.id,
    paymentStatus: session.payment_status || "paid",
    status: "received",
    statusLabel: "Order received",
    createdAt: now,
    updatedAt: now,
    customer: {
      name: metadata.customer_name || session.customer_details?.name || "",
      email: customerEmail,
      phone: customerPhone
    },
    fulfilment: metadata.fulfilment || "",
    deliveryAddress: metadata.delivery_address || "",
    orderSummary: metadata.order_summary || "",
    orderNote: metadata.order_note || "",
    totalJars: metadata.total_jars || "",
    estimatedWeightKg: metadata.estimated_weight_kg || "",
    amountTotal: session.amount_total || 0,
    currency: session.currency || "gbp",
    timeline: getInitialTimeline(now)
  };
}

async function saveCompletedOrder(session) {
  const store = await getOrderStore();
  const order = buildOrderRecord(session);
  await store.setJSON(`${order.orderNumber}.json`, order);
  await store.setJSON(`session-${session.id}.json`, { orderNumber: order.orderNumber });
  return order;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse(500, { error: "Stripe webhook is not configured." });
  }

  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
    const signature = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];

    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed.", error);
    return jsonResponse(400, { error: "Webhook signature verification failed." });
  }

  if (stripeEvent.type !== "checkout.session.completed") {
    return jsonResponse(200, { received: true });
  }

  const session = stripeEvent.data.object;
  const metadata = session.metadata || {};
  const couponCode = normaliseCouponCode(metadata.coupon_code);

  if (!session.payment_status || session.payment_status === "paid") {
    try {
      const order = await saveCompletedOrder(session);
      console.log(`Saved order ${order.orderNumber}.`);
    } catch (error) {
      console.error("Could not save completed order.", error);
    }
  }

  if (!couponCode || couponCode === "NONE" || metadata.coupon_type !== "local_coupon") {
    return jsonResponse(200, { received: true });
  }

  if (session.payment_status && session.payment_status !== "paid") {
    return jsonResponse(200, { received: true });
  }

  try {
    const store = await getCouponStore();
    const key = `${couponCode}.json`;
    const usage = await store.get(key, { type: "json" }) || { paidSessions: [] };
    const paidSessions = Array.isArray(usage.paidSessions) ? usage.paidSessions : [];

    if (!paidSessions.includes(session.id)) {
      paidSessions.push(session.id);
      await store.setJSON(key, {
        paidSessions,
        lastRedeemedAt: new Date().toISOString()
      });
    }

    return jsonResponse(200, { received: true });
  } catch (error) {
    console.error("Could not record coupon redemption.", error);
    return jsonResponse(200, {
      received: true,
      warning: "Coupon redemption could not be recorded."
    });
  }
};
