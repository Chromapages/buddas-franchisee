import { firebaseDb } from "../src/lib/firebase/admin.ts";
import { portalLocations } from "../src/features/portal/data.ts";
import type { PortalProduct } from "../src/features/portal/types.ts";

type ValidCategory = PortalProduct["category"];

const VALID_CATEGORIES: ValidCategory[] = [
  "Bakery & Dough",
  "Packaging",
  "Signage & Uniforms",
  "Equipment",
];

const printUsage = () => {
  console.log(`
Usage:
  npm run firebase:add-product -- [options]

Required Options:
  --sku <sku>               Product SKU code (e.g. ING-GLZ10)
  --name <name>             Product display name (e.g. "Artisan Vanilla Glaze")
  --category <category>     "Bakery & Dough" | "Packaging" | "Signage & Uniforms" | "Equipment"
  --price <price>           Wholesale price in USD (e.g. 46.50)
  --packSize <packSize>     Packaging description (e.g. "10 lb pail", "Case of 200")

Optional Options:
  --unitId <unitId>         Target location ID (e.g. HNL-014) or "ALL" (default: "ALL")
  --description <desc>      Product operational summary and usage instructions
  --leadTimeDays <days>     Freight / production lead time in days (default: 3)
  --isAvailable <true|false>Availability flag (default: true)
  --slug <slug>             Custom URL slug (default: auto-generated from name)
  --imageUrl <path>         Image asset path (e.g. "/images/classic-budda-roll.png")
  --id <id>                 Custom product ID (default: auto-generated from sku/slug)
  --json <json-string>      Full product JSON string

Examples:
  npm run firebase:add-product -- --sku ING-GLZ10 --name "Artisan Vanilla Bean Glaze (10 lb pail)" --category "Bakery & Dough" --price 46.50 --packSize "10 lb pail" --leadTimeDays 3
`);
};

const parseCliArgs = (args: string[]): Record<string, string> => {
  const parsed: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        parsed[key] = next;
        i++;
      } else {
        parsed[key] = "true";
      }
    }
  }
  return parsed;
};

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const run = async () => {
  const rawArgs = process.argv.slice(2);
  const flags = parseCliArgs(rawArgs);

  if (flags.help || rawArgs.length === 0) {
    printUsage();
    process.exit(0);
  }

  if (!firebaseDb) {
    throw new Error(
      "Firebase Admin is not configured. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY or GOOGLE_APPLICATION_CREDENTIALS are set in .env.",
    );
  }

  let productPayload: Partial<PortalProduct> = {};

  if (flags.json) {
    try {
      productPayload = JSON.parse(flags.json);
    } catch {
      throw new Error("Invalid JSON provided to --json flag.");
    }
  }

  const sku = flags.sku || productPayload.sku;
  const name = flags.name || productPayload.name;
  const categoryRaw = (flags.category || productPayload.category) as ValidCategory;
  const priceRaw = flags.price !== undefined ? flags.price : productPayload.price;
  const packSize = flags.packSize || productPayload.packSize;
  const targetUnitId = flags.unitId || "ALL";

  if (!sku || !name || !categoryRaw || priceRaw === undefined || !packSize) {
    console.error("Error: Missing required product fields.\n");
    printUsage();
    process.exit(1);
  }

  if (!VALID_CATEGORIES.includes(categoryRaw)) {
    throw new Error(
      `Invalid category "${categoryRaw}". Must be one of: ${VALID_CATEGORIES.join(", ")}`,
    );
  }

  const price = Number(priceRaw);
  if (isNaN(price) || price < 0) {
    throw new Error(`Invalid price "${priceRaw}". Price must be a non-negative number.`);
  }

  const leadTimeDays = Number(flags.leadTimeDays || productPayload.leadTimeDays || 3);
  const isAvailable = flags.isAvailable !== undefined ? flags.isAvailable === "true" : (productPayload.isAvailable ?? true);
  const slug = flags.slug || productPayload.slug || slugify(name);
  const id = flags.id || productPayload.id || `prod-${slugify(sku)}`;
  const description = flags.description || productPayload.description || `${name} (${packSize}) for commercial franchise kitchen operations.`;
  const imageUrl = flags.imageUrl || productPayload.imageUrl || "/images/classic-budda-roll.png";

  const product: PortalProduct = {
    id,
    sku,
    name,
    category: categoryRaw,
    description,
    packSize,
    leadTimeDays,
    isAvailable,
    price,
    slug,
    imageUrl,
  };

  const targetUnits = targetUnitId === "ALL"
    ? portalLocations.map((l) => l.id)
    : [targetUnitId];

  console.log(`\nAdding product to Firestore:`);
  console.log(`- ID:           ${product.id}`);
  console.log(`- SKU:          ${product.sku}`);
  console.log(`- Name:         ${product.name}`);
  console.log(`- Category:     ${product.category}`);
  console.log(`- Price:        $${product.price.toFixed(2)}`);
  console.log(`- Pack Size:    ${product.packSize}`);
  console.log(`- Slug:         ${product.slug}`);
  console.log(`- Target Units: ${targetUnits.join(", ")}\n`);

  for (const unitId of targetUnits) {
    await firebaseDb
      .collection("units")
      .doc(unitId)
      .collection("products")
      .doc(product.id)
      .set({ ...product }, { merge: true });

    console.log(`✔ Successfully added to unit: ${unitId}`);
  }

  console.log("\nProduct addition complete!");
};

run().catch((error) => {
  console.error("Failed to add product to Firestore:", error);
  process.exit(1);
});
