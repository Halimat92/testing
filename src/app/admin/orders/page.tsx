import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { signOut } from "@/app/admin/login/actions";
import { updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";

type OrderRow = {
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfilment: string;
  order_summary: string;
  amount_total: number;
  currency: string;
  created_at: string;
};

export default async function AdminOrdersPage() {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_number, status, customer_name, customer_email, customer_phone, fulfilment, order_summary, amount_total, currency, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl">Orders</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm text-[var(--color-muted)] underline">
            Sign out
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {(orders as OrderRow[] | null)?.map((order) => (
          <div
            key={order.order_number}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--surface-card)] p-5"
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-semibold text-[var(--color-ink)]">{order.order_number}</span>
              <span className="text-sm text-[var(--color-muted)]">
                {new Date(order.created_at).toLocaleString("en-GB")}
              </span>
            </div>

            <p className="mb-1 text-sm">
              {order.customer_name} — {order.customer_email} — {order.customer_phone}
            </p>
            <p className="mb-1 text-sm text-[var(--color-body)]">{order.order_summary}</p>
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              {order.fulfilment} · £{(order.amount_total / 100).toFixed(2)} {order.currency.toUpperCase()}
            </p>

            <form action={updateOrderStatus} className="flex items-center gap-2">
              <input type="hidden" name="orderNumber" value={order.order_number} />
              <select
                name="status"
                defaultValue={order.status}
                className="rounded-[10px] border border-[var(--color-border)] px-3 py-1.5 text-sm"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-[var(--radius-pill)] bg-[var(--color-rouge)] px-4 py-1.5 text-sm font-semibold text-white"
              >
                Update
              </button>
            </form>
          </div>
        ))}

        {!orders?.length ? <p className="text-[var(--color-muted)]">No orders yet.</p> : null}
      </div>
    </main>
  );
}
