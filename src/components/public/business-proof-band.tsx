import { ClipboardCheck, Store, Utensils, Wheat } from "lucide-react";
import { FRANCHISE_HOME_HERO_CONTENT, formatCurrentFootprint } from "@/src/features/franchise/home-hero-content";

const proof = [
  { label: "Growing footprint", value: formatCurrentFootprint(FRANCHISE_HOME_HERO_CONTENT.currentFootprint), Icon: Store },
  { label: "Bakery-led menu", value: "A Hawaiian Bakery & Grill centered on the Budda Roll.", Icon: Utensils },
  { label: "Operating blueprint", value: "Product, production, hospitality, and growth standards work together.", Icon: ClipboardCheck },
  { label: "Signature product", value: "The Budda Roll gives the menu a distinctive bakery-led center.", Icon: Wheat },
] as const;

export const BusinessProofBand = () => <section className="business-proof-band" aria-labelledby="business-proof-heading"><div className="content-wide"><h2 id="business-proof-heading" className="sr-only">Real business proof</h2><ul>{proof.map(({ label, value, Icon }) => <li key={label}><Icon aria-hidden="true" /><div><h3>{label}</h3><p>{value}</p></div></li>)}</ul></div></section>;
