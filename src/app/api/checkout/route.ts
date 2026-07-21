import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import {
  BUSINESS_NAME,
  CATALOGUE,
  CURRENCY,
  DELIVERY_LABELS,
  getDeliveryAmount,
  getEstimatedWeightKg,
} from "@/lib/catalogue";
import { calculateProductDiscount } from "@/lib/coupons";

export const runtime = "nodejs";

const PICKUP_THANK_YOU_MESSAGE =
  "Thank you for ordering from Leemah Cakes N More! Your order will be freshly prepared with care. You can track your order from your order confirmation page. Please note: as every jar is made fresh to order, cancellations requested more than 6 hours after placing your order are non-refundable. We appreciate your understanding!";

const DELIVERY_THANK_YOU_MESSAGE = PICKUP_THANK_YOU_MESSAGE;

type CartItem = { id: string; quantity: number };

type CheckoutPayload = {
  items?: CartItem[];
  fulfilmentOption?: string;
  customer?: {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    postcode?: string;
  };
  allergenAcknowledged?: boolean;
  couponCode?: string;
  orderNote?: string;
};

const MAX_LINES = 20;
const MAX_QUANTITY_PER_ID = 30;
const MAX_TOTAL_JARS = 100;

function buildOrder(items: CartItem[]) {
  if (!Array.isArray(items) || !items.length) throw new Error("Your cart is empty.");
  if (items.length > MAX_LINES) throw new Error("Too many items in your cart.");

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderSummaryParts: string[] = [];
  let totalJars = 0;
  let productSubtotal = 0;

  // Consolidate duplicate IDs first, so submitting the same product across
  // several lines can't slip past the per-product quantity cap.
  const quantities = new Map<string, number>();
  for (const item of items) {
    const quantity = Number.parseInt(String(item?.quantity), 10);
    if (!item || !CATALOGUE[item.id] || !Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("One of the cart items is not valid.");
    }
    quantities.set(item.id, (quantities.get(item.id) || 0) + quantity);
  }

  for (const [id, quantity] of quantities) {
    const catalogueItem = CATALOGUE[id];

    if (quantity > MAX_QUANTITY_PER_ID) {
      throw new Error("One of the cart items has too high a quantity.");
    }

    totalJars += catalogueItem.jarCount * quantity;
    productSubtotal += catalogueItem.price * quantity;
    orderSummaryParts.push(`${quantity} x ${catalogueItem.name}`);

    lineItems.push({
      quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: catalogueItem.price,
        product_data: {
          name: catalogueItem.name,
          metadata: { jar_count: String(catalogueItem.jarCount) },
        },
      },
    });
  }

  if (totalJars < 2) {
    throw new Error("Minimum order is 2 jars.");
  }

  if (totalJars > MAX_TOTAL_JARS) {
    throw new Error("That's a very large order — please contact us directly to arrange it.");
  }

  return { lineItems, totalJars, productSubtotal, orderSummary: orderSummaryParts.join("; ") };
}

// Use the configured canonical origin for Stripe redirect URLs, not the
// client-supplied Origin header (which an attacker could set to redirect a
// paid customer to an arbitrary site).
function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe secret key has not been configured." }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const payload = (await request.json()) as CheckoutPayload;
    const fulfilmentOption = ["pickup", "delivery"].includes(payload.fulfilmentOption || "")
      ? (payload.fulfilmentOption as string)
      : "pickup";
    const customer = payload.customer || {};
    const customerEmail = String(customer.email || "").trim();
    const customerName = String(customer.name || "").trim();
    const customerPhone = String(customer.phone || "").trim();
    const siteUrl = getSiteUrl();
    const allergenAcknowledged = payload.allergenAcknowledged === true;

    if (!customerEmail || !customerName || !customerPhone) {
      throw new Error("Please enter your name, email and phone number.");
    }

    if (!allergenAcknowledged) {
      throw new Error("Please confirm that you have checked the allergen information before placing your order.");
    }

    if (fulfilmentOption !== "pickup") {
      if (!customer.address || !customer.city || !customer.postcode) {
        throw new Error("Please enter your delivery address, city and postcode.");
      }
    }

    const order = buildOrder(payload.items || []);
    const deliveryAmount = getDeliveryAmount(fulfilmentOption, order.totalJars);
    const estimatedWeightKg = getEstimatedWeightKg(order.totalJars);
    const discount = await calculateProductDiscount(payload.couponCode, order.productSubtotal);
    const deliveryLabel = DELIVERY_LABELS[fulfilmentOption];
    const orderNote = String(payload.orderNote || "").slice(0, 450);
    const addressText =
      fulfilmentOption === "pickup"
        ? "Pickup order"
        : `${customer.address}, ${customer.city}, ${customer.postcode}`;
    const orderSummary = order.orderSummary.slice(0, 500);

    const sharedMetadata: Record<string, string> = {
      order_summary: orderSummary,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      fulfilment: deliveryLabel,
      total_jars: String(order.totalJars),
      estimated_weight_kg: String(estimatedWeightKg),
      delivery_address: addressText,
      order_note: orderNote || "None",
      allergen_acknowledged: allergenAcknowledged ? "Yes" : "No",
      coupon_code: discount ? discount.code : "None",
      product_discount_pence: discount && discount.amount ? String(discount.amount) : "0",
      coupon_type: discount ? discount.type : "None",
    };

    const lineItems = [...order.lineItems];

    if (deliveryAmount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: deliveryAmount,
          product_data: { name: deliveryLabel },
        },
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      customer_email: customerEmail,
      client_reference_id: `${Date.now()}-${customerEmail}`,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
      metadata: sharedMetadata,
      payment_intent_data: {
        receipt_email: customerEmail,
        description: `${BUSINESS_NAME} order: ${orderSummary}.`,
        metadata: sharedMetadata,
      },
      custom_text: {
        submit: {
          message: "Orders are prepared fresh. Orders cancelled after 6 hours are non-refundable.",
        },
        after_submit: {
          message: fulfilmentOption === "pickup" ? PICKUP_THANK_YOU_MESSAGE : DELIVERY_THANK_YOU_MESSAGE,
        },
      },
    };

    if (discount) {
      const stripeCoupon = await stripe.coupons.create({
        name: discount.name,
        amount_off: discount.amount,
        currency: CURRENCY,
        duration: "once",
        metadata: {
          entered_code: discount.code,
          product_only_discount: "true",
          coupon_type: discount.type,
        },
      });

      sessionParams.discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Checkout could not be created.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
