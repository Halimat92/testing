import { Newsreader, Manrope } from "next/font/google";

// Newsreader (headlines) + Manrope (everything else) — swapped from
// Fraunces + Inter, which reads as a very recognisable "AI website builder"
// serif pairing. Newsreader carries editorial weight without the quirky
// ink-trap character that makes Fraunces so identifiable.
export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["400", "500"],
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
