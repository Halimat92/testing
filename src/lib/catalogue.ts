// Product catalogue, prices in pence. Carried over from the legacy Netlify
// function (`legacy-static/netlify/functions/create-checkout.js`). Stays as
// code for now rather than a Supabase table — 8 SKUs doesn't need a CMS yet;
// revisit once there's an admin product-management screen.

export type CatalogueItem = {
  name: string;
  price: number; // pence
  jarCount: number;
  image: string;
  description: string;
};

export const CURRENCY = "gbp";
export const BUSINESS_NAME = "Leemah Cakes N More";

export const CATALOGUE: Record<string, CatalogueItem> = {
  "red-velvet": {
    name: "Rouge Velvet Dessert Jar",
    price: 728,
    jarCount: 1,
    image: "/images/red.png",
    description: "Layers of red velvet sponge and cream cheese frosting.",
  },
  "vanilla-cake": {
    name: "Ivory Dream Dessert Jar",
    price: 728,
    jarCount: 1,
    image: "/images/vanilla.png",
    description: "Classic vanilla sponge with silky vanilla buttercream.",
  },
  "chocolate-caramel": {
    name: "Caramel Noir Dessert Jar",
    price: 728,
    jarCount: 1,
    image: "/images/choco.png",
    description: "Rich chocolate sponge layered with salted caramel.",
  },
  "strawberry-bliss": {
    name: "Strawberry Bliss Dessert Jar",
    price: 728,
    jarCount: 1,
    image: "/images/strawberry.png",
    description: "Fresh strawberry sponge with a strawberry cream swirl.",
  },
  "cookies-cream-noir": {
    name: "Cookies & Cream Noir Dessert Jar",
    price: 728,
    jarCount: 1,
    image: "/images/cookies.png",
    description: "Chocolate sponge, cookie crumb and cream, layer on layer.",
  },
  "bundle-trio": {
    name: "The Trio Bundle",
    price: 2184,
    jarCount: 3,
    image: "/images/3-combo.png",
    description: "Any three jars, boxed and ribboned for gifting.",
  },
  "bundle-four": {
    name: "The Four Pack Bundle",
    price: 2912,
    jarCount: 4,
    image: "/images/4-combo.png",
    description: "Any four jars — the crowd-pleaser box.",
  },
  "bundle-five": {
    name: "The Five Pack Bundle",
    price: 3550,
    jarCount: 5,
    image: "/images/5-combo.PNG",
    description: "Any five jars, our best value box.",
  },
};

export const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Pickup",
  delivery: "Delivery",
};

export function getDeliveryAmount(fulfilmentOption: string, totalJars: number): number {
  if (fulfilmentOption === "pickup" || totalJars <= 0) return 0;
  if (fulfilmentOption === "delivery") return 499;
  return 0;
}

export function getEstimatedWeightKg(totalJars: number): number {
  if (totalJars <= 0) return 0;
  if (totalJars <= 2) return 0.7;
  if (totalJars === 3) return 1.05;
  if (totalJars === 4) return 1.4;
  if (totalJars <= 6) return 2.1;
  return Math.ceil(totalJars / 2) * 0.7;
}
