"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ORDER_STATUSES, buildTimeline } from "@/lib/order-status";
import { isAdminEmail } from "@/lib/admin-access";

export async function updateOrderStatus(formData: FormData) {
  // Defense in depth: the proxy already gates /admin/*, but a Server Action
  // can be invoked directly, so re-check authorisation here too.
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!isAdminEmail(user?.email)) {
    throw new Error("Not authorised.");
  }

  const orderNumber = String(formData.get("orderNumber") || "").trim().toUpperCase();
  const status = String(formData.get("status") || "").trim().toLowerCase();

  if (!orderNumber || !ORDER_STATUSES.includes(status)) {
    throw new Error("Enter a valid order number and status.");
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("timeline")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (fetchError || !order) {
    throw new Error("Order not found.");
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status,
      timeline: buildTimeline(order.timeline, status, now),
    })
    .eq("order_number", orderNumber);

  if (updateError) {
    throw new Error("Order status could not be updated.");
  }

  revalidatePath("/admin/orders");
}
