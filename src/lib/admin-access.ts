/**
 * Admin authorisation is an email allowlist, not "any authenticated user".
 * Set ADMIN_EMAILS to a comma-separated list of the owner's admin email(s).
 * If ADMIN_EMAILS is unset, no one is treated as admin (fail closed) —
 * this prevents a stray Supabase signup from gaining admin access.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  const allowlist = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length === 0) return false;

  return allowlist.includes(email.trim().toLowerCase());
}
