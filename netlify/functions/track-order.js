const Stripe = require("stripe");

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
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

function normaliseRef(value) {
  return String(value || "").trim().toUpperCase();
}

function normaliseLookup(value) {
  return String(value || "").trim().toLowerCase();
}

function getOrderNumber(sessionId) {
  const cleanId = String(sessionId || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
  const suffix = cleanId.slice(-8);
  return suffix ? `LCM-${suffix}` : "";
}

function publicOrder(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: order.statusLabel,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    fulfilment: order.fulfilment,
    orderSummary: order.orderSummary,
    totalJars: order.totalJars,
    timeline: order.timeline || []
  };
}

function lookupMatches(order, lookup) {
  const value = normaliseLookup(lookup);
  if (!value) return false;

  const email = normaliseLookup(order.customer?.email);
  const phone = normaliseLookup(order.customer?.phone).replace(/\s+/g, "");
  const cleanValue = value.replace(/\s+/g, "");

  return value === email || cleanValue === phone || phone.endsWith(cleanValue);
}

async function findOrder(store, reference) {
  let ref = normaliseRef(reference);

  if (ref.startsWith("CS_")) {
    const mapped = await store.get(`session-${reference}.json`, { type: "json" });
    if (mapped?.orderNumber) ref = mapped.orderNumber;
  }

  let order = await store.get(`${ref}.json`, { type: "json" });
  if (order) return order;

  if (!stripe || !String(reference || "").startsWith("cs_")) return null;

  const session = await stripe.checkout.sessions.retrieve(reference);
  const orderNumber = getOrderNumber(session.id);
  order = await store.get(`${orderNumber}.json`, { type: "json" });
  return order || null;
}

exports.handler = async function (event) {
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  try {
    const params = event.httpMethod === "POST"
      ? JSON.parse(event.body || "{}")
      : (event.queryStringParameters || Object.fromEntries(new URLSearchParams(event.rawQuery || "")));

    const reference = params.reference || params.order || params.session_id;
    const lookup = params.lookup || params.email || params.phone;

    if (!reference || !lookup) {
      return jsonResponse(400, { error: "Enter your order number and the email or phone used at checkout." });
    }

    const store = await getOrderStore();
    const order = await findOrder(store, reference);

    if (!order || !lookupMatches(order, lookup)) {
      return jsonResponse(404, { error: "We could not find an order with those details." });
    }

    return jsonResponse(200, { order: publicOrder(order) });
  } catch (error) {
    console.error("Track order error:", error);
    return jsonResponse(500, { error: "Order tracking is temporarily unavailable." });
  }
};
