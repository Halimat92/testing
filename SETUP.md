# Setting up the new site — a guide for Halimah

This is everything needed to get the new Leemah Cakes N More website live. It needs three free/low-cost
accounts connected: **Supabase** (stores orders), **Stripe** (takes payments — you may already have this
from the current site), and **Vercel** (hosts the website). None of these require you to share a password
with anyone — you create your own login for each one and keep it private.

Do these roughly in order: Supabase first, then Stripe, then Vercel (Vercel needs the values from the
first two).

---

## 1. Supabase (order storage + your admin login)

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough to start).
2. Create a new project. Suggested name: `leemah-cakes`. Pick a region close to the UK (e.g. **London,
   eu-west-2** or **Frankfurt, eu-central-1** — anything in the EU is fine). Set a database password
   when prompted and **save it somewhere safe** (a password manager, not a text file you'll lose).
3. Once the project has finished setting up, open **Project Settings → API** (left sidebar, gear icon).
   You'll need three values from this page later — keep this tab open or copy them into a note:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" — this one is more sensitive, treat it like a password)
4. Open **SQL Editor** (left sidebar). Click "New query", then copy the entire contents of
   `supabase/migrations/0001_init.sql` from this repository and paste it in. Click **Run**. This creates
   the tables the site needs to store orders. You should see "Success. No rows returned."
5. Create your own admin login: open **Authentication → Users** (left sidebar), click **Add user →
   Create new user**. Enter your email and choose your own password (only you will know it — nobody
   building the site needs or should ask for it). This is what you'll use to log into `/admin` on the
   live site once it's deployed, to see and update orders.

You now have everything needed from Supabase: the Project URL, anon key, and service role key from
step 3, and your own login from step 5.

## 2. Stripe (payments)

If Leemah Cakes N More already takes payments through Stripe on the current site, you can reuse the same
Stripe account — no need to create a new one.

1. Log into [dashboard.stripe.com](https://dashboard.stripe.com).
2. Start in **test mode** first (toggle in the sidebar) so we can check everything works before real
   money is involved. Go to **Developers → API keys** and copy the **Secret key** (starts `sk_test_...`).
3. The **webhook signing secret** has to wait until after the site is deployed to Vercel (step 3 below),
   because Stripe needs a real web address to send payment confirmations to. Come back to this after
   step 3.

## 3. Vercel (hosting the site)

1. Go to [vercel.com](https://vercel.com) and sign up — choose **"Continue with GitHub"** so it can see
   the repository directly.
2. Click **Add New → Project**, find the `testing` repository (owned by your GitHub account), and import
   it. When asked which branch to deploy, choose **`vercel-nextjs-migration`** — that's the new site;
   `main` is still the old one until this is reviewed and merged.
3. Vercel will detect it's a Next.js project automatically. Before clicking Deploy, open **Environment
   Variables** and add these (values from Supabase step 3 and Stripe step 2 above):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `SUPABASE_URL` | same as Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
   | `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for now) |
   | `STRIPE_WEBHOOK_SECRET` | leave blank for now, see below |
   | `NEXT_PUBLIC_APP_URL` | leave blank for now, see below |

4. Click **Deploy**. After a couple of minutes you'll get a live URL like
   `https://testing-xyz123.vercel.app`.
5. Go back and fill in the two values you skipped:
   - `NEXT_PUBLIC_APP_URL` → the URL from step 4.
   - **Stripe webhook**: in Stripe, go to **Developers → Webhooks → Add endpoint**. Endpoint URL is your
     Vercel URL + `/api/stripe/webhook` (e.g. `https://testing-xyz123.vercel.app/api/stripe/webhook`).
     For events, select `checkout.session.completed`. After creating it, Stripe shows a **signing
     secret** (`whsec_...`) — copy that into Vercel as `STRIPE_WEBHOOK_SECRET`.
6. In Vercel, go to **Settings → Environment Variables**, and after adding the last two, trigger a
   redeploy (Settings → Deployments → "..." on the latest one → Redeploy) so the new values take effect.

## Logging into the admin area

Once deployed, go to `your-site-url.vercel.app/admin/login` and sign in with the email and password you
created yourself in Supabase (step 5 above). There's no separate test account — your Supabase login *is*
your admin login. If you ever forget the password, you can reset it from the Supabase dashboard under
Authentication → Users.

## What to send back once this is done

Once you've completed the steps above, the only thing to share back (not passwords — these are safe to
share since they identify the project, not log into anything) is:
- The Vercel deployment URL
- Confirmation that you've created your own admin login in Supabase (no need to share the password)

## Going live for real

Everything above uses Stripe **test mode**, so no real payments happen yet — good for checking the site
works end-to-end first. When ready to accept real orders: switch Stripe to live mode, get the live secret
key and set up a second webhook endpoint for live mode, and update the Vercel environment variables with
the live values.
