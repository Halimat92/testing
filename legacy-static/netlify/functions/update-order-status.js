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

const STATUS_LABELS = {
  received: "Order received",
  confirmed: "Confirmed by Leemah",
  preparing: "Being prepared",
  ready: "Ready for collection or delivery",
  completed: "Completed"
};

function normaliseStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function normaliseRef(value) {
  return String(value || "").trim().toUpperCase();
}

function updateTimeline(timeline, status, now) {
  const statuses = Object.keys(STATUS_LABELS);
  const statusIndex = statuses.indexOf(status);
  const existing = Array.isArray(timeline) ? timeline : [];

  return statuses.map((item, index) => {
    const current = existing.find(step => step.status === item) || {};
    const complete = index <= statusIndex;
    return {
      status: item,
      label: STATUS_LABELS[item],
      at: complete ? (current.at || now) : null,
      complete
    };
  });
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  if (!process.env.LEEMAH_ADMIN_TOKEN) {
    return jsonResponse(500, { error: "Order admin token is not configured." });
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const token = payload.token || event.headers["x-admin-token"];

    if (token !== process.env.LEEMAH_ADMIN_TOKEN) {
      return jsonResponse(401, { error: "Not authorised." });
    }

    const orderNumber = normaliseRef(payload.orderNumber);
    const status = normaliseStatus(payload.status);

    if (!orderNumber || !STATUS_LABELS[status]) {
      return jsonResponse(400, { error: "Enter a valid order number and status." });
    }

    const store = await getOrderStore();
    const order = await store.get(`${orderNumber}.json`, { type: "json" });

    if (!order) {
      return jsonResponse(404, { error: "Order not found." });
    }

    const now = new Date().toISOString();
    const updatedOrder = {
      ...order,
      status,
      statusLabel: STATUS_LABELS[status],
      updatedAt: now,
      timeline: updateTimeline(order.timeline, status, now)
    };

    await store.setJSON(`${orderNumber}.json`, updatedOrder);

    return jsonResponse(200, {
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      statusLabel: updatedOrder.statusLabel
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return jsonResponse(500, { error: "Order status could not be updated." });
  }
};
